/**
 * Cross-platform postinstall hook for @ray0404/jref.
 * Ensures the compiled CLI entrypoint has executable permissions and
 * adapts the shebang on Termux/Android where /usr/bin/env does not exist
 * outside of termux-exec LD_PRELOAD environments.
 */

import { existsSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const cliPath = resolve(__dirname, '..', 'dist', 'cli.js');

  if (existsSync(cliPath)) {
    let content = readFileSync(cliPath, 'utf8');

    const termuxPrefix = process.env.PREFIX || '/data/data/com.termux/files/usr';
    const termuxEnv = `${termuxPrefix}/bin/env`;

    // On Termux/Android, /usr/bin/env does not exist natively on the root filesystem.
    // Rewriting the shebang ensures `jref` and `jbin` work even when LD_PRELOAD (libtermux-exec) is unset.
    if (!existsSync('/usr/bin/env') && existsSync(termuxEnv)) {
      const targetShebang = `#!${termuxEnv} node`;
      if (content.startsWith('#!/usr/bin/env node')) {
        content = content.replace(/^#!\/usr\/bin\/env node/, targetShebang);
        writeFileSync(cliPath, content, 'utf8');
      }
    }

    if (process.platform !== 'win32') {
      try {
        chmodSync(cliPath, 0o755);
      } catch {
        // Ignore chmod errors on restricted filesystems
      }
    }
  }
} catch {
  // Never fail package installation due to postinstall environment edge cases
}
