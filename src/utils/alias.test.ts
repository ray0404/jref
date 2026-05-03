import { describe, it, expect } from 'vitest';
import { expandAliases } from './alias.js';
import { AliasConfig } from '../types/index.js';

describe('Alias System', () => {
  const config: AliasConfig = {
    'l': ['inspect'],
    's': ['search'],
    'la': ['l', '--all'],
    'recursive': ['recursive'],
    'cycle1': ['cycle2'],
    'cycle2': ['cycle1'],
    'deep': ['la', '--verbose']
  };

  it('should expand a simple alias', () => {
    const result = expandAliases(['l', 'file.json'], config);
    expect(result).toEqual(['inspect', 'file.json']);
  });

  it('should expand nested aliases', () => {
    const result = expandAliases(['la', 'file.json'], config);
    expect(result).toEqual(['inspect', '--all', 'file.json']);
  });

  it('should expand deeply nested aliases', () => {
    const result = expandAliases(['deep', 'file.json'], config);
    expect(result).toEqual(['inspect', '--all', '--verbose', 'file.json']);
  });

  it('should not expand if not an alias', () => {
    const result = expandAliases(['inspect', 'file.json'], config);
    expect(result).toEqual(['inspect', 'file.json']);
  });

  it('should throw on direct circular dependency', () => {
    expect(() => expandAliases(['recursive'], config)).toThrow('Circular alias detected: recursive -> recursive');
  });

  it('should throw on indirect circular dependency', () => {
    expect(() => expandAliases(['cycle1'], config)).toThrow('Circular alias detected: cycle1 -> cycle2 -> cycle1');
  });

  it('should handle empty args', () => {
    const result = expandAliases([], config);
    expect(result).toEqual([]);
  });
});
