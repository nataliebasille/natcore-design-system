import { copyCss } from "./copy-css";
import { compileTsToCss } from "./ts-to-css/compile";
import { type CompileContext } from "./types";

export async function compile(files: string[], context: CompileContext) {
  await copyCss(files, context);
  await compileTsToCss(files, context);
}
