import fs from "fs";

export async function fetchFile(appRootRelativePath: string) {
  const file = await fs.promises.readFile(
    new URL(`../app/${appRootRelativePath}`, import.meta.url),
    "utf8",
  );

  return file;
}
