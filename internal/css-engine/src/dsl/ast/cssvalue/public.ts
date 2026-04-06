import type { AstNode } from "../../visitor/visitor-builder.types.ts";
import type { ColorAst } from "./color.ts";
import type { CssFunction } from "./css-functions.ts";
import type { CssDataType, CssPrimitiveValue } from "./css-primitive.ts";
import type { CssVarAst } from "./cssvar.ts";
import type { MatchModifierAst, MatchValueAst } from "./match-value.ts";
import type { SpacingFunctionAst } from "../tailwind-functions/spacing.ts";

// Re-export related types
export * from "./css-functions.ts";
export type { CssDataType, CssPrimitiveValue } from "./css-primitive.ts";
export * from "./css-primitive.ts";
export { cssvar } from "./cssvar.ts";
export type { CssVarAst } from "./cssvar.ts";
export * from "./match-value.ts";
export { cssv } from "./template-literal.ts";
export type { TemplateLiteralAst } from "./template-literal.ts";

type SpecialCssValueDataTypeMapping<D extends CssDataType> =
  D extends "color" ? ColorAst
  : D extends "integer" | "number" ? number
  : string & {};

export type CssValue<D extends CssDataType> =
  | (D extends CssDataType ?
      | Extract<CssPrimitiveValue, { $primitive: D }>
      | SpecialCssValueDataTypeMapping<D>
      | CssFunction
      | CssVarAst
      | SpacingFunctionAst
    : never)
  | MatchValueAst<D>
  | MatchModifierAst<D>;
