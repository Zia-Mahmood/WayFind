# Architecture Decision Records

Short documents recording *why* a significant decision was made — especially for the graph schema, trace format, and renderer, which will be contested and where contributors need the reasoning.

- One decision per file, numbered sequentially: `NNNN-short-title.md`.
- Use [template.md](template.md).
- ADRs are immutable once accepted; a reversal is a **new** ADR that supersedes the old one (update the old one's status line to point forward).
- Open a GitHub Discussion before drafting an ADR for anything cross-cutting.

## Index

| # | Title | Status |
|---|---|---|
| [0001](0001-license-apache-2.0.md) | License: Apache-2.0 | Accepted |
| [0002](0002-monorepo-tooling.md) | Monorepo: pnpm workspaces + turborepo | Accepted |
| [0003](0003-renderer-webgl.md) | Renderer: WebGL from day one | Accepted |
| [0004](0004-language-adapter-contract.md) | Languages as adapter pairs against versioned formats | Accepted |
