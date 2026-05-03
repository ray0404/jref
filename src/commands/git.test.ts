import { describe, it, expect, vi } from 'vitest';
import { GitCommand } from './git.js';
import type { CommandContext, CLIOptions } from '../types/index.js';

describe('GitCommand', () => {
  const mockSnapshot = {
    files: {
      'README.md': '# Test Project'
    },
    directoryStructure: '.\n└── README.md\n'
  };

  const context: CommandContext = {
    stdin: JSON.stringify(mockSnapshot),
    stdinIsPipe: true
  };

  const options: CLIOptions = {
    json: true,
    silent: true
  };

  it('should initialize a repo if not present', async () => {
    const cmd = new GitCommand();
    const result = await cmd.execute(['status'], options, context);
    
    expect(result.success).toBe(true);
    const updatedSnapshot = JSON.parse(result.output!);
    expect(updatedSnapshot.files['.git/config']).toBeDefined();
  });

  it('should add a file to index', async () => {
    const cmd = new GitCommand();
    const statusResult = await cmd.execute(['status'], options, context);
    const snapshotWithGit = statusResult.output!;
    
    const addResult = await cmd.execute(['add', 'README.md'], options, {
        ...context,
        stdin: snapshotWithGit
    });
    
    expect(addResult.success).toBe(true);
    const snapshotAdded = JSON.parse(addResult.output!);
    expect(snapshotAdded.files['.git/index']).toBeDefined();
  });

  it('should commit changes', async () => {
    const cmd = new GitCommand();
    
    // 1. Status (auto-init)
    const res1 = await cmd.execute(['status'], options, context);
    
    // 2. Add
    const res2 = await cmd.execute(['add', 'README.md'], options, {
        ...context,
        stdin: res1.output!
    });
    
    // 3. Commit
    const res3 = await cmd.execute(['commit', '-m', 'Initial commit'], options, {
        ...context,
        stdin: res2.output!
    });
    
    expect(res3.success).toBe(true);
    const finalSnapshot = JSON.parse(res3.output!);
    expect(Object.keys(finalSnapshot.files).some(p => p.startsWith('.git/objects/'))).toBe(true);
  });
});
