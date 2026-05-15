/**
 * Topology Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TopologyCommand } from './topology.js';
import { existsSync, writeFileSync, rmSync } from 'node:fs';

describe('TopologyCommand', () => {
  let command: TopologyCommand;
  const snapshotA = 'snapshotA.json';
  const snapshotB = 'snapshotB.json';

  beforeEach(() => {
    command = new TopologyCommand();
    [snapshotA, snapshotB].forEach(f => {
      if (existsSync(f)) rmSync(f);
    });
  });

  it('should detect module migration between communities', async () => {
    // Snapshot A: Two distinct clusters
    const dataA = {
      files: { 'A1.ts': '', 'A2.ts': '', 'A3.ts': '', 'B1.ts': '', 'B2.ts': '', 'B3.ts': '' },
      graph: {
        nodes: [
          { id: 'A1.ts', label: 'A1', type: 'code' }, { id: 'A2.ts', label: 'A2', type: 'code' }, { id: 'A3.ts', label: 'A3', type: 'code' },
          { id: 'B1.ts', label: 'B1', type: 'code' }, { id: 'B2.ts', label: 'B2', type: 'code' }, { id: 'B3.ts', label: 'B3', type: 'code' }
        ],
        edges: [
          { source: 'A1.ts', target: 'A2.ts', relation: 'imports' }, { source: 'A2.ts', target: 'A3.ts', relation: 'imports' }, { source: 'A3.ts', target: 'A1.ts', relation: 'imports' },
          { source: 'B1.ts', target: 'B2.ts', relation: 'imports' }, { source: 'B2.ts', target: 'B3.ts', relation: 'imports' }, { source: 'B3.ts', target: 'B1.ts', relation: 'imports' }
        ]
      }
    };
    
    // Snapshot B: B1 migrated to Cluster A
    const dataB = {
      files: { 'A1.ts': '', 'A2.ts': '', 'A3.ts': '', 'B1.ts': '', 'B2.ts': '', 'B3.ts': '' },
      graph: {
        nodes: [
          { id: 'A1.ts', label: 'A1', type: 'code' }, { id: 'A2.ts', label: 'A2', type: 'code' }, { id: 'A3.ts', label: 'A3', type: 'code' },
          { id: 'B1.ts', label: 'B1', type: 'code' }, { id: 'B2.ts', label: 'B2', type: 'code' }, { id: 'B3.ts', label: 'B3', type: 'code' }
        ],
        edges: [
          { source: 'A1.ts', target: 'A2.ts', relation: 'imports' }, { source: 'A2.ts', target: 'A3.ts', relation: 'imports' }, { source: 'A3.ts', target: 'A1.ts', relation: 'imports' },
          { source: 'B1.ts', target: 'A1.ts', relation: 'imports' }, // Migration!
          { source: 'B2.ts', target: 'B3.ts', relation: 'imports' }, { source: 'B3.ts', target: 'B2.ts', relation: 'imports' }
        ]
      }
    };

    writeFileSync(snapshotA, JSON.stringify(dataA));
    writeFileSync(snapshotB, JSON.stringify(dataB));

    const result = await command.execute([snapshotA, snapshotB], { silent: true }, { stdinIsPipe: false });
    
    expect(result.success).toBe(true);
    // The report should contain mentions of migration
    expect(result.output).toContain('B1.ts');
    expect(result.output).toContain('Migrated');
    
    rmSync(snapshotA);
    rmSync(snapshotB);
  });
});
