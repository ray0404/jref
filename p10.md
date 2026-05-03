```markdown
# jref Knowledge Graph Integration Blueprint

## 1. Architectural Overview & Objective
This blueprint outlines the development plan to integrate `graphify`-style deterministic AST extraction, semantic LLM inference, and topological clustering into the `jref` ecosystem. The goal is to transform flat JSON snapshots into queryable, relational knowledge graphs that can be navigated locally via the `jref` CLI, TUI, and exported to AI agents via MCP. 

To ensure maximum portability across diverse ARM64 environments and headless Linux clusters, the architecture will rely on WebAssembly (WASM) for parsing and pure JavaScript topological libraries, avoiding native C++ binding compilation steps (e.g., `node-gyp`).

## 2. Phase 1: Independent Graph Schema Definition
Instead of heavily modifying the existing `project-snapshot-schema.json`, `jref` will implement a distinct schema specifically for graph payloads. This ensures the foundational snapshot logic remains intact while allowing the graph topology to exist as a dedicated artifact or a distinct property namespace.

**Action Items:**
* Create a new file: `schemas/graph-snapshot-schema.json`.
* Implement the Zod runtime validation in `src/types/index.ts`.

**Schema Structure:**
```json
{
  "$schema": "[http://json-schema.org/draft-07/schema#](http://json-schema.org/draft-07/schema#)",
  "title": "JREF Graph Snapshot",
  "type": "object",
  "required": ["nodes", "edges"],
  "properties": {
    "nodes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "label", "type", "source_file"],
        "properties": {
          "id": { "type": "string", "description": "Unique identifier, often a fully qualified path or symbol name" },
          "label": { "type": "string", "description": "Human-readable concept or symbol name" },
          "type": { "type": "string", "enum": ["code", "doc", "concept", "binary"] },
          "source_file": { "type": "string", "description": "Relative path to the origin file" },
          "source_location": { "type": "string", "description": "Line/column or chunk reference" },
          "community": { "type": "integer", "description": "Assigned cluster ID post-analysis" }
        }
      }
    },
    "edges": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["source", "target", "relation", "confidence"],
        "properties": {
          "source": { "type": "string" },
          "target": { "type": "string" },
          "relation": { "type": "string", "description": "e.g., calls, imports, uses, rationale_for" },
          "confidence": { "type": "string", "enum": ["EXTRACTED", "INFERRED", "AMBIGUOUS"] },
          "weight": { "type": "number", "default": 1.0 }
        }
      }
    }
  }
}
```

## 3. Phase 2: Deterministic AST Extraction (No LLM)
To map out explicit structural relationships (`EXTRACTED` confidence) without expending LLM tokens, `jref` will implement local parsing.

**Action Items:**
* **Dependency:** Install `web-tree-sitter`. Bundle the required `.wasm` language parsers (e.g., `tree-sitter-typescript.wasm`, `tree-sitter-zig.wasm`, `tree-sitter-rust.wasm`) directly into the `jref` distribution. This guarantees the CLI can parse code locally on varying architectures without throwing dependency/compilation errors.
* **Extraction Logic (`src/utils/graph-ast.ts`):** * Write traversal scripts that walk the AST to find `import` statements, function declarations, and call expressions.
    * Map these to `nodes` and `edges`. For example, `src/main.ts` importing `src/utils.ts` generates an `imports` edge. `function A()` calling `function B()` generates a `calls` edge.
    * **Edge Case Handling:** Implement cross-file symbol resolution to link a `calls` edge from a file to the exact node in the imported file.

## 4. Phase 3: Semantic Extraction & Inference
Structural code parsing misses the "why." This phase processes markdown files, inline comments, and unstructured text to establish conceptual links.

**Action Items:**
* **Extraction Logic (`src/utils/graph-semantic.ts`):**
    * Create prompts that feed file chunks into the user's configured LLM (via MCP, local API, or Gemini API).
    * Instruct the LLM to return JSON adhering strictly to the `nodes` and `edges` arrays.
    * Ensure the LLM applies the `INFERRED` confidence level for edges like `rationale_for` (e.g., linking a design document to a specific audio DSP module) or `semantically_similar_to`.
* **Merge Strategy:** Combine the deterministic AST graph with the semantic LLM graph. If an edge is both `EXTRACTED` and `INFERRED`, the `EXTRACTED` status takes precedence.

## 5. Phase 4: Topological Clustering & Analysis
Instead of vector embeddings, community detection will rely on the density of the graph edges to find natural modular boundaries.

**Action Items:**
* **Dependencies:** Integrate `graphology` (a robust graph library for JS) and `graphology-communities-louvain` (for community detection).
* **Analysis Logic (`src/utils/graph-analysis.ts`):**
    * Load the combined `nodes` and `edges` into a Graphology instance.
    * Run Louvain community detection to assign a `community` integer to each node.
    * Calculate degree centrality to identify "God Nodes" (the most heavily referenced files, classes, or concepts in the repository).
* **Reporting:** Automatically generate a `GRAPH_REPORT.md` summarizing these findings (listing the God Nodes, heavily inferred connections, and potential architectural bottlenecks) alongside the JSON snapshot.

## 6. Phase 5: CLI, TUI, & MCP Integration
Surface the graph data intuitively to both the human developer and AI agents.

**Action Items:**
* **CLI Commands:** * Implement `jref graph build .` to generate `graph-snapshot.json` and `GRAPH_REPORT.md`.
    * Implement `jref graph query "concept"` to traverse the graph and return connected subgraphs.
* **TUI Updates (`src/components/TUI.ts`):**
    * Add a new hotkey (e.g., `g`) while focused on a file in the interactive tree. This triggers a view that lists all immediate incoming and outgoing edges (Callers, Callees, Concepts), allowing keyboard-driven exploration of the dependency tree.
* **MCP Server (`src/plugins/openapi.ts` / `src/commands/serve.ts`):**
    * Expose tools to connected AI agents:
        * `query_graph_node`: Returns a specific node and its immediate edges.
        * `get_shortest_path`: Finds the connection logic between Node A and Node B.
        * `get_community_context`: Retrieves the topological cluster a specific file belongs to.

## 7. Phase 6: Internal Debugging & Testing Strategy
Because standard console output disrupts interactive CLI/TUI environments, debugging the graph generation pipeline must be handled silently and rigorously.

**Action Items:**
* **File-Based Logging:** Implement a `--debug` flag that routes all verbose extraction logs, AST traversal errors, and LLM prompt/response pairs to a silent, rotating `.jref-debug.log` file. This allows tailing the log in a separate pane without breaking the terminal UI.
* **Vitest Coverage:** Create mock AST trees and mock LLM JSON responses in `src/commands/graph.test.ts`. Test the merge logic and Graphology clustering algorithms purely in memory to ensure 100% deterministic output before deploying to hardware.
```
