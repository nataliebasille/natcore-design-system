/**
 * DSL Rule - CSS rule with selector and body
 */

import type { AstNode } from "../visitor/visitor-builder.types";
import type { css } from "../../css";
import type { CssDataType, CssFunction, CssValue } from "./cssvalue/public";
import type { Selector } from "./selector";
import {
  tw,
  type TailwindClassAst,
  type TailwindUtility,
} from "./tailwind-utilities";
import type { TemplateLiteralAst } from "./cssvalue/template-literal";

export type {
  TailwindUtility,
  TailwindClassAst,
  ArbitraryValue,
  ColorValue,
  LengthValue,
} from "./tailwind-utilities";
export { arbitraryValue } from "./tailwind-utilities";

export type StyleProperties = {
  [K in keyof css.StyleProperties]?:
    | CssValue<CssDataType>
    | TemplateLiteralAst<CssDataType>
    | CssFunction
    | (CssValue<CssDataType> | TemplateLiteralAst<CssDataType> | CssFunction)[];
};

export type StyleListAst = AstNode<
  "style-list",
  { styles: (StyleProperties | TailwindClassAst)[] }
>;
export type StyleRuleBody = StyleListAst | StyleRuleAst | TailwindClassAst;
export type StyleRuleAst = AstNode<
  "style-rule",
  {
    selector: Selector;
    body: StyleRuleBody[];
  }
>;

export type StyleRuleBodyBuilder =
  | StyleListAst
  | StyleRuleAst
  | TailwindUtility
  | (StyleProperties & {
      $?: {
        [K in Selector]?: StyleRuleBodyBuilder | StyleRuleBodyBuilder[];
      };
    });

type BodyBuilder_To_StyleRuleBody<T extends StyleRuleBodyBuilder[]> =
  T extends [infer U, ...infer R extends StyleRuleBodyBuilder[]] ?
    [
      ...(U extends TailwindUtility ? [{ $ast: "tailwind-class"; value: U }]
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
  : T extends (infer U)[] ?
    // Handle array types by converting each possible element
    (U extends TailwindUtility ? { $ast: "tailwind-class"; value: U }
    : U extends StyleListAst | StyleRuleAst ? U
    : U extends { $: any } ? StyleListAst | StyleRuleAst
    : StyleListAst)[]
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
  const astBody: StyleRuleBody[] = body.flatMap((item): StyleRuleBody[] => {
    // Handle strings (TailwindUtility)
    if (typeof item === "string") {
      return [tw(item)];
    }

    // Handle AST nodes (StyleListAst, StyleRuleAst, TailwindClassAst)
    if (typeof item === "object" && item !== null && "$ast" in item) {
      return [item];
    }

    // Handle ArbitraryValue objects (which have prefix/value structure)
    if (
      typeof item === "object" &&
      item !== null &&
      "prefix" in item &&
      "value" in item
    ) {
      return [tw(item as TailwindUtility)];
    }

    // Handle StyleProperties with optional nested selectors
    const { $, ...styles } = item;

    return [
      ...(Object.keys(styles).length > 0 ?
        [{ $ast: "style-list", styles: [styles] } satisfies StyleListAst]
      : []),
      ...(typeof $ === "object" ?
        Object.entries($).map(([sel, body]) => {
          const nestedBody = (
            !body ? []
            : Array.isArray(body) ? body
            : [body]) as StyleRuleBodyBuilder[];
          return (
            styleRule as <S extends Selector, B extends StyleRuleBodyBuilder[]>(
              selector: S,
              ...body: B
            ) => StyleRuleAst
          )(sel as Selector, ...nestedBody);
        })
      : []),
    ];
  });

  return {
    $ast: "style-rule" as const,
    selector,
    body: astBody as BodyBuilder_To_StyleRuleBody<B> satisfies StyleRuleBody[],
  };
}

export type StyleListBuilder =
  | StyleProperties
  | TailwindUtility
  | TailwindClassAst;

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
  : T extends (infer U)[] ?
    // Handle array types by converting each possible element
    (U extends TailwindUtility ? { $ast: "tailwind-class"; value: U }
    : U extends TailwindClassAst ? U
    : U extends StyleProperties ? StyleProperties
    : never)[]
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
