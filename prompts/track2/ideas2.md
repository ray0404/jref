# jref Project Ideas

This document outlines high-value features and updates for the `jref` project, focusing on enhancing architectural intelligence and developer experience.

## 1. Graph-Augmented "Impact" Query Engine
*   **Target:** Architects & AI Agents
*   **Why:** High-value users need to know more than just where a symbol is. They need to understand the structural implications of changes, such as identifying broken dependencies or tracing the flow between disparate modules.
*   **How:** Implement the currently placeholder `query` subcommand in `src/commands/graph.ts`. Leverage `graphology-shortest-path` and BFS/DFS algorithms to provide flags like `--impact` (identifying recursive dependents) and `--path-to <target>` (visualizing the connection between two symbols).
*   **Complexity:** Medium

## 2. Semantic Community Detection (The "Vibe" Map)
*   **Target:** New Contributors & Onboarding Teams
*   **Why:** Large codebases often have functional clusters (e.g., "Authentication" or "Streaming Logic") that are scattered across different directories. Visualizing these "communities" helps in understanding the true logical structure of the project.
*   **How:** Utilize the existing `graphology-communities-louvain` dependency. Modify `analyzeGraph` in `src/utils/graph-analysis.ts` to execute the Louvain algorithm. Update the HTML UI to color-code nodes by their detected community, revealing hidden logical islands.
*   **Complexity:** Low

## 3. Live Graph "Watch" Mode
*   **Target:** Active Developers ("Vibe Coders")
*   **Why:** Static snapshots become outdated quickly during active development. A live, reactive graph serves as a "real-time radar" for developers as they refactor and build.
*   **How:** Add a `--watch` flag to `jref graph ui`. Use a file watcher to monitor the target directory and perform surgical AST updates on changed files. Stream these updates to the UI via the existing WebSocket (`ws`) infrastructure to ensure the visualization is always in sync with the code.
*   **Complexity:** Medium
