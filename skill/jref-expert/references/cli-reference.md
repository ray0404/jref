# jref CLI Reference

## Commands

### pack
`jref pack [directory|url] [options]`
- `--semantic`: Enable AST-aware semantic chunking and local embeddings.
- `--instruction <text>`: Add custom AI instructions.
- `--max-size <bytes>`: Split snapshot into chunks (JSON only).
- `-s, --output-style <st>`: Output format (json, markdown, xml, plain).
- `--compress`: Enable AST-aware whitespace removal.
- `--remove-comments`: Strip code comments.
- `--token-limit <n>`: Cap the total output tokens.
- `--include-binaries`: Include binary files as Base64.

### query
`jref query [options] [file]`
- `--path, -p <path>`: Path of the file to query.
- `--semantic, -s <query>`: Perform RAG across chunks.
- `--top-k <n>`: Number of semantic results (default: 5).
- `--raw, -r`: Emit pure content (no headers).
- `--line-start`, `--line-end`: Slice specific lines.

### serve
`jref serve [file.json]`
- Starts an MCP server on `stdio`.

### validate
`jref validate <target-branch> [options]`
- `--depth, -d <n>`: Maximum depth for dependency traversal.
- `--all, -a`: Include all tracked files (ignores blast radius).

### graph
`jref graph [options] [file]`
- `--format <fmt>`: json, dot, mermaid.
- `--cluster`: Detect modular clusters (Louvain method).
- `--centrality`: Highlight high-impact nodes (Degree centrality).

### ui
`jref ui [file]`
- Interactive TUI for snapshot navigation.
