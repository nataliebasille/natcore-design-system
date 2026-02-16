import type { AstNode } from "../visitor/visitor-builder.types";
import type { css } from "../../css";
import type { ColorAst, ContrastAst } from "./color";
import type { CssValueAst } from "./cssvalue";

export type ThemeProperties = {
  [K in keyof css.ThemeProperties]:
    | css.ThemeProperties[keyof css.ThemeProperties]
    | ColorAst
    | ContrastAst
    | CssValueAst;
};

export type ThemeAst<out T extends ThemeProperties = ThemeProperties> = AstNode<
  "theme",
  {
    theme: T;
  }
>;

export function theme<T extends ThemeProperties>(theme: T) {
  return {
    $ast: "theme",
    theme,
  } satisfies ThemeAst<T>;
}
