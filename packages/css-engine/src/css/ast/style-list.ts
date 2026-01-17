import type { PropertiesHyphen } from "csstype";

export type ThemeProperty = `--${string}`;
export type ThemeProperties = {
  [K: ThemeProperty]: string | number;
};

export type StyleProperties = PropertiesHyphen & ThemeProperties;

export type StyleListAst = {
  type: "style-list";
  styles: StyleProperties;
};

export function styleList<P extends StyleProperties>(styles: P) {
  return {
    type: "style-list",
    styles,
  } satisfies StyleListAst;
}
