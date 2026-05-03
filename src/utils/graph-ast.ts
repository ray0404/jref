import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as https from 'https';
import { GraphNode, GraphEdge } from '../types/index.js';
import { loadConfig } from './config.js';
import { output } from './output.js';

/**
 * Utility for deterministic AST extraction using tree-sitter.
 * Maps code structures to nodes and edges in a knowledge graph.
 */

const WASM_CACHE_DIR = path.join(os.homedir(), '.jref', 'wasm');
const TS_GHPAGES_BASE = 'https://tree-sitter.github.io';
export const CORE_WASM_URL = 'https://unpkg.com/web-tree-sitter/web-tree-sitter.wasm';

export const LANGUAGE_REGISTRY: Record<string, { wasm: string, url: string }> = {
  '.ts': { wasm: 'tree-sitter-typescript.wasm', url: `${TS_GHPAGES_BASE}/tree-sitter-typescript.wasm` },
  '.tsx': { wasm: 'tree-sitter-tsx.wasm', url: `${TS_GHPAGES_BASE}/tree-sitter-tsx.wasm` },
  '.js': { wasm: 'tree-sitter-javascript.wasm', url: `${TS_GHPAGES_BASE}/tree-sitter-javascript.wasm` },
  '.jsx': { wasm: 'tree-sitter-javascript.wasm', url: `${TS_GHPAGES_BASE}/tree-sitter-javascript.wasm` },
  '.json': { wasm: 'tree-sitter-json.wasm', url: `https://unpkg.com/tree-sitter-wasms/out/tree-sitter-json.wasm` }, // fallback as it wasn't on ghpages
  '.py': { wasm: 'tree-sitter-python.wasm', url: `${TS_GHPAGES_BASE}/tree-sitter-python.wasm` },
  '.rs': { wasm: 'tree-sitter-rust.wasm', url: `${TS_GHPAGES_BASE}/tree-sitter-rust.wasm` },
  '.go': { wasm: 'tree-sitter-go.wasm', url: `${TS_GHPAGES_BASE}/tree-sitter-go.wasm` },
  '.cpp': { wasm: 'tree-sitter-cpp.wasm', url: `${TS_GHPAGES_BASE}/tree-sitter-cpp.wasm` },
  '.c': { wasm: 'tree-sitter-c.wasm', url: `${TS_GHPAGES_BASE}/tree-sitter-c.wasm` },
  '.zig': { wasm: 'tree-sitter-zig.wasm', url: `https://github.com/maxxnino/tree-sitter-zig/raw/main/tree-sitter-zig.wasm` },
};

let initialized = false;
let Parser: any = null;
let Language: any = null;

/**
 * Downloads a file from a URL to a local path
 */
async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error(`Redirect without location header: ${url}`));
          return;
        }
        // Handle relative redirects
        const nextUrl = redirectUrl.startsWith('http') ? redirectUrl : new URL(redirectUrl, url).toString();
        downloadFile(nextUrl, dest).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode} ${url}`));
        return;
      }

      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const file = fs.createWriteStream(dest);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      file.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Ensures a WASM file exists in the cache, downloading if necessary.
 */
export async function ensureWasm(wasmName: string, url: string): Promise<string> {
  const targetPath = path.join(WASM_CACHE_DIR, wasmName);
  
  if (fs.existsSync(targetPath)) {
    return targetPath;
  }

  const config = loadConfig();
  if (!config.autoDownloadWasm) {
    throw new Error(`WASM ${wasmName} not found and auto-download is disabled.`);
  }

  output.info(`Downloading ${wasmName} parser...`);
  await downloadFile(url, targetPath);
  return targetPath;
}

async function ensureInitialized() {
  if (initialized) return;

  try {
    const mod = await import('web-tree-sitter');
    Parser = mod.default || mod.Parser;
    Language = mod.Language;

    // Ensure core WASM is available
    const coreWasmPath = await ensureWasm('tree-sitter.wasm', CORE_WASM_URL);

    // In Node.js environment with web-tree-sitter
    await Parser.init({
      locateFile: () => coreWasmPath
    });
    initialized = true;
  } catch (err) {
    output.warn('⚠️ web-tree-sitter failed to initialize. AST extraction disabled.');
    throw err;
  }
}

/**
 * Extracts nodes and edges from a source file using AST traversal.
 */
export async function extractGraphFromSource(
  filePath: string, 
  content: string,
  baseDir: string = process.cwd()
): Promise<{ nodes: GraphNode[], edges: GraphEdge[] }> {
  try {
    await ensureInitialized();
  } catch {
    return { nodes: [], edges: [] };
  }

  const ext = path.extname(filePath).toLowerCase();
  const langInfo = LANGUAGE_REGISTRY[ext];
  
  if (!langInfo) {
    return { nodes: [], edges: [] };
  }

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  const relativePath = path.relative(baseDir, filePath);
  
  // Add file node
  nodes.push({
    id: relativePath,
    label: path.basename(filePath),
    type: 'code',
    source_file: relativePath,
  });

  try {
    const wasmPath = await ensureWasm(langInfo.wasm, langInfo.url);
    const lang = await Language.load(wasmPath);
    const parser = new Parser();
    parser.setLanguage(lang);

    const tree = parser.parse(content);
    if (!tree) return { nodes, edges };
    const cursor = tree.walk();

    // Traverse AST
    let reachedRoot = false;
    while (!reachedRoot) {
      const node = cursor.currentNode;
      
      // Extract function declarations, classes, etc.
      if (
        node.type === 'function_declaration' || 
        node.type === 'method_definition' ||
        node.type === 'class_declaration' ||
        node.type === 'interface_declaration' ||
        node.type === 'export_statement'
      ) {
        // Basic identification of named symbols
        let nameNode = node.childForFieldName('name');
        if (!nameNode && (node.type === 'method_definition' || node.type === 'pair')) {
          nameNode = node.childForFieldName('key');
        }
        
        if (nameNode) {
          const symbolName = nameNode.text;
          const symbolId = `${relativePath}:${node.type}:${symbolName}`;
          
          nodes.push({
            id: symbolId,
            label: symbolName,
            type: 'code',
            source_file: relativePath,
            source_location: `${node.startPosition.row + 1}:${node.startPosition.column}`,
          });
          
          // Edge from file to symbol
          edges.push({
            source: relativePath,
            target: symbolId,
            relation: 'contains',
            confidence: 'EXTRACTED',
            weight: 1.0,
          });
        }
      }

      // Extract imports
      if (node.type === 'import_statement' || node.type === 'import_declaration') {
        const sourceNode = node.childForFieldName('source');
        if (sourceNode) {
          const importPath = sourceNode.text.replace(/['"]/g, '');
          
          edges.push({
            source: relativePath,
            target: importPath, // This will need resolution later
            relation: 'imports',
            confidence: 'EXTRACTED',
            weight: 1.0,
          });
        }
      }

      // Traversal logic
      if (cursor.gotoFirstChild()) {
        continue;
      }
      
      while (!cursor.gotoNextSibling()) {
        if (!cursor.gotoParent()) {
          reachedRoot = true;
          break;
        }
      }
    }
  } catch (error) {
    // Graceful degradation: If WASM fails to load or parse, we still have the file node
    output.warn(`Skipping AST for ${filePath}: ${(error as Error).message}`);
  }

  return { nodes, edges };
}
