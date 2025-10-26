import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    plugin: "src/plugin.ts",
    utils: "src/utils.ts",
  },
  format: ["esm", "cjs"],
  dts: true,           // emits .d.ts for each entry
  sourcemap: true,
  clean: true,
  outDir: "dist",
  // Ensure .mjs for ESM and .cjs for CJS
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".cjs",
  }),
  // Let you import with .ts in source; bundler handles it
  tsconfig: "tsconfig.json",
  treeshake: true,
  minify: true,
  splitting: false,
  external: ["tailwindcss", "tailwindcss/plugin"],
});
