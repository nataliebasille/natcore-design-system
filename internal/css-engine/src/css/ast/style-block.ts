import type { AtRuleAst } from "./at-rule.ts";
import type { StyleListAst } from "./style-list.ts";

export type StyleBlockBody = AtRuleAst | StyleListAst | StyleBlockAst;

export type StyleBlockAst = {
  $css: "style-block";
  selector: string;
  body: Array<StyleBlockBody>;
};

export function styleBlock<S extends string>(
  selector: S,
  ...body: StyleBlockBody[]
) {
  return {
    $css: "style-block",
    selector,
    body,
  } satisfies StyleBlockAst;
}
