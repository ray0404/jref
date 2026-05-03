/**
 * Git TUI Components for Interactive Git Operations on Snapshots
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import * as git from 'isomorphic-git';
import { getGitOptions } from '../utils/git.js';

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
  React.useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

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
      if (key.upArrow || input === 'k') {
        setSelectedIndex(Math.max(0, selectedIndex - 1));
      } else if (key.downArrow || input === 'j') {
        setSelectedIndex(Math.min(statusItems.length - 1, selectedIndex + 1));
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
    return React.createElement(Box, { flexDirection: 'column' }, [
        React.createElement(Box, { key: 'header', borderStyle: 'round', borderColor: 'cyan', paddingX: 1 },
            React.createElement(Text, { color: 'cyan', bold: true }, '📂 VIRTUAL GIT STATUS')
        ),
        React.createElement(Box, { key: 'instructions', paddingX: 1 },
            React.createElement(Text, { color: 'yellow', dimColor: true }, '↑↓ Navigate • a Stage • c Commit • l Log • s Refresh • Esc Exit')
        ),
        statusMessage ? React.createElement(Box, { key: 'status-msg', paddingX: 1 },
            React.createElement(Text, { color: 'green', bold: true }, `✨ ${statusMessage}`)
        ) : null,
        React.createElement(Box, { key: 'content', flexDirection: 'column', paddingX: 1, marginY: 1 },
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
        )
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
