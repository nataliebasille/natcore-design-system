import { runTsup } from "./run-tsup";
import path from "path";
import fs from "node:fs/promises";
import { compile } from "./compile";

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

// Get all files recursively from src directory
const srcDir = path.join(import.meta.dirname, "../src");
const files = await fs.readdir(srcDir, { recursive: true });
await compile(files, { dist: outDir, src: srcDir });
