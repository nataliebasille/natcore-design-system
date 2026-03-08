import {
  dsl,
  type StyleListAst,
  type StyleListBuilder,
  type StyleRuleAst,
  type StyleRuleBodyBuilder,
  type TailwindClassAst,
} from "../dsl/public.ts";
import type { ThemeConstruct } from "./theme.ts";

export type UtilityBodyBuilder = StyleListBuilder | StyleRuleBodyBuilder;

export type UtilityConstruct = {
  $construct: "utility";
  name: string;
  theme?: ThemeConstruct;
  styles: (TailwindClassAst | StyleListAst | StyleRuleAst)[];
};

export function utility<N extends string>(
  name: N,
  ...body: UtilityBodyBuilder[]
): UtilityConstruct & { name: N; theme?: never };
export function utility<N extends string, T extends ThemeConstruct>(
  name: N,
  theme: T,
  ...body: UtilityBodyBuilder[]
): UtilityConstruct & { name: N; theme: T };

export function utility<N extends string>(
  name: N,
  themeOrBody: ThemeConstruct | UtilityBodyBuilder,
  ...body: (StyleListBuilder | StyleRuleBodyBuilder)[]
) {
  return {
    $construct: "utility",
    name,
    ...(typeof themeOrBody === "object" && "$construct" in themeOrBody ?
      { theme: themeOrBody as ThemeConstruct }
    : {}),
    styles: [
      ...(typeof themeOrBody === "object" && "$construct" in themeOrBody ?
        []
      : [themeOrBody as StyleListBuilder | StyleRuleBodyBuilder]),
      ...body,
    ].flatMap((b): (TailwindClassAst | StyleListAst | StyleRuleAst)[] => {
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
    }),
  } satisfies UtilityConstruct;
}
