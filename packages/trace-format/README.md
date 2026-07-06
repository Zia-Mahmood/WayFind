# @wayfind/trace-format

The `.wayfind-trace` bundle spec and its reader/writer: a columnar, compressed event stream (enter/exit/branch/assign/throw) with sampled value snapshots and source spans that link back to a `graph-core` index. Append-only during recording so crashed runs still yield readable partial traces.

The dynamic half of the adapter contract ([ADR-0004](../../docs/adr/0004-language-adapter-contract.md)). Traces can contain sensitive runtime values — see [SECURITY.md](../../SECURITY.md).

**Status:** not yet implemented — lands in [M4](../../docs/ROADMAP.md).
