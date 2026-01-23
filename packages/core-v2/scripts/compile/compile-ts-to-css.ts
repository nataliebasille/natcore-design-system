import { createCompiler } from "./create-compiler";
import { compile } from "@nataliebasille/natcore-css-engine";
import { pathToFileURL } from "node:url";

export const compileTsToCss = createCompiler({
  preprocess: (fileInfos) => {
    const tsToCssFiles = fileInfos.filter((file) => file.ext === ".css.ts");
    if (tsToCssFiles.length === 1) {
      console.log(
        `📦 Compiling ${tsToCssFiles[0]!.filename} TypeScript to CSS file...\n`,
      );
    } else {
      console.log(
        `📦 Compiling ${tsToCssFiles.length} TypeScript to CSS file(s)...\n`,
      );
    }

    return tsToCssFiles;
  },
  compile: async (file) => {
    // Add cache-busting query parameter to force reimport
    const fileUrl = pathToFileURL(file.path);
    fileUrl.searchParams.set("t", Date.now().toString());
    const compiler = await import(fileUrl.href);

    if (typeof compiler.default !== "function") {
      throw new Error(
        `Expected default export to be a function in ${file.path}`,
      );
    }

    return {
      filename: `${file.filename.replace(".ts", "")}`,
      content: compile(compiler.default()),
    };
  },
});
