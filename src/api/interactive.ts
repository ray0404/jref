import { UICommand } from '../commands/ui.js';
import { ShellCommand } from '../commands/shell.js';
import { MountCommand } from '../commands/mount.js';
import { ServeCommand } from '../commands/serve.js';
import type { ProjectSnapshot } from '../types/index.js';

/**
 * Programmatically start the interactive TUI
 */
export async function startUI(
  snapshot: ProjectSnapshot | string
): Promise<void> {
  const cmd = new UICommand();
  const args: string[] = [];

  let contextStdin = '';
  if (typeof snapshot === 'string') {
    args.push(snapshot);
  } else {
    contextStdin = JSON.stringify(snapshot);
  }

  await cmd.execute(
    args, 
    {}, 
    { 
      stdin: contextStdin, 
      stdinIsPipe: !!contextStdin,
      snapshot: typeof snapshot === 'object' ? snapshot : undefined
    }
  );
}

/**
 * Programmatically start the jref REPL shell
 */
export async function startShell(
  snapshot: ProjectSnapshot | string
): Promise<void> {
  const cmd = new ShellCommand();
  const args: string[] = [];

  let contextStdin = '';
  if (typeof snapshot === 'string') {
    args.push(snapshot);
  } else {
    contextStdin = JSON.stringify(snapshot);
  }

  await cmd.execute(
    args, 
    {}, 
    { 
      stdin: contextStdin, 
      stdinIsPipe: !!contextStdin,
      snapshot: typeof snapshot === 'object' ? snapshot : undefined
    }
  );
}

/**
 * Programmatically mount a snapshot as a virtual filesystem (WebDAV)
 */
export async function mount(
  snapshot: ProjectSnapshot | string,
  port: number = 8080
): Promise<void> {
  const cmd = new MountCommand();
  const args: string[] = [];

  let contextStdin = '';
  if (typeof snapshot === 'string') {
    args.push(snapshot);
  } else {
    contextStdin = JSON.stringify(snapshot);
  }

  await cmd.execute(
    args, 
    { port: port.toString() } as any, 
    { 
      stdin: contextStdin, 
      stdinIsPipe: !!contextStdin,
      snapshot: typeof snapshot === 'object' ? snapshot : undefined
    }
  );
}

/**
 * Programmatically start the MCP serve process
 */
export async function serve(
  snapshot: ProjectSnapshot | string
): Promise<void> {
  const cmd = new ServeCommand();
  const args: string[] = [];

  let contextStdin = '';
  if (typeof snapshot === 'string') {
    args.push(snapshot);
  } else {
    contextStdin = JSON.stringify(snapshot);
  }

  await cmd.execute(
    args, 
    {}, 
    { 
      stdin: contextStdin, 
      stdinIsPipe: !!contextStdin,
      snapshot: typeof snapshot === 'object' ? snapshot : undefined
    }
  );
}
