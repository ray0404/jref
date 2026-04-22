/**
 * Format Utility
 * Handles sniffing and translation of different snapshot formats
 * Supports JSON, JSON5, JSONC, YAML, TOML, and Repomix XML
 */

import JSON5 from 'json5';
import YAML from 'yaml';
import TOML from 'toml';
import { XMLParser } from 'fast-xml-parser';
import { ProjectSnapshotSchema, type ProjectSnapshot } from '../types/index.js';
import { generateDirectoryStructure } from './streaming-json.js';

export type SnapshotFormat = 'json' | 'json5' | 'yaml' | 'toml' | 'xml' | 'unknown';

/**
 * Sniff format from content or file extension
 */
export function sniffFormat(content: string, filePath?: string): SnapshotFormat {
  if (filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'json': return 'json';
      case 'json5':
      case 'jsonc': return 'json5';
      case 'yaml':
      case 'yml': return 'yaml';
      case 'toml': return 'toml';
      case 'xml': return 'xml';
    }
  }

  const trimmed = content.trimStart();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    // Could be JSON or JSON5/JSONC
    // We'll try strict JSON first, then fallback to JSON5
    return 'json';
  }
  if (trimmed.startsWith('---') || /^\w+:/.test(trimmed)) {
    return 'yaml';
  }
  if (trimmed.startsWith('<')) {
    return 'xml';
  }
  if (/^\w+\s*=/.test(trimmed)) {
    return 'toml';
  }

  return 'unknown';
}

/**
 * Translate content from any supported format to ProjectSnapshot
 */
export async function translateSnapshot(content: string, format: SnapshotFormat): Promise<ProjectSnapshot> {
  let parsed: any;

  switch (format) {
    case 'json':
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = JSON5.parse(content);
      }
      break;
    case 'json5':
      parsed = JSON5.parse(content);
      break;
    case 'yaml':
      parsed = YAML.parse(content);
      break;
    case 'toml':
      parsed = TOML.parse(content);
      break;
    case 'xml':
      parsed = parseRepomixXML(content);
      break;
    default:
      throw new Error(`Unsupported or unknown snapshot format`);
  }

  // Validate and coerce
  const result = ProjectSnapshotSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid snapshot data after translation: ${result.error.message}`);
  }

  const snapshot = result.data as ProjectSnapshot;

  // Auto-generate structure if missing
  if (!snapshot.directoryStructure && Object.keys(snapshot.files).length > 0) {
    snapshot.directoryStructure = generateDirectoryStructure(Object.keys(snapshot.files));
  }

  return snapshot;
}

/**
 * Specifically parse Repomix XML output into jref format
 */
function parseRepomixXML(xml: string): any {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  const obj = parser.parse(xml);
  
  // Repomix XML structure typically has <repomix> root
  const root = obj.repomix || obj.project || obj;
  
  const files: Record<string, string> = {};
  
  // Handle files
  if (root.files && root.files.file) {
    const fileList = Array.isArray(root.files.file) ? root.files.file : [root.files.file];
    for (const f of fileList) {
      const path = f['@_path'] || f.path;
      const content = f['#text'] || f.content || '';
      if (path) {
        files[path] = content;
      }
    }
  }

  return {
    directoryStructure: root.directoryStructure || root.structure,
    files,
    instruction: root.instruction,
    fileSummary: root.fileSummary || root.summary,
    userProvidedHeader: root.userProvidedHeader || root.header
  };
}
