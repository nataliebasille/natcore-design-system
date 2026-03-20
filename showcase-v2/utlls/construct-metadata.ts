/**
 * Parses the default export of a `.css.ts` file (an array of css-engine
 * constructs) into structured metadata that can be rendered as a
 * UtilityReference.
 */

// Duck-typed shapes — matches ComponentConstruct | UtilityConstruct | ThemeConstruct
// from @nataliebasille/natcore-css-engine without adding it as a direct dep.
type RawConstruct = Record<string, unknown> & { $construct: string };

export type ComponentMeta = {
  kind: "component";
  name: string;
  variants: string[];
  defaultVariant?: string;
};

export type UtilityMeta = {
  kind: "utility";
  name: string;
  /** Modifier values inferred from the utility's theme (e.g. ["sm","md","lg"]). */
  modifiers: string[];
  defaultModifier?: string;
};

export type ConstructMeta = ComponentMeta | UtilityMeta;

/**
 * Converts the flat array exported by a `.css.ts` component file into a list
 * of {@link ConstructMeta} entries.  `theme` constructs (global CSS-var blocks)
 * are intentionally skipped as they have no direct class-name representation.
 */
export function parseConstructs(constructs: unknown[]): ConstructMeta[] {
  const results: ConstructMeta[] = [];

  for (const raw of constructs) {
    const c = raw as RawConstruct;
    if (!c || typeof c.$construct !== "string") continue;

    if (c.$construct === "component") {
      const variants = Object.keys((c.variants as object) ?? {}).filter(
        (k) => k !== "default",
      );
      results.push({
        kind: "component",
        name: c.name as string,
        variants,
        defaultVariant: c.defaultVariant as string | undefined,
      });
    } else if (c.$construct === "utility") {
      const themeProps = (
        c.theme as { properties: Record<string, unknown> } | undefined
      )?.properties;
      const modifiers = themeProps ? inferModifiers(themeProps) : [];
      results.push({
        kind: "utility",
        name: c.name as string,
        modifiers,
        defaultModifier: modifiers.includes("md") ? "md" : modifiers[0],
      });
    }
    // ThemeConstruct ($construct === "theme") — skip
  }

  return results;
}

/**
 * Infers modifier values from a theme's CSS-variable keys.
 *
 * For example, given keys:
 *   `--btn-px-sm`, `--btn-py-sm`, `--btn-px-md`, `--btn-py-md`, …
 * the function detects that "sm", "md", "lg" each appear as the last segment
 * of *multiple* property names, and returns them as modifiers.
 */
function inferModifiers(properties: Record<string, unknown>): string[] {
  const suffixCounts = new Map<string, number>();

  for (const key of Object.keys(properties)) {
    const lastDash = key.lastIndexOf("-");
    if (lastDash <= 2) continue; // must have a meaningful prefix, e.g. "--x-"
    const suffix = key.slice(lastDash + 1);
    // Accept only short lower-kebab identifiers, not numeric shades like "500"
    if (/^[a-z][a-z0-9]*$/.test(suffix) && !/^\d+$/.test(suffix)) {
      suffixCounts.set(suffix, (suffixCounts.get(suffix) ?? 0) + 1);
    }
  }

  // Only treat a suffix as a modifier when it appears for ≥ 2 properties
  // (if it was a one-off it's likely just a coincidence in the name)
  return [...suffixCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([suffix]) => suffix);
}
