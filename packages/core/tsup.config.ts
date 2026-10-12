import { defineConfig } from "tsup";

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
}));
