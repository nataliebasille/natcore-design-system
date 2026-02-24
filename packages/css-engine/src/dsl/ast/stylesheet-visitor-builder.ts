import {
  type ColorAst,
  type CssVarAst,
  type StyleRuleAst,
  type StyleProperties,
  type TailwindClassAst,
  type StyleListAst,
  type AtRuleAst,
  type CssFunctionAst,
  type FunctionAst,
  type TemplateLiteralAst,
  type MatchValueAst,
  type MatchModifierAst,
  type AnyCssValue,
} from "../..";
import { defineVisitor } from "../visitor/visitor-builder";

export type StylesheetVisitorSpec =
  | {
      $in: ColorAst;
      $out: string | StyleProperties | TemplateLiteralAst<AnyCssValue>;
    }
  | AtRuleAst
  | {
      $in: TemplateLiteralAst<AnyCssValue>;
      $out: string | StyleProperties | TemplateLiteralAst<AnyCssValue>;
    }
  | {
      $in: CssVarAst;
      $out: string | StyleProperties | TemplateLiteralAst<AnyCssValue>;
    }
  | {
      $in: CssFunctionAst<AnyCssValue>;
      $out: string | TemplateLiteralAst<AnyCssValue>;
    }
  | { $in: FunctionAst; $out: string | TemplateLiteralAst<AnyCssValue> }
  | { $in: MatchValueAst; $out: string | TemplateLiteralAst<AnyCssValue> }
  | { $in: MatchModifierAst; $out: string | TemplateLiteralAst<AnyCssValue> }
  | StyleListAst
  | StyleRuleAst
  | { $in: TailwindClassAst; $out: string | StyleProperties };

export type DesignSystemAst =
  StylesheetVisitorSpec extends infer T ?
    T extends { $in: infer Ast } ?
      Ast
    : T
  : never;

export function stylesheetVisitorBuilder() {
  return defineVisitor<StylesheetVisitorSpec>();
}
