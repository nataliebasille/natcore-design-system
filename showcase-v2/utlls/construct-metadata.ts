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

export type ThemeMeta = {
  kind: "theme";
  variables: Array<{ name: string; default: string }>;
};

export type CustomVariantMeta = {
  kind: "custom-variant";
  name: string;
  /** The selector or condition string extracted from the at-rule prelude, e.g. "&:is(:has(input:checked))". */
  condition?: string;
};

export type ConstructMeta = ComponentMeta | UtilityMeta;
export type AnyConstructMeta = ConstructMeta | ThemeMeta | CustomVariantMeta;

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
 * Like {@link parseConstructs} but also returns {@link ThemeMeta} (CSS variable
 * blocks) and {@link CustomVariantMeta} (custom Tailwind variants registered via
 * `dsl.atRule("custom-variant", ...)`).
 */
export function parseAllConstructs(constructs: unknown[]): AnyConstructMeta[] {
  const results: AnyConstructMeta[] = [];

  for (const raw of constructs) {
    const c = raw as Record<string, unknown>;
    if (!c || typeof c !== "object") continue;

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
    } else if (c.$construct === "theme") {
      const properties = (c.properties as Record<string, unknown>) ?? {};
      const variables = Object.entries(properties).map(([name, value]) => ({
        name,
        default: cssValueToString(value),
      }));
      results.push({ kind: "theme", variables });
    } else if (
      c.$ast === "at-rule" &&
      c.name === "custom-variant" &&
      typeof c.prelude === "string"
    ) {
      // Prelude format: "toggle-on (&:is(selector))" or "toggle-on (selector)"
      const spaceIdx = c.prelude.indexOf(" ");
      const name = (
        spaceIdx === -1 ?
          c.prelude
        : c.prelude.slice(0, spaceIdx)).trim();
      // Strip the outer parentheses from the condition if present
      const rawCondition =
        spaceIdx === -1 ? undefined : c.prelude.slice(spaceIdx + 1).trim();
      const condition =
        rawCondition?.startsWith("(") && rawCondition.endsWith(")") ?
          rawCondition.slice(1, -1).trim()
        : rawCondition;
      if (name) results.push({ kind: "custom-variant", name, condition });
    }
  }

  return results;
}

/**
 * Best-effort stringification of css-engine DSL value nodes into a
 * human-readable CSS string, suitable for displaying default values in docs.
 */
export function cssValueToString(value: unknown): string {
  if (typeof value !== "object" || value === null) return String(value);
  const obj = value as Record<string, unknown>;

  // Primitive value (e.g. dsl.primitive.length.rem(1.75) → { $primitive, value: "1.75rem" })
  if (obj.$primitive !== undefined && obj.value !== undefined) {
    return String(obj.value);
  }

  // CSS variable reference (e.g. dsl.cssvar("--toggle-h"))
  if (obj.$ast === "css-var" && typeof obj.name === "string") {
    return `var(${obj.name})`;
  }

  // calc() function
  if (obj.$function === "calc") {
    const strings = (obj.strings as string[]) ?? [];
    const vals = (obj.values as unknown[]) ?? [];
    let result = "calc(";
    for (let i = 0; i < strings.length; i++) {
      result += strings[i];
      if (i < vals.length) result += cssValueToString(vals[i]);
    }
    return result + ")";
  }

  // Fall back to toString only if it gives something meaningful
  const str = String(value);
  return str !== "[object Object]" ? str : "";
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
