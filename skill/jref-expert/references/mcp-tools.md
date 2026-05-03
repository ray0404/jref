# MCP Tool Definitions for jref

When `jref serve` is running, the following tools are exposed to the agent:

| Tool | Input Schema | Description |
| :--- | :--- | :--- |
| `inspect` | `{}` | Returns metadata and the ASCII directory structure. |
| `search` | `{ "pattern": "string" }` | Performs a regex search across all files in the snapshot. |
| `query` | `{ "path": "string" }` | Returns the full text content of a specific file. |
| `summarize` | `{ "paths": ["string"] }` | Strips implementation details from code files. |
| `list_directory`| `{ "path": "string" }` | Mimics `ls` for scoped tree exploration. |
| `find_references`| `{ "symbol": "string" }` | Traces cross-file usage of a specific symbol. |
| `query_graph_node`| `{ "nodeId": "string" }` | Returns structural relationships for a node. |
| `get_shortest_path`| `{ "source": "string", "target": "string" }` | Finds the connection between two nodes. |
| `get_community_context`| `{ "nodeId": "string" }` | Returns the modular cluster ID and its members. |
