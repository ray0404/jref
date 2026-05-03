import { Volume, type DirectoryJSON } from 'memfs';
import * as git from 'isomorphic-git';
import type { ProjectSnapshot } from '../types/index.js';
import { join } from 'path';
import { decodeBase64, encodeBase64, isBinaryBuffer } from './binary.js';

/**
 * Create a virtual filesystem from a project snapshot
 */
export function createVirtualFs(snapshot: ProjectSnapshot) {
  const files: DirectoryJSON = {};

  for (const [path, content] of Object.entries(snapshot.files)) {
    // Ensure all paths start with / for memfs consistency
    const fsPath = path.startsWith('/') ? path : `/${path}`;

    if (snapshot.encodings && snapshot.encodings[path] === 'base64') {
      files[fsPath] = decodeBase64(content);
    } else {
      files[fsPath] = content;
    }
  }

  return Volume.fromJSON(files);
}

/**
 * Export virtual filesystem back to snapshot format
 * @param vol The memfs volume
 * @param originalPaths List of paths that were originally relative (no leading slash)
 */
export function exportVirtualFs(vol: any, originalPaths: Set<string> = new Set()): { 
  files: Record<string, string>; 
  encodings: Record<string, 'base64' | 'utf8'> 
} {
  const files: Record<string, string> = {};
  const encodings: Record<string, 'base64' | 'utf8'> = {};

  function walk(dir: string) {
    const entries = vol.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        const buffer = vol.readFileSync(fullPath) as Buffer;
        let exportedPath = fullPath;
        if (fullPath.startsWith('/') && !originalPaths.has(fullPath)) {
          exportedPath = fullPath.slice(1);
        }

        if (isBinaryBuffer(buffer)) {
          files[exportedPath] = encodeBase64(buffer);
          encodings[exportedPath] = 'base64';
        } else {
          files[exportedPath] = buffer.toString('utf8');
          encodings[exportedPath] = 'utf8';
        }
      }
    }
  }

  walk('/');
  return { files, encodings };
}

/**
 * Common git options for isomorphic-git
 */
export function getGitOptions(fs: any, dir: string = process.cwd()) {
  // memfs uses '/' as root for virtual, but for local we want absolute path
  const isVirtual = fs && fs.toJSON; 
  const effectiveDir = isVirtual ? '/' : dir;
  
  return {
    fs,
    dir: effectiveDir,
    gitdir: join(effectiveDir, '.git')
  };
}

/**
 * Initialize a git repository in the virtual filesystem
 */
export async function initRepo(fs: any, dir: string = '/') {
  await git.init(getGitOptions(fs, dir));
}
