import type { css } from "../../css";
import type { ColorAst } from "./color";
import type { CssValueAst } from "./cssvalue";

export type ThemeProperties = {
  [K: keyof css.ThemeProperties]:
    | css.ThemeProperties[keyof css.ThemeProperties]
    | ColorAst
    | CssValueAst;
};

export type ThemeAst = {
  type: "theme";
  theme: ThemeProperties;
};

export function theme<const T extends ThemeProperties>(theme: T) {
  return {
    type: "theme",
    theme,
  } satisfies ThemeAst;
}
