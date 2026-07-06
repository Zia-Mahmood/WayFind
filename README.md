# Wayfind

> A zoomable map of your codebase with a flight recorder — see structure at every altitude, then watch real data flow through it.

**Status: pre-alpha (scaffolding).** Nothing is runnable yet — see [docs/PROGRESS.md](docs/PROGRESS.md) for where we are and [docs/ROADMAP.md](docs/ROADMAP.md) for where we're going.

## What is Wayfind?

Wayfind renders a real codebase as a **semantically zoomable map**:

- **L4 — System:** packages/modules as territories, import/dependency edges, entry points on the rim.
- **L3 — Class/Module:** classes, interfaces, top-level functions; inheritance and composition edges.
- **L2 — Function:** the call graph, with fan-in/fan-out visible at a glance.
- **L1 — Block:** a single function's control flow as nested structured regions — loops as ringed containers, branches as split lanes, try/catch as guarded zones.

On top of the static map sits an **execution cinema**: record a real run (a test, a script, an HTTP request) with `wayfind record -- <command>`, then scrub a timeline and watch control jump between blocks and values flow along edges — with stdlib and dependencies collapsed to opaque nodes so you only see *your* code.

Every node is bidirectionally linked to source: click a node → land on the exact `file:line` in VS Code; move your cursor in the editor → the map focuses. Code remains text and remains the source of truth. Wayfind is the spatial layer for reading, reviewing, onboarding, and debugging-by-watching.

Successor-in-spirit to [Sourcetrail](https://github.com/CoatiSoftware/Sourcetrail) (discontinued 2021), fused with what Python Tutor does for toy snippets — but for real projects.

## Quickstart (target UX, v0.1)

```bash
npx wayfind open .            # index the repo and open the map
wayfind record -- npm test    # record a run into a .wayfind-trace bundle
wayfind open trace.wayfind-trace
```

## Why now

1. The Sourcetrail gap is unfilled and heavily searched.
2. AI-generated code means developers increasingly review and own code they didn't write — a comprehension tool is the natural companion to coding agents.
3. tree-sitter + LSP + runtime inspector protocols make multi-language support feasible for a small team in a way it wasn't in 2016.

## Principles

- **Performance is the product.** Index 100k LOC < 30 s, incremental update < 1 s, 60 fps pan/zoom on 50k-node graphs. WebGL from day one.
- **Everything local.** No telemetry, no cloud. Traces can contain sensitive runtime data — they never leave your machine unless *you* share the file. See [SECURITY.md](SECURITY.md).
- **Language-agnostic core.** Each language is an adapter pair (static indexer + runtime tracer) against a stable, versioned spec. See [docs/writing-a-language-adapter.md](docs/writing-a-language-adapter.md).
- **Not a visual programming tool.** Wayfind's wedge is reading and watching, not drag-and-drop authoring.

## Repository layout

```
packages/
  graph-core/    # language-agnostic code-graph schema (versioned, Zod-validated)
  trace-format/  # .wayfind-trace spec: event stream + value snapshots
  indexer-ts/    # TS/JS static analysis -> graph-core
  tracer-node/   # Node.js runtime tracer (V8 inspector protocol)
  renderer/      # WebGL map engine: semantic zoom, layout, edge bundling
  playback/      # trace loader, timeline model, state reconstruction
  app/           # Tauri desktop shell + shared React UI
  vscode-ext/    # editor integration: focus sync, go-to-code, record lens
  cli/           # wayfind index / record / open / check
apps/
  docs/          # docs site + live demo map
examples/        # reference repos with committed indexes + traces (golden tests)
```

Full detail in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Documentation

| Doc | What's in it |
|---|---|
| [docs/BRIEF.md](docs/BRIEF.md) | The founding project brief |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | Functional & non-functional requirements |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, package responsibilities, data flow |
| [docs/FLOWS.md](docs/FLOWS.md) | User flows and pipeline diagrams |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Milestones, timeline, ideas backlog |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Live status tracker |
| [docs/adr/](docs/adr/) | Architecture Decision Records |
| [docs/writing-a-language-adapter.md](docs/writing-a-language-adapter.md) | How to add a language |

## Contributing

We'd love help — especially with language adapters, layout algorithms, and example repos. Start with [CONTRIBUTING.md](CONTRIBUTING.md). Look for `good first issue` labels once issues open up.

## License

[Apache-2.0](LICENSE) — see [ADR-0001](docs/adr/0001-license-apache-2.0.md) for the reasoning.
