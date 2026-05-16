import { describe, it, expect } from 'vitest';
import { parsePath, getValueByPath, setValueByPath } from './path-resolver.js';

describe('Path Resolver', () => {
  describe('parsePath', () => {
    it('should parse simple dot notation', () => {
      expect(parsePath('a.b.c')).toEqual(['a', 'b', 'c']);
    });

    it('should parse bracket notation with single quotes', () => {
      expect(parsePath("a['b']['c']")).toEqual(['a', 'b', 'c']);
    });

    it('should parse bracket notation with double quotes', () => {
      expect(parsePath('a["b"]["c"]')).toEqual(['a', 'b', 'c']);
    });

    it('should parse mixed dot and bracket notation', () => {
      expect(parsePath('a.b["c"].d')).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should parse bracket notation with dots and slashes', () => {
      expect(parsePath("files['src/main.ts']")).toEqual(['files', 'src/main.ts']);
      expect(parsePath('files["docs/index.md"]')).toEqual(['files', 'docs/index.md']);
    });

    it('should parse dot-quoted notation', () => {
      expect(parsePath('files."src/main.ts"')).toEqual(['files', 'src/main.ts']);
      expect(parsePath("files.'test.js'")).toEqual(['files', 'test.js']);
    });

    it('should handle escaped quotes in brackets', () => {
      expect(parsePath("a['b\\'c']")).toEqual(['a', "b'c"]);
      expect(parsePath('a["b\\"c"]')).toEqual(['a', 'b"c']);
    });

    it('should parse array indices', () => {
      expect(parsePath('a[0].b')).toEqual(['a', '0', 'b']);
    });
  });

  describe('getValueByPath', () => {
    const obj = {
      a: {
        b: {
          c: 123,
          'd.e': 456
        }
      },
      files: {
        'src/main.ts': 'console.log("hello");',
        'config.json': { version: '1.0.0' }
      },
      list: [
        { id: 1 },
        { id: 2 }
      ]
    };

    it('should retrieve simple nested values', () => {
      expect(getValueByPath(obj, 'a.b.c')).toBe(123);
    });

    it('should retrieve values with dots in keys using brackets', () => {
      expect(getValueByPath(obj, "a.b['d.e']")).toBe(456);
    });

    it('should retrieve values with slashes in keys', () => {
      expect(getValueByPath(obj, 'files."src/main.ts"')).toBe('console.log("hello");');
      expect(getValueByPath(obj, "files['src/main.ts']")).toBe('console.log("hello");');
    });

    it('should retrieve array elements', () => {
      expect(getValueByPath(obj, 'list[0].id')).toBe(1);
      expect(getValueByPath(obj, 'list[1]')).toEqual({ id: 2 });
    });

    it('should prevent prototype pollution in getValueByPath', () => {
      expect(() => getValueByPath(obj, '__proto__')).toThrow(/Prototype pollution attempt detected/);
      expect(() => getValueByPath(obj, 'constructor.prototype')).toThrow(/Prototype pollution attempt detected/);
    });

    it('should return undefined for non-existent paths', () => {
      expect(getValueByPath(obj, 'a.x.y')).toBeUndefined();
      expect(getValueByPath(obj, 'files.nonexistent')).toBeUndefined();
    });
  });

  describe('setValueByPath', () => {
    it('should set existing values', () => {
      const obj = { a: { b: 1 } };
      setValueByPath(obj, 'a.b', 2);
      expect(obj.a.b).toBe(2);
    });

    it('should create intermediate objects', () => {
      const obj: any = {};
      setValueByPath(obj, 'a.b.c', 123);
      expect(obj.a.b.c).toBe(123);
    });

    it('should work with complex keys', () => {
      const obj: any = { files: {} };
      setValueByPath(obj, 'files."src/app.ts"', 'content');
      expect(obj.files['src/app.ts']).toBe('content');
    });

    it('should prevent prototype pollution in setValueByPath', () => {
      const obj: any = {};
      expect(() => setValueByPath(obj, '__proto__.polluted', true)).toThrow(/Prototype pollution attempt detected/);
      expect(obj.polluted).toBeUndefined();
      expect(({} as any).polluted).toBeUndefined();
    });

    it('should set values in arrays', () => {
      const obj: any = { list: [{ id: 1 }] };
      setValueByPath(obj, 'list[1]', { id: 2 });
      expect(obj.list[1]).toEqual({ id: 2 });
    });
  });
});
