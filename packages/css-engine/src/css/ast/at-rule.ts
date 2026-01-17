import type { StyleBlockAst } from "./style-block";
import type { StyleListAst } from "./style-list";

export type AtRuleBody = ReadonlyArray<
  StyleListAst | StyleBlockAst | AtRuleAst
>;

export type AtRuleAst = {
  type: "at-rule";
  name: string;
  prelude: string | null;
  body: AtRuleBody | null;
};

export function atRule<N extends string, P extends string | null>(
  name: N,
  prelude: P,
): AtRuleAst & { body: null; prelude: P; name: N };
export function atRule<
  N extends string,
  P extends string | null,
  B extends AtRuleBody,
>(
  name: N,
  prelude: P,
  ...body: B
): AtRuleAst & { body: B; prelude: P; name: N };
export function atRule(
  name: string,
  prelude: string | null,
  ...body: AtRuleBody
) {
  const atRuleBody = arguments.length > 2 ? body : null;
  return {
    type: "at-rule",
    name,
    prelude,
    body: atRuleBody,
  } satisfies AtRuleAst;
}
