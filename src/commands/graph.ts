import * as fs from 'fs';
import * as path from 'path';
import { Command, CommandDefinition } from '../utils/command.js';
import { CLIOptions, CommandContext, CommandResult, GraphSnapshot } from '../types/index.js';
import { extractGraphFromSource } from '../utils/graph-ast.js';
import { analyzeGraph, generateGraphReport } from '../utils/graph-analysis.js';
import { inferSemanticEdges } from '../utils/graph-semantic.js';

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
    ],
    examples: [
      'jref graph build .',
      'jref graph build snapshot.json',
      'jref graph query "concept"'
    ]
  };

  protected parseArgs(args: string[]): Record<string, any> {
    return {
      subcommand: args[0],
      target: args[1] || '.',
    };
  }

  async execute(
    args: string[],
    options: CLIOptions & { output?: string, noLlm?: boolean },
    context: CommandContext
  ): Promise<CommandResult> {
    const { subcommand, target } = this.parseArgs(args);

    if (subcommand === 'build') {
      return await this.buildGraph(target, options, context);
    } else if (subcommand === 'query') {
      return await this.queryGraph(target, args.slice(2), options, context);
    } else {
      return this.error('Invalid subcommand. Use "build" or "query".', options);
    }
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
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf8');
          const relPath = path.relative(target, file);
          fileContents[relPath] = content;
          const { nodes, edges } = await extractGraphFromSource(file, content, target);
          allNodes.push(...nodes);
          allEdges.push(...edges);
        }
      } else {
        // Try to load as a snapshot
        const snapshot = await this.getSnapshot(context, options, target);
        fileContents = snapshot.files;
        for (const [filePath, content] of Object.entries(snapshot.files)) {
          const { nodes, edges } = await extractGraphFromSource(filePath, content);
          allNodes.push(...nodes);
          allEdges.push(...edges);
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
