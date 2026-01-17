import type { AtRuleAst } from "./at-rule";
import type { StyleListAst } from "./style-list";

export type StyleBlockSimpleBody = AtRuleAst | StyleListAst | StyleBlockAst;

export type StyleBlockAst = {
  type: "style-block";
  selector: string;
  body: StyleBlockSimpleBody | Array<StyleBlockSimpleBody>;
};

export type StyleBlockBuilder = typeof styleBlock;

export function styleBlock<S extends string>(
  selector: S,
  body: StyleBlockAst["body"],
) {
  return {
    type: "style-block",
    selector,
    body,
  } satisfies StyleBlockAst;
}
