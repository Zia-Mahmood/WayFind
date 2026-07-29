# Wayfind — Progress

Live status tracker. Update this file in the same PR as the work it describes; keep the log append-only.

**Current phase:** M1 done → M2 (the map)
**Last updated:** 2026-07-29

## Milestone status

| Milestone | Target end | Status |
|---|---|---|
| M0 — Repo scaffolding & docs | 2026-07-06 | ✅ done |
| M1 — Graph foundations | 2026-07-24 | ✅ done 2026-07-29 |
| M2 — The map | 2026-08-14 | ⬜ not started |
| M3 — Block view + go-to-code | 2026-08-28 | ⬜ not started |
| M4 — Execution cinema | 2026-09-18 | ⬜ not started |
| M5 — Polish the loop | 2026-10-02 | ⬜ not started |
| M6 — Launch v0.1 | 2026-10-23 | ⬜ not started |

## M1 checklist — Graph foundations ✅

- [x] ADR: graph bundle storage → sorted JSON ([ADR-0005](adr/0005-graph-storage-json.md))
- [x] `graph-core`: node/edge schema, Zod validation, version field, canonical `finalizeBundle` (sorts, dedupes, rejects duplicates/dangling edges)
- [x] `indexer-ts`: TS compiler API parsing + semantic resolution
- [x] `indexer-ts`: module/class/interface/function/method extraction with source spans
- [x] `indexer-ts`: import/call/inherit/implement/contains edges
- [x] `indexer-ts`: node_modules → boundary stub nodes (`pkg:*`)
- [x] Incremental re-index on file change (`reindexFile` splice; ceiling documented in code)
- [x] 3 example repos in `examples/ts/` with committed golden indexes
- [x] Golden + determinism + incremental tests (16 passing) wired into `pnpm test` / CI
- [x] Throwaway SVG renderer (`scripts/render-svg.mjs`) to eyeball graph correctness

**Deviations from the brief, deliberately deferred:**
- tree-sitter is not wired in yet — the TS compiler API alone covers M1. Add when the 30 s / 100k LOC budget breaks or error-tolerance on broken files matters (comment marks the spot in `indexer-ts`).
- The example repos are authored mini-projects, not large real-world OSS repos. Swap in real repos (and measure the perf budgets on them) as part of M2's performance harness.

## M2 checklist — The map

- [ ] ADR: layout engine split (how much ELK vs custom)
- [ ] `renderer`: WebGL canvas bootstrap, camera (pan/zoom), worker-side layout
- [ ] Semantic zoom L4→L3→L2 with level-of-detail label rules
- [ ] Search teleport + breadcrumbs
- [ ] Performance harness in CI with regression gates (60 fps @ 50k nodes budget)
- [ ] Real-world OSS example repo indexed as the perf corpus

## Log

- **2026-07-06** — Project scaffolded from [BRIEF.md](BRIEF.md): monorepo structure, requirements, architecture, flows, roadmap, ADRs 0001–0004, community health files, CI skeleton. License decided: Apache-2.0 (ADR-0001).
- **2026-07-29** — **M1 complete.** `graph-core` (schema v0.1.0) and `indexer-ts` implemented and tested: 3 example repos with committed golden indexes, determinism + incremental-splice tests, SVG validation renderer. Toolchain live: pnpm + turbo + vitest, `pnpm build/test/typecheck` all green locally.
