# Examples & golden tests

Reference repos with **committed** indexes and traces. They serve double duty:

1. **Golden tests:** CI re-indexes each repo and re-plays each trace, snapshot-comparing against the committed bundles. Any adapter change that alters output shows up as a reviewable diff (deliberate changes update the snapshots in the same PR, with the diff explained).
2. **Living documentation:** the fastest way to see what an adapter must produce.

Layout (established in M1):

```
examples/
  ts/
    <repo-name>/          # pinned checkout or submodule of a real repo
      .wayfind/           # committed golden index
      *.wayfind-trace     # committed golden trace(s) for deterministic runs
```

Rules: pick real repos (not toys) of varied size; traces must come from deterministic entry points (a specific test, not a fuzzer); traces committed here must contain no sensitive values — they're public.

Adding an example repo is a `good first issue` — see [CONTRIBUTING.md](../CONTRIBUTING.md).
