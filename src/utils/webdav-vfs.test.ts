import { describe, it, expect, beforeEach } from 'vitest';
import { v2 as webdav } from 'webdav-server';
import { JrefFileSystem } from './webdav-vfs.js';
import type { ProjectSnapshot } from '../types/index.js';
import { Readable, Writable } from 'stream';

describe('JrefFileSystem', () => {
  let snapshot: ProjectSnapshot;
  let jfs: JrefFileSystem;
  let mockCtx: any;

  beforeEach(() => {
    snapshot = {
      directoryStructure: '.\n├── file1.txt\n└── dir1/\n    └── file2.txt\n',
      files: {
        'file1.txt': 'content1',
        'dir1/file2.txt': 'content2'
      }
    };
    jfs = new JrefFileSystem(snapshot);
    mockCtx = {
      server: {
        options: {
          storageManager: {
            evaluateCreate: (ctx, fs, path, type, cb) => cb(0),
            reserve: (ctx, fs, size, cb) => cb(true),
            evaluateContent: (ctx, fs, size, cb) => cb(size),
            available: (ctx, fs, cb) => cb(-1)
          },
          privilegeManager: {
            can: (path, resource, privileges, cb) => cb(null, true)
          }
        },
        emit: () => {},
        getFileSystemPath: (fs, cb) => cb(new webdav.Path('/')),
        getFileSystem: (path, cb) => cb(jfs, new webdav.Path('/'), new webdav.Path('/'))
      }
    };
  });

  it('should identify resource types correctly', async () => {
    const typeFile = await new Promise((resolve) => jfs.type(mockCtx, new webdav.Path('/file1.txt'), (err, type) => resolve(type)));
    const typeDir = await new Promise((resolve) => jfs.type(mockCtx, new webdav.Path('/dir1'), (err, type) => resolve(type)));
    const typeNone = await new Promise((resolve) => jfs.type(mockCtx, new webdav.Path('/none'), (err, type) => resolve(type)));

    expect(typeFile).toBe(webdav.ResourceType.File);
    expect(typeDir).toBe(webdav.ResourceType.Directory);
    expect(typeNone).toBeUndefined();
  });

  it('should list directory contents', async () => {
    const rootFiles = await new Promise<string[]>((resolve) => jfs.readDir(mockCtx, new webdav.Path('/'), (err, files) => resolve(files as string[])));
    const dir1Files = await new Promise<string[]>((resolve) => jfs.readDir(mockCtx, new webdav.Path('/dir1'), (err, files) => resolve(files as string[])));

    expect(rootFiles).toContain('file1.txt');
    expect(rootFiles).toContain('dir1');
    expect(dir1Files).toContain('file2.txt');
  });

  it('should read file content', async () => {
    const stream = await new Promise<Readable>((resolve) => jfs.openReadStream(mockCtx, new webdav.Path('/file1.txt'), (err, s) => resolve(s as Readable)));
    let content = '';
    for await (const chunk of stream) {
      content += chunk.toString();
    }
    expect(content).toBe('content1');
  });

  it('should write file content and update snapshot', async () => {
    const stream = await new Promise<Writable>((resolve) => jfs.openWriteStream(mockCtx, new webdav.Path('/file1.txt'), (err, s) => resolve(s)));
    
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
      stream.write('new content');
      stream.end();
    });

    expect(snapshot.files['file1.txt']).toBe('new content');
  });

  it('should create new files', async () => {
    await new Promise((resolve) => jfs.create(mockCtx, new webdav.Path('/new.txt'), webdav.ResourceType.File, (err) => resolve(err)));
    expect(snapshot.files['new.txt']).toBe('');
  });

  it('should delete files', async () => {
    await new Promise((resolve) => jfs.delete(mockCtx, new webdav.Path('/file1.txt'), (err) => resolve(err)));
    expect(snapshot.files['file1.txt']).toBeUndefined();
  });
});
