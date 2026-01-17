import type { AtRuleAst } from "./at-rule";
import type { StyleBlockAst } from "./style-block";
import type { StyleListAst } from "./style-list";

export * from "./at-rule";
export * from "./style-block";
export * from "./style-list";

export type StylesheetSimpleAst = AtRuleAst | StyleBlockAst | StyleListAst;
export type StylesheetAst = StylesheetSimpleAst | Array<StylesheetSimpleAst>;
