# Wayfind — Requirements

Derived from [BRIEF.md](BRIEF.md). Priorities: **P0** = required for v0.1 launch, **P1** = v0.2–v0.3, **P2** = backlog/ideas. Each requirement is testable; acceptance criteria for the v0.1 release are in §5.

## 1. Personas

| Persona | Goal | Primary features |
|---|---|---|
| **Newcomer** | Orient in an unfamiliar repo in minutes | Semantic zoom, search, breadcrumbs |
| **Reviewer** | Understand what a change actually touches | Go-to-code, diff/PR mode (P1) |
| **Debugger** | See what really happened at runtime | Execution cinema, time travel, exception rupture |
| **Architect** | Keep structure healthy over time | L4 view, architecture rules (P1) |
| **Agent-wrangler** | Review/own AI-generated code they didn't write | All of the above; trace-as-artifact |

## 2. Functional requirements

### 2.1 Indexing (static analysis)

- **FR-IDX-1 (P0)** `wayfind index` (and implicitly `wayfind open`) produces a versioned graph bundle from a TS/JS repo: nodes = module/class/function/block, edges = import/call/inherit/flow, each with source spans.
- **FR-IDX-2 (P0)** Incremental re-index on file change; only affected subgraphs recomputed.
- **FR-IDX-3 (P0)** Third-party code (`node_modules`) is indexed as boundary stubs only — one opaque node per package, never internals.
- **FR-IDX-4 (P0)** Graph bundles are deterministic for a given commit (required for golden tests and caching).
- **FR-IDX-5 (P1)** Python adapter (tree-sitter + pyright/jedi), then Java (Eclipse JDT LS), then C++ (clangd).
- **FR-IDX-6 (P1)** Adapter interface published as a stable, versioned spec so third parties can add languages without touching core.

### 2.2 Map & semantic zoom

