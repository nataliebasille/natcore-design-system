import type {
  ApplyValue,
  ColorAst,
  ContrastAst,
  CssValueAst,
  CssVarAst,
  StyleRuleAst,
  ThemeAst,
  ToneAst,
  StyleProperties,
  Selector,
} from "../..";
import { defineVisitor } from "../visitor/visitor-builder";

export type StylesheetVisitorSpec =
  | { $in: ColorAst; $out: string }
  | { $in: ContrastAst; $out: string }
  | { $in: CssValueAst; $out: string }
  | { $in: CssVarAst; $out: string }
  | StyleRuleAst
  | ThemeAst
  | { $in: ToneAst; $out: string }
  | {
      apply: { $in: ApplyValue[]; $out: StyleProperties };
      "nested-style-rule": StyleRuleAst["body"]["$"];
      styles: StyleProperties;
    };

export function stylesheetVisitorBuilder() {
  return defineVisitor<StylesheetVisitorSpec>({
    apply: {
      nodeIs(node, context): node is ApplyValue[] {
        return context.key === "@apply" && Array.isArray(node);
      },
    },
    "nested-style-rule": {
      nodeIs(node, context): node is StyleRuleAst["body"]["$"] {
        return (
          typeof node === "object" &&
          node !== null &&
          context.path?.at(-1) === "$"
        );
      },
    },
    styles: {
      nodeIs(node, context): node is StyleProperties {
        return (
          typeof node === "object" &&
          node !== null &&
          (context.key === "styles" ||
            context.key === "body" ||
            context.path?.at(-2) === "$")
        );
      },
    },
  });
}
