# 0005 — Graph bundle storage: sorted JSON files

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

M1 needs a concrete on-disk format for `.wayfind/graph.json` bundles. Requirements: deterministic output for a given commit (golden tests, FR-IDX-4), diffable in PRs (examples commit their goldens), trivially loadable in the renderer and in tests. The open question from ARCHITECTURE.md §7 was flat JSON vs SQLite for very large repos.

## Decision

**Pretty-printed JSON**, one bundle per repo, with canonical ordering enforced by `graph-core`'s `finalizeBundle`: nodes sorted by id, edges sorted and deduplicated by (from, to, kind), code-unit string comparison (not locale-dependent). No timestamps or machine-specific data in the bundle — determinism is a schema-level guarantee.

## Alternatives considered

- **SQLite:** better for 1M+ node repos (partial loads, indexes), but adds a native dependency now, kills PR-diffability of goldens, and our v0.1 target is 100k LOC repos whose JSON bundles are a few MB. Revisit when a real repo's bundle exceeds ~100 MB or load time exceeds the budget — that revisit is a new ADR.
- **Columnar/binary (like trace-format will use):** graphs are small relative to traces; readability wins.

## Consequences

- Golden tests are plain `JSON.parse` + deep-equal; diffs are reviewable.
- Large-repo scaling is deliberately deferred with a measured trigger, not prematurely engineered.
