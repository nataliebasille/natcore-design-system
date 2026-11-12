import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import postcss, { type AtRule, type Root, type Rule } from "postcss";
import { compile } from "tailwindcss";
import { optimize } from "@tailwindcss/node";
import { moduleToCss } from "../../src/compile/ts-to-css/compile.ts";

export type FlatDecl = {
  /** Fully resolved selector (nesting and `&` expanded). */
  selector: string;
  /** Enclosing at-rules, outermost first, excluding `@layer`. */
  atRules: string[];
  /** Enclosing cascade layers as a dotted path, e.g. `utilities.components`. */
  layer: string;
  prop: string;
  value: string;
  important: boolean;
};

type Query = {
  selector: string | RegExp;
  /** Required substring of one enclosing at-rule; `null` means none allowed. */
  atRule?: string | null;
};

const require = createRequire(import.meta.url);
const tailwindDir = path.dirname(require.resolve("tailwindcss/package.json"));
const natcoreSrcDir = fileURLToPath(
  new URL("../../src/tailwind/", import.meta.url),
);
const stylesheetCache = new Map<string, Promise<string>>();

/**
 * Compiles the real `natcore.css` entry from source (compiling `*.css.ts`
 * imports exactly like the package build does), runs it through Tailwind, and
 * generates CSS for the given class candidates. `extraCss` is appended to the
 * entry, e.g. test-only components compiled with `moduleToCss`.
 */
export async function buildNatcoreCss(
  candidates: string[],
  extraCss = "",
): Promise<Root> {
  const entry = path.join(natcoreSrcDir, "natcore.css");
  const compiler = await compile(
    `${await readCssOrCompile(entry)}\n${extraCss}`,
    { base: natcoreSrcDir, loadStylesheet },
  );

  return postcss.parse(compiler.build(candidates));
}

/** Flattens nested Tailwind output into one entry per declaration. */
export function flatten(root: Root): FlatDecl[] {
  const result: FlatDecl[] = [];

  root.walkDecls((decl) => {
    const chain: (Rule | AtRule)[] = [];
    for (let p = decl.parent; p && p.type !== "root"; p = p.parent) {
      chain.unshift(p as Rule | AtRule);
    }

    let selectors: string[] = [];
    const atRules: string[] = [];
    const layers: string[] = [];
    for (const node of chain) {
      if (node.type === "rule") {
        selectors = resolveSelectors(selectors, node.selector);
      } else if (node.name === "layer") {
        layers.push(node.params);
      } else {
        atRules.push(`@${node.name} ${node.params}`.trim());
      }
    }

    for (const selector of selectors) {
      result.push({
        selector,
        atRules,
        layer: layers.join("."),
        prop: decl.prop,
        value: decl.value,
        important: decl.important,
      });
    }
  });

  return result;
}

/** Map of prop → value for declarations matching the query (last wins). */
export function declarations(root: Root, query: Query) {
  const decls: Record<string, string> = {};
  for (const decl of flatten(root)) {
    if (matchesQuery(decl, query)) {
      decls[decl.prop] =
        decl.important ? `${decl.value} !important` : decl.value;
    }
  }
  return decls;
}

/** Every flattened declaration matching the query, with layer/at-rule info. */
export function findDecls(root: Root, query: Query & { prop?: string }) {
  return flatten(root).filter(
    (decl) =>
      matchesQuery(decl, query) &&
      (query.prop === undefined || decl.prop === query.prop),
  );
}

/**
 * Substitutes `var(--x)` with its value (recursively): first from `localVars`,
 * then from `:root` theme variables, so assertions don't depend on whether
 * values are inlined or referenced.
 */
export function resolveVars(
  root: Root,
  value: string,
  localVars: Record<string, string> = {},
  depth = 0,
): string {
  if (depth > 10) return value;

  const themeVars = declarations(root, { selector: /(^|,\s*):root\b/ });
  const resolved = value.replace(
    /var\((--[\w-]+)(?:,\s*([^()]*))?\)/g,
    (match, name: string, fallback?: string) =>
      localVars[name] ?? themeVars[name] ?? fallback?.trim() ?? match,
  );

  return resolved === value ? value : (
      resolveVars(root, resolved, localVars, depth + 1)
    );
}

