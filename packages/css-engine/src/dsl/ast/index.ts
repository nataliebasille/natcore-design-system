import type { ComponentAst } from "./component";
import type { StyleProperties, StyleRuleAst } from "./styleRule";
import type { ThemeAst, ThemeProperties } from "./theme";

export * from "./color";
export * from "./component";
export * from "./cssvalue";
export * from "./cssvar";
export * from "./selector";
export * from "./styleRule";
export * from "./theme";

export type DesignSystemAst =
  | ComponentAst
  | StyleRuleAst
  | ThemeAst
  | ThemeProperties
  | StyleProperties;
