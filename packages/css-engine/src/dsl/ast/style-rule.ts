/**
 * DSL Rule - CSS rule with selector and body
 */

import type { AstNode } from "../visitor/visitor-builder.types";
import type { css } from "../../css";
import type {
  AnyCssValue,
  CssFunctionAst,
  CssValue,
  TemplateLiteralAst,
} from "./cssvalue/public";
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

export type StyleProperties<AllowedValue extends AnyCssValue = CssValue> = {
  [K in keyof css.StyleProperties]?:
    | AllowedValue
    | TemplateLiteralAst<AllowedValue>
    | CssFunctionAst<AllowedValue>
    | (
        | AllowedValue
        | TemplateLiteralAst<AllowedValue>
        | CssFunctionAst<AllowedValue>
      )[];
};

export type StyleListAst<AllowedValue extends AnyCssValue = CssValue> = AstNode<
  "style-list",
  { styles: (StyleProperties<AllowedValue> | TailwindClassAst)[] }
>;
export type StyleRuleBody<AllowedValue extends AnyCssValue = CssValue> =
  | StyleListAst<AllowedValue>
  | StyleRuleAst<AllowedValue>;
export type StyleRuleAst<AllowedValue extends AnyCssValue = CssValue> = AstNode<
  "style-rule",
  {
    selector: Selector;
    body: StyleRuleBody<AllowedValue>[];
  }
>;

export type StyleRuleBodyBuilder<AllowedValue extends AnyCssValue = CssValue> =
  | StyleListAst<AllowedValue>
  | StyleRuleAst<AllowedValue>
  | (StyleProperties<AllowedValue> & {
      $?: {
        [K in Selector]?:
          | StyleRuleBodyBuilder<AllowedValue>
          | StyleRuleBodyBuilder<AllowedValue>[];
      };
    });

type BodyBuilder_To_StyleRuleBody<
  V extends AnyCssValue,
  T extends StyleRuleBodyBuilder<V>[],
> =
  T extends [infer U, ...infer R extends StyleRuleBodyBuilder<V>[]] ?
    [
      ...(U extends StyleListAst<V> ? [U]
      : U extends StyleRuleAst<V> ? [U]
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
      ...BodyBuilder_To_StyleRuleBody<V, R>,
    ]
  : [];

type NestedSelectorsToAst<T, V extends AnyCssValue = CssValue> =
  T extends Partial<Record<Selector, StyleRuleBodyBuilder<V>>> ?
    Array<
      {
        [K in keyof T]: T[K] extends StyleRuleBodyBuilder<V> ?
          {
            $ast: "style-rule";
            selector: K;
            body: BodyBuilder_To_StyleRuleBody<V, [T[K]]>;
          }
        : T[K] extends StyleRuleBodyBuilder<V>[] ?
          {
            $ast: "style-rule";
            selector: K;
            body: BodyBuilder_To_StyleRuleBody<V, T[K]>;
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
  const B extends StyleRuleBodyBuilder<V>[],
  const V extends AnyCssValue = CssValue,
>(selector: S, ...body: B) {
  const astBody: StyleRuleBody<V>[] = body.flatMap((item) => {
    if ("$ast" in item) return [item];

    const { $, ...styles } = item;

    return [
      ...(Object.keys(styles).length > 0 ?
        [{ $ast: "style-list", styles: [styles] } satisfies StyleListAst<V>]
      : []),
      ...(typeof $ === "object" ?
        Object.entries($).map(([sel, body]) => {
          const nestedBody = (
            !body ? []
            : Array.isArray(body) ? body
            : [body]) as StyleRuleBodyBuilder<V>[];
          return (
            styleRule as <
              S extends Selector,
              B extends StyleRuleBodyBuilder<V>[],
            >(
              selector: S,
              ...body: B
            ) => StyleRuleAst<V>
          )(sel as Selector, ...nestedBody);
        })
      : []),
    ];
  });

  return {
    $ast: "style-rule" as const,
    selector,
    body: astBody as BodyBuilder_To_StyleRuleBody<
      V,
      B
    > satisfies StyleRuleBody<V>[],
  };
}

export type StyleListBuilder<AllowedValue extends AnyCssValue = CssValue> =
  | StyleProperties<AllowedValue>
  | TailwindUtility
  | TailwindClassAst;

type ListBuilder_To_StyleListAst<
  V extends AnyCssValue,
  T extends StyleListBuilder<V>[],
> =
  T extends [infer U, ...infer R extends StyleListBuilder<V>[]] ?
    [
      ...(U extends TailwindUtility ? [{ $ast: "tailwind-class"; value: U }]
      : U extends TailwindClassAst ? [U]
      : U extends StyleProperties<V> ?
        [
          {
            -readonly [K in keyof U]: U[K];
          },
        ]
      : []),
      ...ListBuilder_To_StyleListAst<V, R>,
    ]
  : [];

export function styleList<
  const B extends StyleListBuilder<V>[],
  const V extends AnyCssValue = CssValue,
>(...styles: B) {
  return {
    $ast: "style-list" as const,
    styles: styles.map((s) =>
      typeof s === "string" ? tw(s)
      : typeof s === "object" && "prefix" in s ? tw(s)
      : s,
    ) as ListBuilder_To_StyleListAst<V, B> satisfies StyleListAst<V>["styles"],
  } satisfies StyleListAst<V>;
}
