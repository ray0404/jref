# MCP Integration Report: `jref` Agentic Optimization (Revised)

## **1. Core Philosophy: The Referential-First Approach**
The primary function of `jref serve` is to act as a **high-speed reference engine** for AI agents. It is designed to provide high-fidelity context and accessibility for external codebases, directories, and software projects to an agent in a way that is more efficient than raw file access.

## **2. Status Assessment**
The current `serve` command provides basic "read-only" access. While functional, it treats the snapshot as a flat database rather than an intelligently structured reference.

### **Room for Improvement**
- **No Self-Description**: Agents don't know the schema or tool best practices initially.
- **All-or-Nothing Structure**: Accessing the project tree requires reading a potentially massive `directoryStructure` string.
- **Low Signal-to-Noise in Search**: Search returns paths only, requiring extra round-trips to see code.

---

## **3. Brainstormed MCP Features (Referential focus)**

### **Feature 1: `jref://usage` (The Manual)**
- **Type**: MCP Resource & Prompt
- **Utility**: Automatically loads info on `jref` commands, the snapshot schema, and "System Prompts" for how an agent should browse a reference project.

### **Feature 2: `summarize_path` (API Mapping)**
- **Type**: Tool
- **Utility**: Exposes the `summarize` logic to return only signatures (imports, exports, class/function definitions) for a specific file.

### **Feature 3: `semantic_grep` (Contextual Search)**
- **Type**: Tool
- **Utility**: Searches for a pattern and returns the *matching block* (e.g., the entire function body) rather than just the line number.

### **Feature 4: `list_directory` (Granular Navigation)**
- **Type**: Tool
- **Utility**: Returns the immediate contents (files and subfolders) of a single directory level. Essential for large projects.

### **Feature 5: `batch_query` (Latency Optimization)**
- **Type**: Tool
- **Utility**: Fetches multiple file contents in a single round-trip.

### **Feature 6: `fuzzy_find` (Quick Navigation)**
- **Type**: Tool
- **Utility**: Jumps to a file based on partial name matching (e.g., "strmjson" -> "src/utils/streaming-json.ts").

### **Feature 7: `get_file_info` (Metadata Only)**
- **Type**: Tool
- **Utility**: Returns line counts, token estimates, and language detection for a path without reading the content.

---

## **4. Recommended Development Path (Next 5 Features)**

1. **`jref://usage` (Self-Documentation)**: Ensure every agent knows how to interact with the snapshot.
2. **`summarize_path` (Token Efficiency)**: Allow agents to map out codebases without implementation noise.
3. **`semantic_grep` (High-Signal Search)**: Provide code blocks directly in search results.
4. **`list_directory` (Scalable Browsing)**: Support projects too large for a single ASCII tree string.
5. **`batch_query` (Performance)**: Optimize for mobile/constrained network environments.
