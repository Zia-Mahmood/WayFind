# @wayfind/graph-core

The language-agnostic code-graph schema — nodes (module/class/function/block), edges (import/call/inherit/flow/containment), source spans — plus Zod validation and format versioning with migrations. Pure data, no I/O.

This package *is* the static half of the adapter contract ([ADR-0004](../../docs/adr/0004-language-adapter-contract.md)): indexers write it, the renderer reads it, and schema changes require a version bump + migration notes + ADR.

**Status:** implemented (M1). Format v0.1.0: `finalizeBundle` canonicalizes (sorted nodes/edges, deduped, locale-independent) and rejects duplicate ids and dangling edges; storage is sorted JSON ([ADR-0005](../../docs/adr/0005-graph-storage-json.md)).
