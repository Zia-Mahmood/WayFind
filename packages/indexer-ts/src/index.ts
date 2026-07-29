import * as fs from "node:fs";
import * as path from "node:path";
import ts from "typescript";
import {
  GRAPH_FORMAT_VERSION,
  finalizeBundle,
  type GraphBundle,
  type GraphEdge,
  type GraphNode,
  type NodeKind,
  type Span,
} from "@wayfind/graph-core";

// ponytail: TS compiler API only. The brief pairs it with tree-sitter for speed
// and error tolerance; add tree-sitter when indexing time on a 100k LOC repo
// breaks the 30s budget or broken files start crashing real-world indexing.

function toRel(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join("/").replace(/\\/g, "/");
}

function isProjectFile(sf: ts.SourceFile, root: string): boolean {
  if (sf.isDeclarationFile) return false;
  const rel = toRel(root, sf.fileName);
  return !rel.startsWith("..") && !path.isAbsolute(rel) && !rel.includes("node_modules/");
}

function spanOf(sf: ts.SourceFile, node: ts.Node, root: string): Span {
  const s = sf.getLineAndCharacterOfPosition(node.getStart(sf));
  const e = sf.getLineAndCharacterOfPosition(node.getEnd());
  return {
    file: toRel(root, sf.fileName),
    startLine: s.line + 1,
    startCol: s.character + 1,
    endLine: e.line + 1,
    endCol: e.character + 1,
  };
}

interface DeclInfo {
  id: string;
  kind: NodeKind;
  name: string;
}

function isFnInitializer(node: ts.Expression | undefined): boolean {
  return !!node && (ts.isArrowFunction(node) || ts.isFunctionExpression(node));
}

/**
 * Single source of truth for node identity. Returns null for anything we don't
 * index as a node (nested functions, interface members, accessors, ...).
 * Ids: module = "src/a.ts", member = "src/a.ts#Name" / "src/a.ts#Class.member".
 */
function declInfo(node: ts.Node, root: string): DeclInfo | null {
  const mod = () => toRel(root, node.getSourceFile().fileName);

  if (ts.isFunctionDeclaration(node) && node.body && node.parent && ts.isSourceFile(node.parent)) {
    const name = node.name?.text ?? "default";
    return { id: `${mod()}#${name}`, kind: "function", name };
  }

  if (
    (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
    node.parent &&
    ts.isSourceFile(node.parent)
  ) {
    const name = node.name?.text ?? "default";
    return { id: `${mod()}#${name}`, kind: ts.isClassDeclaration(node) ? "class" : "interface", name };
  }

  // methods, constructors, and class-field arrow "methods" of a top-level class
  if (
    (ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node) || ts.isPropertyDeclaration(node)) &&
    node.parent &&
    ts.isClassDeclaration(node.parent) &&
    node.parent.parent &&
    ts.isSourceFile(node.parent.parent)
  ) {
    if (ts.isMethodDeclaration(node) && !node.body) return null; // overload sig / abstract
    if (ts.isConstructorDeclaration(node) && !node.body) return null;
    if (ts.isPropertyDeclaration(node) && !isFnInitializer(node.initializer)) return null;
    const cls = node.parent.name?.text ?? "default";
    let name: string;
    if (ts.isConstructorDeclaration(node)) {
      name = "constructor";
    } else if (node.name && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))) {
      name = node.name.text;
    } else {
      return null; // computed name
    }
    return { id: `${mod()}#${cls}.${name}`, kind: "method", name };
  }

  // const fn = () => {} at top level
  if (
    ts.isVariableDeclaration(node) &&
    ts.isIdentifier(node.name) &&
    isFnInitializer(node.initializer)
  ) {
    const stmt = node.parent?.parent;
    if (stmt && ts.isVariableStatement(stmt) && stmt.parent && ts.isSourceFile(stmt.parent)) {
      return { id: `${mod()}#${node.name.text}`, kind: "function", name: node.name.text };
    }
  }

  return null;
}

