import { describe, it, expect } from 'vitest';
import { flattenObject, unflattenLines } from './flatten.js';

describe('Flattening Engine', () => {
  const sampleObj = {
    instruction: "Hello world",
    files: {
      "src/index.ts": "console.log('hi');",
      "README.md": "# Readme"
    },
    meta: {
      version: 1,
      tags: ["ai", "cli"]
    }
  };

  describe('flattenObject', () => {
    it('should flatten a nested object using dot and bracket notation', () => {
      const lines = flattenObject(sampleObj);
      
      expect(lines).toContain('snapshot.instruction = "Hello world";');
      expect(lines).toContain('snapshot.files["src/index.ts"] = "console.log(\'hi\');";');
      expect(lines).toContain('snapshot.files["README.md"] = "# Readme";');
      expect(lines).toContain('snapshot.meta.version = 1;');
      expect(lines).toContain('snapshot.meta.tags[0] = "ai";');
      expect(lines).toContain('snapshot.meta.tags[1] = "cli";');
    });

    it('should handle special characters in keys with bracket notation', () => {
      const obj = { "key with spaces": 1, "key/with/slashes": 2, "normal": 3 };
      const lines = flattenObject(obj);
      
      expect(lines).toContain('snapshot["key with spaces"] = 1;');
      expect(lines).toContain('snapshot["key/with/slashes"] = 2;');
      expect(lines).toContain('snapshot.normal = 3;');
    });

    it('should handle complex nested paths correctly', () => {
       const obj = { a: { "b.c": { d: 1 } } };
       const lines = flattenObject(obj);
       expect(lines).toContain('snapshot.a["b.c"].d = 1;');
    });
  });

  describe('unflattenLines', () => {
    it('should reconstruct an object from flattened lines', () => {
      const lines = [
        'snapshot.instruction = "Hello world";',
        'snapshot.files["src/index.ts"] = "console.log(\'hi\');";',
        'snapshot.meta.version = 1;',
        'snapshot.meta.tags[0] = "ai";'
      ];
      
      const result = unflattenLines(lines);
      expect(result.instruction).toBe("Hello world");
      expect(result.files["src/index.ts"]).toBe("console.log('hi');");
      expect(result.meta.version).toBe(1);
      expect(result.meta.tags[0]).toBe("ai");
    });
  });

  describe('Symmetry', () => {
    it('should be perfectly symmetrical', () => {
      const obj = {
        a: 1,
        b: { c: 2, d: [3, 4] },
        "e/f": { g: "h" },
        i: [ { j: 5 } ]
      };
      
      const lines = flattenObject(obj);
      const reconstructed = unflattenLines(lines);
      
      expect(reconstructed).toEqual(obj);
    });
  });
});
