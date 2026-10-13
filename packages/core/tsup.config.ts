import fs from "node:fs/promises";
import path from "node:path";
import { defineConfig } from "tsup";

// Entries that are consumed as string-referenced plugins (e.g.
// `"@nataliebasille/natcore-design-system/postcss"` in a Next.js
// `postcss.config`). PostCSS/Vite loaders `require()` the string and expect the
// plugin *function* directly. tsup's default ESM→CJS interop emits
// `module.exports = { __esModule: true, default: fn }`, which those loaders
// reject. tsup's built-in `cjsInterop` does not fire for these chunks (the
// esbuild metafile reports no exports for CJS output), so we patch the emitted
// CJS files here instead.
const CJS_DEFAULT_INTEROP_ENTRIES = ["postcss", "vite"];

const CJS_DEFAULT_INTEROP_FOOTER = `
// --- cjs default interop (natcore) ---
// Make \`require()\` return the default export directly so this entry works as a
// string-referenced PostCSS/Vite plugin. The default export keeps any own
// properties (e.g. \`plugin.postcss === true\`), and \`.default\` is re-attached
// so \`require(...).default\` and ESM default import both keep working.
if (module.exports && module.exports.default) {
  var _natcoreDefault = module.exports.default;
  module.exports = _natcoreDefault;
  module.exports.default = _natcoreDefault;
}
`;

export default defineConfig(() => ({
  entry: {
    index: "src/index.ts",
    utils: "src/utils.ts",
    postcss: "src/postcss.ts",
    vite: "src/vite.ts",
  },
  format: ["esm", "cjs"],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  external: ["tailwindcss", "postcss", "vite"],
  noExternal: ["classnames", "@nataliebasille/css-engine"],
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".js" : ".cjs",
  }),
  async onSuccess() {
    for (const entry of CJS_DEFAULT_INTEROP_ENTRIES) {
      const file = path.join("dist", `${entry}.cjs`);
      const contents = await fs.readFile(file, "utf8");
      if (contents.includes("cjs default interop (natcore)")) continue;
      await fs.writeFile(file, contents + CJS_DEFAULT_INTEROP_FOOTER, "utf8");
    }
  },
}));
