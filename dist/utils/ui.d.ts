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
export declare function parseDirectoryStructure(structure: string): TreeNode;
/**
 * Get all file paths from tree (leaf nodes that are not directories)
 */
export declare function getAllFilePaths(node: TreeNode): string[];
/**
 * Find node by path
 */
export declare function findNodeByPath(root: TreeNode, path: string): TreeNode | null;
//# sourceMappingURL=ui.d.ts.map