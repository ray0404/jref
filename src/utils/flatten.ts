/**
 * Flattening Engine Utility
 * Converts nested objects into a list of assignments and back.
 */

/**
 * Regex to match valid alphanumeric keys for dot notation.
 */
const DOT_NOTATION_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

/**
 * Recursively flattens an object into an array of assignment strings.
 */
export function flattenObject(obj: any, prefix: string = 'snapshot'): string[] {
  const lines: string[] = [];

  function walk(current: any, path: string) {
    if (current === null) {
      lines.push(`${path} = null;`);
      return;
    }

    if (Array.isArray(current)) {
      if (current.length === 0) {
        lines.push(`${path} = [];`);
      } else {
        current.forEach((item, index) => {
          walk(item, `${path}[${index}]`);
        });
      }
      return;
    }

    if (typeof current === 'object') {
      const keys = Object.keys(current);
      if (keys.length === 0) {
        lines.push(`${path} = {};`);
      } else {
        keys.forEach(key => {
          const part = DOT_NOTATION_REGEX.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
          walk(current[key], `${path}${part}`);
        });
      }
      return;
    }

    // Primitive values
    lines.push(`${path} = ${JSON.stringify(current)};`);
  }

  walk(obj, prefix);
  return lines;
}

/**
 * Reconstructs an object from an array of assignment strings.
 */
export function unflattenLines(lines: string[]): any {
  const result: any = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    // Split at the first '=' sign
    const match = trimmed.match(/^([^=]+)\s*=\s*(.+);$/);
    if (!match) continue;

    const pathString = match[1].trim();
    let valueString = match[2].trim();

    // Sanitize path: remove root 'snapshot.' or 'snapshot'
    let cleanPath = pathString;
    if (cleanPath.startsWith('snapshot.')) {
      cleanPath = cleanPath.slice(9);
    } else if (cleanPath.startsWith('snapshot[')) {
      cleanPath = cleanPath.slice(8);
      // If it starts with snapshot["key"], we need to handle it carefully.
      // Actually, my setValueByPath will handle the full path if I just strip the leading 'snapshot'
      cleanPath = pathString.replace(/^snapshot/, '');
    } else if (cleanPath === 'snapshot') {
        cleanPath = '';
    }

    try {
      const value = JSON.parse(valueString);
      setValueByPath(result, cleanPath, value);
    } catch (e) {
      // If JSON.parse fails, maybe it's not a valid assignment or value
      console.warn(`Failed to parse value for path ${pathString}: ${e}`);
    }
  }

  return result;
}

/**
 * Sets a value in a nested object based on a path string that can contain
 * dot notation and bracket notation.
 */
function setValueByPath(obj: any, path: string, value: any) {
  if (!path || path === '') {
      Object.assign(obj, value);
      return;
  }

  // Normalize path to tokens
  // Example: .files["src/index.ts"][0] -> ["files", "src/index.ts", "0"]
  const tokens: string[] = [];
  let i = 0;
  while (i < path.length) {
    const char = path[i];
    if (char === '.') {
      i++;
      let start = i;
      while (i < path.length && /[a-zA-Z0-9_$]/.test(path[i])) i++;
      tokens.push(path.slice(start, i));
    } else if (char === '[') {
      i++;
      let start = i;
      let quote = null;
      if (path[i] === '"' || path[i] === "'") {
        quote = path[i];
        i++;
        start = i;
        while (i < path.length && path[i] !== quote) {
            if (path[i] === '\\') i++; // simple escape skip
            i++;
        }
        tokens.push(path.slice(start, i));
        i++; // skip closing quote
      } else {
        while (i < path.length && path[i] !== ']') i++;
        tokens.push(path.slice(start, i));
      }
      i++; // skip closing bracket
    } else {
        // Handle cases where it might start directly with a property name if prefix was stripped
        let start = i;
        while (i < path.length && /[a-zA-Z0-9_$]/.test(path[i])) i++;
        if (start !== i) {
            tokens.push(path.slice(start, i));
        } else {
            i++; // avoid infinite loop on unexpected char
        }
    }
  }

  let current = obj;
  for (let j = 0; j < tokens.length; j++) {
    const token = tokens[j];
    const isLast = j === tokens.length - 1;

    if (isLast) {
      current[token] = value;
    } else {
      const nextToken = tokens[j+1];
      const isNextArray = /^\d+$/.test(nextToken);
      
      if (current[token] === undefined) {
        current[token] = isNextArray ? [] : {};
      }
      current = current[token];
    }
  }
}
