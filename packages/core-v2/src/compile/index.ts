import { compileTsToCss } from "./compile-ts-to-css";
import { copyCss } from "./copy-css";
import { type CompileContext } from "./types";

export async function compile(files: string[], context: CompileContext) {
  await copyCss(files, context);
  await compileTsToCss(files, context);
}
