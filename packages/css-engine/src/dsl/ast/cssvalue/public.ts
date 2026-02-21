import type { AstNode } from "../../visitor/visitor-builder.types";
import type { ColorAst, ContrastAst, ToneAst } from "../color";
import type { FunctionAst } from "../tailwind-functions/public";
import type { CssFunction } from "./css-functions";
import type { CssVarAst } from "./cssvar";

// Re-export related types
export * from "./css-functions";
export type { CssVarAst } from "./cssvar";
export { cssvar } from "./cssvar";

export type CssValue =
  | string
  | ColorAst
  | ContrastAst
  | CssValueAst
  | CssVarAst
  | FunctionAst
  | ToneAst
  | CssFunction;

export type CssValueAst = AstNode<
  "css-value",
  {
    strings: string[];
    values: CssValue[];
  }
>;

export function cssv<VarKeys extends string = string>(
  strings: TemplateStringsArray,
  ...values: CssValue[]
) {
  return {
    $ast: "css-value",
    strings: Array.from(strings),
    values,
  } satisfies CssValueAst;
}
