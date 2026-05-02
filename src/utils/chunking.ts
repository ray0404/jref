/**
 * Chunking Utility
 * Extracts logical blocks (functions, classes) from source code using Regex patterns.
 * Optimized for lightweight execution in memory-constrained environments.
 */

import { CodeChunk } from '../types/index.js';

interface LanguagePattern {
  name: string;
  extensions: string[];
  patterns: {
    type: 'function' | 'class' | 'method';
    regex: RegExp;
  }[];
}

const LANGUAGE_PATTERNS: LanguagePattern[] = [
  {
    name: 'typescript',
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    patterns: [
      {
        // function name(args) { ... } or const name = (args) => { ... }
        type: 'function',
        regex: /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(|const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s+)?\(.*?\)\s*=>/g
      },
      {
        // class Name { ... }
        type: 'class',
        regex: /(?:export\s+)?class\s+([a-zA-Z0-9_]+)/g
      },
      {
        // method(args) { ... } inside a class
        type: 'method',
        regex: /^\s+(?:async\s+)?([a-zA-Z0-9_]+)\s*\(.*?\)\s*\{/gm
      }
    ]
  },
  {
    name: 'python',
    extensions: ['.py'],
    patterns: [
      {
        // def name(args):
        type: 'function',
        regex: /^def\s+([a-zA-Z0-9_]+)\s*\(.*?\)\s*:/gm
      },
      {
        // class Name:
        type: 'class',
        regex: /^class\s+([a-zA-Z0-9_]+)\s*(?:\(.*?\))?\s*:/gm
      }
    ]
  },
  {
    name: 'zig',
    extensions: ['.zig'],
    patterns: [
      {
        // pub fn name(args) ... {
        type: 'function',
        regex: /(?:pub\s+)?fn\s+([a-zA-Z0-9_]+)\s*\(.*?\)/g
      }
    ]
  },
  {
    name: 'rust',
    extensions: ['.rs'],
    patterns: [
      {
        // pub fn name(args) ... {
        type: 'function',
        regex: /(?:pub\s+)?fn\s+([a-zA-Z0-9_]+)\s*\(.*?\)/g
      },
      {
        // struct Name { ... } or enum Name { ... }
        type: 'class',
        regex: /(?:pub\s+)?(?:struct|enum|trait)\s+([a-zA-Z0-9_]+)/g
      }
    ]
  }
];

/**
 * Heuristically find the end of a code block by counting braces
 */
function findBlockEnd(lines: string[], startLineIdx: number): number {
  let braceCount = 0;
  let started = false;

  for (let i = startLineIdx; i < lines.length; i++) {
    const line = lines[i];
    
    for (const char of line) {
      if (char === '{') {
        braceCount++;
        started = true;
      } else if (char === '}') {
        braceCount--;
        started = true;
      }
    }

    if (started && braceCount === 0) {
      return i;
    }
  }

  return lines.length - 1;
}

/**
 * Chunk source code into logical blocks
 */
export function chunkCode(filePath: string, content: string): CodeChunk[] {
  const ext = '.' + filePath.split('.').pop();
  const lang = LANGUAGE_PATTERNS.find(l => l.extensions.includes(ext));
  
  if (!lang) {
    // Fallback: chunk by lines if language not supported
    return chunkByLines(filePath, content);
  }

  const chunks: CodeChunk[] = [];
  const lines = content.split('\n');

  for (const pattern of lang.patterns) {
    let match;
    // Reset regex index if global
    pattern.regex.lastIndex = 0;
    
    while ((match = pattern.regex.exec(content)) !== null) {
      const name = match[1] || match[2];
      const offset = match.index;
      const startLineIdx = content.substring(0, offset).split('\n').length - 1;
      
      let endLineIdx: number;
      if (lang.name === 'python') {
        // Python uses indentation
        endLineIdx = findPythonBlockEnd(lines, startLineIdx);
      } else {
        endLineIdx = findBlockEnd(lines, startLineIdx);
      }

      const chunkContent = lines.slice(startLineIdx, endLineIdx + 1).join('\n');
      
      chunks.push({
        filePath,
        startLine: startLineIdx + 1,
        endLine: endLineIdx + 1,
        type: pattern.type,
        name,
        content: chunkContent
      });
    }
  }

  // Remove overlapping chunks (favor smaller, more specific chunks or vice versa?)
  // For RAG, we might want both or just the most specific ones.
  // Here we'll just return all found.

  return chunks.length > 0 ? chunks : chunkByLines(filePath, content);
}

function findPythonBlockEnd(lines: string[], startLineIdx: number): number {
  const startLine = lines[startLineIdx];
  const indentMatch = startLine.match(/^\s*/);
  const startIndent = indentMatch ? indentMatch[0].length : 0;

  for (let i = startLineIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    
    const currentIndentMatch = line.match(/^\s*/);
    const currentIndent = currentIndentMatch ? currentIndentMatch[0].length : 0;

    if (currentIndent <= startIndent) {
      return i - 1;
    }
  }

  return lines.length - 1;
}

function chunkByLines(filePath: string, content: string, maxLines = 50): CodeChunk[] {
  const lines = content.split('\n');
  const chunks: CodeChunk[] = [];

  for (let i = 0; i < lines.length; i += maxLines) {
    const end = Math.min(i + maxLines, lines.length);
    chunks.push({
      filePath,
      startLine: i + 1,
      endLine: end,
      type: 'block',
      content: lines.slice(i, end).join('\n')
    });
  }

  return chunks;
}
