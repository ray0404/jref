import { describe, it, expect } from 'vitest';
import { chunkCode } from './chunking.js';

describe('chunkCode', () => {
  it('should chunk TypeScript functions and classes', () => {
    const code = `
export function hello(name: string) {
  console.log("Hello " + name);
}

export class Greeter {
  greet() {
    return "Hi";
  }
}

const arrow = () => {
  return true;
};
    `;
    const chunks = chunkCode('test.ts', code);
    
    expect(chunks.some(c => c.type === 'function' && c.name === 'hello')).toBe(true);
    expect(chunks.some(c => c.type === 'class' && c.name === 'Greeter')).toBe(true);
    expect(chunks.some(c => c.type === 'function' && c.name === 'arrow')).toBe(true);
  });

  it('should chunk Python functions and classes', () => {
    const code = `
def hello(name):
    print(f"Hello {name}")

class Greeter:
    def greet(self):
        return "Hi"
    `;
    const chunks = chunkCode('test.py', code);
    
    expect(chunks.some(c => c.type === 'function' && c.name === 'hello')).toBe(true);
    expect(chunks.some(c => c.type === 'class' && c.name === 'Greeter')).toBe(true);
  });

  it('should fallback to line-based chunking for unknown languages', () => {
    const code = "line1\nline2\nline3";
    const chunks = chunkCode('test.txt', code);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].type).toBe('block');
  });
});
