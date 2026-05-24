import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import type { Endpoint, APIBranding } from '../types/api.js';
import { writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

interface APIWrapperUIProps {
  endpoints: Endpoint[];
  branding: APIBranding;
  onAction: (action: string, payload?: any) => Promise<any>;
  onExit: () => void;
}

const MAX_VISIBLE = 15;

export function APIWrapperUI({ endpoints, branding, onAction, onExit }: APIWrapperUIProps) {
  const [mode, setMode] = useState<'endpoints' | 'parameters' | 'input' | 'save' | 'pipe'>('endpoints');
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [selectedParamIndex, setSelectedParamIndex] = useState(0);
  
  const [paramValues, setParamValues] = useState<Record<string, any>>({});
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [redirectInputValue, setRedirectInputValue] = useState('');
  
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const selectedEndpoint = endpoints[selectedEndpointIndex];

  useInput(async (input, key) => {
    if (loading) return; 

    if (mode === 'save') {
       if (key.escape) setMode('parameters');
       return;
    }
    if (mode === 'pipe') {
       if (key.escape) setMode('parameters');
       return;
    }
    if (mode === 'input') {
       if (key.escape) setMode('parameters');
       return;
    }

    if (key.escape || input === 'q') {
      if (mode === 'parameters') {
         setMode('endpoints');
         setResponse(null);
      } else {
         onExit();
      }
      return;
    }

    if (response && mode === 'parameters') {
       if (input === 's') {
          setRedirectInputValue('api-response.json');
          setMode('save');
          return;
       }
       if (input === 'p') {
          setRedirectInputValue('jq .');
          setMode('pipe');
          return;
       }
    }

    if (mode === 'endpoints') {
      if (key.upArrow || input === 'k') {
        setSelectedIndexSafe(setSelectedEndpointIndex, selectedEndpointIndex - 1, endpoints.length);
      } else if (key.downArrow || input === 'j') {
        setSelectedIndexSafe(setSelectedEndpointIndex, selectedEndpointIndex + 1, endpoints.length);
      } else if (key.return || key.rightArrow || input === ' ') {
        if (endpoints.length > 0) {
          setMode('parameters');
          setSelectedParamIndex(0);
          setParamValues({});
          setResponse(null);
        }
      }
    } else if (mode === 'parameters') {
      const itemsCount = selectedEndpoint.parameters.length + 1; 
      if (key.upArrow || input === 'k') {
        setSelectedIndexSafe(setSelectedParamIndex, selectedParamIndex - 1, itemsCount);
      } else if (key.downArrow || input === 'j') {
        setSelectedIndexSafe(setSelectedParamIndex, selectedParamIndex + 1, itemsCount);
      } else if (key.return || key.rightArrow || input === ' ') {
        if (selectedParamIndex === selectedEndpoint.parameters.length) {
          await executeRequest();
        } else {
          const param = selectedEndpoint.parameters[selectedParamIndex];
          setCurrentInputValue(paramValues[param.name] ? String(paramValues[param.name]) : '');
          setMode('input');
        }
      }
    }
  });

  const setSelectedIndexSafe = (setter: any, nextIndex: number, max: number) => {
    if (max === 0) return;
    if (nextIndex < 0) setter(0);
    else if (nextIndex >= max) setter(max - 1);
    else setter(nextIndex);
  };

  const getVisibleWindow = (selectedIndex: number, itemsLength: number) => {
    let start = Math.max(0, selectedIndex - Math.floor(MAX_VISIBLE / 2));
    let end = start + MAX_VISIBLE;
    if (end > itemsLength) {
      end = itemsLength;
      start = Math.max(0, end - MAX_VISIBLE);
    }
    return { start, end };
  };

  const handleSave = (filename: string) => {
    try {
      const fullPath = join(process.cwd(), filename);
      writeFileSync(fullPath, JSON.stringify(response, null, 2));
      showStatus(`Saved to ${filename}`);
      setMode('parameters');
    } catch (err: any) {
      showStatus(`Save failed: ${err.message}`);
    }
  };

  const handlePipe = (command: string) => {
    try {
      const output = execSync(command, {
        input: JSON.stringify(response, null, 2),
        encoding: 'utf-8'
      });
      try {
        setResponse(JSON.parse(output));
        showStatus('Piped successfully (Response updated)');
      } catch {
        setResponse({ piped_output: output });
        showStatus('Piped successfully');
      }
      setMode('parameters');
    } catch (err: any) {
      showStatus(`Pipe failed: ${err.message}`);
      setMode('parameters');
    }
  };

  const executeRequest = async () => {
    setLoading(true);
    setStatusMessage(`Executing ${selectedEndpoint.method} ${selectedEndpoint.path}...`);
    setResponse(null);
    
    try {
      const payload: { query: any, body: any } = { query: {}, body: {} };
      for (const param of selectedEndpoint.parameters) {
        const val = paramValues[param.name];
        if (val !== undefined && val !== '') {
          let parsedVal = val;
          if (param.type === 'boolean') parsedVal = val === 'true';
          else if (param.type === 'integer' || param.type === 'number') parsedVal = Number(val);
          else if (param.type === 'array' || param.type === 'object') {
            try { parsedVal = JSON.parse(val); } catch (e) { parsedVal = val; }
          }
          
          if (param.in === 'body') {
            const parts = param.name.split('.');
            let cur = payload.body;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!cur[parts[i]]) cur[parts[i]] = {};
              cur = cur[parts[i]];
            }
            cur[parts[parts.length - 1]] = parsedVal;
          } else {
            payload.query[param.name] = parsedVal;
          }
        }
      }
      
      const res = await onAction(selectedEndpoint.id, payload);
      if (res.success) {
        let displayData = res.data;
        // Generic base64 detection
        const checkBase64 = (obj: any): any => {
          if (!obj || typeof obj !== 'object') return obj;
          if (Array.isArray(obj)) return obj.map(checkBase64);
          const newObj = { ...obj };
          for (const key of Object.keys(newObj)) {
            if (typeof newObj[key] === 'string' && newObj[key].length > 1000 && /^[A-Za-z0-9+/=]+$/.test(newObj[key].slice(0, 100))) {
               newObj[key] = `[Large Base64 Data: ${newObj[key].length} chars]`;
            } else if (typeof newObj[key] === 'object') {
               newObj[key] = checkBase64(newObj[key]);
            }
          }
          return newObj;
        };
        displayData = checkBase64(displayData);
        setResponse(displayData);
        showStatus('Success!');
      } else {
        showStatus(`Error: ${res.error}`);
      }
    } catch (err: any) {
      showStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'endpoints') {
    const { start, end } = getVisibleWindow(selectedEndpointIndex, endpoints.length);
    const visibleEndpoints = endpoints.slice(start, end);

    return React.createElement(Box, { flexDirection: 'column', padding: 1 }, [
      React.createElement(Box, { key: 'header', borderStyle: 'round', borderColor: branding.borderColor, paddingX: 1 },
        React.createElement(Text, { color: branding.primaryColor, bold: true }, `🌐 ${branding.title.toUpperCase()} - SELECT ENDPOINT`)
      ),
      React.createElement(Box, { key: 'instructions', marginY: 1 },
        React.createElement(Text, { color: 'yellow', dimColor: true }, '↑↓ Navigate • Enter Select • q/Esc Exit')
      ),
      React.createElement(Box, { key: 'content', flexDirection: 'column' },
        endpoints.length === 0 ? React.createElement(Text, { key: 'no-eps', color: 'red' }, 'No endpoints found. Make sure the schema is accessible.') :
        visibleEndpoints.map((ep, i) => {
          const actualIndex = start + i;
          const isSelected = actualIndex === selectedEndpointIndex;
          const color = isSelected ? 'cyan' : 'white';
          const bgColor = isSelected ? 'gray' : undefined;
          return React.createElement(Box, { key: ep.id }, [
            React.createElement(Text, { color, backgroundColor: bgColor, bold: isSelected },
              `${isSelected ? '▶ ' : '  '}${ep.method.padEnd(6)} ${ep.path}`
            )
          ]);
        })
      ),
      endpoints.length > MAX_VISIBLE ? React.createElement(Box, { key: 'scroll-indicator', marginTop: 1 },
        React.createElement(Text, { color: 'gray' }, `Showing ${start + 1}-${end} of ${endpoints.length}`)
      ) : null
    ]);
  }

  const itemsCount = selectedEndpoint.parameters.length + 1;
  const { start, end } = getVisibleWindow(selectedParamIndex, itemsCount);
  
  const renderParameters = () => {
    const items = [];
    for (let i = start; i < end; i++) {
      if (i === selectedEndpoint.parameters.length) {
        const isExecuteSelected = selectedParamIndex === selectedEndpoint.parameters.length;
        items.push(
          React.createElement(Box, { key: 'execute', marginTop: 1 }, [
             React.createElement(Text, { 
               color: isExecuteSelected ? 'green' : 'white', 
               backgroundColor: isExecuteSelected ? 'gray' : undefined,
               bold: isExecuteSelected 
             }, `${isExecuteSelected ? '▶ ' : '  '}[ EXECUTE REQUEST ]`)
          ])
        );
      } else {
        const param = selectedEndpoint.parameters[i];
        const isSelected = i === selectedParamIndex;
        const val = paramValues[param.name];
        const displayVal = val !== undefined ? String(val) : '<empty>';
        const color = isSelected ? 'cyan' : 'white';
        const bgColor = isSelected ? 'gray' : undefined;
        items.push(
          React.createElement(Box, { key: param.name }, [
            React.createElement(Text, { color, backgroundColor: bgColor, bold: isSelected },
              `${isSelected ? '▶ ' : '  '}${param.name} (${param.type}): `
            ),
            React.createElement(Text, { color: val !== undefined ? 'green' : 'gray' }, displayVal)
          ])
        );
      }
    }
    return items;
  };
  
  return React.createElement(Box, { flexDirection: 'column', padding: 1 }, [
    React.createElement(Box, { key: 'header', borderStyle: 'round', borderColor: 'cyan', paddingX: 1 },
      React.createElement(Text, { color: 'cyan', bold: true }, `🔧 CONFIGURE: ${selectedEndpoint.id}`)
    ),
    mode === 'input' ? 
      React.createElement(Box, { key: 'input-box', marginY: 1, flexDirection: 'column' }, [
        React.createElement(Text, { key: 'lbl', color: 'yellow' }, `Enter value for ${selectedEndpoint.parameters[selectedParamIndex].name} (Esc to cancel, Enter to save):`),
        React.createElement(Box, { key: 'ti' }, 
           React.createElement(TextInput, { 
             value: currentInputValue, 
             onChange: setCurrentInputValue,
             onSubmit: (val: string) => {
               const param = selectedEndpoint.parameters[selectedParamIndex];
               setParamValues(prev => ({ ...prev, [param.name]: val }));
               setMode('parameters');
             }
           } as any)
        )
      ])
    : mode === 'save' ?
      React.createElement(Box, { key: 'save-box', marginY: 1, flexDirection: 'column' }, [
        React.createElement(Text, { key: 'lbl', color: 'yellow' }, `Save JSON response to filename:`),
        React.createElement(Box, { key: 'ti' }, 
           React.createElement(TextInput, { 
             value: redirectInputValue, 
             onChange: setRedirectInputValue,
             onSubmit: handleSave
           } as any)
        )
      ])
    : mode === 'pipe' ?
      React.createElement(Box, { key: 'pipe-box', marginY: 1, flexDirection: 'column' }, [
        React.createElement(Text, { key: 'lbl', color: 'yellow' }, `Pipe JSON response to shell command:`),
        React.createElement(Box, { key: 'ti' }, 
           React.createElement(TextInput, { 
             value: redirectInputValue, 
             onChange: setRedirectInputValue,
             onSubmit: handlePipe
           } as any)
        )
      ])
    : React.createElement(Box, { key: 'instructions', marginY: 1 },
      React.createElement(Text, { color: 'yellow', dimColor: true }, [
        '↑↓ Navigate • Enter Edit/Execute • Esc Back',
        response ? ' • s Save File • p Pipe Command' : ''
      ].join(''))
    ),
    
    React.createElement(Box, { key: 'content', flexDirection: 'column', display: (mode === 'parameters') ? 'flex' : 'none' },
      renderParameters()
    ),
    itemsCount > MAX_VISIBLE && mode === 'parameters' ? React.createElement(Box, { key: 'scroll-indicator', marginTop: 1 },
      React.createElement(Text, { color: 'gray' }, `Showing ${start + 1}-${end} of ${itemsCount}`)
    ) : null,
    statusMessage ? React.createElement(Box, { key: 'status', marginTop: 1 },
      React.createElement(Text, { color: loading ? 'yellow' : 'green', bold: true }, `✨ ${statusMessage}`)
    ) : null,
    response ? React.createElement(Box, { key: 'response', marginTop: 1, borderStyle: 'single', borderColor: 'blue', padding: 1 },
      React.createElement(Text, { color: 'white' }, JSON.stringify(response, null, 2).slice(0, 1500) + (JSON.stringify(response).length > 1500 ? '\n...[Truncated]' : ''))
    ) : null
  ]);
}
