import { runTsup } from "./run-tsup";
import chokidar from "chokidar";
import path from "path";
import { compile } from "./compile";
import fs from "node:fs/promises";

const srcDir = path.join(import.meta.dirname, "../src");
const outDir = path.join(import.meta.dirname, "../dist");

// Start tsup in watch mode for TypeScript files
const tsupProcess = runTsup("watch");

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

async function initializeCssWatcher() {
  // Compile all CSS files initially
  console.log("📦 Compiling all CSS and CSS.ts files...\n");
  const files = await fs.readdir(srcDir, { recursive: true });
  await compile(files, { dist: outDir, src: srcDir });
  console.log("✅ Initial CSS compilation complete!\n");

  const watcher = chokidar.watch("./src", {
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
    console.log(`   Watched paths:`, watched);
    console.log(`   Total watched items:`, Object.keys(watched).length);
    console.log();
  });

  watcher.on("add", async (filePath) => {
    console.log(`➕ File added: ${filePath}`);
    await compileFile(filePath);
  });

  watcher.on("change", async (filePath) => {
    console.log(`🔄 File changed: ${filePath}`);
    await compileFile(filePath);
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
    process.exit(0);
  });
}

async function compileFile(filePath: string) {
  try {
    // If filePath is absolute, make it relative to srcDir
    // If it's relative and starts with 'src/', remove the 'src/' prefix
    let relativePath = filePath;
    if (path.isAbsolute(filePath)) {
      relativePath = path.relative(srcDir, filePath);
    } else if (
      filePath.startsWith("src" + path.sep) ||
      filePath.startsWith("src/")
    ) {
      relativePath = filePath.slice(4); // Remove 'src/' or 'src\\'
    }

    console.log(`🔨 Starting compilation of: ${relativePath}`);
    await compile([relativePath], { dist: outDir, src: srcDir });
    console.log(`✅ Compiled: ${relativePath}\n`);
  } catch (error) {
    console.error(`❌ Error compiling ${filePath}:`, error);
  }
}
