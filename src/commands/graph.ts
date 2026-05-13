import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { networkInterfaces } from 'os';
import { fileURLToPath } from 'url';
import { Command, CommandDefinition } from '../utils/command.js';
import { CLIOptions, CommandContext, CommandResult, GraphSnapshot } from '../types/index.js';
import { extractGraphFromSource, ensureWasm, CORE_WASM_URL, LANGUAGE_REGISTRY } from '../utils/graph-ast.js';
import { analyzeGraph, generateGraphReport } from '../utils/graph-analysis.js';
import { inferSemanticEdges } from '../utils/graph-semantic.js';
import { printInfo, printSuccess } from '../utils/output.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Graph Command
 * Build or query a project knowledge graph
 */
export class GraphCommand extends Command {
  readonly definition: CommandDefinition = {
    name: 'graph',
    description: 'Build or query a project knowledge graph',
    usage: 'jref graph <subcommand> [target] [options]',
    options: [
      { flags: '-o, --output <file>', description: 'Output file for the graph', defaultValue: 'graph-snapshot.json' },
      { flags: '--no-llm', description: 'Skip semantic extraction using LLM', defaultValue: false },
      { flags: '-p, --port <number>', description: 'Port for the graph UI server', defaultValue: '8080' },
    ],
    examples: [
      'jref graph build .',
      'jref graph build snapshot.json',
      'jref graph wasm-update',
      'jref graph ui',
      'jref graph query "concept"'
    ]
  };

