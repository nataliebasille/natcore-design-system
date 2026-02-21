import { defineConfig } from "tsup";

export default defineConfig(async () => {
  return {
    entry: {
      index: "index.ts",
      plugin: "tailwind/plugin.ts",
      utils: "shared/utils.ts",
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
