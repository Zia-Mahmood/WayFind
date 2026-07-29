import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { indexProject, reindexFile } from "../src/index";

const here = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.resolve(here, "../../../examples/ts");
const repos = fs
  .readdirSync(examplesDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

describe("golden indexes (UPDATE_GOLDEN=1 to regenerate)", () => {
  it("found the example repos", () => {
    expect(repos).toEqual(["notes-cli", "shapes", "webhook-svc"]);
  });

  for (const repo of repos) {
    it(`index matches golden: ${repo}`, () => {
      const dir = path.join(examplesDir, repo);
      const bundle = indexProject(dir);
      const goldenPath = path.join(dir, ".wayfind", "graph.json");
      if (process.env.UPDATE_GOLDEN) {
        fs.mkdirSync(path.dirname(goldenPath), { recursive: true });
        fs.writeFileSync(goldenPath, JSON.stringify(bundle, null, 2) + "\n");
      }
      const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));
      expect(bundle).toEqual(golden);
    });

    it(`index is deterministic: ${repo}`, () => {
      const dir = path.join(examplesDir, repo);
      const a = indexProject(dir);
      const b = indexProject(dir);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    });
  }
});

describe("incremental re-index", () => {
  const withTempCopy = (repo: string, fn: (dir: string) => void) => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wayfind-inc-"));
    try {
      fs.cpSync(path.join(examplesDir, repo), tmp, { recursive: true });
      fn(tmp);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  };

  it("splice after a body edit matches a full re-index", () => {
    withTempCopy("notes-cli", (dir) => {
      const before = indexProject(dir);
      // pad() gains an internal call to formatNote — new call edge inside the file
      fs.writeFileSync(
        path.join(dir, "src", "format.ts"),
        [
          "export function pad(s: string, width = 12): string {",
          "  return s.length >= width ? s : s + \" \".repeat(width - s.length);",
          "}",
          "",
          "export function formatNote(title: string, body: string): string {",
          "  return `${pad(title)} | ${pad(body)}`;",
          "}",
          "",
          "export function banner(title: string): string {",
          "  return formatNote(title, \"=\".repeat(20));",
          "}",
          "",
        ].join("\n"),
      );
      const spliced = reindexFile(dir, before, "src/format.ts");
      expect(spliced).toEqual(indexProject(dir));
    });
  });

  it("splice drops incoming edges to a removed function", () => {
    withTempCopy("notes-cli", (dir) => {
      const before = indexProject(dir);
      expect(before.nodes.some((n) => n.id === "src/store.ts#listNotes")).toBe(true);
      // remove listNotes (still called from src/index.ts, which is unchanged)
      fs.writeFileSync(
        path.join(dir, "src", "store.ts"),
        [
          "export interface Note {",
          "  id: string;",
          "  title: string;",
          "  body: string;",
          "}",
          "",
          "const notes: Note[] = [];",
          "",
          "export function addNote(title: string, body: string): Note {",
          "  const note = { id: String(notes.length), title, body };",
          "  notes.push(note);",
          "  return note;",
          "}",
          "",
        ].join("\n"),
      );
      const spliced = reindexFile(dir, before, "src/store.ts");
      expect(spliced.nodes.some((n) => n.id === "src/store.ts#listNotes")).toBe(false);
      expect(spliced.edges.some((e) => e.to === "src/store.ts#listNotes")).toBe(false);
      // nanoid import is gone too — its stub must be pruned
      expect(spliced.nodes.some((n) => n.id === "pkg:nanoid")).toBe(false);
      expect(spliced).toEqual(indexProject(dir));
    });
  });
});

describe("indexed content sanity", () => {
  it("captures the interesting edges in shapes", () => {
    const bundle = indexProject(path.join(examplesDir, "shapes"));
    const has = (from: string, to: string, kind: string) =>
      bundle.edges.some((e) => e.from === from && e.to === to && e.kind === kind);
    expect(has("src/circle.ts#Circle", "src/shape.ts#Shape", "inherit")).toBe(true);
    expect(has("src/circle.ts#Circle", "src/shape.ts#Drawable", "implement")).toBe(true);
    expect(has("src/circle.ts#Circle.area", "src/util.ts#round2", "call")).toBe(true);
    expect(has("src/main.ts#render", "src/shape.ts#Shape.describe", "call")).toBe(true);
    expect(has("src/main.ts", "src/circle.ts#Circle", "call")).toBe(true); // top-level new
  });

  it("collapses external packages to boundary stubs", () => {
    const bundle = indexProject(path.join(examplesDir, "webhook-svc"));
    const express = bundle.nodes.find((n) => n.id === "pkg:express");
    expect(express).toMatchObject({ kind: "package", external: true });
    expect(bundle.nodes.filter((n) => n.external).map((n) => n.id).sort()).toEqual([
      "pkg:express",
      "pkg:node:crypto",
    ]);
    // re-export counts as an import edge
    expect(
      bundle.edges.some((e) => e.from === "src/index.ts" && e.to === "src/server.ts" && e.kind === "import"),
    ).toBe(true);
  });
});
