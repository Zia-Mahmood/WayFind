# @wayfind/indexer-ts

TS/JS static indexer: the TypeScript compiler API for parsing and semantic resolution (call targets, types, imports) → `graph-core` bundles. Emits module/class/interface/function/method nodes with source spans and import/call/inherit/implement/contains edges; `node_modules` becomes `pkg:*` boundary stubs, never internals. `reindexFile` splices a changed file into an existing bundle. The reference indexer for [writing-a-language-adapter.md](../../docs/writing-a-language-adapter.md).

**Status:** implemented (M1), golden-tested against [examples/ts](../../examples/ts). tree-sitter (speed + error tolerance) deferred until the 30 s / 100k LOC budget demands it — see the `ponytail:` note in `src/index.ts`.
