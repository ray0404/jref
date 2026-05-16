/**
 * Path Resolver Utility
 * safely parses mixed path strings (e.g., files."src/main.ts", metadata.instruction, files['test.js'])
 * and provides getter/setter functionality for objects.
 */

/**
 * Parses a path string into an array of tokens.
 * Handles dot notation and bracket notation (quoted or unquoted).
 */
export function parsePath(path: string): string[] {
  const tokens: string[] = [];
  let currentToken = '';
  let i = 0;

  while (i < path.length) {
    const char = path[i];

    if (char === '.') {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
      i++;
    } else if (char === '[') {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
      i++;
      
      const nextChar = path[i];
      if (nextChar === "'" || nextChar === '"') {
        // Quoted bracket notation
        const quote = nextChar;
        i++;
        let quotedToken = '';
        while (i < path.length && path[i] !== quote) {
          if (path[i] === '\\' && path[i + 1] === quote) {
            quotedToken += quote;
            i += 2;
          } else {
            quotedToken += path[i];
            i++;
          }
        }
        tokens.push(quotedToken);
        if (path[i] === quote) i++;
        if (path[i] === ']') i++;
      } else {
        // Unquoted bracket notation (e.g., indices)
        let unquotedToken = '';
        while (i < path.length && path[i] !== ']') {
          unquotedToken += path[i];
          i++;
        }
        tokens.push(unquotedToken);
        if (path[i] === ']') i++;
      }
    } else if (char === '"' || char === "'") {
      // Dot-quoted notation (e.g., files."src/main.ts")
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
      const quote = char;
      i++;
      let quotedToken = '';
      while (i < path.length && path[i] !== quote) {
        if (path[i] === '\\' && path[i + 1] === quote) {
          quotedToken += quote;
          i += 2;
        } else {
          quotedToken += path[i];
          i++;
        }
      }
      tokens.push(quotedToken);
      if (path[i] === quote) i++;
    } else {
      currentToken += char;
      i++;
    }
  }

  if (currentToken) {
    tokens.push(currentToken);
  }

  return tokens;
}

/**
 * Retrieves a value from an object by a path string.
 */
export function getValueByPath(obj: any, path: string): any {
  const tokens = parsePath(path);
  let current = obj;

  for (const token of tokens) {
    if (token === '__proto__' || token === 'constructor' || token === 'prototype') {
      throw new Error(`Prototype pollution attempt detected for token: ${token}`);
    }
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[token];
  }

  return current;
}

/**
 * Sets a value in an object by a path string.
 * Creates intermediate objects if they don't exist.
 */
export function setValueByPath(obj: any, path: string, value: any): void {
  const tokens = parsePath(path);
  let current = obj;

  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    
    if (token === '__proto__' || token === 'constructor' || token === 'prototype') {
      throw new Error(`Prototype pollution attempt detected for token: ${token}`);
    }

    if (current[token] === null || typeof current[token] !== 'object') {
      current[token] = {};
    }
    current = current[token];
  }

  const lastToken = tokens[tokens.length - 1];
  if (lastToken !== undefined) {
    if (lastToken === '__proto__' || lastToken === 'constructor' || lastToken === 'prototype') {
      throw new Error(`Prototype pollution attempt detected for token: ${lastToken}`);
    }
    current[lastToken] = value;
  }
}
