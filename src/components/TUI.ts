/**
 * TUI Components for Interactive Snapshot Browser
 * Built with Ink (React for CLI) - using programmatic API instead of JSX
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { TreeNode } from '../utils/ui.js';

interface SnapshotBrowserProps {
  tree: TreeNode;
  files: Record<string, string>;
  onExit: () => void;
}

// Tree item for flattened view
interface FlatTreeItem {
  node: TreeNode;
  depth: number;
  isExpanded: boolean;
}

// Export for testing
export function buildFlatTree(root: TreeNode, expanded: Set<string>): FlatTreeItem[] {
  const items: FlatTreeItem[] = [];

  // Detect structure: single-container (typical project) vs multi-root (monorepo/workspace)
  const singleContainer = root.children.length === 1 && root.children[0].isDirectory;
  const containerPath = singleContainer ? root.children[0].path : '';

  function traverse(node: TreeNode, depth: number) {
    // Compute the path used for file lookup and expansion state
    let nodePath: string;
    if (node === root) {
      nodePath = ''; // dummy root
    } else if (singleContainer && node.path.startsWith(containerPath + '/')) {
      // Strip container prefix (e.g., "project/src" -> "src")
      nodePath = node.path.slice(containerPath.length + 1);
    } else if (singleContainer && node.path === containerPath) {
      // The container itself
      nodePath = '';
    } else {
      // Multi-root or other: use full path as-is
      nodePath = node.path;
    }

    // Add non-root nodes to flat list
    if (node !== root) {
      items.push({
        node: {
          ...node,
          path: nodePath
        },
        depth: depth - 1, // Adjust depth so first visible level is at depth 0
        isExpanded: expanded.has(nodePath)
      });
    }

    // Traverse children if this directory is expanded (always traverse dummy root)
    const shouldTraverse = node === root
      ? true
      : node.isDirectory && expanded.has(nodePath);

    if (shouldTraverse) {
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  traverse(root, 0);
  return items;
}

export function SnapshotBrowser({ tree, files, onExit }: SnapshotBrowserProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'tree' | 'file' | 'search'>('tree');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isCompactMode, setIsCompactMode] = useState(false);
  // Initialize expanded directories - include project root (using relative paths)
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['']));

  // Toggle directory expansion
  const toggleExpansion = React.useCallback((nodePath: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodePath)) {
        newSet.delete(nodePath);
      } else {
        newSet.add(nodePath);
      }
      return newSet;
    });
  }, []);

  // Compute flat tree directly (avoid useEffect timing issues)
  const flatTreeItems = React.useMemo(() => {
    return buildFlatTree(tree, expandedDirs);
  }, [tree, expandedDirs]);

  // Adjust selected index if it's out of bounds
  React.useEffect(() => {
    if (selectedIndex >= flatTreeItems.length) {
      setSelectedIndex(Math.max(0, flatTreeItems.length - 1));
    }
  }, [flatTreeItems.length, selectedIndex]);

  // Detect screen size and set compact mode
  React.useEffect(() => {
    const checkScreenSize = () => {
      try {
        // Get terminal dimensions
        const { columns = 80 } = process.stdout;
        setIsCompactMode(columns < 60); // Compact mode for narrow screens
      } catch {
        setIsCompactMode(false);
      }
    };

    checkScreenSize();
    // Check on resize if available
    const resizeHandler = () => checkScreenSize();
    process.stdout.on?.('resize', resizeHandler);
    return () => {
      process.stdout.off?.('resize', resizeHandler);
    };
  }, []);

  // Helper functions for mobile-friendly display
  const truncatePath = (path: string, maxLength: number = isCompactMode ? 20 : 40): string => {
    if (path.length <= maxLength) return path;
    return '...' + path.slice(-(maxLength - 3));
  };

  const getFileName = (path: string): string => {
    return path.split('/').pop() || path;
  };



  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape) {
      if (viewMode === 'search') {
        setViewMode('tree');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedIndex(0);
      } else if (viewMode === 'file') {
        setViewMode('tree');
        setSelectedFile(null);
        setScrollOffset(0);
      } else {
        onExit();
      }
      return;
    }

    if (viewMode === 'tree') {
      const visibleLines = isCompactMode ? 15 : 20;

      if (input === '/' && !key.ctrl) {
        setViewMode('search');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedIndex(0);
        return;
      }

      if (input === 'c' && !key.ctrl) {
        // Toggle compact mode
        setIsCompactMode(!isCompactMode);
        return;
      }

      if (key.upArrow || input === 'k') {
        const newIndex = Math.max(0, selectedIndex - 1);
        setSelectedIndex(newIndex);
        // Adjust scroll to keep selected item visible
        if (newIndex < scrollOffset) {
          setScrollOffset(newIndex);
        }
      } else if (key.downArrow || input === 'j') {
        const newIndex = Math.min(Math.max(0, flatTreeItems.length - 1), selectedIndex + 1);
        setSelectedIndex(newIndex);
        // Adjust scroll to keep selected item visible
        if (newIndex >= scrollOffset + visibleLines) {
          setScrollOffset(newIndex - visibleLines + 1);
        }
      } else if (key.return) {
        const selectedItem = flatTreeItems[selectedIndex];
        if (selectedItem) {
          if (selectedItem.node.isDirectory) {
            toggleExpansion(selectedItem.node.path);
          } else {
            // Show file content
            setSelectedFile(selectedItem.node.path);
            setViewMode('file');
            setScrollOffset(0);
          }
        }
      } else if (key.leftArrow || input === 'h') {
        // Collapse directory
        const selectedItem = flatTreeItems[selectedIndex];
        if (selectedItem && selectedItem.node.isDirectory && expandedDirs.has(selectedItem.node.path)) {
          toggleExpansion(selectedItem.node.path);
        }
      } else if (key.rightArrow || input === 'l') {
        // Expand directory
        const selectedItem = flatTreeItems[selectedIndex];
        if (selectedItem && selectedItem.node.isDirectory && !expandedDirs.has(selectedItem.node.path)) {
          toggleExpansion(selectedItem.node.path);
        }
      }
    } else if (viewMode === 'search') {
      if (key.return) {
        // Select the current search result
        if (searchResults[selectedIndex]) {
          setSelectedFile(searchResults[selectedIndex]);
          setViewMode('file');
          setScrollOffset(0);
        }
      } else if (key.backspace || key.delete) {
        const newQuery = searchQuery.slice(0, -1);
        setSearchQuery(newQuery);
        updateSearchResults(newQuery);
        setSelectedIndex(0);
      } else if (input && !key.ctrl && !key.meta) {
        const newQuery = searchQuery + input;
        setSearchQuery(newQuery);
        updateSearchResults(newQuery);
        setSelectedIndex(0);
      } else if (key.upArrow) {
        setSelectedIndex(Math.max(0, selectedIndex - 1));
      } else if (key.downArrow) {
        setSelectedIndex(Math.min(searchResults.length - 1, selectedIndex + 1));
      }
    } else if (viewMode === 'file') {
       const lines = (selectedFile ? files[selectedFile] : '').split('\n');
       const visibleLines = isCompactMode ? 15 : 20;
       const maxScroll = Math.max(0, lines.length - visibleLines);

       if (key.upArrow) {
         setScrollOffset(Math.max(0, scrollOffset - 1));
       } else if (key.downArrow) {
         setScrollOffset(Math.min(maxScroll, scrollOffset + 1));
       } else if (key.pageUp) {
         setScrollOffset(Math.max(0, scrollOffset - visibleLines));
       } else if (key.pageDown) {
         setScrollOffset(Math.min(maxScroll, scrollOffset + visibleLines));
       } else if (input || key.return) {
        // Any other input returns to tree view
        setViewMode('tree');
        setSelectedFile(null);
        setScrollOffset(0);
      }
    }
  });

  // Update search results when query changes
  const updateSearchResults = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const allFiles = Object.keys(files);
    const filtered = allFiles.filter(file =>
      file.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  if (viewMode === 'file' && selectedFile) {
    const content = files[selectedFile] || 'File not found';
    const lines = content.split('\n');
    const visibleLines = lines.slice(scrollOffset, scrollOffset + (isCompactMode ? 15 : 20));
    const fileName = getFileName(selectedFile);
    const headerText = isCompactMode
      ? `${fileName} (${lines.length})`
      : `📄 ${truncatePath(selectedFile)} (${lines.length} lines)`;

    return React.createElement(Box, { flexDirection: 'column', height: '100%' }, [
      // Header
      React.createElement(Box, { key: 'header', borderStyle: isCompactMode ? 'single' : 'round', borderColor: 'green', paddingX: isCompactMode ? 0 : 1 },
        React.createElement(Text, { color: 'green', bold: true }, headerText)
      ),

      // Instructions (only show in non-compact mode or simplified)
      !isCompactMode ? React.createElement(Box, { key: 'instructions', paddingX: 1, paddingY: 0 },
        React.createElement(Text, { color: 'yellow', dimColor: true }, '↑↓ Scroll • Esc Back')
      ) : null,

      // Content
      React.createElement(Box, { key: 'content', flexDirection: 'column', flexGrow: 1, paddingX: isCompactMode ? 0 : 1 },
        visibleLines.map((line, index) => {
          const lineNum = scrollOffset + index + 1;
          const lineNumText = isCompactMode
            ? lineNum.toString().padStart(2, ' ')
            : lineNum.toString().padStart(4, ' ');

          return React.createElement(Text, { key: scrollOffset + index, color: 'white' }, [
            React.createElement(Text, { key: 'line-num', color: 'gray', dimColor: true },
              lineNumText + (isCompactMode ? '' : ':')
            ),
            isCompactMode ? '' : ' ',
            line || ' '
          ]);
        }).concat(lines.length > (isCompactMode ? 15 : 20) ? [
          React.createElement(Box, { key: 'scroll-info', paddingTop: 1 },
            React.createElement(Text, { color: 'gray', dimColor: true },
              isCompactMode
                ? `${scrollOffset + 1}-${Math.min(scrollOffset + 15, lines.length)}/${lines.length}`
                : `Lines ${scrollOffset + 1}-${Math.min(scrollOffset + 20, lines.length)} of ${lines.length}`
            )
          )
        ] : [])
      )
    ].filter(Boolean));
  }

  if (viewMode === 'search') {
    const headerText = isCompactMode ? '🔍' : '🔍 Search Files';
    const queryDisplay = isCompactMode ? `${searchQuery}_` : `Query: ${searchQuery}_`;

    return React.createElement(Box, { flexDirection: 'column', height: '100%' }, [
      // Header
      React.createElement(Box, { key: 'header', borderStyle: isCompactMode ? 'single' : 'round', borderColor: 'magenta', paddingX: isCompactMode ? 0 : 1 },
        React.createElement(Text, { color: 'magenta', bold: true }, headerText)
      ),

      // Search input
      React.createElement(Box, { key: 'search-input', paddingX: isCompactMode ? 0 : 1, paddingY: 0 },
        React.createElement(Text, { color: 'cyan' }, queryDisplay)
      ),

      // Instructions (only show in non-compact mode)
      !isCompactMode ? React.createElement(Box, { key: 'instructions', paddingX: 1, paddingY: 0 },
        React.createElement(Text, { color: 'yellow', dimColor: true }, 'Type to search • ↑↓ Navigate • Enter Select • Esc Back')
      ) : null,

      // Results
      React.createElement(Box, { key: 'results', flexDirection: 'column', flexGrow: 1, paddingX: isCompactMode ? 0 : 1 },
        searchResults.length === 0
          ? React.createElement(Text, { color: 'gray', italic: true },
              searchQuery ? 'No files' : 'Type to search...'
            )
          : searchResults.map((file, index) => {
              const color = index === selectedIndex ? 'cyan' : 'white';
              const bgColor = index === selectedIndex ? 'gray' : undefined;
              const displayName = isCompactMode ? getFileName(file) : truncatePath(file);
              const icon = isCompactMode ? '•' : '📄';
              return React.createElement(Box, { key: file },
                React.createElement(Text, { color, backgroundColor: bgColor }, `${icon} ${displayName}`)
              );
            })
      )
    ].filter(Boolean));
  }

  // Tree view
  const visibleLines = isCompactMode ? 15 : 20;
  const visibleItems = flatTreeItems.slice(scrollOffset, scrollOffset + visibleLines);
  const headerText = isCompactMode
    ? `Project (${flatTreeItems.length})`
    : `📁 Project Tree (${flatTreeItems.length} items)`;

  return React.createElement(Box, { flexDirection: 'column', height: '100%' }, [
    // Header
    React.createElement(Box, { key: 'header', borderStyle: isCompactMode ? 'single' : 'round', borderColor: 'blue', paddingX: isCompactMode ? 0 : 1 },
      React.createElement(Text, { color: 'blue', bold: true }, headerText)
    ),

    // Instructions (compact version for mobile)
    React.createElement(Box, { key: 'instructions', paddingX: isCompactMode ? 0 : 1, paddingY: 0 },
      React.createElement(Text, { color: 'yellow', dimColor: true },
        isCompactMode
          ? '↑↓/Enter • ←→:expand • /:search'
          : '↑↓ Navigate • Enter Select • ←→ Expand/Collapse • / Search • c Compact'
      )
    ),

    // Content
    React.createElement(Box, { key: 'content', flexDirection: 'column', flexGrow: 1, paddingX: isCompactMode ? 0 : 1 },
      flatTreeItems.length === 0
        ? React.createElement(Text, { color: 'gray', italic: true }, '(empty project)')
        : visibleItems.map((item, index) => {
            const actualIndex = scrollOffset + index;
            const node = item.node;
            const icon = node.isDirectory
              ? (item.isExpanded ? '📂' : '📁')
              : '📄';
            const color = actualIndex === selectedIndex ? 'cyan' : 'white';
            const bgColor = actualIndex === selectedIndex ? 'gray' : undefined;

            // Create indentation and tree prefix
            const indent = '  '.repeat(item.depth);
            let prefix = '';
            if (item.depth > 0) {
              // Check if this is the last item at this depth
              const nextItem = flatTreeItems[actualIndex + 1];
              const isLast = !nextItem || nextItem.depth < item.depth;
              prefix = isLast ? '└──' : '├──';
            }

            return React.createElement(Box, { key: node.path },
              React.createElement(Text, { color, backgroundColor: bgColor }, [
                indent,
                prefix,
                prefix ? ' ' : '',
                icon,
                ' ',
                node.name,
                node.isDirectory && !isCompactMode ? React.createElement(Text, { key: 'slash', color: 'gray' }, '/') : ''
              ])
            );
          })
    ),

    // Scroll indicator
    flatTreeItems.length > visibleLines ? React.createElement(Box, { key: 'scroll', paddingX: isCompactMode ? 0 : 1, paddingTop: 1 },
      React.createElement(Text, { color: 'gray', dimColor: true },
        isCompactMode
          ? `${scrollOffset + 1}-${Math.min(scrollOffset + visibleLines, flatTreeItems.length)}/${flatTreeItems.length}`
          : `Showing ${scrollOffset + 1}-${Math.min(scrollOffset + visibleLines, flatTreeItems.length)} of ${flatTreeItems.length} items`
      )
    ) : null
  ].filter(Boolean));
}