import path from "node:path";
import { compile } from "../src/compile/index.ts";
import { resolveCompileFiles } from "./resolve-compile-files.ts";

const outDir = path.join(import.meta.dirname, "../dist");
const srcDir = path.join(import.meta.dirname, "../src/tailwind");
const files = await resolveCompileFiles(process.argv.slice(2), srcDir);

console.log("🚀 Building core-v2 CSS...\n");
await compile(files, { dist: outDir, src: srcDir });
console.log("✅ core-v2 CSS build complete.\n");
