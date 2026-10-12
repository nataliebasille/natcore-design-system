import { SHADES, theme, compile } from "@nataliebasille/css-engine";
import {
  paletteRootEntries,
  paletteInlineEntries,
} from "../shared/palette-theme.ts";
import { themeConstructToDsl } from "../compile/ts-to-css/theme-construct-to-dsl.ts";
import { dslToCss } from "../compile/ts-to-css/dsl-to-css.ts";

const SHADE_SET = new Set<number>(SHADES as readonly number[]);

export type PaletteSeed = {
  /** `--theme-{name}` base value (500). */
  base?: string;
  /** `--theme-{name}-{shade}` explicit anchors / nudges / pins. */
  shades: Map<number, string>;
};

export type PaletteConfig = Map<string, PaletteSeed>;

/**
 * Parse flat `{name}` / `{name}-{shade}` -> value declarations into a grouped
 * palette config. Declaration order is irrelevant.
 *
 * @throws when a key has an unknown trailing shade or an empty name.
 */
export function parsePaletteDeclarations(
  declarations: Iterable<{ prop: string; value: string }>,
): PaletteConfig {
  const config: PaletteConfig = new Map();

  const ensure = (name: string): PaletteSeed => {
    let seed = config.get(name);
    if (!seed) {
      seed = { shades: new Map() };
      config.set(name, seed);
    }
    return seed;
  };

  for (const { prop, value } of declarations) {
    const key = prop.trim();
    const hex = value.trim();
    if (!key) continue;

    const dash = key.lastIndexOf("-");
    if (dash > 0) {
      const trailing = key.slice(dash + 1);
      const maybeShade = Number(trailing);
      if (!Number.isNaN(maybeShade) && SHADE_SET.has(maybeShade)) {
        const name = key.slice(0, dash);
        if (!name) {
          throw new Error(
            `@natcore-palettes: invalid palette key "${key}" (empty name).`,
          );
        }
        ensure(name).shades.set(maybeShade, hex);
        continue;
      }
      // A trailing number that is not a known shade is an error.
      if (/^\d+$/.test(trailing)) {
        throw new Error(
          `@natcore-palettes: invalid shade "${trailing}" in "${key}". ` +
            `Valid shades: ${SHADES.join(", ")}.`,
        );
      }
    }

    ensure(key).base = hex;
  }

  return config;
}

/**
 * Build the `@theme` constructs (seed defaults + root derivation chain +
 * inline tone keys) for a set of custom palettes. Output is structurally
 * identical to the built-in `color.css.ts` output, so Tailwind tree-shakes
 * unused shades/palettes exactly the same way.
 */
export function buildPaletteThemeConstructs(config: PaletteConfig) {
  const seedEntries: [string, string][] = [];
  const rootEntries: [string, unknown][] = [];
  const inlineEntries: [string, unknown][] = [];

  for (const [name, seed] of config) {
    if (seed.base !== undefined) {
      seedEntries.push([`--theme-${name}`, seed.base]);
    }
    for (const [shade, hex] of seed.shades) {
      seedEntries.push([`--theme-${name}-${shade}`, hex]);
    }

    rootEntries.push(...(paletteRootEntries(name) as [string, unknown][]));
    inlineEntries.push(...(paletteInlineEntries(name) as [string, unknown][]));
  }

  return [
    theme(
      "root",
      Object.fromEntries([...seedEntries, ...rootEntries]) as Record<
        string,
        never
      >,
    ),
    theme(
      "inline",
      Object.fromEntries(inlineEntries) as Record<string, never>,
    ),
  ];
}

/**
 * Compile a parsed palette config to CSS text (one or more `@theme` blocks),
 * reusing the same ts-to-css pipeline the built-in palettes use.
 */
export function compilePaletteConfig(config: PaletteConfig): string {
  if (config.size === 0) return "";

  const constructs = buildPaletteThemeConstructs(config);
  const cssAst = constructs.flatMap((construct) =>
    dslToCss([themeConstructToDsl(construct)]),
  );
  return compile(cssAst);
}

/**
 * Convenience: parse raw declarations and compile to CSS in one step. Emits the
 * declared custom palettes as their own `@theme` blocks (appended alongside the
 * built-in color theme), reusing the exact same generation the built-ins use so
 * `palette-{name}`, `bg-{name}-{shade}`, the full anchor model, and components
 * all work identically.
 */
export function compilePaletteDeclarations(
  declarations: Iterable<{ prop: string; value: string }>,
): string {
  return compilePaletteConfig(parsePaletteDeclarations(declarations));
}