/**
 * Runs Tailwind output through the lightningcss minifier that Tailwind's
 * PostCSS/Vite/CLI pipelines use, which un-nests and rewrites at-rules.
 */
export function minify(root: Root): Root {
  return postcss.parse(optimize(root.toString(), { minify: true }).code);
}

/**
 * Whether `winner` beats `loser` on cascade layer alone (normal declarations).
 * Styles directly in a layer beat its nested layers; sibling layers are ranked
 * by first declaration. Returns false for the same layer, where specificity and
 * source order decide instead.
 */
export function winsByLayer(root: Root, winner: FlatDecl, loser: FlatDecl) {
  if (winner.important || loser.important) {
    throw new Error("!important reverses layer order; compare normal decls");
  }

  const a = winner.layer ? winner.layer.split(".") : [];
  const b = loser.layer ? loser.layer.split(".") : [];
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;

  if (i === a.length && i === b.length) return false;
  if (i === a.length) return true;
  if (i === b.length) return false;

  const order = layerOrder(root);
  const prefix = a.slice(0, i);
  return (
    order.indexOf([...prefix, a[i]].join(".")) >
    order.indexOf([...prefix, b[i]].join("."))
  );
}

async function loadStylesheet(id: string, base: string) {
  const file =
    id === "tailwindcss" ? path.join(tailwindDir, "index.css")
    : id.startsWith("tailwindcss/") ?
      path.join(tailwindDir, `${id.slice("tailwindcss/".length)}.css`)
    : path.resolve(base, id);

  return {
    path: file,
    base: path.dirname(file),
    content: await readCssOrCompile(file),
  };
}

/**
 * Reads a `.css` file, or compiles its `.css.ts` source like the build does.
 * Cached per process: sources don't change during a test run, and re-importing
 * every module per test grows the module graph until tests stall.
 */
function readCssOrCompile(file: string) {
  let cached = stylesheetCache.get(file);
  if (!cached) {
    cached = readCssOrCompileUncached(file);
    stylesheetCache.set(file, cached);
  }
  return cached;
}

async function readCssOrCompileUncached(file: string) {
  if (await exists(file)) return fs.readFile(file, "utf8");

  const source = `${file}.ts`;
  if (await exists(source)) {
    return moduleToCss((await import(pathToFileURL(source).href)).default);
  }

  throw new Error(`Cannot resolve stylesheet ${file} (or ${source})`);
}

async function exists(file: string) {
  return fs.access(file).then(
    () => true,
    () => false,
  );
}

function matchesQuery(decl: FlatDecl, query: Query) {
  const selectorMatches =
    typeof query.selector === "string" ?
      decl.selector === query.selector
    : query.selector.test(decl.selector);
  if (!selectorMatches) return false;

  if (query.atRule === undefined) return true;
  if (query.atRule === null) return decl.atRules.length === 0;
  return decl.atRules.some((atRule) => atRule.includes(query.atRule!));
}

function resolveSelectors(parents: string[], selector: string) {
  const own = splitSelectorList(selector);
  if (parents.length === 0) return own;

  return parents.flatMap((parent) =>
    own.map((part) =>
      part.includes("&") ? part.replaceAll("&", parent) : `${parent} ${part}`,
    ),
  );
}

function splitSelectorList(selector: string) {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of selector) {
    if (char === "(" || char === "[") depth++;
    if (char === ")" || char === "]") depth--;
    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** Dotted layer paths in the order the cascade first sees them. */
function layerOrder(root: Root) {
  const order: string[] = [];
  root.walkAtRules("layer", (atRule) => {
    const parents: string[] = [];
    for (let p = atRule.parent; p && p.type !== "root"; p = p.parent) {
      if (p.type === "atrule" && (p as AtRule).name === "layer") {
        parents.unshift((p as AtRule).params);
      }
    }
    const names = atRule.nodes ? [atRule.params] : atRule.params.split(",");
    for (const name of names) {
      const path = [...parents, name.trim()].join(".");
      if (!order.includes(path)) order.push(path);
    }
  });
  return order;
}
