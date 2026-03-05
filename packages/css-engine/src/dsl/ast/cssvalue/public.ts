import type { AstNode } from "../../visitor/visitor-builder.types";
import type { ColorAst } from "./color";
import type { CssFunction } from "./css-functions";
import type { CssDataType, CssPrimitiveValue } from "./css-primitive";
import type { CssVarAst } from "./cssvar";
import type { MatchModifierAst, MatchValueAst } from "./match-value";
import type { SpacingFunctionAst } from "../tailwind-functions/spacing";

// Re-export related types
export * from "./css-functions";
export type { CssDataType, CssPrimitiveValue } from "./css-primitive";
export * from "./css-primitive";
export { cssvar } from "./cssvar";
export type { CssVarAst } from "./cssvar";
export * from "./match-value";
export { cssv } from "./template-literal";
export type { TemplateLiteralAst } from "./template-literal";

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
