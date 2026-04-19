
import { describe, it, expect, beforeEach } from 'vitest';
import { SummarizeCommand } from './summarize.js';
import type { ProjectSnapshot } from '../types/index.js';

describe('SummarizeCommand', () => {
  let command: SummarizeCommand;
  let mockSnapshot: ProjectSnapshot;

  beforeEach(() => {
    command = new SummarizeCommand();
    mockSnapshot = {
      directoryStructure: 'src/main.ts',
      files: {
        'src/main.ts': 'export function add(a: number, b: number) {\n  return a + b;\n}\n\nexport class Calculator {\n  multiply(a: number, b: number) {\n    return a * b;\n  }\n}'
      }
    };
  });

  it('should be registered', () => {
    expect(command.definition.name).toBe('summarize');
  });

  it('should strip function and class bodies', async () => {
    const context = { snapshot: mockSnapshot, stdinIsPipe: false };
    const result = await command.execute([], { json: true }, context);
    
    expect(result.success).toBe(true);
    const summary = JSON.parse(result.output!);
    const content = summary.files['src/main.ts'];
    
    expect(content).toContain('export function add(a: number, b: number)');
    expect(content).not.toContain('return a + b;');
    expect(content).toContain('export class Calculator');
    expect(content).not.toContain('return a * b;');
  });
});