/** Pass 1: declaration nodes + contains edges for one file. */
function extractDecls(
  sf: ts.SourceFile,
  root: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  seen: Set<string>,
): void {
  const modId = toRel(root, sf.fileName);
  nodes.push({
    id: modId,
    kind: "module",
    name: modId.split("/").pop() ?? modId,
    span: spanOf(sf, sf, root),
  });
  seen.add(modId);

  const add = (node: ts.Node, containerId: string): string | null => {
    const info = declInfo(node, root);
    if (!info || seen.has(info.id)) return null; // merged interfaces: first decl wins
    seen.add(info.id);
    nodes.push({ ...info, span: spanOf(sf, node, root) });
    edges.push({ from: containerId, to: info.id, kind: "contains" });
    return info.id;
  };

  for (const st of sf.statements) {
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) add(d, modId);
    } else if (ts.isClassDeclaration(st)) {
      const clsId = add(st, modId);
      if (clsId) for (const m of st.members) add(m, clsId);
    } else {
      add(st, modId); // functions, interfaces; declInfo() is null for the rest
    }
  }
}

/** Import target: project module rel-path, external stub node, or null (unresolved relative). */
function importTarget(
  spec: ts.StringLiteral,
  root: string,
  checker: ts.TypeChecker,
): string | GraphNode | null {
  const sym = checker.getSymbolAtLocation(spec);
  const sfDecl = sym?.declarations?.find(ts.isSourceFile);
  if (sfDecl && !sfDecl.isDeclarationFile) {
    const rel = toRel(root, sfDecl.fileName);
    if (!rel.startsWith("..") && !rel.includes("node_modules/")) return rel;
  }
  const text = spec.text;
  if (text.startsWith(".") || text.startsWith("/")) return null; // broken relative import
  const name = text.startsWith("@")
    ? text.split("/").slice(0, 2).join("/")
    : (text.split("/")[0] ?? text);
  return { id: `pkg:${name}`, kind: "package", name, external: true };
}

