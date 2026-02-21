import { defineConfig } from "tsup";

export default defineConfig(async () => {
  return {
    entry: {
      index: "src/index.ts",
      plugin: "src/tailwind/plugin.ts",
      utils: "src/shared/utils.ts",
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
  };
});
