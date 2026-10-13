import { compilePaletteDeclarations } from "./generate.ts";

const AT_RULE = "@natcore-palettes";
const IMPORT_AT_RULE = "@import";

/**
 * Expand every `@natcore-palettes { … }` at-rule in a raw CSS string into the
 * generated `@theme` blocks. Dependency-free (no PostCSS) so it can back the
 * Vite plugin and other raw-string pipelines.
 */
export function expandNatcorePalettesInCss(css: string): string {
  if (!css.includes(AT_RULE)) return css;

  let result = "";
  let index = 0;

  while (index < css.length) {
    // Scan for the next at-rule, skipping comments and string literals so a
    // mention of the token inside `/* … */` or `"…"` never false-matches.
    const start = findAtRule(css, index);
    if (start === -1) {
      result += css.slice(index);
      break;
    }

    // Copy everything up to the at-rule.
    result += css.slice(index, start);

    // Find the opening brace (also comment/string aware).
    const braceStart = findOpenBrace(css, start + AT_RULE.length);
    if (braceStart === -1) {
      // Malformed; leave the rest untouched.
      result += css.slice(start);
      break;
    }

    // Match the balanced closing brace, ignoring braces in comments/strings.
    const braceEnd = findMatchingBrace(css, braceStart);
    if (braceEnd === -1) {
      result += css.slice(start);
      break;
    }

    const body = css.slice(braceStart + 1, braceEnd);
    result += compilePaletteDeclarations(parseDeclarations(body));
    index = braceEnd + 1;
  }

  return result;
}

/** Resolve a CSS `@import` specifier to an absolute file path, or `null`. */
export type ResolveImport = (
  spec: string,
  fromFile: string | undefined,
) => string | null;

/** Read a resolved file's contents, or `null` when it cannot be read. */
export type ReadFile = (absPath: string) => string | null;

export interface InlineImportsOptions {
  /** Absolute path of the document being processed (for relative resolution). */
  fromFile?: string;
  /** Resolve an `@import` specifier to an absolute path (or `null` to skip). */
  resolveImport: ResolveImport;
  /** Read a resolved file's contents (or `null` to skip). */
  readFile: ReadFile;
  /** Absolute paths already inlined — guards against import cycles/duplicates. */
  visited?: Set<string>;
}

/**
 * Inline plain CSS `@import`s that lead to `@natcore-palettes` declarations so
 * the expander can see palette blocks factored into shared files.
 *
 * natcore must run before `@tailwindcss/postcss`, which is what normally inlines
 * `@import`s — so without this pass a palette block behind an `@import` is never
 * expanded. An `@import` is inlined only when its resolved file (or something it
 * transitively imports) actually declares palettes; every other `@import` (bare
 * specifiers such as `tailwindcss`, non-palette files, qualified imports, and
 * unresolvable paths) is left verbatim for Tailwind. Comment/string-aware so a
 * mention of `@import` or `@natcore-palettes` inside `/* … *​/` or a string
 * literal never false-matches. Recurses into inlined files and guards against
 * cycles/duplicates via `visited`.
 *
 * Inlined palette content is deferred to the end of the leading import prelude
 * (after any `@import`s that remain) rather than injected at the consumed
 * import's original position, so a later untouched `@import` is never left
 * sitting after non-import rules — which CSS would otherwise ignore.
 */
