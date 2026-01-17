import { defineConfig } from "tsup";
import fs from "fs/promises";
import path from "path";
import { globby } from "globby";
import { build } from "esbuild";
import { transformTailwindV4 } from "./src/transformers/tailwindv4";

export default defineConfig(async () => {
  return {
    entry: {
      index: "src/index.ts",
      plugin: "src/plugin.ts",
      utils: "src/utils.ts",
    },
    format: ["esm", "cjs"],
    dts: {
      resolve: true,
    },
    clean: true,
    sourcemap: true,
    minify: false,
    splitting: false,
    external: ["tailwindcss"],
    noExternal: ["classnames"],
    async onSuccess() {
      console.log("✅ TypeScript build complete");
      console.log("\n🚀 Compiling component TypeScript to CSS...\n");

      try {
        await copyNatcoreCSS();
        await compileComponents();
        await copyUtilities();
        await copyThemes();
        console.log("\n✨ Build complete!");
      } catch (error) {
        console.error("❌ Component CSS compilation failed:", error);
        throw error;
      }
    },
  };
});

async function copyNatcoreCSS() {
  const srcPath = path.resolve("src/natcore.css");
  const destPath = path.resolve("dist/natcore.css");

  try {
    await fs.copyFile(srcPath, destPath);
    console.log("📦 Copied natcore.css to dist/\n");
  } catch (error) {
    console.warn("⚠️  natcore.css not found, skipping copy\n");
  }
}

async function compileComponents() {
  const distComponentsDir = path.resolve("dist/components");
  await fs.mkdir(distComponentsDir, { recursive: true });

  // Copy all .css files directly
  const cssFiles = await globby("src/components/**/*.css");
  if (cssFiles.length > 0) {
    console.log(`📦 Copying ${cssFiles.length} CSS file(s)...\n`);
    for (const file of cssFiles) {
      const fileName = path.basename(file);
      const destPath = path.join(distComponentsDir, fileName);
      await fs.copyFile(file, destPath);
      console.log(`  ✅ ${fileName}`);
    }
    console.log("");
  }

  // Find all component .ts files in src/components
  const componentFiles = await globby("src/components/**/*.ts", {
    ignore: ["**/*.spec.ts", "**/*.test.ts", "**/index.ts"],
  });

  if (componentFiles.length === 0) {
    console.log("⚠️  No component .ts files found in src/components");
    return;
  }

  console.log(
    `📦 Compiling ${componentFiles.length} component file(s) to CSS...\n`,
  );

  for (const file of componentFiles) {
    const componentName = path.basename(file, ".ts");
    console.log(`  ⚙️  Compiling ${componentName}...`);

    try {
      // Use esbuild to compile the TS file to ESM
      const tempFile = path.join(
        distComponentsDir,
        `${componentName}.temp.mjs`,
      );

      await build({
        entryPoints: [file],
        bundle: true,
        format: "esm",
        platform: "node",
        outfile: tempFile,
        external: [],
      });

      // Import the compiled temp file
      const module = await import(`file://${tempFile}`);
      const componentAst = module.default;

      // Clean up temp file
      await fs.unlink(tempFile);

      if (!componentAst) {
        console.warn(`  ⚠️  ${componentName} has no default export, skipping`);
        continue;
      }

      // Transform the AST to CSS
      const css = transformTailwindV4(componentAst);

      // Write ONLY the CSS file to dist/components
      const outputPath = path.join(distComponentsDir, `${componentName}.css`);
      await fs.writeFile(outputPath, css, "utf-8");

      console.log(`  ✅ ${componentName}.css`);
    } catch (error) {
      console.error(`  ❌ Failed to compile ${componentName}:`, error);
      throw error;
    }
  }

  console.log(`\n✅ Compiled ${componentFiles.length} component(s) to CSS`);
}

async function copyUtilities() {
  const distUtilitiesDir = path.resolve("dist/utilities");
  await fs.mkdir(distUtilitiesDir, { recursive: true });

  const cssFiles = await globby("src/utilities/**/*.css");
  if (cssFiles.length === 0) {
    return;
  }

  console.log(`\n📦 Copying ${cssFiles.length} utility CSS file(s)...\n`);
  for (const file of cssFiles) {
    const relativePath = path.relative("src/utilities", file);
    const destPath = path.join(distUtilitiesDir, relativePath);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(file, destPath);
    console.log(`  ✅ ${relativePath}`);
  }
}

async function copyThemes() {
  const distThemesDir = path.resolve("dist/themes");
  await fs.mkdir(distThemesDir, { recursive: true });

  const cssFiles = await globby("src/themes/**/*.css");
  if (cssFiles.length === 0) {
    return;
  }

  console.log(`\n📦 Copying ${cssFiles.length} theme CSS file(s)...\n`);
  for (const file of cssFiles) {
    const relativePath = path.relative("src/themes", file);
    const destPath = path.join(distThemesDir, relativePath);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(file, destPath);
    console.log(`  ✅ ${relativePath}`);
  }
}
