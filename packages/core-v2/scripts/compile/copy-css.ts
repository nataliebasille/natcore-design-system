import fs from "node:fs/promises";
import { createCompiler } from "./create-compiler";

export const copyCss = createCompiler({
  preprocess(fileInfos) {
    const cssFiles = fileInfos.filter((file) => file.ext === ".css");
    if (cssFiles.length === 1) {
      console.log(`📦 Copying ${cssFiles[0]} CSS file...\n`);
    } else {
      console.log(`📦 Copying ${cssFiles.length} CSS file(s)...\n`);
    }

    return cssFiles;
  },
  async compile(file) {
    return {
      filename: file.filename,
      content: await fs.readFile(file.path, "utf-8"),
    };
  },
});
