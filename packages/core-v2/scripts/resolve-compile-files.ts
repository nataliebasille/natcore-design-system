import fs from "node:fs/promises";
import path from "node:path";

const CSS_TS_EXTENSION = ".css.ts";

export async function resolveCompileFiles(args: string[], srcDir: string) {
  const selectedFiles = parseSelectedFiles(args);

  if (selectedFiles.length === 0) {
    return listTailwindFiles(srcDir);
  }

  const cssTsFiles = await listCssTsFiles(srcDir);

  return selectedFiles.map((file) =>
    resolveSelectedFile(file, cssTsFiles, srcDir),
  );
}

function parseSelectedFiles(args: string[]) {
  const selectedFiles: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!;

    if (arg === "--file" || arg === "--files" || arg === "-f") {
      const value = args[index + 1];
      if (!value) {
        throw new Error(`Missing value for ${arg}`);
      }

      selectedFiles.push(...splitFileList(value));
      index += 1;
      continue;
    }

    if (arg.startsWith("--file=")) {
      selectedFiles.push(...splitFileList(arg.slice("--file=".length)));
      continue;
    }

    if (arg.startsWith("--files=")) {
      selectedFiles.push(...splitFileList(arg.slice("--files=".length)));
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    selectedFiles.push(...splitFileList(arg));
  }

  return [...new Set(selectedFiles)];
}

function splitFileList(value: string) {
  return value
    .split(",")
    .map((file) => file.trim())
    .filter(Boolean);
}

async function listTailwindFiles(srcDir: string) {
  return (await fs.readdir(srcDir, { recursive: true }))
    .filter((file): file is string => typeof file === "string")
    .map(normalizeFilePath);
}

async function listCssTsFiles(srcDir: string) {
  return (await listTailwindFiles(srcDir)).filter((file) =>
    file.endsWith(CSS_TS_EXTENSION),
  );
}

function resolveSelectedFile(
  file: string,
  cssTsFiles: string[],
  srcDir: string,
) {
  const normalized = normalizeFilePath(file);
  const fileWithExtension =
    normalized.endsWith(CSS_TS_EXTENSION) ? normalized : (
      `${normalized}${CSS_TS_EXTENSION}`
    );

  if (!fileWithExtension.endsWith(CSS_TS_EXTENSION)) {
    throw new Error(
      `Selected file must be a ${CSS_TS_EXTENSION} file: ${file}`,
    );
  }

  const relativePath = getRelativePath(fileWithExtension, srcDir);
  const directMatch = cssTsFiles.find(
    (cssTsFile) => cssTsFile === relativePath,
  );
  if (directMatch) {
    return directMatch;
  }

  const basenameMatches = cssTsFiles.filter(
    (cssTsFile) =>
      path.basename(cssTsFile) === path.basename(fileWithExtension),
  );

  if (basenameMatches.length === 1) {
    return basenameMatches[0]!;
  }

  if (basenameMatches.length > 1) {
    throw new Error(
      `Multiple ${CSS_TS_EXTENSION} files match ${file}: ${basenameMatches.join(", ")}`,
    );
  }

  throw new Error(
    `Could not find ${file}. Try one of: ${cssTsFiles.join(", ")}`,
  );
}

function normalizeFilePath(file: string) {
  return file.replaceAll("\\", "/").replace(/^\.\/+/, "");
}

function getRelativePath(file: string, srcDir: string) {
  if (path.isAbsolute(file)) {
    return normalizeFilePath(path.relative(srcDir, file));
  }

  return file.replace(/^src\/tailwind\//, "");
}
