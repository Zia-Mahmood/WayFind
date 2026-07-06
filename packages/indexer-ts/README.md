# @wayfind/indexer-ts

TS/JS static indexer: tree-sitter for fast error-tolerant parsing, the TypeScript compiler API for semantic resolution (call targets, types, imports) → `graph-core` bundles. Incremental re-index on file change (< 1 s budget); `node_modules` becomes boundary stubs, never internals. The reference indexer for [writing-a-language-adapter.md](../../docs/writing-a-language-adapter.md).

**Status:** not yet implemented — core of [M1](../../docs/ROADMAP.md).
