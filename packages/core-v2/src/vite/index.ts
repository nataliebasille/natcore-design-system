import { expandNatcorePalettesInCss } from "../custom-palettes/expand.ts";

type ViteTransformResult = { code: string; map: null } | undefined;

interface MinimalVitePlugin {
  name: string;
  enforce: "pre";
  transform(code: string, id: string): ViteTransformResult;
}

/**
 * Vite plugin that expands the `@natcore-palettes { … }` at-rule into real
 * `@theme` blocks before `@tailwindcss/vite` runs.
 *
 * Add it BEFORE the Tailwind plugin in `vite.config`:
 *
 * ```ts
 * import natcorePalettes from "@nataliebasille/natcore-design-system/vite";
 * import tailwindcss from "@tailwindcss/vite";
 *
 * export default defineConfig({
 *   plugins: [natcorePalettes(), tailwindcss()],
 * });
 * ```
 */
export default function natcorePalettes(): MinimalVitePlugin {
  return {
    name: "@nataliebasille/natcore-design-system:custom-palettes",
    enforce: "pre",
    transform(code, id) {
      const [file] = id.split("?", 1);
      if (!file || !file.endsWith(".css")) return undefined;
      if (!code.includes("@natcore-palettes")) return undefined;

      return { code: expandNatcorePalettesInCss(code), map: null };
    },
  };
}
