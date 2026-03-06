import { copyCss } from "./copy-css.ts";
import { compileTsToCss } from "./ts-to-css/compile.ts";
import { type CompileContext } from "./types.ts";

export async function compile(files: string[], context: CompileContext) {
  await copyCss(files, context);
  await compileTsToCss(files, context);
}
