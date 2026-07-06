# Project Brief: Wayfind

**Repo name:** `wayfind`
**Tagline:** A zoomable map of your codebase with a flight recorder — see structure at every altitude, then watch real data flow through it.
**License:** GPL-3.0 or Apache-2.0 (decide early; Apache-2.0 recommended for adoption)

---

## 1. One-paragraph summary

Wayfind is an open-source code comprehension environment that renders a real codebase as a semantically zoomable map — zoom out to see module/class dependencies (system-design view), zoom in to function call graphs, zoom further into a function's control-flow blocks (if/else, loops, try/catch rendered as structured visual regions, not beginner flowcharts). On top of this static map sits an **execution cinema**: record a real run of the program (a test, a script, a request) and scrub through it on a timeline, watching control jump between blocks and data values flow along edges — only through user-written code, with stdlib/dependencies collapsed. Every node is bidirectionally linked to source: click → open file:line in VS Code; move your cursor in the editor → the map focuses. Code remains text and remains the source of truth; Wayfind is the spatial layer for navigating, understanding, reviewing, and debugging it. Successor-in-spirit to Sourcetrail (discontinued 2021, never replaced), fused with what Python Tutor does for toy snippets — but for real projects.

## 2. Positioning and non-goals

**Is:** comprehension, navigation, onboarding, code review, debugging-by-watching, architecture governance.
**Is NOT (v1):** a visual programming tool. No drag-and-drop authoring of Java/C++/Python. Writing code visually for general-purpose languages is a historically failed category; Wayfind's wedge is reading and watching. Structural refactors triggered from the map (rename/move/extract, executed via LSP code actions so text stays canonical) are a v2 bridge, not MVP.

**Why now:** (a) the Sourcetrail gap is unfilled and heavily searched; (b) AI-generated code means developers increasingly review/own code they didn't write — a comprehension tool is the perfect companion to coding agents; (c) tree-sitter + LSP + runtime inspector protocols make a multi-language implementation feasible for a small team in a way it wasn't in 2016.

## 3. Core concepts (the product spec in miniature)

### 3.1 Semantic zoom (the "altitudes")
- **L4 System:** packages/modules as territories; import/dependency edges; size = LOC or churn; entry points highlighted on the rim.
- **L3 Class/Module:** classes, interfaces, top-level functions; inheritance, implementation, composition edges.
- **L2 Function:** call graph within/across files; fan-in/fan-out visible at a glance.
- **L1 Block:** a single function's control flow as nested structured regions — loops as ringed containers, branches as split lanes, try/catch as guarded zones. Not box-and-diamond flowcharts; think "code minimap that shows shape and state."
- Zoom is continuous and semantic (like a map app): labels, detail, and edge bundling adapt to altitude. Search teleports; breadcrumbs preserve orientation.

### 3.2 Execution cinema
- `wayfind record -- <command>` traces a run (a test, a script, an HTTP request) and produces a `.wayfind-trace` bundle.
- Playback: timeline scrubber; the active block glows; calls animate along call-graph edges; variable values render on edges/nodes at the moment they change. Step, play at speed, or jump to any event.
- **User-code-only:** stdlib and node_modules/site-packages are collapsed to single opaque nodes by default ("goes into lodash, comes back with X"). Configurable include/exclude.
- Time travel: click any node at any timestamp → full local state at that moment. Exceptions render as a visible rupture at the exact block, with the propagation path highlighted up the call stack.
- Traces are shareable files: attach to a PR, a bug report, or an onboarding doc — "watch this request travel through the system."

### 3.3 Bidirectional go-to-code
- Standalone app (desktop, Tauri) + VS Code extension sharing the same core.
- Map → editor: click node / "go to code" opens exact file:line. Editor → map: cursor position focuses and highlights the map. Selection in a trace highlights the source lines executed.

### 3.4 Differentiating extras (post-MVP, prioritized)
1. **Diff/PR mode:** overlay a git diff on the map — changed nodes hot, blast radius (transitive dependents) shaded. Answers "what does this PR actually touch."
2. **React/JS mode:** component tree as a first-class altitude; hook dependency edges; record a session and watch props/state flow and re-renders fire. No tool does this structurally.
3. **Architecture rules:** declare allowed edges ("ui must not import db"); violations render red on the map and fail CI. (dependency-cruiser does this textually; Wayfind makes it visual and multi-language.)
4. **Trace diffing:** run the same test on two commits, diff the execution paths — regression debugging by watching where the paths diverge.
5. **Optional AI annotation (BYOK):** generate plain-language summaries for nodes/regions; never required, never phones home by default.
6. **Embeddable read-only maps:** export an interactive HTML snapshot for docs/READMEs.

## 4. Language strategy (ordered by ROI)

