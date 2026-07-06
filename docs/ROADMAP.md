# Wayfind — Roadmap & Timeline

Dates assume a small team starting **Monday 2026-07-06** and map the 16-week plan from [BRIEF.md](BRIEF.md) §6 onto the calendar. Dates are targets, not promises; [PROGRESS.md](PROGRESS.md) tracks reality.

## v0.1 — TypeScript/JavaScript (16 weeks)

| Milestone | Weeks | Dates (2026) | Deliverable | Exit criterion |
|---|---|---|---|---|
| **M1 — Graph foundations** | 1–3 | Jul 6 – Jul 24 | `graph-core` schema + `indexer-ts` running on 3 real repos; dumb SVG rendering to validate data | Graphs for 3 repos snapshot-committed in `examples/`, golden test green in CI |
| **M2 — The map** | 4–6 | Jul 27 – Aug 14 | `renderer`: semantic zoom L4→L2, search, breadcrumbs; performance harness in CI | 60 fps pan/zoom on the largest example; perf gates active |
| **M3 — Block view + go-to-code** | 7–8 | Aug 17 – Aug 28 | L1 control-flow regions; VS Code extension, map→editor direction | Click any block → correct `file:line` opens |
| **M4 — Execution cinema** | 9–11 | Aug 31 – Sep 18 | `tracer-node` + `trace-format` + `playback`: record, scrub, values on edges, exception rupture | Record a test on an example repo, scrub it end-to-end |
| **M5 — Polish the loop** | 12–13 | Sep 21 – Oct 2 | Bidirectional editor sync; user-code filtering polish; shareable trace bundles | The full v0.1 acceptance loop ([REQUIREMENTS.md](REQUIREMENTS.md) §5) passes |
| **M6 — Launch** | 14–16 | Oct 5 – Oct 23 | Hosted demo map + demo video ("watch an HTTP request travel through Express"), docs site, launch | Public release, `npx wayfind open .` works from npm |

## v0.2+ (order per brief §4 and §3.4)

| Version | Target | Contents |
|---|---|---|
| **v0.2** | Q4 2026 | Python adapter (tree-sitter + pyright/jedi; `sys.monitoring` tracer, 3.12+); **Diff/PR mode** (changed nodes hot, blast radius shaded) |
| **v0.3** | Q1 2027 | Java adapter (JDT LS; JVMTI/instrument agent); **React/JS mode** (component-tree altitude, hook edges, re-render playback); **Architecture rules** + `wayfind check` in CI |
| **v0.4** | later 2027 | C++ (clangd/LSIF-style; hardest tracing — deferred deliberately); trace diffing across commits |

## Ideas backlog (unscheduled, roughly ordered)

From the brief: optional AI annotation (BYOK, off by default) · embeddable read-only HTML maps · map-triggered structural refactors via LSP code actions (the v2 "bridge", explicitly not before).

Added since the brief (see REQUIREMENTS.md P2 items for detail):

- **Overlay layers** — churn/coverage/complexity heatmaps on the map (FR-MAP-6).
- **Trace search** — query the event stream, jump the timeline to matches (FR-PLAY-6).
- **Multi-trace aggregation** — N runs as a coverage-style heat layer; exposes never-executed paths (FR-PLAY-7).
- **Tour mode** — recordable, annotated navigation walkthroughs as shareable onboarding artifacts (FR-TOUR-1).
- **Bookmarks & annotations** — pin notes to map coordinates in a sidecar file (FR-MAP-7).
- **Keyboard-first navigation** — full map control without a mouse (FR-EDIT-5).
- **`wayfind export`** — static interactive snapshot for READMEs (FR-CLI-3).

Anything promoted from this list gets requirements first, then a milestone.

## What we will not build

A visual programming tool. No drag-and-drop authoring of general-purpose languages — historically a failed category, and re-litigating it dilutes the wedge (reading and watching). See brief §2.
