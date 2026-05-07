# Implementation Plan: WebDAV Virtual Filesystem Mount

## Phase 1: Research & Preparation
- [x] Analyze `ProjectSnapshot` structure.
- [x] Research `webdav-server` API for custom `FileSystem`.
- [x] Install `webdav-server` dependency.
- [x] Create test snapshot for verification.

## Phase 2: Virtual FileSystem Implementation
- [x] Create `src/utils/webdav-vfs.ts`.
- [x] Implement `JrefFileSystem` extending `webdav.FileSystem`.
  - [x] Implement `_type` to distinguish between files and directories.
  - [x] Implement `_readDir` for listing directory contents.
  - [x] Implement `_openReadStream` for reading file content.
  - [x] Implement `_openWriteStream` for writing file content.
  - [x] Implement `_size` and `_stat`.
  - [x] Implement `_create` for new files/dirs.
  - [x] Implement `_delete` for removing files/dirs.
- [x] Add unit tests for `JrefFileSystem` using `memfs` or mock server.

## Phase 3: Command Implementation
- [x] Create `src/commands/mount.ts`.
- [x] Implement `MountCommand` class extending `Command`.
  - [x] Parse arguments (snapshot path, port).
  - [x] Load snapshot.
  - [x] Initialize `WebDAVServer` with `JrefFileSystem`.
  - [x] Handle `SIGINT` (Ctrl+C) for graceful shutdown and saving.
- [x] Register `MountCommand` in `src/utils/command.ts`.
- [x] Add integration tests for `MountCommand`.

## Phase 4: Verification & Polishing
- [x] Verify build.
- [x] Run full test suite.
- [ ] Manual verification with a WebDAV client.
- [ ] Documentation update (if necessary).
