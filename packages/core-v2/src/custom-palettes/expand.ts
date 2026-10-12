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
    const start = css.indexOf(AT_RULE, index);
    if (start === -1) {
      result += css.slice(index);
      break;
    }

    // Copy everything up to the at-rule.
    result += css.slice(index, start);

    // Find the opening brace.
    const braceStart = css.indexOf("{", start + AT_RULE.length);
    if (braceStart === -1) {
      // Malformed; leave the rest untouched.
      result += css.slice(start);
      break;
    }

    // Match the balanced closing brace.
    let depth = 0;
    let braceEnd = -1;
    for (let i = braceStart; i < css.length; i += 1) {
      const ch = css[i];
      if (ch === "{") depth += 1;
      else if (ch === "}") {
        depth -= 1;
        if (depth === 0) {
          braceEnd = i;
          break;
        }
      }
    }

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

function parseDeclarations(
  body: string,
): { prop: string; value: string }[] {
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
