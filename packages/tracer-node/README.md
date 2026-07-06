# @wayfind/tracer-node

Runtime tracer for Node.js via the V8 inspector protocol (`--inspect`): captures enter/exit/branch/assign/throw events, filters to user code at capture time, samples and size-caps values, applies redaction filters before anything hits disk. Overhead budget: < 5× on typical runs. The reference tracer for [writing-a-language-adapter.md](../../docs/writing-a-language-adapter.md).

**Status:** not yet implemented — core of [M4](../../docs/ROADMAP.md).
