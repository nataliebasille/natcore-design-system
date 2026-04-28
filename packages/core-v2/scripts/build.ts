import { runTsup } from "./run-tsup.ts";
import path from "path";
import { compile } from "../src/compile/index.ts";
import { resolveCompileFiles } from "./resolve-compile-files.ts";

console.log("🚀 Starting TypeScript build...\n");

// Wait for tsup to finish before copying CSS files
await new Promise<void>((resolve, reject) => {
  const tsupProcess = runTsup();

  tsupProcess.on("exit", (code) => {
    if (code === 0 || code === null) {
      resolve();
    } else {
      reject(new Error(`tsup exited with code ${code}`));
    }
  });

  tsupProcess.on("error", (error) => {
    reject(error);
  });
});

const outDir = path.join(import.meta.dirname, "../dist");

const srcDir = path.join(import.meta.dirname, "../src/tailwind");
const files = await resolveCompileFiles(process.argv.slice(2), srcDir);

await compile(files, { dist: outDir, src: srcDir });
