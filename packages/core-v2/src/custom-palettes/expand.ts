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
  /**
   * Called with each resolved file that is actually consumed (inlined), so the
   * caller can register it as a build dependency — consumed imports are removed
   * before Tailwind sees them and would otherwise not be watched.
   */
  onConsume?: (file: string, parent: string | undefined) => void;
}

/**
 * Inline plain CSS `@import`s that lead to `@natcore-palettes` declarations so
 * the expander can see palette blocks factored into shared files.
 *
 * natcore must run before `@tailwindcss/postcss`, which is what normally inlines
 * `@import`s — so without this pass a palette block behind an `@import` is never
 * expanded. An `@import` is consumed only when it resolves to a file whose
 * meaningful content is *exclusively* `@natcore-palettes` blocks (optionally via
 * nested imports to other such files). Every other `@import` — bare specifiers
 * (`tailwindcss`), non-palette files, *mixed* files that also contain ordinary
 * rules, qualified imports, and unresolvable paths — is left verbatim for
 * Tailwind. Leaving mixed files alone avoids transplanting their non-palette
 * rules (whose relative `url(…)`/`@import` references would otherwise resolve
 * from the wrong base directory) and preserves cascade order.
 *
 * Comment/string-aware and brace-depth-aware so a mention of `@import` or
 * `@natcore-palettes` inside `/* … *​/`, a string literal, or a nested rule block
 * never false-matches. Recurses into consumed files, isolating each branch's
 * consumption state so a palette reachable only through a non-pure parent is not
 * falsely de-duplicated, and guards against import cycles.
 *
 * Consumed palette blocks are hoisted to the end of the leading import prelude
 * (after any `@import`s that remain), so a later untouched `@import` is never
 * left sitting after non-import rules — which CSS would otherwise ignore.
 */
export function inlineNatcorePaletteImports(
  css: string,
  options: InlineImportsOptions,
): string {
  if (!css.includes(IMPORT_AT_RULE)) return css;

  const state: InlineState = {
    resolveImport: options.resolveImport,
    readFile: options.readFile,
    // Files whose palette blocks are committed to the kept output (file ->
    // importing parent). Used for cross-import de-duplication; `onConsume` runs
    // for these only after the whole traversal succeeds.
    consumed: new Map<string, string | undefined>(),
    // Absolute paths on the active recursion stack, for cycle detection.
    stack: new Set<string>(),
  };
  if (options.fromFile) state.stack.add(options.fromFile);

  const output = explore(css, options.fromFile, state);

  // Commit side effects only now that the final output is known: a palette file
  // consumed speculatively under a branch that turned out non-pure was rolled
  // back and never reaches here.
  if (options.onConsume) {
    for (const [file, parent] of state.consumed) options.onConsume(file, parent);
  }

  return output;
}

interface InlineState {
  resolveImport: ResolveImport;
  readFile: ReadFile;
  consumed: Map<string, string | undefined>;
  stack: Set<string>;
}

/**
 * Walk the top-level `@import`s in `css`, consuming pure palette files and
 * hoisting their blocks past the import prelude. Pure, side-effect-free with
 * respect to `onConsume`: consumption is recorded in `state.consumed` and only
 * committed by the public entry point once the whole traversal succeeds.
 */
function explore(
  css: string,
  fromFile: string | undefined,
  state: InlineState,
): string {
  if (!css.includes(IMPORT_AT_RULE)) return css;

  let output = "";
  // Collected palette blocks from consumed imports, deferred until after the
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

    const palettes = resolveStatement(statement, fromFile, state);
    if (palettes === null) {
      // Not a consumable palette import — keep it verbatim for Tailwind.
      output += statement;
      lastImportEnd = output.length;
    } else {
      // Pure palette import consumed — hoist its blocks past the prelude.
      if (firstConsumedAt === -1) firstConsumedAt = output.length;
      if (palettes) collected += (collected ? "\n" : "") + palettes;
    }
    index = statementEnd;
  }

  if (collected === "") return output;

  const at = Math.max(firstConsumedAt, lastImportEnd, 0);
  return `${output.slice(0, at)}\n${collected}\n${output.slice(at)}`;
}

/**
 * Split CSS into its `@natcore-palettes { … }` blocks and everything else,
 * comment/string-aware. Used to hoist palette declarations out of an imported
 * file without relocating the file's unrelated rules.
 */
function splitPaletteBlocks(css: string): { palettes: string; rest: string } {
  if (!css.includes(AT_RULE)) return { palettes: "", rest: css };

  let palettes = "";
  let rest = "";
  let index = 0;

  while (index < css.length) {
    const start = findAtRule(css, index);
    if (start === -1) {
      rest += css.slice(index);
      break;
    }

    rest += css.slice(index, start);

    const braceStart = findOpenBrace(css, start + AT_RULE.length);
    if (braceStart === -1) {
      rest += css.slice(start);
      break;
    }

    const braceEnd = findMatchingBrace(css, braceStart);
    if (braceEnd === -1) {
      rest += css.slice(start);
      break;
    }

    palettes += (palettes ? "\n" : "") + css.slice(start, braceEnd + 1);
    index = braceEnd + 1;
  }

  return { palettes, rest };
}

