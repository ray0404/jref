/**
 * TUI Components for Interactive Snapshot Browser
 * Built with Ink (React for CLI) - using programmatic API instead of JSX
 */
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { exec, spawnSync } from 'child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import Fuse from 'fuse.js';
// Export for testing
export function buildFlatTree(root, expanded) {
    const items = [];
    // Detect structure: single-container (typical project) vs multi-root (monorepo/workspace)
    const singleContainer = root.children.length === 1 && root.children[0].isDirectory;
    const containerPath = singleContainer ? root.children[0].path : '';
    function traverse(node, depth) {
        // Compute the path used for file lookup and expansion state
        let nodePath;
        if (node === root) {
            nodePath = ''; // dummy root
        }
        else if (singleContainer && node.path.startsWith(containerPath + '/')) {
            // Strip container prefix (e.g., "project/src" -> "src")
            nodePath = node.path.slice(containerPath.length + 1);
        }
        else if (singleContainer && node.path === containerPath) {
            // The container itself
            nodePath = '';
        }
        else {
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
export function SnapshotBrowser({ tree, files, onExit }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [viewMode, setViewMode] = useState('tree');
    const [selectedFile, setSelectedFile] = useState(null);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('filename');
    const [searchResults, setSearchResults] = useState([]);
    const [isCompactMode, setIsCompactMode] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    // Initialize expanded directories - include project root (using relative paths)
    const [expandedDirs, setExpandedDirs] = useState(new Set(['']));
    const [selectedPaths, setSelectedPaths] = useState(new Set());
    // Toggle directory expansion
    const toggleExpansion = React.useCallback((nodePath) => {
        setExpandedDirs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodePath)) {
                newSet.delete(nodePath);
            }
            else {
                newSet.add(nodePath);
            }
            return newSet;
        });
    }, []);
    // Toggle path selection
    const toggleSelection = React.useCallback((nodePath) => {
        setSelectedPaths(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodePath)) {
                newSet.delete(nodePath);
            }
            else {
                newSet.add(nodePath);
            }
            return newSet;
        });
    }, []);
    // Compute flat tree directly (avoid useEffect timing issues)
    const flatTreeItems = React.useMemo(() => {
        return buildFlatTree(tree, expandedDirs);
    }, [tree, expandedDirs]);
    // Fuzzy Search instance
    const fuse = React.useMemo(() => {
        const allFiles = Object.keys(files);
        if (searchType === 'filename') {
            return new Fuse(allFiles, {
                threshold: 0.4,
                distance: 100,
            });
        }
        else {
            const data = allFiles.map(path => ({ path, content: files[path] }));
            return new Fuse(data, {
                keys: ['content'],
                threshold: 0.4,
                distance: 1000,
            });
        }
    }, [files, searchType]);
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
            }
            catch {
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
    const truncatePath = (path, maxLength = isCompactMode ? 20 : 40) => {
        if (path.length <= maxLength)
            return path;
        return '...' + path.slice(-(maxLength - 3));
    };
    const getFileName = (path) => {
        return path.split('/').pop() || path;
    };
    const showStatus = (msg) => {
        setStatusMessage(msg);
        setTimeout(() => setStatusMessage(null), 2000);
    };
    // Update search results when query changes
    const updateSearchResults = React.useCallback((query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        const results = fuse.search(query);
        if (searchType === 'filename') {
            setSearchResults(results.map(r => r.item));
        }
        else {
            setSearchResults(results.map(r => r.item.path));
        }
    }, [fuse, searchType]);
    // Handle keyboard input
    useInput((input, key) => {
        if (key.escape) {
            if (viewMode === 'search') {
                setViewMode('tree');
                setSearchQuery('');
                setSearchResults([]);
                setSelectedIndex(0);
            }
            else if (viewMode === 'file') {
                setViewMode('tree');
                setSelectedFile(null);
                setScrollOffset(0);
            }
            else {
                onExit();
            }
            return;
        }
        if (viewMode === 'tree') {
            const visibleLines = isCompactMode ? 15 : 20;
            if (input === ' ' && !key.ctrl) {
                const selectedItem = flatTreeItems[selectedIndex];
                if (selectedItem) {
                    toggleSelection(selectedItem.node.path);
                }
                return;
            }
            if (input === 'y' && !key.ctrl) {
                const selectedItem = flatTreeItems[selectedIndex];
                if (selectedItem && !selectedItem.node.isDirectory) {
                    const content = files[selectedItem.node.path];
                    if (content) {
                        const isTermux = process.env.TERMUX_VERSION !== undefined;
                        const command = isTermux ? 'termux-clipboard-set' : (process.platform === 'darwin' ? 'pbcopy' : 'xclip -selection clipboard');
                        const child = exec(command);
                        child.stdin?.write(content);
                        child.stdin?.end();
                        showStatus('Yanked to clipboard');
                    }
                }
                return;
            }
            if (input === 'e' && !key.ctrl) {
                const selectedItem = flatTreeItems[selectedIndex];
                if (selectedItem && !selectedItem.node.isDirectory) {
                    const content = files[selectedItem.node.path];
                    if (content !== undefined) {
                        const tempPath = join(tmpdir(), `jref-${Date.now()}-${selectedItem.node.name}`);
                        writeFileSync(tempPath, content);
                        spawnSync(process.env.EDITOR || 'vi', [tempPath], { stdio: 'inherit' });
                        const updatedContent = readFileSync(tempPath, 'utf8');
                        files[selectedItem.node.path] = updatedContent;
                        showStatus('File edited (in-memory)');
                    }
                }
                return;
            }
            if (input === 'v' && !key.ctrl) {
                const selectedItem = flatTreeItems[selectedIndex];
                if (selectedItem && !selectedItem.node.isDirectory) {
                    const content = files[selectedItem.node.path];
                    if (content !== undefined) {
                        const tempPath = join(tmpdir(), `jref-view-${Date.now()}-${selectedItem.node.name}`);
                        writeFileSync(tempPath, content);
                        const pager = process.env.JREF_PAGER || process.env.PAGER || 'less';
                        spawnSync(pager, [tempPath], { stdio: 'inherit' });
                        showStatus('Closed pager');
                    }
                }
                return;
            }
            if (input === 'x' && !key.ctrl) {
                const extractFile = (path, content) => {
                    const outputPath = join(process.cwd(), path);
                    const parentDir = dirname(outputPath);
                    if (!existsSync(parentDir)) {
                        mkdirSync(parentDir, { recursive: true });
                    }
                    writeFileSync(outputPath, content);
                };
                if (selectedPaths.size > 0) {
                    let count = 0;
                    selectedPaths.forEach(path => {
                        const content = files[path];
                        if (content !== undefined) {
                            extractFile(path, content);
                            count++;
                        }
                    });
                    showStatus(`Extracted ${count} files`);
                    setSelectedPaths(new Set());
                }
                else {
                    const selectedItem = flatTreeItems[selectedIndex];
                    if (selectedItem && !selectedItem.node.isDirectory) {
                        const content = files[selectedItem.node.path];
                        if (content !== undefined) {
                            extractFile(selectedItem.node.path, content);
                            showStatus(`Extracted: ${selectedItem.node.name}`);
                        }
                    }
                }
                return;
            }
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
            }
            else if (key.downArrow || input === 'j') {
                const newIndex = Math.min(Math.max(0, flatTreeItems.length - 1), selectedIndex + 1);
                setSelectedIndex(newIndex);
                // Adjust scroll to keep selected item visible
                if (newIndex >= scrollOffset + visibleLines) {
                    setScrollOffset(newIndex - visibleLines + 1);
                }
            }
            else if (key.return) {
                const selectedItem = flatTreeItems[selectedIndex];
                if (selectedItem) {
                    if (selectedItem.node.isDirectory) {
                        toggleExpansion(selectedItem.node.path);
                    }
                    else {
                        // Show file content
                        setSelectedFile(selectedItem.node.path);
                        setViewMode('file');
                        setScrollOffset(0);
                    }
                }
            }
            else if (key.leftArrow || input === 'h') {
                // Collapse directory
                const selectedItem = flatTreeItems[selectedIndex];
                if (selectedItem && selectedItem.node.isDirectory && expandedDirs.has(selectedItem.node.path)) {
                    toggleExpansion(selectedItem.node.path);
                }
            }
            else if (key.rightArrow || input === 'l') {
                // Expand directory
                const selectedItem = flatTreeItems[selectedIndex];
                if (selectedItem && selectedItem.node.isDirectory && !expandedDirs.has(selectedItem.node.path)) {
                    toggleExpansion(selectedItem.node.path);
                }
            }
        }
        else if (viewMode === 'search') {
            if (key.return) {
                // Select the current search result
                if (searchResults[selectedIndex]) {
                    setSelectedFile(searchResults[selectedIndex]);
                    setViewMode('file');
                    setScrollOffset(0);
                }
            }
            else if (key.tab) {
                // Toggle search type
                const newType = searchType === 'filename' ? 'content' : 'filename';
                setSearchType(newType);
                updateSearchResults(searchQuery);
            }
            else if (key.backspace || key.delete) {
                const newQuery = searchQuery.slice(0, -1);
                setSearchQuery(newQuery);
                updateSearchResults(newQuery);
                setSelectedIndex(0);
            }
            else if (input && !key.ctrl && !key.meta) {
                const newQuery = searchQuery + input;
                setSearchQuery(newQuery);
                updateSearchResults(newQuery);
                setSelectedIndex(0);
            }
            else if (key.upArrow) {
                setSelectedIndex(Math.max(0, selectedIndex - 1));
            }
            else if (key.downArrow) {
                setSelectedIndex(Math.min(searchResults.length - 1, selectedIndex + 1));
            }
        }
        else if (viewMode === 'file') {
            const lines = (selectedFile ? files[selectedFile] : '').split('\n');
            const visibleLines = isCompactMode ? 15 : 20;
            const maxScroll = Math.max(0, lines.length - visibleLines);
            if (input === 'y' && !key.ctrl) {
                if (selectedFile) {
                    const content = files[selectedFile];
                    const isTermux = process.env.TERMUX_VERSION !== undefined;
                    const command = isTermux ? 'termux-clipboard-set' : (process.platform === 'darwin' ? 'pbcopy' : 'xclip -selection clipboard');
                    const child = exec(command);
                    child.stdin?.write(content);
                    child.stdin?.end();
                    showStatus('Yanked to clipboard');
                }
                return;
            }
            if (key.upArrow) {
                setScrollOffset(Math.max(0, scrollOffset - 1));
            }
            else if (key.downArrow) {
                setScrollOffset(Math.min(maxScroll, scrollOffset + 1));
            }
            else if (key.pageUp) {
                setScrollOffset(Math.max(0, scrollOffset - visibleLines));
            }
            else if (key.pageDown) {
                setScrollOffset(Math.min(maxScroll, scrollOffset + visibleLines));
            }
            else if (input || key.return) {
                // Any other input returns to tree view
                setViewMode('tree');
                setSelectedFile(null);
                setScrollOffset(0);
            }
        }
    });
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
            React.createElement(Box, { key: 'header', borderStyle: isCompactMode ? 'single' : 'round', borderColor: 'green', paddingX: isCompactMode ? 0 : 1 }, React.createElement(Text, { color: 'green', bold: true }, headerText)),
            // Instructions (only show in non-compact mode or simplified)
            !isCompactMode ? React.createElement(Box, { key: 'instructions', paddingX: 1, paddingY: 0 }, React.createElement(Text, { color: 'yellow', dimColor: true }, '↑↓ Scroll • Esc Back • y Yank')) : null,
            // Status Bar
            statusMessage ? React.createElement(Box, { key: 'status', paddingX: 1 }, React.createElement(Text, { color: 'green', bold: true }, `✨ ${statusMessage}`)) : null,
            // Content
            React.createElement(Box, { key: 'content', flexDirection: 'column', flexGrow: 1, paddingX: isCompactMode ? 0 : 1 }, visibleLines.map((line, index) => {
                const lineNum = scrollOffset + index + 1;
                const lineNumText = isCompactMode
                    ? lineNum.toString().padStart(2, ' ')
                    : lineNum.toString().padStart(4, ' ');
                return React.createElement(Text, { key: scrollOffset + index, color: 'white' }, [
                    React.createElement(Text, { key: 'line-num', color: 'gray', dimColor: true }, lineNumText + (isCompactMode ? '' : ':')),
                    isCompactMode ? '' : ' ',
                    line || ' '
                ]);
            }).concat(lines.length > (isCompactMode ? 15 : 20) ? [
                React.createElement(Box, { key: 'scroll-info', paddingTop: 1 }, React.createElement(Text, { color: 'gray', dimColor: true }, isCompactMode
                    ? `${scrollOffset + 1}-${Math.min(scrollOffset + 15, lines.length)}/${lines.length}`
                    : `Lines ${scrollOffset + 1}-${Math.min(scrollOffset + 20, lines.length)} of ${lines.length}`))
            ] : []))
        ].filter(Boolean));
    }
    if (viewMode === 'search') {
        const headerText = isCompactMode ? '🔍' : `🔍 Search Files (${searchType})`;
        const queryDisplay = isCompactMode ? `${searchQuery}_` : `Query: ${searchQuery}_`;
        return React.createElement(Box, { flexDirection: 'column', height: '100%' }, [
            // Header
            React.createElement(Box, { key: 'header', borderStyle: isCompactMode ? 'single' : 'round', borderColor: 'magenta', paddingX: isCompactMode ? 0 : 1 }, React.createElement(Text, { color: 'magenta', bold: true }, headerText)),
            // Search input
            React.createElement(Box, { key: 'search-input', paddingX: isCompactMode ? 0 : 1, paddingY: 0 }, React.createElement(Text, { color: 'cyan' }, queryDisplay)),
            // Instructions (only show in non-compact mode)
            !isCompactMode ? React.createElement(Box, { key: 'instructions', paddingX: 1, paddingY: 0 }, React.createElement(Text, { color: 'yellow', dimColor: true }, 'Type to search • Tab Toggle Mode • ↑↓ Navigate • Enter Select • Esc Back')) : null,
            // Results
            React.createElement(Box, { key: 'results', flexDirection: 'column', flexGrow: 1, paddingX: isCompactMode ? 0 : 1 }, searchResults.length === 0
                ? React.createElement(Text, { color: 'gray', italic: true }, searchQuery ? 'No matches' : 'Type to search...')
                : searchResults.map((file, index) => {
                    const color = index === selectedIndex ? 'cyan' : 'white';
                    const bgColor = index === selectedIndex ? 'gray' : undefined;
                    const displayName = isCompactMode ? getFileName(file) : truncatePath(file);
                    const icon = isCompactMode ? '•' : '📄';
                    return React.createElement(Box, { key: file }, React.createElement(Text, { color, backgroundColor: bgColor }, `${icon} ${displayName}`));
                }))
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
        React.createElement(Box, { key: 'header', borderStyle: isCompactMode ? 'single' : 'round', borderColor: 'blue', paddingX: isCompactMode ? 0 : 1 }, React.createElement(Text, { color: 'blue', bold: true }, headerText)),
        // Instructions (compact version for mobile)
        React.createElement(Box, { key: 'instructions', paddingX: isCompactMode ? 0 : 1, paddingY: 0 }, React.createElement(Text, { color: 'yellow', dimColor: true }, isCompactMode
            ? '↑↓/Ent • Spc:sel • /:src • y:yank • e:edit • v:view • x:ext'
            : '↑↓ Navigate • Enter Select • Space Toggle Sel • / Search • y Yank • e Edit • v View • x Extract • c Compact')),
        // Status Bar
        statusMessage ? React.createElement(Box, { key: 'status', paddingX: 1 }, React.createElement(Text, { color: 'green', bold: true }, `✨ ${statusMessage}`)) : null,
        // Content
        React.createElement(Box, { key: 'content', flexDirection: 'column', flexGrow: 1, paddingX: isCompactMode ? 0 : 1 }, flatTreeItems.length === 0
            ? React.createElement(Text, { color: 'gray', italic: true }, '(empty project)')
            : visibleItems.map((item, index) => {
                const actualIndex = scrollOffset + index;
                const node = item.node;
                const isSelected = selectedPaths.has(node.path);
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
                return React.createElement(Box, { key: node.path }, React.createElement(Text, { color, backgroundColor: bgColor }, [
                    indent,
                    prefix,
                    prefix ? ' ' : '',
                    isSelected ? '[*] ' : '',
                    icon,
                    ' ',
                    node.name,
                    node.isDirectory && !isCompactMode ? React.createElement(Text, { key: 'slash', color: 'gray' }, '/') : ''
                ]));
            })),
        // Scroll indicator
        flatTreeItems.length > visibleLines ? React.createElement(Box, { key: 'scroll', paddingX: isCompactMode ? 0 : 1, paddingTop: 1 }, React.createElement(Text, { color: 'gray', dimColor: true }, isCompactMode
            ? `${scrollOffset + 1}-${Math.min(scrollOffset + visibleLines, flatTreeItems.length)}/${flatTreeItems.length}`
            : `Showing ${scrollOffset + 1}-${Math.min(scrollOffset + visibleLines, flatTreeItems.length)} of ${flatTreeItems.length} items`)) : null
    ].filter(Boolean));
}
//# sourceMappingURL=TUI.js.map