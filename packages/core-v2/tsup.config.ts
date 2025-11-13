import { defineConfig } from 'tsup'
import fs from 'fs/promises'
import path from 'path'
import { globby } from 'globby'

export default defineConfig(async () => {
  // Find all CSS files to watch
  const cssFiles = await globby('src/**/*.css')
  const cssEntries = Object.fromEntries(
    cssFiles.map((file: string) => {
      // Create entry name from file path: src/components/tray.css -> components/tray
      const relativePath = path.relative('src', file)
      const parsed = path.parse(relativePath)
      const entryName = path.join(parsed.dir, parsed.name).replace(/\\/g, '/')
      return [entryName, file]
    })
  )

  return {
    entry: {
      index: 'src/index.ts',
      plugin: 'src/plugin.ts',
      utils: 'src/utils.ts',
      ...cssEntries
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    splitting: false,
    external: ['tailwindcss'],
    noExternal: ['classnames'],
    loader: {
      '.css': 'copy'
    },
    async onSuccess() {
      console.log('✅ Build complete - CSS files copied')
    }
  }
})

async function copyFilesRecursively(srcDir: string, destDir: string, extension: string) {
  const entries = await fs.readdir(srcDir, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)

    if (entry.isDirectory()) {
      // Recursively handle subdirectories
      await fs.mkdir(destPath, { recursive: true })
      await copyFilesRecursively(srcPath, destPath, extension)
    } else if (entry.name.endsWith(extension)) {
      // Copy matching files
      await fs.copyFile(srcPath, destPath)
      console.log(`✅ Copied ${path.relative(srcDir, srcPath)} to dist/`)
    }
  }
}