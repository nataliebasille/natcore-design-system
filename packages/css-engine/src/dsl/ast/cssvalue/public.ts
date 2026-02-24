import type { AstNode } from "../../visitor/visitor-builder.types";
import type { ColorAst } from "../color";
import type { FunctionAst } from "../tailwind-functions/public";
import type { CssFunction } from "./css-functions";
import type { CssVarAst } from "./cssvar";
import type { MatchModifierAst, MatchValueAst } from "./match-value";

// Re-export related types
export * from "./css-functions";
export type { CssVarAst } from "./cssvar";
export { cssvar } from "./cssvar";
export * from "./match-value";

export type CssValue = string | ColorAst | CssVarAst | FunctionAst;

export type DynamicCssValue = CssValue | MatchValueAst | MatchModifierAst;

export type AnyCssValue = CssValue | DynamicCssValue;

export type TemplateLiteralAst<AllowedValue extends AnyCssValue> = AstNode<
  "css-value",
  {
    strings: string[];
    values: AllowedValue[];
  }
>;

export function cssv<AllowedValue extends AnyCssValue = CssValue>(
  strings: TemplateStringsArray,
  ...values: AllowedValue[]
) {
  return {
    $ast: "css-value",
    strings: Array.from(strings),
    values,
  } satisfies TemplateLiteralAst<AllowedValue>;
}
