import fs from "node:fs/promises";
import path from "node:path";

type PackageJson = {
  main?: string;
  module?: string;
  exports?: Record<string, Record<string, string> | string>;
};

function expectEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) {
    throw new Error(
      `${label} expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`,
    );
  }
}

function expectMissing(actual: unknown, label: string) {
  if (actual !== undefined) {
    throw new Error(
      `${label} should be omitted but received ${JSON.stringify(actual)}`,
    );
  }
}

const packageJsonPath = path.join(import.meta.dirname, "../package.json");
const packageJson = JSON.parse(
  await fs.readFile(packageJsonPath, "utf8"),
) as PackageJson;

const rootExport =
  packageJson.exports && typeof packageJson.exports["."] === "object" ?
    packageJson.exports["."]
  : undefined;
const cssExport =
  packageJson.exports && typeof packageJson.exports["./css"] === "object" ?
    packageJson.exports["./css"]
  : undefined;

if (!rootExport) {
  throw new Error('Missing exports["."] in packages/core-v2/package.json');
}

expectEqual(packageJson.main, "./dist/natcore.css", "main");
expectEqual(packageJson.module, "./dist/natcore.css", "module");
expectEqual(rootExport.types, "./dist/index.d.ts", 'exports["."].types');
expectEqual(rootExport.style, "./dist/natcore.css", 'exports["."].style');
expectEqual(rootExport.default, "./dist/natcore.css", 'exports["."].default');
expectMissing(rootExport.import, 'exports["."].import');
expectMissing(rootExport.require, 'exports["."].require');

if (!cssExport) {
  throw new Error('Missing exports["./css"] in packages/core-v2/package.json');
}

expectEqual(cssExport.style, "./dist/natcore.css", 'exports["./css"].style');
expectEqual(
  cssExport.default,
  "./dist/natcore.css",
  'exports["./css"].default',
);

console.log("packages/core-v2/package.json matches the 2.x release contract.");
