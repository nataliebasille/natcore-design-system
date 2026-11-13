import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "@nataliebasille/preview-jsx-runtime",
  },
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@css-engine/css": path.resolve(__dirname, "./src/css/index.ts"),
      "@css-engine/dsl": path.resolve(__dirname, "./src/dsl/index.ts"),
      "@css-engine/transformers": path.resolve(
        __dirname,
        "./src/transformers/index.ts",
      ),
    },
  },
});
