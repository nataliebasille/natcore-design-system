import type { PropertiesHyphen } from "csstype";

export type ThemeProperty = `--${string}`;
export type ThemeProperties = {
  [K: ThemeProperty]: string | number;
};

export type StyleProperties = PropertiesHyphen & ThemeProperties;

export type StyleListAst = {
  $css: "style-list";
  styles: StyleProperties;
};

export function styleList<P extends StyleProperties>(styles: P) {
  return {
    $css: "style-list",
    styles,
  } satisfies StyleListAst;
}