export function inlineNatcorePaletteImports(
  css: string,
  options: InlineImportsOptions,
): string {
  const visited = options.visited ?? new Set<string>();
  if (options.fromFile) visited.add(options.fromFile);

  if (!css.includes(IMPORT_AT_RULE)) return css;

  const ctx: InlineContext = {
    resolveImport: options.resolveImport,
    readFile: options.readFile,
    visited,
  };

  let output = "";
  // Collected palette content from consumed imports, deferred until after the
  // import prelude.
  let collected = "";
  // Output index of the first consumed palette import (locality fallback).
  let firstConsumedAt = -1;
  // Output index just past the last `@import` left verbatim.
  let lastImportEnd = -1;
  let index = 0;

  while (index < css.length) {
    const start = findToken(css, index, IMPORT_AT_RULE);
    if (start === -1) {
      output += css.slice(index);
      break;
    }

    output += css.slice(index, start);

    const semicolon = findSemicolon(css, start + IMPORT_AT_RULE.length);
    const statementEnd = semicolon === -1 ? css.length : semicolon + 1;
    const statement = css.slice(start, statementEnd);

    const inlined = resolveStatement(statement, options.fromFile, ctx);
    if (inlined === null) {
      // Not a palette import — keep it verbatim for Tailwind.
      output += statement;
      lastImportEnd = output.length;
    } else {
      // Palette import consumed — defer its content past the prelude.
      if (firstConsumedAt === -1) firstConsumedAt = output.length;
      if (inlined) collected += (collected ? "\n" : "") + inlined;
    }
    index = statementEnd;
  }

  if (collected === "") return output;

  const at = Math.max(firstConsumedAt, lastImportEnd, 0);
  return `${output.slice(0, at)}\n${collected}\n${output.slice(at)}`;
}

interface InlineContext {
  resolveImport: ResolveImport;
  readFile: ReadFile;
  visited: Set<string>;
}

/**
 * Resolve a single `@import` statement. Returns the inlined palette content to
 * defer (possibly `""` for a de-duplicated/cyclic import), or `null` to leave
 * the statement verbatim for Tailwind.
 */
function resolveStatement(
  statement: string,
  fromFile: string | undefined,
  ctx: InlineContext,
): string | null {
  const parsed = parseImportTarget(statement);
  if (parsed === null) return null;

  // A qualified import (`@import "…" print`, `layer(…)`, `supports(…)`, or a
  // media query) only applies under its condition. Inlining its contents
  // unconditionally would change that, so leave it for Tailwind.
  if (hasImportConditions(statement, parsed.end)) return null;

  const resolved = ctx.resolveImport(parsed.spec, fromFile);
  if (resolved === null) return null;

  // Already inlined elsewhere (duplicate) or currently being inlined higher up
  // the chain (cycle) — consume it but contribute nothing to avoid duplicate
  // palette definitions and infinite recursion.
  if (ctx.visited.has(resolved)) return "";

  // Tentatively claim this path before recursing so cycles and duplicates are
  // caught; revert if it turns out there are no palettes down this branch.
  ctx.visited.add(resolved);

  const contents = ctx.readFile(resolved);
  if (contents === null) {
    ctx.visited.delete(resolved);
    return null;
  }

  const inlined = inlineNatcorePaletteImports(contents, {
    fromFile: resolved,
    resolveImport: ctx.resolveImport,
    readFile: ctx.readFile,
    visited: ctx.visited,
  });

  // Only inline when this branch yields a *real* `@natcore-palettes` at-rule
  // (not merely a mention in a comment or string); otherwise leave the
  // `@import` verbatim for Tailwind (do no harm to non-palette imports).
  if (findAtRule(inlined, 0) === -1) {
    ctx.visited.delete(resolved);
    return null;
  }

  return inlined;
}

/**
 * Whether anything other than whitespace/`;` follows the import URL token that
 * ends at `urlEnd` — i.e. a media query, `layer(…)`, or `supports(…)` condition.
 */
function hasImportConditions(statement: string, urlEnd: number): boolean {
  let tail = statement.slice(urlEnd).trim();
  if (tail.endsWith(";")) tail = tail.slice(0, -1).trim();
  return tail.length > 0;
}

/** The import URL specifier plus the index just past its closing token. */
interface ImportTarget {
  spec: string;
  end: number;
}

