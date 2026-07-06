# 0004 — Languages as adapter pairs against versioned format specs

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

Wayfind must eventually cover TS/JS, Python, Java, C++ and community languages (Go, Rust, C#). A small team cannot build these; the community must be able to. Sourcetrail's per-language indexers were entangled with its UI, which made contribution hard and stalled coverage.

## Decision

Each language is an **adapter pair** — `indexer-<lang>` (source → `graph-core`) and `tracer-<lang>` (run → `trace-format`) — that depends **only on the format packages**, never on renderer/playback/UI. The UI consumes only the formats and never imports adapters; the CLI is the sole composition point.

`graph-core` and `trace-format` are **versioned independently** of package releases, Zod-validated at every boundary, with migration notes required for every format bump. The adapter contract (requirements + conformance checklist) is published as a stable doc: [writing-a-language-adapter.md](../writing-a-language-adapter.md).

## Alternatives considered

- **Plugin API with runtime registration:** more flexible, but a stable in-process plugin ABI is a heavy commitment pre-1.0. File formats *are* the API — process-level decoupling for free, adapters can even be written in the target language (a Java tracer agent emits trace-format directly).
- **LSIF/SCIP as the graph format:** great for code intelligence, but they model symbols/references, not control-flow blocks or execution semantics; we'd bolt our core concepts onto a foreign schema. We keep import paths from SCIP-style IDs in mind for interop.

## Consequences

- New languages are additive: no core changes, conformance = golden tests passing.
- Format changes are expensive by design (version bump + migration + ADR) — the contract's stability is the product's extension point.
- Cross-language repos (e.g. TS frontend + Python backend) compose naturally: two adapters, one map.
