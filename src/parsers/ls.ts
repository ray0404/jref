import type { Parser } from './index.js';

export const lsParser: Parser = {
  name: 'ls',
  description: 'Parses output of ls -la',
  parse: (input: string) => {
    const lines = input.trim().split('\n');
    const result = [];

    for (const line of lines) {
      if (line.startsWith('total')) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 9) continue;

      const permissions = parts[0];
      const links = parseInt(parts[1], 10);
      const owner = parts[2];
      const group = parts[3];
      const size = parseInt(parts[4], 10);
      const month = parts[5];
      const day = parts[6];
      const timeOrYear = parts[7];
      const name = parts.slice(8).join(' ');

      result.push({
        permissions,
        links,
        owner,
        group,
        size,
        date: `${month} ${day} ${timeOrYear}`,
        name
      });
    }

    return result;
  }
};
