/**
 * UI Utilities
 * Helper functions for the interactive TUI
 */

export interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
  parent?: TreeNode;
}

/**
 * Parse directory structure string into navigable tree
 */
export function parseDirectoryStructure(structure: string): TreeNode {
  const lines = structure.split('\n').filter(line => line.trim());
  const root: TreeNode = {
    name: '',
    path: '',
    isDirectory: true,
    children: []
  };

  let currentPath: TreeNode[] = [root];
  let currentDepth = 0;

  for (const line of lines) {
    // Parse the line to determine depth and name
    const { depth, name, isDirectory } = parseTreeLine(line);

    // Adjust current path based on depth
    while (currentDepth >= depth && currentPath.length > 1) {
      currentPath.pop();
      currentDepth--;
    }

    // Create new node
    const node: TreeNode = {
      name,
      path: currentPath[currentPath.length - 1].path + (currentPath[currentPath.length - 1].path ? '/' : '') + name,
      isDirectory,
      children: [],
      parent: currentPath[currentPath.length - 1]
    };

    // Add to parent's children
    currentPath[currentPath.length - 1].children.push(node);

    // If it's a directory, add to current path
    if (isDirectory) {
      currentPath.push(node);
      currentDepth = depth;
    }
  }

  return root;
}

/**
 * Parse a single line from tree output
 */
function parseTreeLine(line: string): { depth: number; name: string; isDirectory: boolean } {
  // Remove tree characters and count indentation
  let cleanLine = line;
  let depth = 0;

  // Count leading spaces and tree characters
  let foundTreeChar = false;

  while (cleanLine.length > 0) {
    if (cleanLine.startsWith('├── ') || cleanLine.startsWith('└── ')) {
      cleanLine = cleanLine.substring(4);
      depth++;
      foundTreeChar = true;
      break;
    } else if (cleanLine.startsWith('│   ')) {
      cleanLine = cleanLine.substring(4);
      depth++;
    } else if (cleanLine.startsWith('    ')) {
      cleanLine = cleanLine.substring(4);
      depth++;
    } else {
      break;
    }
  }

  // If no tree characters found, it might be the root
  if (!foundTreeChar && line.includes('/')) {
    depth = 0;
  }

  // Extract name and determine if directory
  const name = cleanLine.trim();
  const isDirectory = name.endsWith('/');

  return {
    depth,
    name: isDirectory ? name.slice(0, -1) : name,
    isDirectory
  };
}

/**
 * Get all file paths from tree (leaf nodes that are not directories)
 */
export function getAllFilePaths(node: TreeNode): string[] {
  const files: string[] = [];

  function traverse(current: TreeNode) {
    if (!current.isDirectory && current.path) {
      files.push(current.path);
    }

    for (const child of current.children) {
      traverse(child);
    }
  }

  traverse(node);
  return files;
}

/**
 * Find node by path
 */
export function findNodeByPath(root: TreeNode, path: string): TreeNode | null {
  if (root.path === path) {
    return root;
  }

  for (const child of root.children) {
    const found = findNodeByPath(child, path);
    if (found) return found;
  }

  return null;
}