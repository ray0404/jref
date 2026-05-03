import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { JrefConfigSchema, type JrefConfig } from '../types/index.js';

interface ConfigUIProps {
  config: JrefConfig;
  onSave: (config: JrefConfig) => void;
  onExit: () => void;
}

export function ConfigUI({ config: initialConfig, onSave, onExit }: ConfigUIProps) {
  const [config, setConfig] = useState<JrefConfig>(initialConfig);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const configKeys = [
    'defaultOutput',
    'silent',
    'ui.theme',
    'ui.showIcons',
    'aliasToggle',
    'binPath',
    'defaultJq'
  ];

  const getValue = (key: string): any => {
    return key.split('.').reduce((prev, curr) => (prev as any)?.[curr], config);
  };

  const updateValue = (key: string, value: any) => {
    setConfig(prev => {
      const next = { ...prev };
      const parts = key.split('.');
      let current: any = next;
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = { ...current[parts[i]] };
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2000);
  };

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      onExit();
      return;
    }

    if (key.upArrow || input === 'k') {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex(prev => Math.min(configKeys.length - 1, prev + 1));
    } else if (key.return || key.rightArrow || input === ' ') {
      const selectedKey = configKeys[selectedIndex];
      const currentVal = getValue(selectedKey);

      if (typeof currentVal === 'boolean') {
        updateValue(selectedKey, !currentVal);
      } else if (selectedKey === 'defaultOutput') {
        const options = ['pretty', 'json', 'raw'];
        const nextIdx = (options.indexOf(currentVal) + 1) % options.length;
        updateValue(selectedKey, options[nextIdx]);
      } else if (selectedKey === 'ui.theme') {
        const options = ['system', 'dark', 'light'];
        const nextIdx = (options.indexOf(currentVal) + 1) % options.length;
        updateValue(selectedKey, options[nextIdx]);
      }
    } else if (input === 's') {
      onSave(config);
      showStatus('Configuration Saved');
    }
  });

  return React.createElement(Box, { flexDirection: 'column', padding: 1 }, [
    React.createElement(Box, { key: 'header', borderStyle: 'round', borderColor: 'cyan', paddingX: 1 },
      React.createElement(Text, { color: 'cyan', bold: true }, '⚙️ JREF CONFIGURATION DASHBOARD')
    ),
    React.createElement(Box, { key: 'instructions', marginY: 1 },
      React.createElement(Text, { color: 'yellow', dimColor: true }, '↑↓ Navigate • Enter/Space Toggle • s Save • Esc Exit')
    ),
    React.createElement(Box, { key: 'content', flexDirection: 'column' },
      configKeys.map((key, index) => {
        const isSelected = index === selectedIndex;
        const value = getValue(key);
        const color = isSelected ? 'cyan' : 'white';
        const bgColor = isSelected ? 'gray' : undefined;

        return React.createElement(Box, { key }, [
          React.createElement(Text, { color, backgroundColor: bgColor, bold: isSelected },
            `${isSelected ? '▶ ' : '  '}${key.padEnd(20)}: `
          ),
          React.createElement(Text, { color: typeof value === 'boolean' ? (value ? 'green' : 'red') : 'white' },
            String(value)
          )
        ]);
      })
    ),
    statusMessage ? React.createElement(Box, { key: 'status', marginTop: 1 },
      React.createElement(Text, { color: 'green', bold: true }, `✨ ${statusMessage}`)
    ) : null
  ]);
}
