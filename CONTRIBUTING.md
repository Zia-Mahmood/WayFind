# Contributing to Wayfind

Thanks for your interest! Wayfind is early — the highest-leverage contributions right now are language adapters, layout/rendering work, and good example repos.

## Ground rules

- Be kind: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- Significant design changes (graph schema, trace format, renderer) need an ADR in [docs/adr/](docs/adr/) — open a Discussion first.
- Code stays local-first: no telemetry, no network calls by default. PRs that phone home will be rejected.

## Development setup

Prerequisites: **Node.js ≥ 22** and **pnpm ≥ 9** (`corepack enable`).

```bash
git clone https://github.com/<org>/wayfind
cd wayfind
pnpm install
pnpm build        # turbo builds all packages
pnpm test         # unit tests (Vitest)
pnpm lint
pnpm typecheck
```

Native tracer components (future Java/C++ adapters) live in their own package with language-appropriate toolchains, documented per package.

## Repository layout

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for what each package does and how data flows between them. The short version: `indexer-*` and `tracer-*` packages are language adapters; everything else is language-agnostic.

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(renderer): add edge bundling at L4
fix(tracer-node): cap captured string values at 4KB
docs(adr): record trace-format compression decision
```

Common scopes are package names (`graph-core`, `renderer`, `cli`, …) plus `adr`, `ci`, and `examples`.

Releases are managed with [changesets](https://github.com/changesets/changesets): user-visible changes need a changeset file (`pnpm changeset`). Graph and trace formats are versioned independently of package versions — a format bump always requires an ADR and migration notes.

## Pull requests

1. Fork, branch from `main` (`feat/<topic>` or `fix/<topic>`).
2. Keep PRs focused; small is fast to review.
3. Add or update tests. For adapter changes, update the golden snapshots in `examples/` and explain diffs in the PR description.
4. CI must pass: lint, typecheck, unit tests, golden index/trace tests, and (once M2 lands) renderer performance gates.
5. Fill in the PR template — especially "how did you verify this."

## Writing a language adapter

The most-wanted contribution. An adapter is a pair:

- an **indexer** that turns source code into the `graph-core` schema (static structure), and
- a **tracer** that turns a run into the `trace-format` event stream (dynamic behavior).

The full contract, step-by-step guide, and conformance checklist live in [docs/writing-a-language-adapter.md](docs/writing-a-language-adapter.md). Open a "Language adapter request" issue first so efforts don't collide.

## Good first issues

Once the codebase lands (see [docs/ROADMAP.md](docs/ROADMAP.md)), we label starter work as `good first issue` — typically: new node badges, layout tweaks, example repos, docs fixes.

## Questions

Use GitHub Discussions for design questions and ideas; issues are for actionable bugs and features.
