import re

with open("src/commands/serve.ts", "r") as f:
    code = f.read()

# Define the new methods
methods_str = """
  private async handleLoadSnapshot(path: string, options: CLIOptions) {
    try {
      this.snapshot = await loadSnapshotFromFile(path, options);
      this.snapshotFile = path;
      return {
        content: [{ type: 'text', text: `Successfully loaded snapshot from ${path}` }]
      };
    } catch (err) {
      throw new McpError(ErrorCode.InternalError, `Failed to load snapshot: ${(err as Error).message}`);
    }
  }

  private async handleDynamicCommand(
    name: string,
    toolArgs: any,
    command: Command,
    options: CLIOptions,
    context: CommandContext
  ) {
    if (!this.snapshot && !['pack', 'config', 'alias', 'bin-setup', 'get', 'set'].includes(name)) {
      return {
        content: [{ type: 'text', text: 'Directive: No snapshot loaded. Use "load_snapshot" or "pack" to establish context.' }],
        isError: true
      };
    }

    if (name === 'inspect' && this.snapshot) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              metadata: calculateMetadata(this.snapshot),
              directoryStructure: this.snapshot.directoryStructure,
              instruction: this.snapshot.instruction,
              roadmap: this.snapshot.roadmap,
            }, null, 2),
          },
        ],
      };
    }

    const cliArgs: string[] = [];

    if (toolArgs) {
      if (Array.isArray(toolArgs.args)) {
        cliArgs.push(...toolArgs.args);
      }

      for (const [key, value] of Object.entries(toolArgs)) {
        if (key === 'args') continue;

        const flag = '--' + key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

        if (typeof value === 'boolean') {
          if (value) cliArgs.push(flag);
        } else if (value !== undefined && value !== null) {
          cliArgs.push(flag, String(value));
        }
      }
    }

    const cliOptions: CLIOptions = { ...options, json: true };

    let stdout = '';
    let stderr = '';

    setOutputHandler((data, type) => {
      if (type === 'stdout') stdout += data + '\\n';
      else stderr += data + '\\n';
    });

    try {
      const result = await command.execute(cliArgs, cliOptions, {
        ...context,
        snapshot: this.snapshot || undefined
      });

      return {
        content: [
          { type: 'text', text: stdout || (result.success ? 'Success' : 'No output') },
          ...(stderr ? [{ type: 'text', text: `Error Output: ${stderr}` }] : [])
        ],
        isError: !result.success
      };
    } finally {
      setOutputHandler(null);
    }
  }
"""

# Find the request handler body for CallToolRequestSchema
handler_start = code.find("server.setRequestHandler(CallToolRequestSchema, async (request) => {")
if handler_start == -1:
    print("Could not find CallToolRequestSchema handler")
    exit(1)

# we need to find the matching closing brace
brace_count = 0
handler_end = -1
in_handler = False

for i in range(handler_start, len(code)):
    if code[i] == '{':
        brace_count += 1
        in_handler = True
    elif code[i] == '}':
        brace_count -= 1
        if in_handler and brace_count == 0:
            handler_end = i
            break

if handler_end == -1:
    print("Could not find end of handler")
    exit(1)


handler_replacement = """server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: toolArgs } = request.params;

        if (name === 'load_snapshot') {
          const { path } = toolArgs as { path: string };
          return await this.handleLoadSnapshot(path, options);
        }

        const command = registry.get(name);
        if (command) {
          return await this.handleDynamicCommand(name, toolArgs, command, options, context);
        }

        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }"""


new_code = code[:handler_start] + handler_replacement + code[handler_end + 1:]

# Insert the methods right before private commandToTool(cmd: Command) {
methods_insert_pos = new_code.find("  private commandToTool(cmd: Command) {")

if methods_insert_pos == -1:
    print("Could not find commandToTool to insert before")
    exit(1)

final_code = new_code[:methods_insert_pos] + methods_str + "\n" + new_code[methods_insert_pos:]

with open("src/commands/serve.ts", "w") as f:
    f.write(final_code)

print("Refactor complete")
