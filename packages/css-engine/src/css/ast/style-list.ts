import type { PropertiesHyphen } from "csstype";
import type { AtRuleAst } from "./at-rule";

export type ThemeProperty = `--${string}`;
export type PropertyAtRuleDescriptor = "syntax" | "inherits" | "initial-value";
export type PropertyAtRuleDescriptors = {
  syntax?: string;
  inherits?: boolean | "true" | "false";
  "initial-value"?: string | number;
};

export type StylePropertyValue =
  | string
  | number
  | boolean
  | (string | number | boolean)[];

export type ThemeProperties = {
  [K: ThemeProperty]: StylePropertyValue;
};

export type StyleProperties = PropertiesHyphen &
  ThemeProperties &
  PropertyAtRuleDescriptors;

export type StyleListAst = {
  $css: "style-list";
  styles: (StyleProperties | AtRuleAst)[];
};
export function styleList(
  ...styles: (StyleProperties | AtRuleAst)[]
): StyleListAst {
  return {
    $css: "style-list",
    styles,
  } satisfies StyleListAst;
}