| Phase | Language | Static analysis | Runtime tracing |
|---|---|---|---|
| v0.1 | TypeScript/JavaScript | tree-sitter + TS compiler API | Node.js V8 inspector protocol (`--inspect`) |
| v0.2 | Python | tree-sitter + LSP (pyright/jedi) | sys.monitoring (PEP 669, low overhead, 3.12+) |
| v0.3 | Java | tree-sitter + Eclipse JDT LS | JVMTI / java.lang.instrument agent |
| v0.4+ | C++ | clangd/LSIF-style index | Hardest; defer. Sourcetrail-fork learnings apply. |

The core graph schema, renderer, trace format, and UI are language-agnostic; each language is an adapter pair (indexer + tracer). Publish the adapter interface as a stable spec so the community can add Go, Rust, C#.

## 5. Architecture

```
Monorepo (pnpm workspaces + turborepo; tracers in native lang per adapter)
packages/
  graph-core/      # Language-agnostic code-graph schema (nodes: module/class/fn/block; edges: import/call/inherit/flow), Zod-validated, versioned
  trace-format/    # .wayfind-trace spec: event stream (enter/exit/branch/assign/throw), value snapshots, source spans; columnar + compressed
  indexer-ts/      # TS/JS static analysis -> graph-core (tree-sitter + TS API); incremental re-index on file change
  tracer-node/     # Runtime tracer via inspector protocol; user-code filtering; sampling/limits for big values
  renderer/        # WebGL/canvas map engine: semantic zoom, edge bundling, layout (ELK + custom), 60fps on 50k-node graphs
  playback/        # Trace loader, timeline model, state reconstruction at time t
  app/             # Tauri desktop shell + shared React UI
  vscode-ext/      # Editor integration: focus sync, go-to-code, inline "record this test" lens
  cli/             # wayfind index / record / open / check (architecture rules)
apps/
  docs/            # Docs site + live demo map of a well-known OSS repo (e.g. Express) — the marketing asset
examples/          # Reference repos with committed indexes + traces (used as golden tests)
```

Key technical decisions:
- **Performance is the product.** Sourcetrail's magic was fluid navigation. Budget: index 100k LOC < 30s, incremental update < 1s, pan/zoom at 60fps. Renderer on WebGL from day one; graph layout computed off-thread.
- Trace overhead target < 5x slowdown for typical runs; value capture is sampled and size-capped with "expand on demand" re-runs.
- Everything local. No telemetry, no cloud. Traces may contain sensitive data — say so in docs, provide redaction filters.
- Golden tests: for each example repo, the index and a recorded trace are snapshot-verified in CI.

## 6. Milestones

- **M1 (weeks 1–3):** graph-core schema + indexer-ts on 3 real repos; dumb SVG rendering to validate data.
- **M2 (weeks 4–6):** renderer: semantic zoom L4→L2, search, breadcrumbs; performance harness in CI.
- **M3 (weeks 7–8):** L1 block view (control-flow regions inside a function); go-to-code via VS Code extension (one direction).
- **M4 (weeks 9–11):** tracer-node + trace-format + playback: record a run, scrub timeline, values on edges, exception rupture view.
- **M5 (weeks 12–13):** bidirectional editor sync; user-code filtering polish; shareable trace bundles.
- **M6 (weeks 14–16):** hosted demo map + demo video ("watch an HTTP request travel through Express"), docs, launch. Then v0.2 = Python adapter + diff/PR mode.

## 7. Open-source standards (mandatory)

- `LICENSE` (Apache-2.0), `README.md` (hero GIF of zoom-out + execution playback; 60-second quickstart: `npx wayfind open .`), `CONTRIBUTING.md` with a dedicated "Writing a language adapter" guide, `CODE_OF_CONDUCT.md` (Contributor Covenant), `SECURITY.md` (trace data sensitivity, local-only guarantees).
- Conventional Commits + changesets; semantic versioning; graph and trace formats versioned independently with migration notes.
- GitHub Actions: lint, typecheck, unit tests (Vitest), golden index/trace tests, renderer performance benchmarks with regression gates, cross-platform Tauri builds.
- Issue templates incl. "Language adapter request"; Discussions; `good first issue` = new node badges, layout tweaks, example repos.
- ADRs in `docs/adr/` — especially for graph schema, trace format, and renderer choices; these will be contested and contributors need the reasoning.

## 8. Success criteria for v0.1

A developer opens an unfamiliar 50k-LOC TypeScript repo with `npx wayfind open .`, orients themselves at the system level within 2 minutes, zooms to a function they care about, records one test run, and watches the data flow through it with values visible — then clicks a suspicious block and lands on the exact line in VS Code. If that loop feels magical, everything else follows.
