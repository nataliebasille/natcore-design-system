/**
 * DSL Rule - CSS rule with selector and body
 */

import type { AstNode } from "../visitor/visitor-builder.types";
import type { css } from "../../css";
import type { CssValue } from "./cssvalue/public";
import type { Selector } from "./selector";
import {
  tw,
  type TailwindClassAst,
  type TailwindUtility,
} from "./tailwind-utilities";

export type {
  TailwindUtility,
  TailwindClassAst,
  ArbitraryValue,
  ColorValue,
  LengthValue,
} from "./tailwind-utilities";
export { arbitraryValue } from "./tailwind-utilities";

export type StyleProperties = {
  [K in keyof css.StyleProperties]?: CssValue;
};

export type StyleListAst = AstNode<
  "style-list",
  { styles: (StyleProperties | TailwindClassAst)[] }
>;
export type StyleRuleBody = StyleListAst | TailwindClassAst | StyleRuleAst;
export type StyleRuleAst = AstNode<
  "style-rule",
  {
    selector: Selector;
    body: StyleRuleBody[];
  }
>;

export type StyleRuleBodyBuilder =
  | TailwindUtility
  | TailwindClassAst
  | StyleListAst
  | StyleRuleAst
  | (StyleProperties & {
      $?: { [K in Selector]?: StyleRuleBodyBuilder | StyleRuleBodyBuilder[] };
    });

type BodyBuilder_To_StyleRuleBody<T extends StyleRuleBodyBuilder[]> =
  T extends [infer U, ...infer R extends StyleRuleBodyBuilder[]] ?
    [
      ...(U extends TailwindUtility ? [{ $ast: "tailwind-class"; value: U }]
      : U extends TailwindClassAst ? [U]
      : U extends StyleListAst ? [U]
      : U extends StyleRuleAst ? [U]
      : U extends { $: infer Nested } ?
        [
          {
            $ast: "style-list";
            styles: [
              {
                -readonly [K in keyof U as K extends "$" ? never : K]: U[K];
              },
            ];
          },
          ...NestedSelectorsToAst<Nested>,
        ]
      : [
          {
            $ast: "style-list";
            styles: [
              {
                -readonly [K in keyof U as K extends "$" ? never : K]: U[K];
              },
            ];
          },
        ]),
      ...BodyBuilder_To_StyleRuleBody<R>,
    ]
  : [];

type NestedSelectorsToAst<T> =
  T extends Partial<Record<Selector, StyleRuleBodyBuilder>> ?
    Array<
      {
        [K in keyof T]: T[K] extends StyleRuleBodyBuilder ?
          {
            $ast: "style-rule";
            selector: K;
            body: BodyBuilder_To_StyleRuleBody<[T[K]]>;
          }
        : T[K] extends StyleRuleBodyBuilder[] ?
          {
            $ast: "style-rule";
            selector: K;
            body: BodyBuilder_To_StyleRuleBody<T[K]>;
          }
        : never;
      }[keyof T]
    >
  : [];

/**
 * DSL function to create a rule with type-safe selector and body
 */
export function styleRule<
  const S extends Selector,
  const B extends StyleRuleBodyBuilder[],
>(selector: S, ...body: B) {
  const astBody: StyleRuleBody[] = body.flatMap((item) => {
    if (
      typeof item === "string" ||
      (typeof item === "object" && "prefix" in item)
    )
      return [tw(item)];

    if ("$ast" in item) return [item];

    const { $, ...styles } = item;

    return [
      ...(Object.keys(styles).length > 0 ?
        [{ $ast: "style-list", styles: [styles] } satisfies StyleListAst]
      : []),
      ...(typeof $ === "object" ?
        Object.entries($).map(([sel, body]) =>
          styleRule(
            sel as Selector,
            ...(!body ? []
            : Array.isArray(body) ? body
            : [body]),
          ),
        )
      : []),
    ];
  });

  return {
    $ast: "style-rule" as const,
    selector,
    body: astBody as BodyBuilder_To_StyleRuleBody<B> satisfies StyleRuleBody[],
  };
}

type StyleListBuilder = StyleProperties | TailwindUtility | TailwindClassAst;
type ListBuilder_To_StyleListAst<T extends StyleListBuilder[]> =
  T extends [infer U, ...infer R extends StyleListBuilder[]] ?
    [
      ...(U extends TailwindUtility ? [{ $ast: "tailwind-class"; value: U }]
      : U extends TailwindClassAst ? [U]
      : U extends StyleProperties ?
        [
          {
            -readonly [K in keyof U]: U[K];
          },
        ]
      : []),
      ...ListBuilder_To_StyleListAst<R>,
    ]
  : [];

export function styleList<const B extends StyleListBuilder[]>(...styles: B) {
  return {
    $ast: "style-list" as const,
    styles: styles.map((s) =>
      typeof s === "string" ? tw(s)
      : typeof s === "object" && "prefix" in s ? tw(s)
      : s,
    ) as ListBuilder_To_StyleListAst<B> satisfies StyleListAst["styles"],
  } satisfies StyleListAst;
}
