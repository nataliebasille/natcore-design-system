import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    // Barrel; re-export common icons here
    "src/index.ts",
    // Build each icon as its own module to allow `@nataliebasille/natcore-icons/<name>`
    "src/*.tsx",
  ],
  format: ["esm", "cjs"],
  dts: true, // emits .d.ts for each entry
  sourcemap: true,
  clean: true,
  outDir: "dist",
  // Ensure .mjs for ESM and .cjs for CJS
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".cjs",
  }),
  // Let you import with .ts in source; bundler handles it
  tsconfig: "tsconfig.build.json",
  treeshake: true,
  minify: true,
  splitting: false,
  external: ["react", "react-dom"],
});
