/**
 * Format Utility Tests
 */

import { describe, it, expect } from 'vitest';
import { sniffFormat, translateSnapshot } from './format.js';

describe('sniffFormat', () => {
  it('should detect JSON from extension', () => {
    expect(sniffFormat('{}', 'test.json')).toBe('json');
  });

  it('should detect YAML from extension', () => {
    expect(sniffFormat('key: value', 'test.yaml')).toBe('yaml');
    expect(sniffFormat('key: value', 'test.yml')).toBe('yaml');
  });

  it('should detect TOML from extension', () => {
    expect(sniffFormat('key = "value"', 'test.toml')).toBe('toml');
  });

  it('should detect XML from extension', () => {
    expect(sniffFormat('<root></root>', 'test.xml')).toBe('xml');
  });

  it('should detect JSON from content', () => {
    expect(sniffFormat('  { "a": 1 }')).toBe('json');
  });

  it('should detect YAML from content', () => {
    expect(sniffFormat('---\nkey: value')).toBe('yaml');
  });

  it('should detect XML from content', () => {
    expect(sniffFormat('<?xml version="1.0"?>\n<root></root>')).toBe('xml');
  });
});

describe('translateSnapshot', () => {
  it('should translate YAML to ProjectSnapshot', async () => {
    const yaml = `
directoryStructure: |
  .
  └── a.ts
files:
  a.ts: "content"
`;
    const result = await translateSnapshot(yaml, 'yaml');
    expect(result.files['a.ts']).toBe('content');
    expect(result.directoryStructure).toContain('a.ts');
  });

  it('should translate Repomix XML to ProjectSnapshot', async () => {
    const xml = `
<repomix>
  <structure>.
└── main.ts</structure>
  <files>
    <file path="main.ts">console.log("hello");</file>
  </files>
</repomix>
`;
    const result = await translateSnapshot(xml, 'xml');
    expect(result.files['main.ts']).toBe('console.log("hello");');
    expect(result.directoryStructure).toContain('main.ts');
  });

  it('should translate JSON5', async () => {
    const json5 = "{ files: { 'a.ts': 'c' } }"; // keys without quotes
    const result = await translateSnapshot(json5, 'json5');
    expect(result.files['a.ts']).toBe('c');
  });
});
