# @wayfind/renderer

The map engine: WebGL from day one ([ADR-0003](../../docs/adr/0003-renderer-webgl.md)), continuous semantic zoom across altitudes L4→L1, edge bundling, layout (ELK + custom) computed in a worker. Budgets: 60 fps pan/zoom at 50k nodes — enforced by CI benchmarks from M2. Consumes `graph-core` only; playback drives it for execution cinema.

**Status:** not yet implemented — core of [M2](../../docs/ROADMAP.md) (L1 block regions in M3).
