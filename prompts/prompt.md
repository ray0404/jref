# `jref` CLI Tool

## The Optimized Development Prompt
**Role:** You are an expert Senior Software Engineer specializing in high-performance CLI tool development and AI-agent interoperability.

**Objective:** Develop a lightweight CLI tool called jref to interact with "condensed" JSON project snapshots. The tool must serve two masters: human developers and AI agents.

### 1. Data Schema Context
The input files follow this JSON schema:
- directoryStructure: (Required) String representing the file tree.
- files: (Required) Object where keys are file paths and values are file contents.
- instruction, fileSummary, userProvidedHeader: (Optional) Strings.

### 2. Core Functional Requirements
- **Inspect:** View the directoryStructure and metadata without loading the entire file into memory (use streaming if possible).
- **Search:** Perform high-speed regex or keyword searching across all entries in the files object.
- **Extract:** Unpack specific files, directories, or the entire project back into the local filesystem, preserving paths.
- **Query:** Allow an AI agent to request the content of a specific file path via a command like tool query --path "src/main.ts".
- **Reconstruct:** A "dry-run" or "check" mode to verify if a local directory matches the snapshot.

### 3. Environmental & Performance Constraints
- **Target Environments:** Termux (Android/ARM), Raspberry Pi 4 (Linux/ARM), and standard x86 Linux.
- **Lightweight:** Minimal dependencies. Avoid heavy frameworks. Use a fast parser for large JSON files (e.g., snapshots can exceed 10MB).
- **CLI-First:** Strictly follow POSIX standards for exit codes. Support --json flags for all commands to allow AI agents to parse the tool's output.
- **Termux Friendly:** Ensure paths and permissions are handled correctly for Android’s scoped storage if applicable.

### 4. Technical Architecture (for 3rd-Year CS Level)
- **Language:** TypeScript (Node.js).
- **Pattern:** Use a Command pattern for CLI actions. Implement a "Buffer-to-Stream" strategy for handling massive JSON strings to avoid heap overflows on lower-memory Raspberry Pi models.
- **Testing:** Include a test suite (Vitest/Jest) that uses the provided repomix_MCP-juce.json as a mock input.

### 5. Output Expectation
Provide the project structure, the main entry point logic, and a README.md detailing the CLI interface (commands, flags, and usage examples for both humans and AI agents).

## Key Features to "Bake In" for your Specific Workflow:
- **The "AI Mode":** Since you mentioned use by AI agents, ensure the prompt instructs the agent to create a --silent or --raw flag. This prevents the tool from printing "Progress: 10%..." or ASCII art, which confuses LLMs when they try to parse the output.
- **Termux Path Handling:** Since binaries in Termux live in /data/data/com.termux/files/usr/bin, the tool should handle path resolution gracefully without assuming a standard /usr/bin environment.
- **Pipe Support:** Ensure it supports cat snapshot.json | tool inspect. This is crucial for the CLI environment you describe.
