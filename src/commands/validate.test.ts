import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidateCommand } from './validate.js';
import { execFileSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';

vi.mock('child_process', () => ({
  execFileSync: vi.fn()
}));

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    lstatSync: vi.fn().mockReturnValue({ isFile: () => true })
  };
});

describe('ValidateCommand', () => {
  let command: ValidateCommand;

  beforeEach(() => {
    command = new ValidateCommand();
    vi.clearAllMocks();
  });

  it('should fail if target branch is missing', async () => {
    const result = await command.execute([], {}, { stdinIsPipe: false });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Target branch/commit is required');
  });

  it('should handle no changes detected', async () => {
    (execFileSync as any).mockReturnValue('');
    const result = await command.execute(['main'], {}, { stdinIsPipe: false });
    expect(result.success).toBe(true);
    expect(result.output).toContain('No local changes detected');
  });

  it('should generate a validation snapshot with blast radius', async () => {
    // Setup git mocks
    (execFileSync as any).mockImplementation((cmd: string, args?: string[]) => {
      if (args && args.includes('diff')) return 'src/utils/output.ts\n';
      if (args && args.includes('ls-files')) return 'src/utils/output.ts\nsrc/utils/command.ts\npackage.json\n';
      return '';
    });

    // Setup fs mocks
    (existsSync as any).mockImplementation((p: string) => {
      const allowed = ['src/utils/output.ts', 'src/utils/command.ts', 'package.json'];
      return allowed.some(f => p.endsWith(f));
    });
    (readFileSync as any).mockImplementation((path: string) => {
      if (path.includes('command.ts')) return "import { printOutput } from './output.js';";
      if (path.includes('output.ts')) return "export const printOutput = () => {};";
      return '{}';
    });

    const result = await command.execute(['main'], { silent: true }, { stdinIsPipe: false });
    
    expect(result.success).toBe(true);
    const snapshot = JSON.parse(result.output!);
    
    // Changed file
    expect(snapshot.files['src/utils/output.ts']).toBeDefined();
    // Dependent file (blast radius)
    expect(snapshot.files['src/utils/command.ts']).toBeDefined();
    // Non-dependent file
    expect(snapshot.files['package.json']).toBeUndefined();
    
    expect(snapshot.instruction).toContain('Analyze the structural and logical changes');
    expect(snapshot.instruction).toContain('src/utils/output.ts');
    expect(snapshot.instruction).toContain('src/utils/command.ts');
  });

  it('should respect --all flag', async () => {
    (execFileSync as any).mockImplementation((cmd: string, args?: string[]) => {
        if (args && args.includes('diff')) return 'src/utils/output.ts\n';
        if (args && args.includes('ls-files')) return 'src/utils/output.ts\nsrc/utils/command.ts\npackage.json\n';
        return '';
    });
    (existsSync as any).mockReturnValue(true);

    const result = await command.execute(['main', '--all'], { silent: true }, { stdinIsPipe: false });
    
    expect(result.success).toBe(true);
    const snapshot = JSON.parse(result.output!);
    expect(Object.keys(snapshot.files)).toHaveLength(3);
    expect(snapshot.files['package.json']).toBeDefined();
  });
});
