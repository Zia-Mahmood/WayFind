import { describe, expect, it } from "vitest";
import {
  GRAPH_FORMAT_VERSION,
  finalizeBundle,
  parseBundle,
  type GraphBundle,
} from "../src/index";

const bundle = (over: Partial<GraphBundle> = {}): GraphBundle => ({
  formatVersion: GRAPH_FORMAT_VERSION,
  language: "typescript",
  nodes: [
    { id: "src/b.ts", kind: "module", name: "b.ts" },
    { id: "src/a.ts#fn", kind: "function", name: "fn" },
    { id: "src/a.ts", kind: "module", name: "a.ts" },
    { id: "pkg:lodash", kind: "package", name: "lodash", external: true },
  ],
  edges: [
    { from: "src/a.ts", to: "pkg:lodash", kind: "import" },
    { from: "src/a.ts", to: "src/a.ts#fn", kind: "contains" },
    { from: "src/a.ts", to: "pkg:lodash", kind: "import" }, // duplicate
  ],
  ...over,
});

describe("graph-core", () => {
  it("finalize sorts nodes, dedupes+sorts edges, and validates", () => {
    const out = finalizeBundle(bundle());
    expect(out.nodes.map((n) => n.id)).toEqual([
      "pkg:lodash",
      "src/a.ts",
      "src/a.ts#fn",
      "src/b.ts",
    ]);
    expect(out.edges).toHaveLength(2);
  });

  it("rejects dangling edges", () => {
    expect(() =>
      finalizeBundle(bundle({ edges: [{ from: "src/a.ts", to: "ghost", kind: "call" }] })),
    ).toThrow(/dangling/);
  });

  it("rejects duplicate node ids", () => {
    const b = bundle();
    b.nodes.push({ id: "src/a.ts", kind: "module", name: "a.ts" });
    expect(() => finalizeBundle(b)).toThrow(/duplicate/);
  });

  it("rejects unknown kinds on untrusted input", () => {
    const raw = JSON.parse(JSON.stringify(bundle()));
    raw.nodes[0].kind = "banana";
    expect(() => parseBundle(raw)).toThrow();
  });

  it("finalize output is stable under re-finalize", () => {
    const once = finalizeBundle(bundle());
    expect(finalizeBundle(once)).toEqual(once);
  });
});
