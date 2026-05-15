/**
 * Topology Command
 * Detects architectural drift between two snapshots using graph analysis.
 */

import { Command } from '../utils/command.js';
import type { CLIOptions, CommandResult, CommandContext, GraphSnapshot } from '../types/index.js';
import { readFileSync, existsSync } from 'fs';
import { analyzeGraph, createGraph } from '../utils/graph-analysis.js';
import { extractGraphFromSource } from '../utils/graph-ast.js';

export class TopologyCommand extends Command {
  readonly definition = {
    name: 'topology',
    description: 'Detect architectural drift between two snapshots',
    usage: 'jref topology <snapshot_A.json> <snapshot_B.json>',
    options: [],
    examples: [
      'jref topology snapshot1.json snapshot2.json'
    ],
    workflows: [
      'Architectural Drift: Detects when modules migrate between communities.',
      'God Node Detection: Identifies files that have become bottlenecks.',
      'Dependency Analysis: Tracks changes in degree centrality for all modules.'
    ]
  };

  async execute(
    args: string[],
    options: CLIOptions,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      if (args.length < 2) {
        return this.error('Two snapshots are required for topology analysis.', options);
      }

      const pathA = args[0];
      const pathB = args[1];

      if (!existsSync(pathA) || !existsSync(pathB)) {
        return this.error('One or both snapshot files do not exist.', options);
      }

      const snapshotA = JSON.parse(readFileSync(pathA, 'utf8'));
      const snapshotB = JSON.parse(readFileSync(pathB, 'utf8'));

      const graphA = await this.getGraph(snapshotA);
      const graphB = await this.getGraph(snapshotB);

      const analysisA = analyzeGraph(graphA);
      const analysisB = analyzeGraph(graphB);

      const report = this.generateDriftReport(analysisA, analysisB, options);

      if (!options.silent && !options.json) {
        process.stdout.write(report + '\n');
      }

      return this.success(report);
    } catch (err) {
      return this.error(`Topology failed: ${(err as Error).message}`, options);
    }
  }

  private async getGraph(snapshot: any): Promise<GraphSnapshot> {
    if (snapshot.graph) return snapshot.graph;

    // Fallback: Build graph from files
    const allNodes: any[] = [];
    const allEdges: any[] = [];

    for (const [path, content] of Object.entries(snapshot.files)) {
      const { nodes, edges } = await extractGraphFromSource(path, content as string);
      allNodes.push(...nodes);
      allEdges.push(...edges);
    }

    return { nodes: allNodes, edges: allEdges };
  }

  private generateDriftReport(a: any, b: any, options: CLIOptions): string {
    let report = '# 🏗️ Architectural Drift Report\n\n';

    // 1. Bottleneck Analysis (Degree Centrality increase)
    report += '## 🚀 Bottleneck Evolution (Centrality Drift)\n';
    const godNodesA = new Map(a.godNodes.map((n: any) => [n.id, n.centrality]));
    const godNodesB = new Map(b.godNodes.map((n: any) => [n.id, n.centrality]));

    let bottleneckFound = false;
    for (const [id, centralityB] of godNodesB) {
      const centralityA = godNodesA.get(id) || 0;
      const drift = centralityA === 0 ? 1 : (centralityB - centralityA) / centralityA;
      
      if (drift > 0.2) {
        report += `- **${id}**: Centrality increased by **${(drift * 100).toFixed(1)}%** (${centralityA.toFixed(1)} → ${centralityB.toFixed(1)})\n`;
        bottleneckFound = true;
      }
    }
    if (!bottleneckFound) report += '_No significant bottleneck evolution detected._\n';

    // 2. Module Migration (Louvain Communities)
    report += '\n## 🏗️ Module Migrations (Community Drift)\n';
    const communitiesA = new Map<string, number>();
    for (const [communityId, nodes] of Object.entries(a.communities)) {
      (nodes as string[]).forEach(n => communitiesA.set(n, parseInt(communityId)));
    }

    const communitiesB = new Map<string, number>();
    for (const [communityId, nodes] of Object.entries(b.communities)) {
      (nodes as string[]).forEach(n => communitiesB.set(n, parseInt(communityId)));
    }

    // Since community IDs are arbitrary between runs, we need to map A IDs to B IDs based on maximum overlap
    const communityOverlap = new Map<number, Map<number, number>>();
    for (const [id, commB] of communitiesB) {
      const commA = communitiesA.get(id);
      if (commA !== undefined) {
        if (!communityOverlap.has(commA)) communityOverlap.set(commA, new Map());
        const counts = communityOverlap.get(commA)!;
        counts.set(commB, (counts.get(commB) || 0) + 1);
      }
    }

    const communityMapping = new Map<number, number>();
    for (const [commA, counts] of communityOverlap) {
      let maxCount = -1;
      let mappedB = -1;
      for (const [commB, count] of counts) {
        if (count > maxCount) {
          maxCount = count;
          mappedB = commB;
        }
      }
      communityMapping.set(commA, mappedB);
    }

    let migrationFound = false;
    for (const [id, commB] of communitiesB) {
      const commA = communitiesA.get(id);
      if (commA !== undefined) {
        const expectedB = communityMapping.get(commA);
        if (expectedB !== undefined && commB !== expectedB) {
          report += `- **${id}**: Migrated from Cluster ${commA} to Cluster ${commB}\n`;
          migrationFound = true;
        }
      }
    }
    if (!migrationFound) report += '_No significant module migrations detected._\n';

    return report;
  }
}
