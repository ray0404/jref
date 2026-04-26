/**
 * UI Utilities
 * Helper functions for the interactive TUI
 */
/**
 * Parse directory structure string into navigable tree
 */
export function parseDirectoryStructure(structure) {
    const lines = structure.split('\n').filter(line => line.trim());
    const root = {
        name: '',
        path: '',
        isDirectory: true,
        children: []
    };
    // Detect indentation mode: does any line contain classic tree chars?
    const hasTreeChars = lines.some(line => /[├└│]/.test(line));
    // If using plain indentation, detect indent unit by scanning first few indented lines
    let indentUnit = 2; // default for repomix
    if (!hasTreeChars) {
        const indents = lines
            .map(l => l.length - l.trimStart().length)
            .filter(s => s > 0)
            .slice(0, 10);
        // Find smallest non-zero indent (usually 2)
        if (indents.length > 0) {
            const minIndent = Math.min(...indents);
            if (minIndent > 0)
                indentUnit = minIndent;
        }
    }
    let currentPath = [root];
    let currentDepth = 0;
    for (const line of lines) {
        // Parse the line to determine depth and name
        const { depth, name, isDirectory } = parseTreeLine(line, hasTreeChars, indentUnit);
        // Adjust current path based on depth
        while (currentDepth >= depth && currentPath.length > 1) {
            currentPath.pop();
            currentDepth--;
        }
        // Create new node
        const node = {
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
 * @param line - The line to parse
 * @param hasTreeChars - Whether the structure contains classic tree drawing chars (├└│)
 * @param indentUnit - Number of spaces per indent level (for plain indentation)
 */
function parseTreeLine(line, hasTreeChars, indentUnit) {
    let remaining = line;
    let depth = 0;
    if (hasTreeChars) {
        // Classic tree format: consume 4-char prefixes (├──, └──, │   , or 4 spaces)
        while (remaining.length > 0) {
            if (remaining.startsWith('├── ') || remaining.startsWith('└── ')) {
                remaining = remaining.substring(4);
                depth++;
            }
            else if (remaining.startsWith('│   ')) {
                remaining = remaining.substring(4);
                depth++;
            }
            else if (remaining.startsWith('    ')) {
                remaining = remaining.substring(4);
                depth++;
            }
            else {
                break;
            }
        }
    }
    else {
        // Plain indentation: depth = leading spaces / indentUnit, remainder is trimmed
        const leadingSpaces = line.length - line.trimStart().length;
        depth = Math.floor(leadingSpaces / indentUnit);
        remaining = line.trim();
    }
    const name = remaining.trim();
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
export function getAllFilePaths(node) {
    const files = [];
    function traverse(current) {
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
export function findNodeByPath(root, path) {
    if (root.path === path) {
        return root;
    }
    for (const child of root.children) {
        const found = findNodeByPath(child, path);
        if (found)
            return found;
    }
    return null;
}
//# sourceMappingURL=ui.js.map