- **FR-MAP-1 (P0)** Four altitudes — L4 system, L3 class/module, L2 function, L1 block — with continuous semantic zoom: labels, detail, and edge bundling adapt to altitude.
- **FR-MAP-2 (P0)** L1 renders a function's control flow as nested structured regions (loops = ringed containers, branches = split lanes, try/catch = guarded zones) — not box-and-diamond flowcharts.
- **FR-MAP-3 (P0)** Search teleports to any symbol; breadcrumbs preserve orientation; back/forward navigation history.
- **FR-MAP-4 (P0)** Node size/emphasis encodes a configurable metric (LOC by default; churn when git data available). Entry points highlighted on the rim at L4.
- **FR-MAP-5 (P0)** Fan-in/fan-out visible at a glance at L2; hover reveals edge details.
- **FR-MAP-6 (P2)** Overlay layers: git churn heatmap, test-coverage shading, cyclomatic complexity. (Added: natural extension of FR-MAP-4's metric channel.)
- **FR-MAP-7 (P2)** Bookmarks and free-form annotations pinned to map coordinates, stored in a shareable sidecar file. (Added: makes maps usable as living onboarding docs.)

### 2.3 Execution recording

- **FR-REC-1 (P0)** `wayfind record -- <command>` traces a Node.js run via the V8 inspector protocol and writes a self-contained `.wayfind-trace` bundle.
- **FR-REC-2 (P0)** Event stream captures enter/exit/branch/assign/throw with timestamps and source spans.
- **FR-REC-3 (P0)** **User-code-only by default:** stdlib and `node_modules` collapse to opaque nodes ("goes into lodash, comes back with X"). Include/exclude configurable per-package and per-path.
- **FR-REC-4 (P0)** Value capture is sampled and size-capped; truncated values are marked and can be expanded by re-running with a targeted capture filter.
- **FR-REC-5 (P0)** Redaction filters (name/type/regex) drop or mask values at capture time, before anything is written to disk.
- **FR-REC-6 (P1)** Python tracer via `sys.monitoring` (PEP 669, 3.12+); Java via JVMTI/instrument agent.

### 2.4 Playback (execution cinema)

- **FR-PLAY-1 (P0)** Timeline scrubber: step, play at variable speed, jump to any event. Active block glows; calls animate along call-graph edges.
- **FR-PLAY-2 (P0)** Variable values render on edges/nodes at the moment they change.
- **FR-PLAY-3 (P0)** Time travel: click any node at any timestamp → full captured local state at that moment.
- **FR-PLAY-4 (P0)** Exceptions render as a visible rupture at the exact block, with the propagation path highlighted up the call stack.
- **FR-PLAY-5 (P0)** Traces are portable files openable on another machine (`wayfind open x.wayfind-trace`) against the matching index; version/commit mismatch is detected and reported.
- **FR-PLAY-6 (P2)** Trace search: query events ("when did `user.id` become null", "all throws in module X") and jump the timeline to matches. (Added: scrubbing doesn't scale to long traces.)
- **FR-PLAY-7 (P2)** Multi-trace aggregation: overlay N runs as a coverage-style heat layer — which paths are hot, which never execute. (Added: bridges to dead-code discovery.)

### 2.5 Editor integration

- **FR-EDIT-1 (P0)** Map → editor: activating a node opens the exact `file:line` in VS Code.
- **FR-EDIT-2 (P0)** Editor → map: cursor movement focuses and highlights the corresponding map node (debounced).
- **FR-EDIT-3 (P0)** Selecting a trace time-range highlights the executed source lines in the editor.
- **FR-EDIT-4 (P1)** Code lens above tests: "⏺ record this test" launches `wayfind record` and opens the trace.
- **FR-EDIT-5 (P2)** Keyboard-first map navigation (search, zoom, walk edges) so the map is usable without a mouse; baseline accessibility for the graph view. (Added.)

### 2.6 CLI

- **FR-CLI-1 (P0)** `wayfind index [path]`, `wayfind record -- <cmd>`, `wayfind open [path|trace]`; `npx wayfind open .` works with zero config on a TS repo.
- **FR-CLI-2 (P1)** `wayfind check` evaluates declared architecture rules ("ui must not import db") and exits non-zero on violations, for CI.
- **FR-CLI-3 (P2)** `wayfind export` emits a read-only interactive HTML snapshot of the current map view for docs/READMEs.

### 2.7 Post-MVP differentiators (from brief §3.4, in priority order)

- **FR-DIFF-1 (P1)** Diff/PR mode: overlay a git diff — changed nodes hot, transitive dependents (blast radius) shaded.
- **FR-REACT-1 (P1)** React/JS mode: component tree as a first-class altitude, hook dependency edges, recorded sessions show props/state flow and re-renders.
- **FR-ARCH-1 (P1)** Architecture rules: declarative allowed-edge config; violations render red and fail CI via FR-CLI-2.
- **FR-TDIFF-1 (P2)** Trace diffing: same test on two commits, diff the execution paths, highlight divergence point.
- **FR-AI-1 (P2)** Optional AI annotation (BYOK): plain-language summaries for nodes/regions. Never required, never phones home by default.
- **FR-EMBED-1 (P2)** Embeddable read-only maps (see FR-CLI-3).
- **FR-TOUR-1 (P2)** Tour mode: record a narrated navigation path (sequence of map states + notes) as a shareable onboarding walkthrough. (Added.)

## 3. Non-functional requirements

- **NFR-PERF-1 (P0)** Index 100k LOC in < 30 s cold; incremental update < 1 s.
- **NFR-PERF-2 (P0)** Pan/zoom at 60 fps on graphs up to 50k nodes; layout computed off the UI thread. WebGL/canvas renderer from day one ([ADR-0003](adr/0003-renderer-webgl.md)).
- **NFR-PERF-3 (P0)** Trace overhead < 5× slowdown for typical runs.
- **NFR-PERF-4 (P0)** Performance budgets enforced by CI benchmarks with regression gates (from M2).
- **NFR-PRIV-1 (P0)** No telemetry, no cloud, no network calls by default. Trace sensitivity documented ([SECURITY.md](../SECURITY.md)).
- **NFR-COMPAT-1 (P0)** Desktop app (Tauri) on Windows/macOS/Linux; VS Code extension shares the same core.
- **NFR-EXT-1 (P0)** Graph schema and trace format are versioned independently, validated (Zod), with documented migrations ([ADR-0004](adr/0004-language-adapter-contract.md)).
- **NFR-QUAL-1 (P0)** Golden tests: every example repo's index and one recorded trace are snapshot-verified in CI.
- **NFR-DX-1 (P0)** Zero-config first run on a standard TS repo; config file (`wayfind.config.*`) only for overrides.

## 4. Constraints & assumptions

- Monorepo: pnpm workspaces + turborepo; tracers may be native per adapter ([ADR-0002](adr/0002-monorepo-tooling.md)).
- v1 is read-only over code: no visual authoring. Map-triggered structural refactors (via LSP code actions) are a v2 bridge at most (brief §2).
- Node ≥ 22 for development; traced target apps may run older Node versions supported by the inspector protocol (to be determined during M4).
- Python tracing requires 3.12+ (`sys.monitoring`).

## 5. v0.1 acceptance criteria (the "magic loop")

From brief §8 — all must hold on a real, unfamiliar ~50k-LOC TypeScript repo:

1. `npx wayfind open .` → oriented at system level **within 2 minutes** of first command.
2. Zoom L4 → L2 to a chosen function; search and breadcrumbs work.
3. Record one test run; scrub playback with values visible on edges.
4. Click a suspicious block → land on the exact line in VS Code.
5. All performance budgets in §3 hold on that repo.
