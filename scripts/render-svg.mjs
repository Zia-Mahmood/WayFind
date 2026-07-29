#!/usr/bin/env node
// Throwaway M1 data-validation renderer (NOT the real renderer — see ADR-0003).
// Usage: node scripts/render-svg.mjs <graph.json> [out.svg]
import * as fs from "node:fs";

const [input, output = input.replace(/\.json$/, "") + ".svg"] = process.argv.slice(2);
if (!input) {
  console.error("usage: node scripts/render-svg.mjs <graph.json> [out.svg]");
  process.exit(1);
}
const bundle = JSON.parse(fs.readFileSync(input, "utf8"));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const moduleOf = (id) => (id.includes("#") ? id.split("#")[0] : id);

// group member nodes under their module; externals get their own row up top
const modules = bundle.nodes.filter((n) => n.kind === "module");
const externals = bundle.nodes.filter((n) => n.external);
const members = new Map(modules.map((m) => [m.id, []]));
for (const n of bundle.nodes) {
  if (n.kind === "module" || n.external) continue;
  members.get(moduleOf(n.id))?.push(n);
}

const ROW = 22, PAD = 10, BOX_W = 260, GAP = 40, PER_ROW = 3;
const pos = new Map(); // id -> {x, y, w, h}

let y = PAD;
externals.forEach((n, i) => {
  pos.set(n.id, { x: PAD + i * (BOX_W / 1.5 + 20), y, w: BOX_W / 1.5, h: ROW });
});
y += externals.length ? ROW + GAP : 0;

let rowMaxH = 0, col = 0, rowY = y;
for (const m of modules) {
  const kids = members.get(m.id) ?? [];
  const h = ROW + PAD + kids.length * ROW + PAD;
  const x = PAD + col * (BOX_W + GAP);
  pos.set(m.id, { x, y: rowY, w: BOX_W, h });
  kids.forEach((k, i) => pos.set(k.id, { x: x + PAD, y: rowY + ROW + PAD + i * ROW, w: BOX_W - 2 * PAD, h: ROW - 4 }));
  rowMaxH = Math.max(rowMaxH, h);
  if (++col === PER_ROW) { col = 0; rowY += rowMaxH + GAP; rowMaxH = 0; }
}
const height = rowY + rowMaxH + GAP;
const width = PAD + PER_ROW * (BOX_W + GAP);

const center = (p) => [p.x + p.w / 2, p.y + p.h / 2];
const COLORS = { import: "#999", call: "#2b6cb0", inherit: "#2f855a", implement: "#2f855a" };
const DASH = { implement: ' stroke-dasharray="6 3"', import: ' stroke-dasharray="2 3"' };

let svg = "";
for (const e of bundle.edges) {
  if (e.kind === "contains") continue; // containment shown by nesting
  const a = pos.get(e.from), b = pos.get(e.to);
  if (!a || !b) continue;
  const [x1, y1] = center(a), [x2, y2] = center(b);
  svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${COLORS[e.kind] ?? "#ccc"}"${DASH[e.kind] ?? ""} marker-end="url(#arr)" opacity="0.7"/>\n`;
}
const FILL = { module: "#f7fafc", class: "#ebf8ff", interface: "#faf5ff", function: "#f0fff4", method: "#fffff0", package: "#fed7d7" };
for (const n of bundle.nodes) {
  const p = pos.get(n.id);
  if (!p) continue;
  svg += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${FILL[n.kind] ?? "#fff"}" stroke="#4a5568" rx="4"/>\n`;
  svg += `<text x="${p.x + 6}" y="${p.y + 15}" font-family="monospace" font-size="12">${esc(n.kind === "module" || n.external ? n.id : n.name)}</text>\n`;
}

fs.writeFileSync(
  output,
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">\n` +
    `<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6" fill="none" stroke="#666"/></marker></defs>\n` +
    `<rect width="100%" height="100%" fill="white"/>\n${svg}</svg>\n`,
);
console.log(`${output}: ${bundle.nodes.length} nodes, ${bundle.edges.length} edges`);
