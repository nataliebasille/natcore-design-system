/**
 * Thin subprocess runner for the compile step.
 * Spawned by watch.ts so each compile gets a fresh module context,
 * avoiding stale cached imports of the compile pipeline itself.
 *
 * Usage: tsx scripts/run-compile.ts --dist <dir> --src <dir> --files <comma-separated>
 */
import path from "path";
import { compile } from "../src/compile/index.ts";

const args = process.argv.slice(2);

function getArg(name: string): string {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) {
    throw new Error(`Missing argument: ${name}`);
  }
  return args[idx + 1]!;
}

const dist = getArg("--dist");
const src = getArg("--src");
const filesArg = getArg("--files");
const files = filesArg.split(",").filter(Boolean);

await compile(files, { dist, src });
