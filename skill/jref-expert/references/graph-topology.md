# Graph Topology Guide

`jref` uses the `graphology` library to analyze project snapshots.

## Centrality
Centrality measures how "important" a node is based on its connections (imports/exports/calls).
- **High Centrality (God Nodes):** These are the core dependencies of your system. Changing them has a high probability of causing regressions.
- **Use Case:** When refactoring, start by analyzing God Nodes to understand the foundational logic.

## Modular Communities (Clustering)
The Louvain method partitions the graph into "communities" where nodes are more densely connected to each other than to nodes outside.
- **Community ID:** Nodes with the same `community` integer in the graph snapshot are tightly coupled.
- **Use Case:** Use community data to identify "feature slices" or "domain boundaries" that might not be obvious from the directory structure alone.

## Blast Radius
The `validate` command uses graph topology to identify affected files.
- **Direct Impact:** Files that directly import a changed file.
- **Indirect Impact:** Files that import files that import a changed file (traversal depth controlled by `--depth`).
