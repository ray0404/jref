#!/usr/bin/env node
/**
 * install-man.js — prepack script
 * Copies docs/jref.1 to the system's standard man page directory.
 *
 * Standard man directories:
 *   Linux:     /usr/local/share/man/man1  (or $(manpath ...)/man1)
 *   macOS:     /usr/local/share/man/man1
 *   Termux:    $PREFIX/share/man/man1
 *
 * The `man` field in package.json tells npm to add this path to MANPATH
 * automatically when the package is installed globally via `npm install -g`.
 */

import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const MAN_SRC  = join(__dirname, '..', 'docs', 'jref.1');

function getManDir() {
  // Termux (Android)
  if (process.env.PREFIX && process.env.PREFIX.includes('/data/data')) {
    return join(process.env.PREFIX, 'share', 'man', 'man1');
  }
  // Linux / macOS — detect from `manpath` or fall back to /usr/local
  try {
    const out = execSync('manpath 2>/dev/null', { encoding: 'utf8' }).trim();
    const first = out.split(':')[0];
    if (first && first !== '') return join(first, 'man1');
  } catch {
    // manpath unavailable — fall through
  }
  // Fallback: /usr/local is standard on Linux and macOS homebrew
  return '/usr/local/share/man/man1';
}

function main() {
  if (!existsSync(MAN_SRC)) {
    console.warn('install-man: docs/jref.1 not found, skipping man page installation.');
    return;
  }

  const manDir  = getManDir();
  const manDest = join(manDir, 'jref.1');

  // Try to create the directory if it doesn't exist
  try {
    mkdirSync(manDir, { recursive: true });
  } catch (err) {
    // Likely a permissions issue (system man dir); skip silently
    console.warn(`install-man: could not create ${manDir}: ${err.code}. Skipping.`);
    return;
  }

  // Try to copy the file
  try {
    copyFileSync(MAN_SRC, manDest);
    console.log(`install-man: installed ${manDest}`);
  } catch (err) {
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      console.warn(`install-man: permission denied writing to ${manDest}. Skipping.`);
    } else {
      throw err;
    }
  }
}

main();