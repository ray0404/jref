import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { GraphNode, GraphEdge } from '../types/index.js';

/**
 * Utility for deterministic AST extraction using tree-sitter.
 * Maps code structures to nodes and edges in a knowledge graph.
 */

const PARSER_MAP: Record<string, string> = {
  '.ts': 'tree-sitter-typescript.wasm',
  '.js': 'tree-sitter-javascript.wasm',
  '.json': 'tree-sitter-json.wasm',
};

let initialized = false;
let Parser: any = null;
let Language: any = null;

async function ensureInitialized() {
  if (initialized) return;

  try {
    const mod = await import('web-tree-sitter');
    Parser = mod.default || mod.Parser;
    Language = mod.Language;

    // In Node.js environment with web-tree-sitter
    await Parser.init();
    initialized = true;
  } catch (err) {
    console.error('⚠️ web-tree-sitter not found or failed to initialize. Graph extraction disabled.');
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

  const ext = path.extname(filePath);
  const wasmFile = PARSER_MAP[ext];
  
  if (!wasmFile) {
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
    // Try to find WASM in common locations
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const possibleWasmPaths = [
      path.join(process.cwd(), 'vendor/wasm', wasmFile),
      path.join(__dirname, '../../vendor/wasm', wasmFile),
    ];
    
    let wasmPath = possibleWasmPaths[0];
    for (const p of possibleWasmPaths) {
      if (fs.existsSync(p)) {
        wasmPath = p;
        break;
      }
    }

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
      
      // Extract function declarations
      if (
        node.type === 'function_declaration' || 
        node.type === 'method_definition' ||
        node.type === 'export_statement'
      ) {
        // Basic identification of named symbols
        let nameNode = node.childForFieldName('name');
        if (!nameNode && node.type === 'method_definition') {
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
    console.error(`Error parsing ${filePath}:`, error);
  }

  return { nodes, edges };
}
