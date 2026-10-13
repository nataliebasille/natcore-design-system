import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Asserts the built `./postcss` and `./vite` entries expose the plugin as a
// bare function from both `require()` and `import` — the shape PostCSS/Vite
// loaders need when a plugin is referenced by string (e.g.
// `"@nataliebasille/natcore-design-system/postcss": {}` in a Next.js
// `postcss.config`). Run against `dist/*` after a build.

const distDir = path.join(import.meta.dirname, "../dist");
const require = createRequire(import.meta.url);

const failures: string[] = [];

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

async function assertEntry(
  entry: "postcss" | "vite",
  { requiresPostcssFlag }: { requiresPostcssFlag: boolean },
) {
  const cjsPath = path.join(distDir, `${entry}.cjs`);
  const esmPath = path.join(distDir, `${entry}.js`);

  // CJS: `require(...)` must return the plugin function directly.
  const cjs = require(cjsPath) as unknown;
  check(
    typeof cjs === "function",
    `require("./dist/${entry}.cjs") should be a function, got ${typeof cjs}`,
  );
  check(
    typeof (cjs as { default?: unknown }).default === "function",
    `require("./dist/${entry}.cjs").default should be a function (interop)`,
  );
  if (requiresPostcssFlag) {
    check(
      (cjs as { postcss?: unknown }).postcss === true,
      `require("./dist/${entry}.cjs").postcss should be true`,
    );
  }

  // ESM: default import must also be the plugin function.
  const esm = (await import(pathToFileURL(esmPath).href)) as {
    default?: unknown;
  };
  check(
    typeof esm.default === "function",
    `import("./dist/${entry}.js").default should be a function, got ${typeof esm.default}`,
  );
  if (requiresPostcssFlag) {
    check(
      (esm.default as { postcss?: unknown }).postcss === true,
      `import("./dist/${entry}.js").default.postcss should be true`,
    );
  }
}

await assertEntry("postcss", { requiresPostcssFlag: true });
await assertEntry("vite", { requiresPostcssFlag: false });

if (failures.length > 0) {
  console.error("Plugin export contract violations:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  "packages/core plugin exports (./postcss, ./vite) match the require/import contract.",
);
