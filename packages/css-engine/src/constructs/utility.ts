import {
  dsl,
  type StyleListAst,
  type StyleListBuilder,
  type StyleRuleAst,
  type StyleRuleBodyBuilder,
  type TailwindClassAst,
  type BodyBuilder_To_StyleRuleBody,
  type ListBuilder_To_StyleListAst,
} from "../dsl/public.ts";
import type { ThemeConstruct } from "./theme.ts";

export type UtilityBodyBuilder = StyleListBuilder | StyleRuleBodyBuilder;

export type BodyBuilder_To_UtilityBody<T extends UtilityBodyBuilder[]> =
  T extends [infer U, ...infer R extends UtilityBodyBuilder[]] ?
    [
      U extends StyleListBuilder ? ListBuilder_To_StyleListAst<[U]>
      : U extends StyleRuleBodyBuilder ? BodyBuilder_To_StyleRuleBody<[U]>
      : never,
      ...BodyBuilder_To_UtilityBody<R>,
    ]
  : T extends (infer U)[] ?
    (U extends StyleListBuilder ? ListBuilder_To_StyleListAst<[U]>
    : U extends StyleRuleBodyBuilder ? BodyBuilder_To_StyleRuleBody<[U]>
    : never)[]
  : [];

export type UtilityConstruct<
  N extends string,
  T extends ThemeConstruct | undefined,
  B extends UtilityBodyBuilder[],
> = {
  $construct: "utility";
  name: N;
  theme?: T;
  styles: BodyBuilder_To_UtilityBody<B>;
};

export function utility<N extends string, B extends UtilityBodyBuilder[]>(
  name: N,
  ...body: B
): UtilityConstruct<N, never, B>;
export function utility<
  N extends string,
  T extends ThemeConstruct,
  B extends UtilityBodyBuilder[],
>(name: N, theme: T, ...body: B): UtilityConstruct<N, T, B>;

export function utility<N extends string>(
  name: N,
  themeOrBody: ThemeConstruct | UtilityBodyBuilder,
  ...body: UtilityBodyBuilder[]
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
  } as UtilityConstruct<N, any, any>;
}
