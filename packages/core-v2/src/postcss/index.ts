import { expandNatcorePalettesInCss } from "../custom-palettes/expand.ts";

// Minimal structural types so this plugin does not need `postcss` as a
// type/runtime dependency of the package it ships in. The host project
// provides the real PostCSS instance at build time.
interface MinimalRoot {
  toString(): string;
  removeAll(): void;
  append(nodes: unknown): void;
  source?: { input?: { file?: string } };
}
interface MinimalParse {
  (css: string, opts?: { from?: string }): { nodes: unknown };
}
interface MinimalHelpers {
  postcss: { parse: MinimalParse };
  result?: { opts?: { from?: string } };
}
interface MinimalPlugin {
  postcssPlugin: string;
  Once(root: MinimalRoot, helpers: MinimalHelpers): void;
}
interface MinimalPluginCreator {
  (): MinimalPlugin;
  postcss: true;
}

/**
 * PostCSS plugin that expands the `@natcore-palettes { … }` at-rule into the
 * `@theme` blocks for the declared custom palettes, so consumer-defined palettes
 * behave like the built-ins (full anchor model, `palette-{name}`,
 * `bg-{name}-{shade}`, and every component that uses `dsl.current()`).
 *
 * ```css
 * @import "tailwindcss";
 * @import "@nataliebasille/natcore-design-system";
 * @natcore-palettes { brand: #f04e23; }
 * ```
 *
 * Must run BEFORE `@tailwindcss/postcss`. The whole document is re-parsed so the
 * generated `@theme` is registered as a theme by Tailwind (a detached `parse()` +
 * `replaceWith()` leaves the color namespace unregistered, so `bg-{name}-{shade}`
 * utilities are never generated).
 */
const plugin: MinimalPluginCreator = () => {
  return {
    postcssPlugin: "@nataliebasille/natcore-design-system/custom-palettes",
    Once(root, { postcss, result }) {
      const css = root.toString();
      if (!css.includes("@natcore-palettes")) return;

      const expanded = expandNatcorePalettesInCss(css);
      if (expanded === css) return;

      const from = result?.opts?.from ?? root.source?.input?.file;
      const parsed = postcss.parse(expanded, from ? { from } : undefined);
      root.removeAll();
      root.append(parsed.nodes);
    },
  };
};

plugin.postcss = true;

export default plugin;
