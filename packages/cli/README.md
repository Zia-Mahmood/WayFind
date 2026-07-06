# wayfind (CLI)

The published entry point — `npx wayfind open .` must work with zero config on a TS repo.

```
wayfind index [path]         # build/refresh the code graph
wayfind record -- <command>  # trace a run into a .wayfind-trace bundle
wayfind open [path|trace]    # open the map (and cinema, for traces)
wayfind check                # architecture rules for CI (v0.3)
```

The CLI is the only package that composes adapters (indexer/tracer) with the UI — everything else stays decoupled ([ADR-0004](../../docs/adr/0004-language-adapter-contract.md)).

**Status:** not yet implemented — grows alongside every milestone, published in [M6](../../docs/ROADMAP.md).
