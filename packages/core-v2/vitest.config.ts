import { configDefaults, defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // *.docs.tsx files are written for the preview JSX runtime (see tsconfig.json).
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "@nataliebasille/preview-jsx-runtime",
  },
  test: {
    testTimeout: 100000,
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    // *.e2e.spec.ts files are Playwright specs; run them with `pnpm test:e2e`.
    exclude: [...configDefaults.exclude, "**/*.e2e.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/scripts/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
