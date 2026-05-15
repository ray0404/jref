import { v2 as webdav } from 'webdav-server';
import { Readable, Writable } from 'stream';
import type { ProjectSnapshot } from '../types/index.js';
import fs from 'fs';
import nodePath from 'path';
import os from 'os';
import crypto from 'crypto';
import { EventEmitter } from 'events';

export class JrefSerializer implements webdav.FileSystemSerializer {
  uid(): string {
    return 'JrefSerializer-1.0.0';
  }

  serialize(_fs: webdav.FileSystem, callback: webdav.ReturnCallback<any>): void {
    callback(null as any, {});
  }

  unserialize(_serializedData: any, callback: webdav.ReturnCallback<webdav.FileSystem>): void {
    callback(new Error('Unserialize not supported for JrefFileSystem') as any, null as any);
  }
}

/**
 * JrefFileSystem
 * Virtual FileSystem for webdav-server that maps a ProjectSnapshot
 * to a WebDAV mount point.
 */
export class JrefFileSystem extends webdav.FileSystem {
  private snapshot: ProjectSnapshot;
  public events = new EventEmitter();
  private tmpDir: string;

  constructor(snapshot: ProjectSnapshot) {
    super(new JrefSerializer());
    this.snapshot = snapshot;
    
    // Ensure temp directory exists
    this.tmpDir = nodePath.join(os.homedir(), '.jref', 'tmp');
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }
  }

  /**
   * Helper to get resource from path
   */
  private getItem(path: webdav.Path): 'file' | 'directory' | null {
    const fullPath = this.normalizePath(path);
    if (fullPath === '' || fullPath === '.') return 'directory';

    if (this.snapshot.files[fullPath] !== undefined) {
      return 'file';
    }

    // Check if it's a directory (prefix for any file)
    const dirPrefix = fullPath.endsWith('/') ? fullPath : fullPath + '/';
    const isDir = Object.keys(this.snapshot.files).some(p => p.startsWith(dirPrefix));
    
    return isDir ? 'directory' : null;
  }

  private normalizePath(path: webdav.Path): string {
    let p = path.toString();
    if (p.startsWith('/')) p = p.substring(1);
    if (p.endsWith('/')) p = p.substring(0, p.length - 1);
    return p;
  }

  protected _type(path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<webdav.ResourceType>) {
    const item = this.getItem(path);
    if (!item) return callback(webdav.Errors.ResourceNotFound);
    callback(null as any, item === 'file' ? webdav.ResourceType.File : webdav.ResourceType.Directory);
  }

  protected _readDir(path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<string[] | webdav.Path[]>) {
    const fullPath = this.normalizePath(path);
    const dirPrefix = fullPath === '' ? '' : fullPath + '/';
    
    const children = new Set<string>();
    for (const file of Object.keys(this.snapshot.files)) {
      if (file.startsWith(dirPrefix)) {
        const remaining = file.substring(dirPrefix.length);
        const parts = remaining.split('/');
        if (parts[0]) children.add(parts[0]);
      }
    }

    callback(null as any, Array.from(children));
  }

  protected _openReadStream(path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<Readable>) {
    const fullPath = this.normalizePath(path);
    const content = this.snapshot.files[fullPath];

    if (content === undefined) {
      return callback(webdav.Errors.ResourceNotFound);
    }

    const stream = new Readable();
    stream.push(content);
    stream.push(null);
    callback(null as any, stream);
  }

  protected _openWriteStream(path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<Writable>) {
    const fullPath = this.normalizePath(path);
    const tempFile = nodePath.join(this.tmpDir, crypto.randomUUID());
    
    const writeStream = fs.createWriteStream(tempFile);
    
    const stream = new Writable({
      write(chunk, encoding, next) {
        if (!writeStream.write(chunk, encoding as any)) {
          writeStream.once('drain', next);
        } else {
          next();
        }
      },
      final: (done) => {
        writeStream.end(() => {
          try {
            // Memory safety: read the file content into the snapshot
            // and then unlink the temp file.
            this.snapshot.files[fullPath] = fs.readFileSync(tempFile, 'utf8');
            fs.unlinkSync(tempFile);
            this.events.emit('change', fullPath);
            done();
          } catch (err) {
            done(err as Error);
          }
        });
      }
    });

    // Handle stream error to clean up temp file
    stream.on('error', () => {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    });

    callback(null as any, stream);
  }

  protected _size(path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<number>) {
    const fullPath = this.normalizePath(path);
    const content = this.snapshot.files[fullPath];
    if (content !== undefined) {
      callback(null as any, Buffer.byteLength(content, 'utf8'));
    } else {
      callback(null as any, 0);
    }
  }

  protected _create(path: webdav.Path, ctx: any, callback: webdav.ReturnCallback<void>) {
    const fullPath = this.normalizePath(path);
    if (ctx.type && ctx.type.isFile) {
      this.snapshot.files[fullPath] = '';
      this.events.emit('change', fullPath);
      callback();
    } else {
      callback();
    }
  }

  protected _delete(path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<void>) {
    const fullPath = this.normalizePath(path);
    const item = this.getItem(path);

    if (item === 'file') {
      delete this.snapshot.files[fullPath];
      this.events.emit('change', fullPath);
    } else if (item === 'directory') {
      const dirPrefix = fullPath === '' ? '' : fullPath + '/';
      let changed = false;
      for (const file of Object.keys(this.snapshot.files)) {
        if (file.startsWith(dirPrefix)) {
          delete this.snapshot.files[file];
          changed = true;
        }
      }
      if (changed) this.events.emit('change', fullPath);
    }
    callback();
  }

  protected _propertyManager(_path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<webdav.IPropertyManager>) {
    callback(null as any, new webdav.LocalPropertyManager());
  }

  protected _lockManager(_path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<webdav.ILockManager>) {
    callback(null as any, new webdav.LocalLockManager());
  }
}
