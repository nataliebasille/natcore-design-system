import {
  dsl,
  type DynamicCssValue,
  type StyleListAst,
  type StyleListBuilder,
  type StyleRuleAst,
  type StyleRuleBodyBuilder,
  type TailwindClassAst,
} from "../dsl/public";

export type UtilityConstruct = {
  $construct: "utility";
  name: string;
  styles: (
    | TailwindClassAst
    | StyleListAst<dsl.DynamicCssValue>
    | StyleRuleAst<dsl.DynamicCssValue>
  )[];
};

export function utility<
  N extends string,
  B extends
    | StyleListBuilder<dsl.DynamicCssValue>
    | StyleRuleBodyBuilder<dsl.DynamicCssValue>,
>(name: N, ...body: B[]) {
  return {
    $construct: "utility",
    name,
    styles: body.flatMap(
      (
        b,
      ): (
        | TailwindClassAst
        | StyleListAst<dsl.DynamicCssValue>
        | StyleRuleAst<dsl.DynamicCssValue>
      )[] => {
        if (typeof b === "object" && b !== null && "$ast" in b) {
          return [
            b as
              | TailwindClassAst
              | StyleListAst<DynamicCssValue>
              | StyleRuleAst<DynamicCssValue>,
          ];
        }

        if (
          typeof b === "string" ||
          (typeof b === "object" && b !== null && "prefix" in b)
        ) {
          return [dsl.tw(b)];
        }

        const { $ = {}, ...rest } =
          b as dsl.StyleProperties<DynamicCssValue> & {
            $?: Partial<
              Record<dsl.Selector, dsl.StyleListAst<DynamicCssValue>>
            >;
          };

        return [
          ...(Object.keys(rest).length > 0 ?
            [
              dsl.styleList<
                dsl.StyleListBuilder<dsl.DynamicCssValue>[],
                dsl.DynamicCssValue
              >(rest as dsl.StyleProperties<dsl.DynamicCssValue>),
            ]
          : []),
          ...Object.entries($).map(([selector, styles]) =>
            dsl.styleRule(
              selector as dsl.Selector,
              styles as dsl.StyleListAst<dsl.DynamicCssValue>,
            ),
          ),
        ];
      },
    ),
  } satisfies UtilityConstruct;
}
