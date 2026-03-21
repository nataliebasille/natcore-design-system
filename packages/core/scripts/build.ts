import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ChildProcess } from "node:child_process";
import { compile } from "../../core-v2/src/compile/index.ts";
import { runTsup } from "./run-tsup.ts";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

await new Promise<void>((resolve, reject) => {
  const tsupProcess: ChildProcess = runTsup();

  tsupProcess.on("exit", (code: number | null) => {
    if (code === 0 || code === null) {
      resolve();
    } else {
      reject(new Error(`tsup exited with code ${code}`));
    }
  });

  tsupProcess.on("error", (error: Error) => {
    reject(error);
  });
});

const outDir = path.join(currentDir, "../dist");
const srcDir = path.join(currentDir, "../../core-v2/src/tailwind");
const files = await fs.readdir(srcDir, { recursive: true });

await compile(files, { dist: outDir, src: srcDir });
