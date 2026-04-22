import { runTsup } from "./run-tsup.ts";
import chokidar from "chokidar";
import path from "path";
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs/promises";

const srcDir = path.join(import.meta.dirname, "../src/tailwind");
const compileDir = path.join(import.meta.dirname, "../src/compile");
const outDir = path.join(import.meta.dirname, "../dist");
const corePackageDir = path.join(import.meta.dirname, "../../core");
const coreOutDir = path.join(corePackageDir, "dist");
const outDirs = [outDir, coreOutDir];
const watchPaths = [srcDir, compileDir];

function runCoreTsupWatch() {
  const tsupProcess = spawn("pnpm", ["exec", "tsup", "--watch"], {
    cwd: corePackageDir,
    stdio: "pipe",
    shell: true,
  });

  tsupProcess.stdout?.on("data", (data: Buffer) => {
    process.stdout.write(`[core] ${data.toString()}`);
  });

  tsupProcess.stderr?.on("data", (data: Buffer) => {
    process.stderr.write(`[core] ${data.toString()}`);
  });

  tsupProcess.on("error", (error) => {
    console.error("❌ Error starting core tsup watch:", error);
  });

  tsupProcess.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ core tsup watch exited with code ${code}`);
    }
  });

  return tsupProcess;
}

// Start tsup in watch mode for TypeScript files
const tsupProcess = runTsup("watch");
const coreTsupProcess: ChildProcess = runCoreTsupWatch();

let tsupInitialBuildComplete = false;

tsupProcess.stdout?.on("data", (data: Buffer) => {
  const output = data.toString();
  process.stdout.write(output);

  // Detect when tsup finishes its initial build
  if (
    !tsupInitialBuildComplete &&
    (output.includes("Built in") || output.includes("Build success"))
  ) {
    console.log(
      "🎯 Detected tsup build completion, initializing CSS watcher...\n",
    );
    tsupInitialBuildComplete = true;
    initializeCssWatcher();
  }
});

tsupProcess.on("error", (error) => {
  console.error("❌ Error starting tsup in watch mode:", error);
});

tsupProcess.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`❌ tsup watch exited with code ${code}`);
    process.exit(code);
  }
});

console.log("🚀 tsup is running in watch mode...\n");
console.log("🚀 core tsup is running in watch mode...\n");

async function runCompile(files: string[]) {
  return runCompileToDist(outDir, files);
}

async function runCompileToDist(dist: string, files: string[]) {
  // Spawn a fresh subprocess so the compile pipeline modules are never served
  // from the parent process's module cache (which would happen with dynamic
  // import() after a compile-pipeline file changes).
  return new Promise<void>((resolve, reject) => {
    const runner = path.join(import.meta.dirname, "run-compile.ts");
    const child = spawn(
      process.execPath,
      [
        "--conditions=source",
        "--import",
        "tsx",
        runner,
        "--dist",
        dist,
        "--src",
        srcDir,
        "--files",
        files.join(","),
      ],
      { stdio: "inherit" },
    );

    child.on("exit", (code) => {
      if (code === 0 || code === null) {
        resolve();
      } else {
        reject(new Error(`compile subprocess exited with code ${code}`));
      }
    });

    child.on("error", reject);
  });
}

async function initializeCssWatcher() {
  // Compile all CSS files initially from tailwind directory only
  console.log(
    "📦 Compiling all CSS and CSS.ts files from tailwind/ to core-v2 and core dist folders...\n",
  );
  const files = await listTailwindFiles();
  await compileToAllOutDirs(files);
  console.log("✅ Initial CSS compilation complete!\n");

  const watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
    persistent: true,
    usePolling: true, // Use polling on Windows for better reliability
    interval: 100,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100,
    },
  });

  watcher.on("ready", () => {
    console.log("👀 Watcher is ready!");
    const watched = watcher.getWatched();
    const totalWatchedFiles = Object.values(watched).reduce(
      (count, files) => count + files.length,
      0,
    );
    console.log(`   Watching: ${watchPaths.join(", ")}`);
    console.log(`   Watched directories: ${Object.keys(watched).length}`);
    console.log(`   Watched files: ${totalWatchedFiles}`);
    console.log();
  });

  watcher.on("add", async (filePath) => {
    console.log(`➕ File added: ${filePath}`);
    await handleFileEvent(filePath);
  });

  watcher.on("change", async (filePath) => {
    console.log(`🔄 File changed: ${filePath}`);
    await handleFileEvent(filePath);
  });

  watcher.on("all", (event, filePath) => {
    console.log(`🔔 Event: ${event} on ${filePath}`);
  });

  watcher.on("error", (error) => {
    console.error("❌ Watcher error:", error);
  });

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Stopping watchers...");
    watcher.close();
    tsupProcess.kill();
    coreTsupProcess.kill();
    process.exit(0);
  });
}

async function compileToAllOutDirs(files: string[]) {
  for (const dist of outDirs) {
    await runCompileToDist(dist, files);
  }
}

async function listTailwindFiles() {
  return (await fs.readdir(srcDir, { recursive: true })).filter(
    (file) => typeof file === "string",
  );
}

async function handleFileEvent(filePath: string) {
  if (path.resolve(filePath).startsWith(path.resolve(compileDir))) {
    console.log(
      "♻️ Compile pipeline changed, rebuilding all tailwind CSS...\n",
    );
    await compileToAllOutDirs(await listTailwindFiles());
    console.log("✅ Rebuilt all tailwind CSS after compiler change.\n");
    return;
  }

  await compileFile(filePath);
}

async function compileFile(filePath: string) {
  try {
    // If filePath is absolute, make it relative to srcDir
    let relativePath = filePath;
    if (path.isAbsolute(filePath)) {
      relativePath = path.relative(srcDir, filePath);
    }

    console.log(`🔨 Starting compilation of: ${relativePath}`);
    await compileToAllOutDirs([relativePath]);
    console.log(`✅ Compiled: ${relativePath}\n`);
  } catch (error) {
    console.error(`❌ Error compiling ${filePath}:`, error);
  }
}
