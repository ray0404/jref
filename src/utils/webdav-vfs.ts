import { v2 as webdav } from 'webdav-server';
import { Readable, Writable } from 'stream';
import type { ProjectSnapshot } from '../types/index.js';

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

  constructor(snapshot: ProjectSnapshot) {
    super(new JrefSerializer());
    this.snapshot = snapshot;
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
    console.error(`[JrefFileSystem] _type: ${path.toString()}`);
    const item = this.getItem(path);
    if (!item) return callback(webdav.Errors.ResourceNotFound);
    callback(null as any, item === 'file' ? webdav.ResourceType.File : webdav.ResourceType.Directory);
  }

  protected _readDir(path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<string[] | webdav.Path[]>) {
    console.error(`[JrefFileSystem] _readDir: ${path.toString()}`);
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
    console.error(`[JrefFileSystem] _openReadStream: ${path.toString()}`);
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
    console.error(`[JrefFileSystem] _openWriteStream: ${path.toString()}`);
    const fullPath = this.normalizePath(path);
    
    const chunks: Buffer[] = [];
    const stream = new Writable({
      write(chunk, encoding, next) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding as any));
        next();
      },
      final: (done) => {
        this.snapshot.files[fullPath] = Buffer.concat(chunks).toString('utf8');
        done();
      }
    });

    callback(null as any, stream);
  }

  protected _size(path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<number>) {
    console.error(`[JrefFileSystem] _size: ${path.toString()}`);
    const fullPath = this.normalizePath(path);
    const content = this.snapshot.files[fullPath];
    if (content !== undefined) {
      callback(null as any, Buffer.byteLength(content, 'utf8'));
    } else {
      callback(null as any, 0);
    }
  }

  protected _create(path: webdav.Path, ctx: any, callback: webdav.ReturnCallback<void>) {
    console.error(`[JrefFileSystem] _create: ${path.toString()}`);
    const fullPath = this.normalizePath(path);
    if (ctx.type && ctx.type.isFile) {
      this.snapshot.files[fullPath] = '';
      callback();
    } else {
      callback();
    }
  }

  protected _delete(path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<void>) {
    console.error(`[JrefFileSystem] _delete: ${path.toString()}`);
    const fullPath = this.normalizePath(path);
    const item = this.getItem(path);

    if (item === 'file') {
      delete this.snapshot.files[fullPath];
    } else if (item === 'directory') {
      const dirPrefix = fullPath === '' ? '' : fullPath + '/';
      for (const file of Object.keys(this.snapshot.files)) {
        if (file.startsWith(dirPrefix)) {
          delete this.snapshot.files[file];
        }
      }
    }
    callback();
  }

  protected _propertyManager(path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<webdav.IPropertyManager>) {
    console.error(`[JrefFileSystem] _propertyManager: ${path.toString()}`);
    // Return a default property manager
    callback(null as any, new webdav.LocalPropertyManager());
  }

  protected _lockManager(path: webdav.Path, _ctx: any, callback: webdav.ReturnCallback<webdav.ILockManager>) {
    console.error(`[JrefFileSystem] _lockManager: ${path.toString()}`);
    // Return a default lock manager
    callback(null as any, new webdav.LocalLockManager());
  }
}
