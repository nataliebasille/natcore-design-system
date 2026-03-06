import {
  type ColorAst,
  type CssVarAst,
  type StyleRuleAst,
  type StyleProperties,
  type TailwindClassAst,
  type StyleListAst,
  type AtRuleAst,
  type CssFunction,
  type FunctionAst,
  type MatchValueAst,
  type MatchModifierAst,
  type CssDataType,
} from "../../index.ts";
import { defineVisitor } from "../visitor/visitor-builder.ts";
import type { TemplateLiteralAst } from "./cssvalue/template-literal.ts";

export type StylesheetVisitorSpec =
  | {
      $in: ColorAst;
      $out: string | StyleProperties | TemplateLiteralAst<"color">;
    }
  | AtRuleAst
  | {
      $in: TemplateLiteralAst<CssDataType>;
      $out: string | StyleProperties | TemplateLiteralAst<CssDataType>;
    }
  | {
      $in: CssVarAst;
      $out: string | StyleProperties | TemplateLiteralAst<CssDataType>;
    }
  | {
      $in: FunctionAst;
      $out: string | TemplateLiteralAst<CssDataType>;
    }
  | {
      $in: MatchValueAst<CssDataType>;
      $out: string | TemplateLiteralAst<CssDataType>;
    }
  | {
      $in: MatchModifierAst<CssDataType>;
      $out: string | TemplateLiteralAst<CssDataType>;
    }
  | StyleListAst
  | StyleRuleAst
  | {
      $in: TailwindClassAst;
      $out: string | StyleProperties;
    };

export type DesignSystemAst =
  StylesheetVisitorSpec extends infer T ?
    T extends { $in: infer Ast } ?
      Ast
    : T
  : never;

export function stylesheetVisitorBuilder() {
  return defineVisitor<StylesheetVisitorSpec>();
}
