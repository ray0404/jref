import { readFileSync, lstatSync, existsSync } from 'fs';
import { join, relative, dirname, extname, resolve } from 'path';

/**
 * Dependency Graph structure representing file relationships
 */
export interface DependencyGraph {
  // Map of file path to list of files that depend on it (the inverse of imports)
  dependents: Record<string, string[]>;
}

/**
 * Build a dependent graph for the project by scanning file contents for imports
 * @param rootDir The root directory of the project
 * @param allFiles List of all files to scan (relative to rootDir)
 */
export function buildDependentGraph(rootDir: string, allFiles: string[]): DependencyGraph {
  const dependents: Record<string, string[]> = {};

  for (const file of allFiles) {
    const fullPath = join(rootDir, file);
    
    // Only scan files that exist and are actually files
    if (!existsSync(fullPath) || !lstatSync(fullPath).isFile()) continue;

    const imports = getImports(fullPath);
    for (const imp of imports) {
      const resolved = resolveImport(fullPath, imp, rootDir);
      if (resolved) {
        const relResolved = relative(rootDir, resolved);
        
        // Add current file as a dependent of the resolved import
        if (!dependents[relResolved]) {
          dependents[relResolved] = [];
        }
        
        if (!dependents[relResolved].includes(file)) {
          dependents[relResolved].push(file);
        }
      }
    }
  }

  return { dependents };
}

/**
 * Extract imports from a file based on its extension using regex heuristics
 */
function getImports(filePath: string): string[] {
  const ext = extname(filePath).toLowerCase();
  
  // Skip large binary files or non-source files
  const textExtensions = ['.ts', '.js', '.tsx', '.jsx', '.mjs', '.cjs', '.rs', '.cpp', '.h', '.hpp', '.c', '.go', '.py'];
  if (!textExtensions.includes(ext)) return [];

  let content: string;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }
  
  const imports: string[] = [];

  // JavaScript / TypeScript patterns
  if (['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'].includes(ext)) {
    // import { x } from './y';
    // import x from './y';
    // export * from './y';
    // const x = require('./y');
    const JS_TS_PATTERNS = [
      /import\s+.*?\s+from\s+['"](.*?)['"]/g,
      /import\(['"](.*?)['"]\)/g,
      /require\(['"](.*?)['"]\)/g,
      /export\s+.*?\s+from\s+['"](.*?)['"]/g
    ];

    for (const pattern of JS_TS_PATTERNS) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
      }
    }
  } 
  // Rust patterns
  else if (ext === '.rs') {
    const RUST_PATTERNS = [
      /mod\s+([a-zA-Z0-9_]+);/g,
      /use\s+([a-zA-Z0-9_:]+);/g
    ];
    for (const pattern of RUST_PATTERNS) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const imp = match[1];
        if (imp) imports.push(imp);
      }
    }
  }
  // C / C++ patterns
  else if (['.cpp', '.h', '.hpp', '.c'].includes(ext)) {
    const CPP_PATTERN = /#include\s+["'](.*?)["']/g;
    let match;
    while ((match = CPP_PATTERN.exec(content)) !== null) {
      if (match[1]) imports.push(match[1]);
    }
  }
  // Python patterns
  else if (ext === '.py') {
    const PY_PATTERNS = [
      /import\s+([a-zA-Z0-9_.]+)/g,
      /from\s+([a-zA-Z0-9_.]+)\s+import/g
    ];
    for (const pattern of PY_PATTERNS) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) imports.push(match[1].replace(/\./g, '/'));
      }
    }
  }

  return imports;
}

/**
 * Resolve an import string to a physical file path
 */
function resolveImport(sourceFile: string, importPath: string, rootDir: string): string | null {
  // Support both relative and some absolute-style imports if needed
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    // Check if it matches a file in the root directory (heuristic for some projects)
    const rootPotential = resolve(rootDir, importPath);
    if (existsSync(rootPotential) && lstatSync(rootPotential).isFile()) return rootPotential;
    
    // Try some common source subdirectories if it looks like a local path
    const srcPotential = resolve(rootDir, 'src', importPath);
    if (existsSync(srcPotential) && lstatSync(srcPotential).isFile()) return srcPotential;

    return null;
  }

  const sourceDir = dirname(sourceFile);
  const baseResolved = resolve(sourceDir, importPath);

  // 1. Try exact path and common extensions
  const extensions = ['', '.ts', '.js', '.tsx', '.jsx', '.rs', '.cpp', '.py', '.go', '.h'];
  for (const ext of extensions) {
    const p = baseResolved + ext;
    if (existsSync(p) && lstatSync(p).isFile()) {
      return p;
    }
  }

  // 2. Handle ESM .js -> .ts resolution (TypeScript convention)
  const currentExt = extname(importPath);
  if (['.js', '.mjs', '.cjs'].includes(currentExt)) {
    const barePath = baseResolved.slice(0, -currentExt.length);
    for (const ext of ['.ts', '.tsx', '.mts', '.cts']) {
      const p = barePath + ext;
      if (existsSync(p) && lstatSync(p).isFile()) {
        return p;
      }
    }
  }

  // 3. Directory index priority
  const indices = ['/index.ts', '/index.js', '/mod.rs', '/__init__.py', '/index.tsx'];
  for (const idx of indices) {
    const p = baseResolved + idx;
    if (existsSync(p) && lstatSync(p).isFile()) {
      return p;
    }
  }

  return null;
}

/**
 * Calculate the blast radius (affected dependents) of a set of changed files
 * @param changedFiles List of files that were mutated
 * @param graph The dependent graph
 * @param maxDepth How many levels of dependents to traverse
 */
export function getBlastRadius(
  changedFiles: string[], 
  graph: DependencyGraph, 
  maxDepth: number = 1
): string[] {
  const affected = new Set<string>();
  let currentLevel = new Set<string>(changedFiles);

  // We want to exclude the original changed files from the "affected" list 
  // as they are already identified as changed.
  const initialChanged = new Set(changedFiles);

  for (let d = 0; d < maxDepth; d++) {
    const nextLevel = new Set<string>();
    for (const file of currentLevel) {
      const dependents = graph.dependents[file] || [];
      for (const dep of dependents) {
        if (!affected.has(dep) && !initialChanged.has(dep)) {
          affected.add(dep);
          nextLevel.add(dep);
        }
      }
    }
    if (nextLevel.size === 0) break;
    currentLevel = nextLevel;
  }

  return Array.from(affected);
}
