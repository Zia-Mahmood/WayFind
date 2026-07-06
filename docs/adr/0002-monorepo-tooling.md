# 0002 — Monorepo: pnpm workspaces + turborepo

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

Wayfind is ~9 tightly coupled TypeScript packages (formats, adapters, renderer, playback, app, extension, CLI) plus future native tracer components per language. Format packages change in lockstep with their consumers during v0.1; contributors must be able to build everything with one command.

## Decision

A single monorepo using **pnpm workspaces** for package management and **turborepo** for task orchestration/caching. Native tracer components (future Java/C++ agents) live in the same repo in their own packages with language-appropriate toolchains, invoked through turbo tasks.

## Alternatives considered

- **Polyrepo:** version-skew hell between `graph-core`/`trace-format` and their consumers exactly when the schemas churn most. Rejected.
- **npm/yarn workspaces:** pnpm's strict node_modules layout catches phantom dependencies — important for packages we publish (`wayfind` CLI) — and it's the fastest installer.
- **Nx instead of turborepo:** more features we don't need yet; turbo's task graph + remote-cache-optional model is the smaller tool that covers lint/typecheck/test/build.

## Consequences

- One `pnpm install && pnpm build` for contributors; CI caches via turbo.
- Publishing is per-package via changesets; the repo version and package versions diverge — that's expected.
- If native tracers outgrow JS-centric tooling, they can get their own build entry points behind turbo tasks without restructuring.
