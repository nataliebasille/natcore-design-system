import { createCompiler } from "../create-compiler.ts";
import {
  ComponentBuilder,
  compile,
  componentBuilderToDsl,
  dsl,
} from "@nataliebasille/css-engine";
import { pathToFileURL } from "node:url";
import { componentConstructToDsl } from "./component-construct-to-dsl.ts";
import { dslToCss } from "./dsl-to-css.ts";
import { themeConstructToDsl } from "./theme-construct-to-dsl.ts";
import { utilityConstructToDsl } from "./utility-construct-to-dsl.ts";

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

    if (!("default" in compiler)) {
      throw new Error(`Expected default export in ${file.path}`);
    }

    const content =
      typeof compiler.default === "function" ?
        compiler.default()
      : compiler.default;

    const contentAsArray = Array.isArray(content) ? content : [content];

    const transpiledToCssAstContent = contentAsArray.flatMap((content) => {
      return (
        content instanceof ComponentBuilder ?
          dslToCss(componentBuilderToDsl(content))
        : "$construct" in content ?
          content.$construct === "theme" ?
            dslToCss([themeConstructToDsl(content)])
          : content.$construct === "utility" ?
            dslToCss(utilityConstructToDsl(content))
          : content.$construct === "component" ?
            dslToCss(componentConstructToDsl(content))
          : content
        : "$ast" in content ? dslToCss([content])
        : content
      );
    });

    return {
      filename: `${file.filename.replace(".ts", "")}`,
      content: compile(transpiledToCssAstContent),
    };
  },
});
