import type { AstNode } from "../../visitor/visitor-builder.types";
import type { CssDataType, CssValue } from "./public";

export type TemplateLiteralAst<D extends CssDataType> = AstNode<
  "css-value",
  {
    strings: string[];
    values: CssValue<D>[];
  }
>;

export function cssv<D extends CssDataType>(
  strings: string[],
  ...values: CssValue<D>[]
): TemplateLiteralAst<D>;

export function cssv<D extends CssDataType>(
  strings: TemplateStringsArray,
  ...values: CssValue<D>[]
): TemplateLiteralAst<D>;

export function cssv<D extends CssDataType>(
  strings: TemplateStringsArray | string[],
  ...values: CssValue<D>[]
) {
  return {
    $ast: "css-value",
    strings: Array.from(strings),
    values,
  } satisfies TemplateLiteralAst<D>;
}
