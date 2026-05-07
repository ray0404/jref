# Specification: WebDAV Virtual Filesystem Mount

## Objective
Implement a `mount` command that exposes the `jref` JSON snapshot as a local network drive via the WebDAV protocol.

## User Stories
- As a developer, I want to explore my codebase snapshots using standard file system tools (`ls`, `cat`, `vi`) without extracting them to disk.
- As a developer, I want to edit files within a snapshot using my favorite editor and have those changes saved back to the JSON snapshot.

## Requirements
1. **WebDAV Server Integration**
   - Use `webdav-server` (v2/v3) to provide WebDAV functionality.
2. **Virtual FileSystem**
   - Implement a custom `FileSystem` class that maps the in-memory `ProjectSnapshot` to a virtual drive.
   - Support reading and writing files.
   - Reflect real-time byte counts.
3. **Command Interface**
   - New command: `jref mount <snapshot.json> [options]`.
   - Options: `--port <number>` (default 8080).
4. **Lifecycle Management**
   - Graceful shutdown on `Ctrl+C`.
   - Auto-save mutated snapshot back to the original file on exit.
5. **Security**
   - Bind to `127.0.0.1` by default.
6. **Output**
   - Clear text connection string for easy copy-pasting.

## Validation Criteria
- `jref mount snapshot.json` starts a server.
- The server is accessible via a WebDAV client (e.g., `cadaver` or mounting as a network drive).
- Files can be read and edited.
- Changes are persisted to the original `snapshot.json` file on server shutdown.
