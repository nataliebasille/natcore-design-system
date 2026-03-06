import {
  dsl,
  type StyleListAst,
  type StyleListBuilder,
  type StyleRuleAst,
  type StyleRuleBodyBuilder,
  type TailwindClassAst,
} from "../dsl/public";

export type UtilityConstruct = {
  $construct: "utility";
  name: string;
  styles: (TailwindClassAst | StyleListAst | StyleRuleAst)[];
};

export function utility<N extends string>(
  name: N,
  ...body: (StyleListBuilder | StyleRuleBodyBuilder)[]
) {
  return {
    $construct: "utility",
    name,
    styles: body.flatMap(
      (b): (TailwindClassAst | StyleListAst | StyleRuleAst)[] => {
        if (typeof b === "object" && b !== null && "$ast" in b) {
          return [b as TailwindClassAst | StyleListAst | StyleRuleAst];
        }

        if (
          typeof b === "string" ||
          (typeof b === "object" && b !== null && "prefix" in b)
        ) {
          return [dsl.tw(b)];
        }

        const { $ = {}, ...rest } = b as dsl.StyleProperties & {
          $?: Partial<Record<dsl.Selector, dsl.StyleListAst>>;
        };

        return [
          ...(Object.keys(rest).length > 0 ?
            [dsl.styleList(rest as dsl.StyleProperties)]
          : []),
          ...Object.entries($).map(([selector, styles]) =>
            dsl.styleRule(
              selector as dsl.Selector,
              ...(styles instanceof Array ? styles : [styles]),
            ),
          ),
        ];
      },
    ),
  } satisfies UtilityConstruct;
}
