import type {
  ColorAst,
  ContrastAst,
  CssValueAst,
  CssVarAst,
  StyleRuleAst,
  ToneAst,
  StyleProperties,
  TailwindClassAst,
  StyleListAst,
  AtRuleAst,
} from "../..";
import { defineVisitor } from "../visitor/visitor-builder";

export type StylesheetVisitorSpec =
  | { $in: ColorAst; $out: string | StyleProperties }
  | AtRuleAst
  | { $in: ContrastAst; $out: string | StyleProperties }
  | { $in: CssValueAst; $out: string | StyleProperties }
  | { $in: CssVarAst; $out: string | StyleProperties }
  | StyleListAst
  | StyleRuleAst
  | { $in: TailwindClassAst; $out: string | StyleProperties }
  | { $in: ToneAst; $out: string | StyleProperties };

export type DesignSystemAst =
  StylesheetVisitorSpec extends infer T ?
    T extends { $in: infer Ast } ?
      Ast
    : T
  : never;

export function stylesheetVisitorBuilder() {
  return defineVisitor<StylesheetVisitorSpec>();
}
