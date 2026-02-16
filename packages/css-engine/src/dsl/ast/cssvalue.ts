import type { AstNode } from "../visitor/visitor-builder.types";
import type { ColorAst, ToneAst } from "./color";
import type { CssVarAst } from "./cssvar";
import type { FunctionAst } from "./tailwind-functions/public";

export type CssValue<VarKeys extends string = string> =
  | ColorAst
  | ToneAst
  | CssVarAst<VarKeys>
  | string
  | FunctionAst
  | CssValueAst<VarKeys>;

export type CssValueAst<VarKeys extends string = string> = AstNode<
  "css-value",
  {
    strings: string[];
    values: CssValue<VarKeys>[];
  }
>;

export function cssv<VarKeys extends string = string>(
  strings: TemplateStringsArray,
  ...values: CssValue<VarKeys>[]
) {
  return {
    $ast: "css-value",
    strings: Array.from(strings),
    values,
  } satisfies CssValueAst<VarKeys>;
}
