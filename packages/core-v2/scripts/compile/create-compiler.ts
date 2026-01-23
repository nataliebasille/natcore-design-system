import { type CompileContext, type CompiledFile, type FileInfo } from "./types";
import path from "node:path";
import fs from "node:fs/promises";

const CUSTOM_EXTENSIONS = [".css.ts"] as const;

export function createCompiler(options: {
  preprocess?: (fileInfos: FileInfo[]) => FileInfo[];
  compile: (file: FileInfo) => CompiledFile | Promise<CompiledFile>;
}) {
  return async (files: string[], context: CompileContext) => {
    const fileInfos = files
      .map((file) => {
        // If file is already absolute, use it; otherwise resolve from context.src
        const absolutePath =
          path.isAbsolute(file) ? file : path.join(context.src, file);
        const relativePath = path.relative(context.src, absolutePath);
        const parts = relativePath.split(path.sep);

        const ext =
          CUSTOM_EXTENSIONS.find((ext) => relativePath.endsWith(ext)) ??
          path.extname(absolutePath);

        return {
          type: parts.length > 1 ? parts[0]! : "",
          path: absolutePath,
          directory: path.dirname(relativePath),
          filename: path.basename(absolutePath),
          ext,
        } satisfies FileInfo;
      })
      .filter((x) => !!x.ext);

    const preprocessedFileInfos = options.preprocess?.(fileInfos) ?? fileInfos;

    for (const file of preprocessedFileInfos) {
      // Read the CSS file content
      const compiledFile = await Promise.resolve(options.compile(file));

      // Calculate relative path from src directory

      // Create the full output path preserving directory structure
      const outPath = path.join(
        context.dist,
        file.directory,
        compiledFile.filename,
      );

      // Ensure the output directory exists
      await fs.mkdir(path.dirname(outPath), { recursive: true });

      // Write to the output directory
      await fs.writeFile(outPath, compiledFile.content, "utf-8");
    }
  };
}
