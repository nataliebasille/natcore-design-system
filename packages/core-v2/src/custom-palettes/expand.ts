import { compilePaletteDeclarations } from "./generate.ts";

const AT_RULE = "@natcore-palettes";

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
  let i = from;
  while (i < css.length) {
    const ch = css[i];
    if (ch === "/" && css[i + 1] === "*") {
      i = skipComment(css, i);
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = skipString(css, i);
      continue;
    }
    if (ch === "@" && css.startsWith(AT_RULE, i)) return i;
    i += 1;
  }
  return -1;
}

/** Next `{` that is not inside a comment or string literal. */
function findOpenBrace(css: string, from: number): number {
  let i = from;
  while (i < css.length) {
    const ch = css[i];
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
