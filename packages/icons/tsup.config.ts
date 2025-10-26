import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    // Barrel; re-export common icons here
    "src/index.ts",
    // Build each icon as its own module to allow `@natcore/icons/<name>`
    "src/*.tsx"
  ],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Don’t bundle React; consumers provide it.
  external: ["react"],
  // Emit .mjs/.cjs so subpath exports map cleanly
  // (tsup sets extensions automatically for esm/cjs)
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".mjs",
    };
  },
});
