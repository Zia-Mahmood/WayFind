# Writing a Language Adapter

A language adapter is what makes Wayfind speak your language. It is a **pair**:

| Part | Input | Output | Ships as |
|---|---|---|---|
| **Indexer** | source tree | `graph-core` bundle (structure) | `packages/indexer-<lang>` |
| **Tracer** | a program run | `.wayfind-trace` bundle (behavior) | `packages/tracer-<lang>` |

Everything downstream — renderer, playback, app, extension — is language-agnostic and works unchanged once your adapter emits valid formats. That boundary is the contract ([ADR-0004](adr/0004-language-adapter-contract.md)): **adapters depend on the format packages, never on the UI.**

> Formats are versioned independently of Wayfind releases. Your adapter declares which `graph-core` / `trace-format` versions it emits; the loader refuses mismatches loudly.

## Before you start

1. Open a **"Language adapter request"** issue (template provided) so efforts don't collide and we can flag known pitfalls.
2. Check the reference implementations: `indexer-ts` + `tracer-node` are the canonical pair; the brief's language table (BRIEF.md §4) lists the recommended tooling per language (tree-sitter + an LSP for indexing; the platform's native inspection API for tracing).

## Indexer requirements

Your indexer must:

- Emit **nodes** for module, class, function, and block, each with a stable ID and a source span (`file`, `startLine/Col`, `endLine/Col`).
- Emit **edges** for import, call, inherit/implement, and containment.
- Represent third-party/stdlib code as **boundary stubs** — one opaque node per package/module, never internals (FR-IDX-3).
- Be **deterministic**: same commit in, byte-identical graph out (golden tests depend on this).
- Support **incremental re-index**: given a changed-files list, recompute only the affected subgraph in < 1 s for a single-file change.

Recommended approach: tree-sitter for fast, error-tolerant parsing; the language's LSP or compiler API for semantic resolution (call targets, types). Parse errors degrade gracefully — a file that won't parse still gets a module node flagged `unresolved`, never a crashed index.

## Tracer requirements

Your tracer must:

- Capture **enter / exit / branch / assign / throw** events with timestamps and source spans matching the indexer's spans (this is what links a trace to the map).
- Filter to **user code at capture time** — collapsing stdlib/deps in the UI later is too expensive and leaks data into the bundle.
- **Sample and size-cap** captured values; mark truncations so the UI can offer "expand on demand" re-runs.
- Apply **redaction filters** (name/type/regex) before anything is written to disk (FR-REC-5 — this is a security requirement, see [SECURITY.md](../SECURITY.md)).
- Stay under **5× slowdown** on typical runs; document your overhead measurement.
- Write **append-only chunks** so a crashed run still yields a readable partial trace.

## Conformance checklist

Your adapter PR needs:

- [ ] Indexer emits schema-valid `graph-core` output (validation is part of the test suite)
- [ ] Tracer emits schema-valid `trace-format` output
- [ ] At least one real-world example repo added to `examples/<lang>/` with a committed golden index
- [ ] One committed golden trace for a deterministic entry point (a test or script) in that repo
- [ ] Golden tests wired into CI (copy the pattern from `examples/ts/`)
- [ ] Determinism test: two consecutive indexes of the same commit are identical
- [ ] Overhead measurement documented in the package README
- [ ] Package README covering: supported language versions, required toolchain, known limitations

## What you don't need to do

No renderer work, no UI work, no playback logic, no VS Code integration — if your formats validate, all of that lights up for free. That's the point of the contract.
