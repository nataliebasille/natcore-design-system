import { defineConfig } from "tsup";

export default defineConfig(() => ({
  entry: {
    index: "src/index.ts",
    utils: "src/utils.ts",
  },
  format: ["esm", "cjs"],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  external: ["tailwindcss"],
  noExternal: ["classnames"],
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".js" : ".cjs",
  }),
}));
