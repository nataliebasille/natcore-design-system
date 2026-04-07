import fs from "node:fs/promises";
import path from "node:path";
import { compile } from "../src/compile/index.ts";

const outDir = path.join(import.meta.dirname, "../dist");
const srcDir = path.join(import.meta.dirname, "../src/tailwind");
const files = (await fs.readdir(srcDir, { recursive: true })).filter(
  (file: unknown): file is string => typeof file === "string",
);

console.log("🚀 Building core-v2 CSS...\n");
await compile(files, { dist: outDir, src: srcDir });
console.log("✅ core-v2 CSS build complete.\n");
