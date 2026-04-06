import type { AtRuleAst } from "./at-rule.ts";
import type { StyleBlockAst } from "./style-block.ts";
import type { StyleListAst } from "./style-list.ts";

export * from "./at-rule.ts";
export * from "./style-block.ts";
export * from "./style-list.ts";

export type StylesheetSimpleAst = AtRuleAst | StyleBlockAst | StyleListAst;
export type StylesheetAst = StylesheetSimpleAst | Array<StylesheetSimpleAst>;
