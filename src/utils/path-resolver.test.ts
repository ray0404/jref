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

    it('should set values in arrays', () => {
      const obj: any = { list: [{ id: 1 }] };
      setValueByPath(obj, 'list[1]', { id: 2 });
      expect(obj.list[1]).toEqual({ id: 2 });
    });
  });

  describe('parsePath edge cases', () => {
    it('should parse escaped quotes in dot-quoted notation', () => {
      expect(parsePath('files."src/main\\"ts"')).toEqual(['files', 'src/main"ts']);
      expect(parsePath("files.'src/main\\'ts'")).toEqual(['files', "src/main'ts"]);
    });

    it('should parse dot-quoted notation that ends right after the quote', () => {
      expect(parsePath('"src/main.ts"')).toEqual(['src/main.ts']);
      expect(parsePath("'src/main.ts'")).toEqual(['src/main.ts']);
    });

    it('should handle unclosed quotes', () => {
      expect(parsePath('files."src/main')).toEqual(['files', 'src/main']);
      expect(parsePath("files['src/main")).toEqual(['files', 'src/main']);
      expect(parsePath("files[src/main")).toEqual(['files', 'src/main']);
    });

    it('should handle extra brackets', () => {
      expect(parsePath('a[0]]')).toEqual(['a', '0', ']']);
    });
  });

  describe('getValueByPath edge cases', () => {
    it('should handle null or non-object values gracefully', () => {
      const obj = { a: null, b: "string", c: 42 };
      expect(getValueByPath(obj, 'a.x')).toBeUndefined();
      expect(getValueByPath(obj, 'b.x')).toBeUndefined();
      expect(getValueByPath(obj, 'c.x')).toBeUndefined();
      expect(getValueByPath(null, 'a')).toBeUndefined();
      expect(getValueByPath(undefined, 'a')).toBeUndefined();
      expect(getValueByPath({}, 'a')).toBeUndefined();
    });
  });

  describe('setValueByPath edge cases', () => {
    it('should handle setting values on non-objects by creating intermediate objects', () => {
      const obj = { a: null, b: "string", c: 42 };
      setValueByPath(obj, 'a.x', 1);
      expect(obj.a).toEqual({ x: 1 });

      setValueByPath(obj, 'b.x', 2);
      expect(obj.b).toEqual({ x: 2 });

      setValueByPath(obj, 'c.x', 3);
      expect(obj.c).toEqual({ x: 3 });
    });

    it('should handle setting with empty path (which does nothing)', () => {
      const obj = { a: 1 };
      setValueByPath(obj, '', 2);
      expect(obj).toEqual({ a: 1 }); // Still a:1
    });
  });


  describe('parsePath with dot-quoted edge case', () => {
    it('should push current token before dot-quoted notation', () => {
      // In parsePath, line 63-65 pushes currentToken when seeing " or '
      expect(parsePath('a"b"')).toEqual(['a', 'b']);
    });
  });

});