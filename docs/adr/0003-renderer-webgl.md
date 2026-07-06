# 0003 — Renderer: WebGL from day one

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

Sourcetrail's magic was fluid navigation; our budgets are 60 fps pan/zoom on 50k-node graphs and continuous semantic zoom between four altitudes. SVG/DOM renderers fall over between 2k–10k visible elements. Migrating a renderer later means rewriting the product's core.

## Decision

The `renderer` package targets **WebGL (canvas fallback where required) from the first line of code**, with graph layout computed off the main thread in a worker. The M1 SVG output is explicitly a throwaway data-validation harness, not the seed of the real renderer.

## Alternatives considered

- **SVG/DOM first, WebGL later:** faster to demo, guaranteed rewrite, and it would let performance debt hide until it's structural. Performance is the product — the risky part must be de-risked first.
- **Canvas 2D only:** simpler, but edge bundling + thousands of animated edges during playback need GPU batching.
- **Existing graph libs (cytoscape, sigma, react-flow):** none combine semantic-zoom LOD, custom L1 region rendering, and our scale targets; we'd fight the abstraction. We do reuse **ELK** for layout algorithms, behind our own worker interface.

## Consequences

- Steeper initial cost in M2 and a performance harness with regression gates in CI from M2 onward.
- Custom text rendering/labeling work we'd have gotten free in DOM.
- The renderer becomes reusable for the embeddable read-only map export later.