/**
 * Resolve a single `@import` statement. Returns the hoisted palette blocks when
 * the import resolves to a pure palette file (possibly `""` for a
 * de-duplicated/cyclic import), or `null` to leave the statement verbatim for
 * Tailwind (non-palette, mixed, qualified, or unresolvable imports).
 *
 * Branch state is isolated: the file's subtree is explored speculatively, and
 * any consumption it records is rolled back unless this file is confirmed pure,
 * so a palette reachable only through a non-pure parent is not falsely marked
 * consumed.
 */
function resolveStatement(
  statement: string,
  fromFile: string | undefined,
  state: InlineState,
): string | null {
  const parsed = parseImportTarget(statement);
  if (parsed === null) return null;

  // A qualified import (`@import "…" print`, `layer(…)`, `supports(…)`, or a
  // media query) only applies under its condition. Inlining its contents
  // unconditionally would change that, so leave it for Tailwind.
  if (hasImportConditions(statement, parsed.end)) return null;

  const resolved = state.resolveImport(parsed.spec, fromFile);
  if (resolved === null) return null;

  // Already committed elsewhere (duplicate) or currently on the recursion stack
  // (cycle) — consume it but contribute nothing to avoid duplicate palette
  // definitions and infinite recursion.
  if (state.consumed.has(resolved) || state.stack.has(resolved)) return "";

  const contents = state.readFile(resolved);
  if (contents === null) return null;

  state.stack.add(resolved);
  // Record what is already committed so this speculative branch can be rolled
  // back if the file turns out not to be a pure palette file.
  const snapshot = new Set(state.consumed.keys());
  const inlined = explore(contents, resolved, state);
  state.stack.delete(resolved);

  const { palettes, rest } = splitPaletteBlocks(inlined);

  // Only consume a *pure* palette file: one whose only meaningful content is
  // `@natcore-palettes` blocks. A mixed file (palette plus ordinary rules) is
  // left verbatim for Tailwind so its non-palette rules — and their relative
  // `url(…)`/`@import` references — are not transplanted to a different base
  // directory, and so cascade order is preserved.
  if (palettes === "" || !isBlank(rest)) {
    // Roll back any consumption recorded while exploring this non-pure branch.
    for (const file of state.consumed.keys()) {
      if (!snapshot.has(file)) state.consumed.delete(file);
    }
    return null;
  }

  // Consumed: record it (committed to `onConsume` by the entry point once the
  // whole traversal succeeds) so watch mode rebuilds when the file changes.
  state.consumed.set(resolved, fromFile);

  return palettes;
}

/** Whether `css` is only whitespace and comments (no meaningful rules). */
function isBlank(css: string): boolean {
  return css.replace(/\/\*[\s\S]*?\*\//g, "").trim() === "";
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
 * Next index of `token` at the top level (brace depth 0) that is not inside a
 * comment or string literal. Shared by the `@natcore-palettes` and `@import`
 * scanners so both stay comment/string aware and ignore tokens nested inside a
 * rule block (e.g. a declaration value like `--x: @import "…";`), which are not
 * real top-level at-rules. Callers always resume from a depth-0 boundary.
 */
function findToken(css: string, from: number, token: string): number {
  let i = from;
  let depth = 0;
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
    if (ch === "{") {
      depth += 1;
      i += 1;
      continue;
    }
    if (ch === "}") {
      if (depth > 0) depth -= 1;
      i += 1;
      continue;
    }
    if (
      depth === 0 &&
      ch === token[0] &&
      css.startsWith(token, i) &&
      !isIdentChar(css[i + token.length])
    ) {
      // Require an identifier boundary after the token so `@import` does not
      // match `@imported` and `@natcore-palettes` does not match a longer
      // at-keyword that merely starts with it.
      return i;
    }
    i += 1;
  }
  return -1;
}

/** Whether `ch` can continue a CSS identifier / at-keyword name. */
function isIdentChar(ch: string | undefined): boolean {
  if (ch === undefined) return false;
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    (ch >= "0" && ch <= "9") ||
    ch === "-" ||
    ch === "_"
  );
}

/**
 * Next statement-terminating `;` (parenthesis depth 0) that is not inside a
 * comment or string literal. Tracking parentheses keeps a `;` inside an
 * unquoted `url(data:…;base64,…)` from ending the import early.
 */
function findSemicolon(css: string, from: number): number {
  let i = from;
  let parens = 0;
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
    if (ch === "(") {
      parens += 1;
      i += 1;
      continue;
    }
    if (ch === ")") {
      if (parens > 0) parens -= 1;
      i += 1;
      continue;
    }
    if (ch === ";" && parens === 0) return i;
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
