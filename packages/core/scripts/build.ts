import fs from "node:fs/promises";
import path from "node:path";
import { compile } from "../../core-v2/src/compile/index.ts";
import { runTsup } from "./run-tsup.ts";

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
const srcDir = path.join(import.meta.dirname, "../../core-v2/src/tailwind");
const files = await fs.readdir(srcDir, { recursive: true });

await compile(files, { dist: outDir, src: srcDir });
