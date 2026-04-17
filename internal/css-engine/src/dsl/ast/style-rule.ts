/**
 * DSL Rule - CSS rule with selector and body
 */

import type { AstNode } from "../visitor/visitor-builder.types.ts";
import type { css } from "../../css/index.ts";
import type { CssDataType, CssFunction, CssValue } from "./cssvalue/public.ts";
import type { Selector } from "./selector.ts";
import {
  tw,
  type TailwindClassAst,
  type TailwindUtility,
} from "./tailwind-utilities.ts";
import type { TemplateLiteralAst } from "./cssvalue/template-literal.ts";
import type { SpacingFunctionAst } from "./tailwind-functions/spacing.ts";
import type { Eager, WithMetadata } from "../../utils/types.ts";

export type {
  TailwindUtility,
  TailwindClassAst,
  ArbitraryValue,
  ColorValue,
  LengthValue,
} from "./tailwind-utilities.ts";
export { arbitraryValue } from "./tailwind-utilities.ts";

type Styles =
  | WithMetadata<StyleListAst | StyleRuleAst, unknown>
  | StyleProperties
  | TailwindUtility
  | TailwindClassAst<TailwindUtility>
  | { $: { [K in Selector]?: Styles | Styles[] } };

type UnionToIntersection<U> =
  (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I
  : never;

type ValueOf<T> = T[keyof T];

type NestedStylesMetadata<Nested> =
  Nested extends Record<PropertyKey, Styles | Styles[]> ?
    {
      [K in keyof Nested]: Styles_Metadata<Nested[K]>;
    }
  : {};

type MetadataOfStyle<S> =
  // Fast O(1) short-circuits for TailwindUtility strings and ArbitraryValue prefix-objects.
  // When TypeScript computes variance for generic components it instantiates MetadataOfStyle
  // with the full Styles union (~3979 members). Without short-circuits every member must
  // traverse all branches below, producing thousands of comparisons. Both branches return {}
  // for these cases anyway, so the result is identical — skipping the O(3979) distribution.
  S extends string ? {}
  : S extends { readonly prefix: string } ? {}
  : S extends WithMetadata<StyleListAst | StyleRuleAst, infer M> ? M
  : S extends StyleProperties ?
    Omit<S, "$"> &
      (S extends { $: infer Nested } ? NestedStylesMetadata<Nested> : {})
  : S extends { $: infer Nested } ? NestedStylesMetadata<Nested>
  : {};

type TwOfStyle<S> =
  // Use fast structural checks instead of distributing against the full ~3980-member
  // TailwindUtility union. All TailwindUtility string literals are caught by
  // `extends string`, and all ArbitraryValue<D,P> objects by `extends { prefix: string }`.
  // Autocomplete is unaffected — it comes from the TailwindUtility parameter types, not here.
  S extends string ? S
  : S extends { readonly prefix: string } ? S
  : S extends TailwindClassAst<infer Tw> ? Tw
  : S extends { $: infer Nested } ?
    Nested extends Record<PropertyKey, Styles | Styles[]> ?
      TwOf<ValueOf<Nested>>
    : never
  : never;

type MetadataOf<T> =
  // Use readonly unknown[] instead of readonly Styles[] — same structural gate, O(1) check
  // instead of O(3979) T[number]-vs-Styles comparison that triggered on every array branch.
  T extends readonly unknown[] ? UnionToIntersection<MetadataOfStyle<T[number]>>
  : // Short-circuit TailwindUtility strings and ArbitraryValue prefix-objects before
  // the expensive `T extends Styles` check. MetadataOfStyle returns {} for both of
  // these branches anyway, so the result is identical — skipping the O(3979) check.
  T extends string ? {}
  : T extends { readonly prefix: string } ? {}
  : T extends Styles ? MetadataOfStyle<T>
  : {};

type TwOf<T> =
  T extends readonly unknown[] ? TwOfStyle<T[number]>
  : T extends Styles ? TwOfStyle<T>
  : never;

type Styles_Metadata<T> = Eager<
  MetadataOf<T> & ([TwOf<T>] extends [never] ? {} : { tw: TwOf<T> })
>;

export type StylePropertyValue =
  | CssValue<CssDataType>
  | TemplateLiteralAst<CssDataType>
  | CssFunction
  | SpacingFunctionAst;

export type StyleProperties = {
  [K in keyof css.StyleProperties]?: StylePropertyValue | StylePropertyValue[];
};

export type StyleRuleBody =
  | StyleListAst
  | StyleRuleAst
  | TailwindClassAst<TailwindUtility>;

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
  | TailwindClassAst<TailwindUtility>
  | (StyleProperties & {
      $?: {
        [K in Selector]?: StyleRuleBodyBuilder | StyleRuleBodyBuilder[];
      };
    });

export type StyleRuleAst_WithMetadata<
  B extends StyleRuleBodyBuilder[] = never[],
> = WithMetadata<StyleRuleAst, Styles_Metadata<B>>;

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
    body: astBody,
  } as unknown as WithMetadata<
    StyleRuleAst,
    Styles_Metadata<{ $: { [K in S]: B } }>
  >;
}

// `string & {}` is listed first so TypeScript's assignability check short-circuits
// immediately for string-literal inputs instead of walking TailwindUtility's
// ~3979-member union. TailwindUtility ⊆ (string & {}), so all string utilities
// are still accepted; TailwindUtility is kept for IntelliSense completions.
export type StyleListBuilder =
  | (string & {})
  | StyleProperties
  | TailwindUtility
  | TailwindClassAst<TailwindUtility>;

export type StyleListAst = AstNode<
  "style-list",
  { styles: (StyleProperties | TailwindClassAst<TailwindUtility>)[] }
>;

export type StyleListAst_WithMetadata<B extends StyleListBuilder[] = never[]> =
  WithMetadata<StyleListAst, Styles_Metadata<B>>;

// Overload 1 — single-string fast path.
// When the caller passes exactly one string (including template-literal unions
// such as `palette-${Palette}`), TypeScript uses this overload and returns the
// plain `StyleListAst_WithMetadata` without instantiating the costly
// `Styles_Metadata<[union-of-7-strings]>` generic.  This prevents TS2590
// ("Expression produces a union type that is too complex to represent") that
// would otherwise occur because inference tries matching the string union
// against the full ~3979-member TailwindUtility constrained on `const B`.
export function styleList(style: string): StyleListAst_WithMetadata<never[]>;
// Overload 2 — generic with full metadata (StyleProperties CSS-var keys, tw names).
export function styleList<const B extends StyleListBuilder[]>(
  ...styles: B
): StyleListAst_WithMetadata<B>;
export function styleList<const B extends StyleListBuilder[]>(...styles: B) {
  return {
    $ast: "style-list" as const,
    styles: styles.map((s): StyleListAst["styles"][number] =>
      typeof s === "string" ? tw(s)
      : typeof s === "object" && "prefix" in s ? tw(s)
      : s,
    ),
  } as unknown as StyleListAst_WithMetadata<B>;
}
