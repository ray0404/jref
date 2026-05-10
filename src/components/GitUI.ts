/**
 * Git TUI Components for Interactive Git Operations on Snapshots
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import * as git from 'isomorphic-git';
import { getGitOptions } from '../utils/git.js';
import * as diff from 'diff';

interface GitUIProps {
  vol: any;
  files: Record<string, string>;
  onExit: (mutation: boolean) => void;
}

interface GitFileStatus {
  filepath: string;
  status: string;
}

export function GitUI({ vol, files, onExit }: GitUIProps) {
  const [viewMode, setViewMode] = useState<'status' | 'log' | 'commit'>('status');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [statusItems, setStatusItems] = useState<GitFileStatus[]>([]);
  const [logItems, setLogItems] = useState<any[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [mutation, setMutation] = useState(false);
  const [diffText, setDiffText] = useState<string>('');

  // For scrolling diff
  const [diffScrollY, setDiffScrollY] = useState(0);

  const gitOpts = useMemo(() => getGitOptions(vol), [vol]);

  const refreshStatus = useCallback(async () => {
    const allFiles = Object.keys(files);
    const results: GitFileStatus[] = [];
    for (const filepath of allFiles) {
      const status = await git.status({ ...gitOpts, filepath });
      if (status !== 'unmodified') {
        results.push({ filepath, status });
      }
    }
    setStatusItems(results);
    setSelectedIndex(prev => Math.min(prev, Math.max(0, results.length - 1)));
  }, [files, gitOpts]);

  const refreshLog = useCallback(async () => {
    try {
        const logs = await git.log(gitOpts);
        setLogItems(logs);
    } catch (err) {
        setLogItems([]);
    }
  }, [gitOpts]);

  // Initial load
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Load diff when selected item changes
  useEffect(() => {
    async function loadDiff() {
      if (viewMode !== 'status') return;
      const selected = statusItems[selectedIndex];
      if (!selected) {
        setDiffText('');
        return;
      }

      const filepath = selected.filepath;
      let headContent = '';
      try {
        const ref = await git.resolveRef({ ...gitOpts, ref: 'HEAD' });
        const { blob } = await git.readBlob({ ...gitOpts, oid: ref, filepath });
        headContent = Buffer.from(blob).toString('utf8');
      } catch (e) {
        // file might be new or not in HEAD
      }

      let currentContent = '';
      try {
        currentContent = vol.readFileSync(filepath.startsWith('/') ? filepath : `/${filepath}`, 'utf8');
      } catch (e) {
        // file might be deleted
      }

      const d = diff.createTwoFilesPatch(filepath, filepath, headContent, currentContent);
      // Remove header rows to make it cleaner
      const cleanDiff = d.split('\n').slice(4).join('\n');
      setDiffText(cleanDiff || 'No changes or binary file');
      setDiffScrollY(0);
    }
    loadDiff();
  }, [selectedIndex, statusItems, viewMode, gitOpts, vol]);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2000);
  };

  useInput(async (input, key) => {
    if (key.escape) {
      if (viewMode === 'commit') {
        setViewMode('status');
      } else {
        onExit(mutation);
      }
      return;
    }

    if (viewMode === 'status') {
      if (input === 's') {
        refreshStatus();
        return;
      }
      if (input === 'l') {
        await refreshLog();
        setViewMode('log');
        setSelectedIndex(0);
        return;
      }
      if (input === 'c') {
        setViewMode('commit');
        setCommitMessage('');
        return;
      }
      if (input === 'a') {
        const selected = statusItems[selectedIndex];
        if (selected) {
          await git.add({ ...gitOpts, filepath: selected.filepath });
          setMutation(true);
          showStatus(`Staged ${selected.filepath}`);
          refreshStatus();
        }
        return;
      }
      if (input === ' ') {
        // Spacebar to toggle staging
        const selected = statusItems[selectedIndex];
        if (selected) {
          if (selected.status.includes('*') || selected.status === '*unmodified') {
             // Need to add
             await git.add({ ...gitOpts, filepath: selected.filepath });
             showStatus(`Staged ${selected.filepath}`);
          } else {
             // Unstage
             await git.resetIndex({ ...gitOpts, filepath: selected.filepath });
             showStatus(`Unstaged ${selected.filepath}`);
          }
          setMutation(true);
          refreshStatus();
        }
        return;
      }
      if (key.upArrow || input === 'k') {
        setSelectedIndex(Math.max(0, selectedIndex - 1));
      } else if (key.downArrow || input === 'j') {
        setSelectedIndex(Math.min(statusItems.length - 1, selectedIndex + 1));
      } else if (key.pageDown) {
        setDiffScrollY(prev => prev + 10);
      } else if (key.pageUp) {
        setDiffScrollY(prev => Math.max(0, prev - 10));
      } else if (input === ']') {
        setDiffScrollY(prev => prev + 1);
      } else if (input === '[') {
        setDiffScrollY(prev => Math.max(0, prev - 1));
      }
    } else if (viewMode === 'log') {
        if (input === 's') {
            setViewMode('status');
            setSelectedIndex(0);
            return;
        }
        if (key.upArrow || input === 'k') {
            setSelectedIndex(Math.max(0, selectedIndex - 1));
        } else if (key.downArrow || input === 'j') {
            setSelectedIndex(Math.min(logItems.length - 1, selectedIndex + 1));
        }
    } else if (viewMode === 'commit') {
        if (key.return) {
            if (commitMessage.trim()) {
                try {
                    const sha = await git.commit({
                        ...gitOpts,
                        message: commitMessage,
                        author: { name: 'Jref User', email: 'user@jref.io' }
                    });
                    setMutation(true);
                    showStatus(`Committed: ${sha.slice(0, 7)}`);
                    setViewMode('status');
                    refreshStatus();
                } catch (err) {
                    showStatus(`Error: ${(err as Error).message}`);
                }
            }
        } else if (key.backspace || key.delete) {
            setCommitMessage(commitMessage.slice(0, -1));
        } else if (input && !key.ctrl && !key.meta) {
            setCommitMessage(commitMessage + input);
        }
    }
  });

  // Render Logic
  if (viewMode === 'status') {
    const diffLines = diffText.split('\n').slice(diffScrollY, diffScrollY + 20); // Show max 20 lines

    return React.createElement(Box, { flexDirection: 'column', width: '100%', height: 26 }, [
        React.createElement(Box, { key: 'header', borderStyle: 'round', borderColor: 'cyan', paddingX: 1 },
            React.createElement(Text, { color: 'cyan', bold: true }, '📂 VIRTUAL GIT STATUS')
        ),
        React.createElement(Box, { key: 'instructions', paddingX: 1 },
            React.createElement(Text, { color: 'yellow', dimColor: true }, '↑↓ Navigate • a Add • Space Toggle Stage • c Commit • l Log • [] scroll diff • Esc Exit')
        ),
        statusMessage ? React.createElement(Box, { key: 'status-msg', paddingX: 1 },
            React.createElement(Text, { color: 'green', bold: true }, `✨ ${statusMessage}`)
        ) : null,
        React.createElement(Box, { key: 'content', flexDirection: 'row', width: '100%', paddingX: 1, marginY: 1 }, [
            // Left Pane: File list
            React.createElement(Box, { key: 'file-list', flexDirection: 'column', width: '40%', paddingRight: 2 },
                statusItems.length === 0
                    ? React.createElement(Text, { color: 'gray', italic: true }, 'Working tree clean')
                    : statusItems.map((item, index) => {
                        const isSelected = index === selectedIndex;
                        const color = isSelected ? 'cyan' : 'white';
                        const bgColor = isSelected ? 'gray' : undefined;
                        return React.createElement(Box, { key: item.filepath },
                            React.createElement(Text, { color, backgroundColor: bgColor }, [
                                item.status.padEnd(10),
                                ' ',
                                item.filepath
                            ])
                        );
                    })
            ),
            // Right Pane: Diff View
            React.createElement(Box, { key: 'diff-view', flexDirection: 'column', width: '60%', borderStyle: 'single', borderColor: 'gray' },
                diffLines.length === 0 && !diffText
                    ? React.createElement(Text, { color: 'gray' }, 'No diff available')
                    : diffLines.map((line, i) => {
                        let color: string | undefined = undefined;
                        if (line.startsWith('+')) color = 'green';
                        else if (line.startsWith('-')) color = 'red';
                        else if (line.startsWith('@@')) color = 'cyan';
                        return React.createElement(Text, { key: i, color }, line);
                    })
            )
        ])
    ].filter(Boolean));
  }

  if (viewMode === 'log') {
    return React.createElement(Box, { flexDirection: 'column' }, [
        React.createElement(Box, { key: 'header', borderStyle: 'round', borderColor: 'magenta', paddingX: 1 },
            React.createElement(Text, { color: 'magenta', bold: true }, '📜 VIRTUAL GIT LOG')
        ),
        React.createElement(Box, { key: 'instructions', paddingX: 1 },
            React.createElement(Text, { color: 'yellow', dimColor: true }, '↑↓ Navigate • s Back to Status • Esc Exit')
        ),
        React.createElement(Box, { key: 'content', flexDirection: 'column', paddingX: 1, marginY: 1 },
            logItems.length === 0
                ? React.createElement(Text, { color: 'gray', italic: true }, 'No commits found')
                : logItems.map((log, index) => {
                    const isSelected = index === selectedIndex;
                    const color = isSelected ? 'magenta' : 'white';
                    const bgColor = isSelected ? 'gray' : undefined;
                    return React.createElement(Box, { key: log.oid, flexDirection: 'column' }, [
                        React.createElement(Text, { color, backgroundColor: bgColor, bold: true }, 
                            `commit ${log.oid.slice(0, 7)}`
                        ),
                        React.createElement(Text, { color: 'gray' }, `Author: ${log.commit.author.name} <${log.commit.author.email}>`),
                        React.createElement(Box, { marginY: 1 },
                            React.createElement(Text, { color: 'white' }, `    ${log.commit.message}`)
                        )
                    ]);
                })
        )
    ].filter(Boolean));
  }

  if (viewMode === 'commit') {
    return React.createElement(Box, { flexDirection: 'column' }, [
        React.createElement(Box, { key: 'header', borderStyle: 'round', borderColor: 'green', paddingX: 1 },
            React.createElement(Text, { color: 'green', bold: true }, '📝 COMMIT CHANGES')
        ),
        React.createElement(Box, { key: 'input-box', paddingX: 1, marginY: 1 }, [
            React.createElement(Text, { key: 'label', color: 'cyan' }, 'Message: '),
            React.createElement(Text, { key: 'val', color: 'white' }, `${commitMessage}_`)
        ]),
        React.createElement(Box, { key: 'footer', paddingX: 1 },
            React.createElement(Text, { color: 'yellow', dimColor: true }, 'Enter to Commit • Esc Cancel')
        )
    ]);
  }

  return null;
}