  protected parseArgs(args: string[]): { subcommand: string, target: string, flags: { output?: string, noLlm?: boolean, port?: string } } {
    const flags: any = {};
    let subcommand = '';
    let target = '';

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-o' || arg === '--output') {
        flags.output = args[++i];
      } else if (arg === '--no-llm') {
        flags.noLlm = true;
      } else if (arg === '-p' || arg === '--port') {
        flags.port = args[++i];
      } else if (!arg.startsWith('-')) {
        if (!subcommand) {
          subcommand = arg;
        } else if (!target) {
          target = arg;
        }
      }
    }

    return { 
      subcommand, 
      target: target || (subcommand === 'ui' || subcommand === 'serve' ? '' : '.'), 
      flags 
    };
  }

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    const { subcommand, target, flags } = this.parseArgs(args);
    
    // Merge command flags with global options
    const mergedOptions = { ...options, ...flags };

    if (subcommand === 'build') {
      return await this.buildGraph(target, mergedOptions, context);
    } else if (subcommand === 'query') {
      return await this.queryGraph(target, args.slice(2), mergedOptions, context);
    } else if (subcommand === 'wasm-update') {
      return await this.updateWasm(options);
    } else if (subcommand === 'ui' || subcommand === 'serve') {
      return await this.startUIServer(target, mergedOptions);
    } else {
      return this.error('Invalid subcommand. Use "build", "query", "wasm-update", or "ui".', options);
    }
  }

  /**
   * Pre-fetches all registered WASM binaries for offline use.
   */
  private async updateWasm(options: CLIOptions): Promise<CommandResult> {
    try {
      this.print('Updating WASM binaries...', options);
      
      // Update core
      await ensureWasm('tree-sitter.wasm', CORE_WASM_URL);
      
      // Update languages
      const uniqueWasms = new Map<string, string>();
      for (const info of Object.values(LANGUAGE_REGISTRY)) {
        uniqueWasms.set(info.wasm, info.url);
      }

      for (const [wasm, url] of uniqueWasms.entries()) {
        await ensureWasm(wasm, url);
      }

      return this.success('All WASM binaries updated successfully.');
    } catch (err) {
      return this.error(`Failed to update WASM: ${(err as Error).message}`, options);
    }
  }

  /**
   * Starts a local web server to visualize the graph
   */
  private async startUIServer(
    target: string,
    options: CLIOptions & { output?: string, port?: string }
  ): Promise<CommandResult> {
    const port = parseInt(options.port || '8080', 10);
    const graphFile = target.endsWith('.json') ? target : (options.output || 'graph-snapshot.json');

    if (!fs.existsSync(graphFile)) {
      return this.error(`Graph file not found: ${graphFile}. Run 'jref graph build' first.`, options);
    }

    try {
      const graphData = JSON.parse(fs.readFileSync(graphFile, 'utf8'));
      
      // Resolve path to the HTML viewer
      // Handle both src (dev) and dist (prod) locations
      let htmlPath = path.resolve(__dirname, '../assets/graph-viewer.html');
      if (!fs.existsSync(htmlPath)) {
        htmlPath = path.resolve(__dirname, '../../src/assets/graph-viewer.html');
      }

      if (!fs.existsSync(htmlPath)) {
        return this.error(`Graph viewer asset not found at ${htmlPath}`, options);
      }

      const htmlContent = fs.readFileSync(htmlPath, 'utf8');

      const server = http.createServer((req, res) => {
        if (req.url === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(htmlContent);
        } else if (req.url === '/api/graph') {
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
          });
          res.end(JSON.stringify(graphData));
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      });

      return new Promise((resolve) => {
        server.listen(port, () => {
          printSuccess(`Graph UI server started!`, options);
          printInfo(`- Local:   http://localhost:${port}/`, options);
          printInfo(`- Network: http://${this.getNetworkIP()}:${port}/`, options);
          printInfo(`Press Ctrl+C to stop.`, options);
          
          // Keep the process alive
          process.on('SIGINT', () => {
            server.close();
            resolve(this.success('Server stopped.'));
          });
        });

        server.on('error', (err) => {
          resolve(this.error(`Server error: ${err.message}`, options));
        });
      });
    } catch (err) {
      return this.error(`Failed to start UI server: ${(err as Error).message}`, options);
    }
  }

  private getNetworkIP(): string {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]!) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return '0.0.0.0';
  }

  /**
   * Builds a knowledge graph from a directory or snapshot
   */
  private async buildGraph(
    target: string,
    options: CLIOptions & { output?: string, noLlm?: boolean },
    context: CommandContext
  ): Promise<CommandResult> {
    let allNodes: any[] = [];
    let allEdges: any[] = [];
    let fileContents: Record<string, string> = {};
    
    const outputFileName = options.output || 'graph-snapshot.json';
    const reportFileName = 'GRAPH_REPORT.md';

    try {
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
        // Build from directory
        const files = this.getAllFiles(target);
        // Pre-read files to populate fileContents sequentially
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf8');
          const relPath = path.relative(target, file);
          fileContents[relPath] = content;
        }

        // Parallelize graph extraction
        // Note: Using chunking to prevent EMFILE or memory explosion for large repos
        const chunkSize = 50;
        for (let i = 0; i < files.length; i += chunkSize) {
          const chunk = files.slice(i, i + chunkSize);
          const promises = chunk.map(file => {
            const relPath = path.relative(target, file);
            return extractGraphFromSource(file, fileContents[relPath], target);
          });
          const results = await Promise.all(promises);
          for (const { nodes, edges } of results) {
            allNodes.push(...nodes);
            allEdges.push(...edges);
          }
        }
      } else {
        // Try to load as a snapshot
        const snapshot = await this.getSnapshot(context, options, target);
        fileContents = snapshot.files;

        // Parallelize graph extraction using chunks
        const entries = Object.entries(snapshot.files);
        const chunkSize = 50;
        for (let i = 0; i < entries.length; i += chunkSize) {
          const chunk = entries.slice(i, i + chunkSize);
          const promises = chunk.map(([filePath, content]) =>
            extractGraphFromSource(filePath, content)
          );
          const results = await Promise.all(promises);
          for (const { nodes, edges } of results) {
            allNodes.push(...nodes);
            allEdges.push(...edges);
          }
        }
      }

      // Merge and deduplicate
      const uniqueNodes = Array.from(new Map(allNodes.map(n => [n.id, n])).values());
      
      // Phase 3: Semantic Extraction
      if (!options.noLlm) {
        const semanticEdges = await inferSemanticEdges(uniqueNodes, fileContents);
        allEdges.push(...semanticEdges);
      }

      // Perform topological analysis
      const initialSnapshot: GraphSnapshot = { nodes: uniqueNodes, edges: allEdges };
      const analysis = analyzeGraph(initialSnapshot);
      
      // Save graph
      fs.writeFileSync(outputFileName, JSON.stringify(analysis.graph, null, 2));
      
      // Save report
      const report = generateGraphReport(analysis);
      fs.writeFileSync(reportFileName, report);

      return this.success(`Graph built successfully!\n- Graph: ${outputFileName}\n- Report: ${reportFileName}`);
    } catch (err) {
      return this.error(`Failed to build graph: ${(err as Error).message}`, options);
    }
  }

  /**
   * Placeholder for graph querying
   */
  private async queryGraph(
    _target: string,
    queryArgs: string[],
    _options: CLIOptions,
    _context: CommandContext
  ): Promise<CommandResult> {
    return this.success(`Querying graph for: ${queryArgs.join(' ')} (Not fully implemented yet)`);
  }

  /**
   * Recursively get all files in a directory
   */
  private getAllFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const name = path.join(dir, file);
      if (fs.statSync(name).isDirectory()) {
        const basename = path.basename(file);
        if (basename !== 'node_modules' && basename !== '.git' && basename !== 'dist') {
          this.getAllFiles(name, fileList);
        }
      } else {
        fileList.push(name);
      }
    }
    return fileList;
  }
}

