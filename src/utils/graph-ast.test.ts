import { describe, it, expect, beforeAll } from 'vitest';
import { extractGraphFromSource } from './graph-ast';
import * as path from 'path';

describe('graph-ast', () => {
  it('should extract nodes and edges from a TypeScript file', async () => {
    const filePath = 'test.ts';
    const content = `
      import { other } from './other';
      
      export function hello() {
        console.log("world");
      }
      
      class MyClass {
        myMethod() {
          return 1;
        }
      }
    `;
    
    const result = await extractGraphFromSource(filePath, content);
    
    expect(result.nodes).toContainEqual(expect.objectContaining({
      id: 'test.ts',
      type: 'code'
    }));
    
    expect(result.nodes).toContainEqual(expect.objectContaining({
      label: 'hello',
      type: 'code'
    }));
    
    expect(result.edges).toContainEqual(expect.objectContaining({
      source: 'test.ts',
      relation: 'imports',
      target: './other'
    }));
    
    expect(result.edges).toContainEqual(expect.objectContaining({
      source: 'test.ts',
      relation: 'contains'
    }));
  });

  it('should return empty graph for unsupported extensions', async () => {
    const result = await extractGraphFromSource('test.txt', 'hello');
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });
});
