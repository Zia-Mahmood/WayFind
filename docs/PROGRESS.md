# Wayfind — Progress

Live status tracker. Update this file in the same PR as the work it describes; keep the log append-only.

**Current phase:** pre-M1 (scaffolding)
**Last updated:** 2026-07-06

## Milestone status

| Milestone | Target end | Status |
|---|---|---|
| M0 — Repo scaffolding & docs | 2026-07-06 | ✅ done |
| M1 — Graph foundations | 2026-07-24 | ⬜ not started |
| M2 — The map | 2026-08-14 | ⬜ not started |
| M3 — Block view + go-to-code | 2026-08-28 | ⬜ not started |
| M4 — Execution cinema | 2026-09-18 | ⬜ not started |
| M5 — Polish the loop | 2026-10-02 | ⬜ not started |
| M6 — Launch v0.1 | 2026-10-23 | ⬜ not started |

## M1 checklist — Graph foundations

- [ ] ADR: graph bundle storage (JSON vs SQLite)
- [ ] `graph-core`: node/edge schema, Zod validation, version field + migration hook
- [ ] `indexer-ts`: parse with tree-sitter, resolve with TS compiler API
- [ ] `indexer-ts`: module/class/function extraction with source spans
- [ ] `indexer-ts`: import/call/inherit edges
- [ ] `indexer-ts`: node_modules → boundary stub nodes
- [ ] Incremental re-index on file change
- [ ] 3 example repos chosen and added to `examples/` with committed golden indexes
- [ ] Golden index test in CI
- [ ] Throwaway SVG renderer to eyeball graph correctness

(Later milestones get their checklists when the preceding one closes — planning detail decays fast beyond one horizon.)

## Log

- **2026-07-06** — Project scaffolded from [BRIEF.md](BRIEF.md): monorepo structure, requirements, architecture, flows, roadmap, ADRs 0001–0004, community health files, CI skeleton. License decided: Apache-2.0 (ADR-0001).
