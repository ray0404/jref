import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { createHash } from 'crypto';

export interface FileHashMap {
  [path: string]: string;
}

/**
 * Generate a hash map for a directory
 */
export function generateFileHashMap(dir: string, ignorePatterns: string[] = []): FileHashMap {
  const hashMap: FileHashMap = {};

  const walk = (currentDir: string) => {
    const entries = readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      const relPath = relative(dir, fullPath).replace(/\\/g, '/');

      // Simple ignore logic
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') continue;
      if (ignorePatterns.some(p => relPath.includes(p))) continue;

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        try {
          const content = readFileSync(fullPath);
          const hash = createHash('md5').update(content).digest('hex');
          hashMap[relPath] = hash;
        } catch (err) {
          // Skip files we can't read
        }
      }
    }
  };

  walk(dir);
  return hashMap;
}

/**
 * Compare two hash maps and return paths that are different or new in the local map
 */
export function getDeltaPaths(localMap: FileHashMap, remoteMap: FileHashMap): string[] {
  const deltaPaths: string[] = [];

  for (const [path, hash] of Object.entries(localMap)) {
    if (remoteMap[path] !== hash) {
      deltaPaths.push(path);
    }
  }

  return deltaPaths;
}
