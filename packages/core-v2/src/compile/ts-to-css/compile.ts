import { createCompiler } from "../create-compiler";
import { compile } from "@nataliebasille/natcore-css-engine";
import { pathToFileURL } from "node:url";
import { dslToCss } from "./dsl-to-css";
import { themeConstructToDsl } from "./theme-construct-to-dsl";
import { utilityConstructToDsl } from "./utility-construct-to-dsl";

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

    const content =
      typeof compiler.default === "function" ?
        compiler.default()
      : compiler.default;

    const contentAsArray = Array.isArray(content) ? content : [content];

    const transpiledToCssAstContent = contentAsArray.flatMap((content) => {
      return (
        "$construct" in content ?
          content.$construct === "theme" ?
            dslToCss([themeConstructToDsl(content)])
          : content.$construct === "utility" ?
            dslToCss([utilityConstructToDsl(content)])
          : content
        : content
      );
    });

    return {
      filename: `${file.filename.replace(".ts", "")}`,
      content: compile(transpiledToCssAstContent),
    };
  },
});