/** Resolve a callee/heritage expression to the id of a node we indexed, else null. */
function resolveDeclId(expr: ts.Node, root: string, checker: ts.TypeChecker): string | null {
  try {
    let sym = checker.getSymbolAtLocation(expr);
    if (!sym) return null;
    if (sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
    const decl = sym.valueDeclaration ?? sym.declarations?.[0];
    if (!decl) return null;
    const dsf = decl.getSourceFile();
    if (dsf.isDeclarationFile) return null;
    const rel = toRel(root, dsf.fileName);
    if (rel.startsWith("..") || rel.includes("node_modules/")) return null;
    return declInfo(decl, root)?.id ?? null;
  } catch {
    return null;
  }
}

/** Nearest enclosing indexed node (function/method/class), else null = module level. */
function enclosingId(node: ts.Node, root: string, nodeIds: Set<string>): string | null {
  for (let cur: ts.Node | undefined = node.parent; cur; cur = cur.parent) {
    const info = declInfo(cur, root);
    if (info && nodeIds.has(info.id)) return info.id;
  }
  return null;
}

/** Pass 2: import/call/inherit/implement edges for one file. */
function extractEdges(
  sf: ts.SourceFile,
  root: string,
  checker: ts.TypeChecker,
  nodeIds: Set<string>,
  edges: GraphEdge[],
  externals: Map<string, GraphNode>,
): void {
  const modId = toRel(root, sf.fileName);

  for (const st of sf.statements) {
    const spec =
      (ts.isImportDeclaration(st) || ts.isExportDeclaration(st)) &&
      st.moduleSpecifier &&
      ts.isStringLiteral(st.moduleSpecifier)
        ? st.moduleSpecifier
        : null;
    if (!spec) continue;
    const target = importTarget(spec, root, checker);
    if (target === null) continue;
    if (typeof target === "string") {
      if (nodeIds.has(target)) edges.push({ from: modId, to: target, kind: "import" });
    } else {
      externals.set(target.id, target);
      edges.push({ from: modId, to: target.id, kind: "import" });
    }
  }

  const visit = (node: ts.Node): void => {
    if ((ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.heritageClauses) {
      const fromId = declInfo(node, root)?.id;
      if (fromId && nodeIds.has(fromId)) {
        for (const hc of node.heritageClauses) {
          const kind = hc.token === ts.SyntaxKind.ExtendsKeyword ? "inherit" : "implement";
          for (const t of hc.types) {
            const to = resolveDeclId(t.expression, root, checker);
            if (to && nodeIds.has(to)) edges.push({ from: fromId, to, kind });
          }
        }
      }
    }
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
      const to = resolveDeclId(node.expression, root, checker);
      if (to && nodeIds.has(to)) {
        edges.push({ from: enclosingId(node, root, nodeIds) ?? modId, to, kind: "call" });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

function listSourceFiles(dir: string, out: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listSourceFiles(full, out);
    } else if (/\.(ts|tsx|mts|cts)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      out.push(full);
    }
  }
}

function createProgram(root: string): ts.Program {
  const configPath = path.join(root, "tsconfig.json");
  if (fs.existsSync(configPath)) {
    const host: ts.ParseConfigFileHost = {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (d) => {
        throw new Error(ts.flattenDiagnosticMessageText(d.messageText, "\n"));
      },
    };
    const parsed = ts.getParsedCommandLineOfConfigFile(configPath, { noEmit: true }, host);
    if (!parsed) throw new Error(`failed to parse ${configPath}`);
    return ts.createProgram(parsed.fileNames, parsed.options);
  }
  const files: string[] = [];
  listSourceFiles(root, files);
  return ts.createProgram(files, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
  });
}

function projectFiles(program: ts.Program, root: string): ts.SourceFile[] {
  return program
    .getSourceFiles()
    .filter((sf) => isProjectFile(sf, root))
    .sort((a, b) => (a.fileName < b.fileName ? -1 : a.fileName > b.fileName ? 1 : 0));
}

/** Full index of a TS/JS project rooted at `rootDir`. Deterministic (FR-IDX-4). */
export function indexProject(rootDir: string): GraphBundle {
  const root = path.resolve(rootDir);
  const program = createProgram(root);
  const checker = program.getTypeChecker();
  const files = projectFiles(program, root);

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const externals = new Map<string, GraphNode>();

  for (const sf of files) extractDecls(sf, root, nodes, edges, seen);
  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const sf of files) extractEdges(sf, root, checker, nodeIds, edges, externals);

  nodes.push(...externals.values());
  return finalizeBundle({
    formatVersion: GRAPH_FORMAT_VERSION,
    language: "typescript",
    nodes,
    edges,
  });
}

/**
 * Splice one changed (or deleted) file into an existing bundle.
 *
 * ponytail: rebuilds the full ts.Program (O(project)) and re-extracts only the
 * changed file; cross-file edges are spliced and dangling ones dropped. Known
 * ceiling: an *unchanged* file whose call newly resolves because this file
 * added a symbol won't gain that edge until the next full index. Swap to a
 * ts.LanguageService-backed incremental pipeline when the <1s budget breaks.
 */
export function reindexFile(rootDir: string, bundle: GraphBundle, changedFile: string): GraphBundle {
  const root = path.resolve(rootDir);
  const rel = toRel(root, path.resolve(root, changedFile));
  const owned = (id: string) => id === rel || id.startsWith(`${rel}#`);

  const keptNodes = bundle.nodes.filter((n) => !owned(n.id));
  const keptEdges = bundle.edges.filter((e) => !owned(e.from));

  const program = createProgram(root);
  const checker = program.getTypeChecker();
  const sf = projectFiles(program, root).find((f) => toRel(root, f.fileName) === rel);

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const externals = new Map<string, GraphNode>();
  if (sf) {
    extractDecls(sf, root, nodes, edges, new Set(keptNodes.map((n) => n.id)));
    const nodeIds = new Set([...keptNodes, ...nodes].map((n) => n.id));
    extractEdges(sf, root, checker, nodeIds, edges, externals);
  }

  const allNodes = [...keptNodes.filter((n) => !externals.has(n.id)), ...nodes, ...externals.values()];
  const ids = new Set(allNodes.map((n) => n.id));
  const allEdges = [...keptEdges, ...edges].filter((e) => ids.has(e.from) && ids.has(e.to));
  const referenced = new Set(allEdges.flatMap((e) => [e.from, e.to]));
  const pruned = allNodes.filter((n) => !n.external || referenced.has(n.id));

  return finalizeBundle({ ...bundle, nodes: pruned, edges: allEdges });
}
