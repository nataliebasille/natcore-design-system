import type {
  StyleListAst,
  StylePropertyValue,
  StyleRuleAst,
  StyleRuleBodyBuilder,
  StyleListAst_WithMetadata,
  StyleRuleAst_WithMetadata,
} from "../dsl/ast/style-rule.ts";
import { dsl } from "../dsl/public.ts";

export type ComponentConstruct<
  N extends string,
  V extends ComponentVariants,
  B extends StyleRuleBodyBuilder[],
> = {
  $construct: "component";
  name: N;
  styles: StyleListAst_WithMetadata<B> | StyleRuleAst_WithMetadata<B>;
  defaultVariant?: string;
  variants: V;
};

export type ComponentVariants = Record<
  string,
  { [K: `--${string}`]: StylePropertyValue }
> & {
  default?: { [K: `--${string}`]: StylePropertyValue };
};

type VariantName<T extends ComponentVariants> = Exclude<keyof T, "default"> &
  string;

export type ComponentBuilder<
  T extends ComponentVariants,
  B extends StyleRuleBodyBuilder | StyleRuleBodyBuilder[],
> = {
  variants?: T;
  defaultVariant?: NoInfer<VariantName<T>>;
  styles: B;
};

export function component<
  N extends string,
  T extends ComponentVariants,
  B extends StyleRuleBodyBuilder,
>(name: N, body: ComponentBuilder<T, B>): ComponentConstruct<N, T, [B]>;

export function component<
  N extends string,
  T extends ComponentVariants,
  B extends StyleRuleBodyBuilder[],
>(name: N, body: ComponentBuilder<T, B>): ComponentConstruct<N, T, B>;

export function component<
  N extends string,
  T extends ComponentVariants,
  B extends StyleRuleBodyBuilder | StyleRuleBodyBuilder[],
>(name: N, body: ComponentBuilder<T, B>) {
  const { styles, variants = {} } = body;

  return {
    $construct: "component",
    name,
    defaultVariant: body.defaultVariant,
    styles: normalizeStyleBuilders(styles),
    variants: variants ?? {},
  } as unknown as ComponentConstruct<
    N,
    T,
    B extends readonly unknown[] ? B : [B]
  >;
}

function normalizeStyleBuilders<
  B extends StyleRuleBodyBuilder | StyleRuleBodyBuilder[],
>(builders: B): (StyleListAst_WithMetadata | StyleRuleAst_WithMetadata)[] {
  const list = Array.isArray(builders) ? builders : [builders];

  return list.flatMap(
    (
      builder,
    ): (StyleListAst_WithMetadata<B> | StyleRuleAst_WithMetadata<B>)[] => {
      if (
        typeof builder === "object" &&
        builder !== null &&
        "$ast" in builder
      ) {
        return [
          builder as StyleListAst_WithMetadata | StyleRuleAst_WithMetadata,
        ];
      }

      if (
        typeof builder === "string" ||
        (typeof builder === "object" && builder !== null && "prefix" in builder)
      ) {
        return [dsl.styleList(builder)];
      }

      const { $, ...styles } = builder as dsl.StyleProperties & {
        $?: {
          [K in dsl.Selector]?: StyleRuleBodyBuilder | StyleRuleBodyBuilder[];
        };
      };

      return [
        ...(Object.keys(styles).length > 0 ?
          [dsl.styleList(styles as dsl.StyleProperties)]
        : []),
        ...(typeof $ === "object" && $ !== null ?
          Object.entries($).map(([selector, body]) =>
            dsl.styleRule(
              selector as dsl.Selector,
              ...((!body ? []
              : Array.isArray(body) ? body
              : [body]) as StyleRuleBodyBuilder[]),
            ),
          )
        : []),
      ];
    },
  );
}