/** Extract the path/specifier from an `@import` statement, or `null`. */
function parseImportTarget(statement: string): ImportTarget | null {
  let i = IMPORT_AT_RULE.length;
  while (i < statement.length && isWhitespace(statement[i])) i += 1;

  if (statement.startsWith("url(", i)) {
    let j = i + 4;
    while (j < statement.length && isWhitespace(statement[j])) j += 1;
    const quote = statement[j];
    if (quote === '"' || quote === "'") {
      const end = statement.indexOf(quote, j + 1);
      if (end === -1) return null;
      const close = statement.indexOf(")", end + 1);
      if (close === -1) return null;
      return { spec: statement.slice(j + 1, end), end: close + 1 };
    }
    const close = statement.indexOf(")", j);
    return close === -1 ?
        null
      : { spec: statement.slice(j, close).trim(), end: close + 1 };
  }

  const quote = statement[i];
  if (quote === '"' || quote === "'") {
    const end = statement.indexOf(quote, i + 1);
    return end === -1 ? null : { spec: statement.slice(i + 1, end), end: end + 1 };
  }

  return null;
}

function isWhitespace(ch: string): boolean {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\f";
}

/** Index after the closing quote of the string starting at `quoteIndex`. */
function skipString(css: string, quoteIndex: number): number {
  const quote = css[quoteIndex];
  let i = quoteIndex + 1;
  while (i < css.length) {
    const ch = css[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === quote) return i + 1;
    i += 1;
  }
  return css.length;
}

/** Index after the end of the block comment starting at `commentIndex`. */
function skipComment(css: string, commentIndex: number): number {
  const end = css.indexOf("*/", commentIndex + 2);
  return end === -1 ? css.length : end + 2;
}

/** Next index of `AT_RULE` that is not inside a comment or string literal. */
function findAtRule(css: string, from: number): number {
  return findToken(css, from, AT_RULE);
}

/**
 * Next index of `token` that is not inside a comment or string literal. Shared
 * by the `@natcore-palettes` and `@import` scanners so both stay comment/string
 * aware.
 */
function findToken(css: string, from: number, token: string): number {
  let i = from;
  while (i < css.length) {
    const ch = css[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === "/" && css[i + 1] === "*") {
      i = skipComment(css, i);
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = skipString(css, i);
      continue;
    }
    if (ch === token[0] && css.startsWith(token, i)) return i;
    i += 1;
  }
  return -1;
}

/** Next `;` that is not inside a comment or string literal. */
function findSemicolon(css: string, from: number): number {
  let i = from;
  while (i < css.length) {
    const ch = css[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === "/" && css[i + 1] === "*") {
      i = skipComment(css, i);
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = skipString(css, i);
      continue;
    }
    if (ch === ";") return i;
    i += 1;
  }
  return -1;
}

/** Next `{` that is not inside a comment or string literal. */
function findOpenBrace(css: string, from: number): number {
  let i = from;
  while (i < css.length) {
    const ch = css[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === "/" && css[i + 1] === "*") {
      i = skipComment(css, i);
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = skipString(css, i);
      continue;
    }
    if (ch === "{") return i;
    i += 1;
  }
  return -1;
}

/**
 * Index of the `}` that balances the `{` at `braceStart`, ignoring braces that
 * appear inside comments or string literals. Returns -1 when unbalanced.
 */
function findMatchingBrace(css: string, braceStart: number): number {
  let depth = 0;
  let i = braceStart;
  while (i < css.length) {
    const ch = css[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === "/" && css[i + 1] === "*") {
      i = skipComment(css, i);
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = skipString(css, i);
      continue;
    }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
    i += 1;
  }
  return -1;
}

function parseDeclarations(body: string): { prop: string; value: string }[] {
  const declarations: { prop: string; value: string }[] = [];
  for (const raw of body.split(";")) {
    const segment = stripComments(raw).trim();
    if (!segment) continue;
    const colon = segment.indexOf(":");
    if (colon === -1) continue;
    const prop = segment.slice(0, colon).trim();
    const value = segment.slice(colon + 1).trim();
    if (prop && value) declarations.push({ prop, value });
  }
  return declarations;
}

function stripComments(input: string): string {
  return input.replace(/\/\*[\s\S]*?\*\//g, "");
}
