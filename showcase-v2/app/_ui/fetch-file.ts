import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export async function fetchFile(appRootRelativePath: string) {
  const filePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../app",
    appRootRelativePath
  );

  const file = await fs.promises.readFile(filePath, "utf8");
  return file;
}
