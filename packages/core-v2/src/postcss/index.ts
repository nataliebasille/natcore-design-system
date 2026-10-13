import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import {
  expandNatcorePalettesInCss,
  inlineNatcorePaletteImports,
  type ResolveImport,
  type ReadFile,
} from "../custom-palettes/expand.ts";

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
interface MinimalResult {
  opts?: { from?: string };
  messages?: unknown[];
}
interface MinimalHelpers {
  postcss: { parse: MinimalParse };
  result?: MinimalResult;
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
      // Nothing to do when the document has neither palettes nor imports that
      // might bring palette declarations in.
      if (!css.includes("@natcore-palettes") && !css.includes("@import")) {
        return;
      }

      const rawFrom = result?.opts?.from ?? root.source?.input?.file;
      // `result.opts.from` may be a caller-provided relative path; resolve it to
      // an absolute path so `createRequire` (used for node_modules resolution)
      // does not throw `ERR_INVALID_ARG_VALUE` and silently skip package-subpath
      // palette imports.
      const from = rawFrom ? path.resolve(rawFrom) : undefined;

      // Inline `@import`ed palette files first; Tailwind (which normally inlines
      // imports) runs after us, so a palette block behind a plain `@import`
      // would otherwise be invisible to the expander.
      const inlined = inlineNatcorePaletteImports(css, {
        fromFile: from,
        resolveImport,
        readFile,
        onConsume: (file, parent) => {
          // Consumed palette files are removed before Tailwind sees them, so
          // register them as PostCSS dependencies to keep watch mode rebuilding
          // when they change.
          result?.messages?.push({
            type: "dependency",
            plugin: "@nataliebasille/natcore-design-system/custom-palettes",
            file,
            parent: parent ?? from,
          });
        },
      });
      if (!inlined.includes("@natcore-palettes")) return;

      const expanded = expandNatcorePalettesInCss(inlined);
      if (expanded === css) return;

      const parsed = postcss.parse(expanded, from ? { from } : undefined);
      root.removeAll();
      root.append(parsed.nodes);
    },
  };
};

plugin.postcss = true;

export default plugin;

/**
 * Resolve an `@import` specifier to an absolute file path, or `null` to leave it
 * for Tailwind. Relative/absolute paths resolve against the importing file;
 * package specifiers with a subpath resolve through node_modules. Bare entry
 * specifiers (`tailwindcss`, `@nataliebasille/natcore-design-system`) return
 * `null`.
 */
const resolveImport: ResolveImport = (spec, fromFile) => {
  const clean = spec.replace(/[?#].*$/, "").trim();
  if (!clean) return null;

  if (clean.startsWith("./") || clean.startsWith("../") || path.isAbsolute(clean)) {
    const base = fromFile ? path.dirname(fromFile) : process.cwd();
    const resolved = path.resolve(base, clean);
    return fs.existsSync(resolved) ? resolved : null;
  }

  // Bare specifier: only resolve when it points at a subpath inside a package.
  if (!hasSubpath(clean)) return null;
  try {
    const req = createRequire(fromFile ?? path.join(process.cwd(), "_"));
    return req.resolve(clean);
  } catch {
    return null;
  }
};

const readFile: ReadFile = (absPath) => {
  try {
    return fs.readFileSync(absPath, "utf8");
  } catch {
    return null;
  }
};

/** Whether a bare specifier addresses a subpath (not just a package entry). */
function hasSubpath(spec: string): boolean {
  if (spec.startsWith("@")) return spec.split("/").length > 2;
  return spec.includes("/");
}
