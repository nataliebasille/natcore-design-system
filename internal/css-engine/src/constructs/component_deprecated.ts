import type {
  StylePropertyValue,
  StyleRuleBodyBuilder,
  StyleListAst_WithMetadata,
  StyleRuleAst_WithMetadata,
} from "../dsl/ast/style-rule.ts";
import { dsl, stylesheetVisitorBuilder } from "../dsl/public.ts";

export type ComponentConstruct<
  N extends string = string,
  V extends ComponentVariants = ComponentVariants,
  B extends StyleRuleBodyBuilder[] = StyleRuleBodyBuilder[],
> = {
  $construct: "component";
  name: N;
  styles: (StyleListAst_WithMetadata<B> | StyleRuleAst_WithMetadata<B>)[];
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

export type ComponentBuilder_Deprecated<
  T extends ComponentVariants,
  B extends StyleRuleBodyBuilder | StyleRuleBodyBuilder[],
> = {
  variants?: T;
  defaultVariant?: NoInfer<VariantName<T>>;
  styles: B;
};

export function component_deprecated<
  N extends string,
  T extends ComponentVariants,
  B extends StyleRuleBodyBuilder,
>(
  name: N,
  body: ComponentBuilder_Deprecated<T, B>,
): ComponentConstruct<N, T, [B]>;

export function component_deprecated<
  N extends string,
  T extends ComponentVariants,
  B extends StyleRuleBodyBuilder[],
>(
  name: N,
  body: ComponentBuilder_Deprecated<T, B>,
): ComponentConstruct<N, T, B>;

export function component_deprecated<
  N extends string,
  T extends ComponentVariants,
  B extends StyleRuleBodyBuilder | StyleRuleBodyBuilder[],
>(name: N, body: ComponentBuilder_Deprecated<T, B>) {
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

export function isThemeable(componentConstruct: ComponentConstruct) {
  let themeable = false;
  stylesheetVisitorBuilder()
    .on("color", (ast) => {
      themeable ||= ast.palette === "current";
      return ast;
    })
    .visit([componentConstruct.styles, componentConstruct.variants]);

  return themeable;
}

/**
 * Detects if a component should be generated as @utility component
 * @param componentConstruct
 */
export function hasStaticVariant(componentConstruct: ComponentConstruct) {
  const themable = isThemeable(componentConstruct);
  return !themable || !!componentConstruct.defaultVariant;
}

function normalizeStyleBuilders(
  builders: StyleRuleBodyBuilder | StyleRuleBodyBuilder[],
): (StyleListAst_WithMetadata | StyleRuleAst_WithMetadata)[] {
  const list: StyleRuleBodyBuilder[] =
    Array.isArray(builders) ? builders : [builders];

  return list.flatMap((builder) => {
    if (typeof builder === "object" && builder !== null && "$ast" in builder) {
      return [builder as StyleListAst_WithMetadata | StyleRuleAst_WithMetadata];
    }

    if (
      typeof builder === "string" ||
      (typeof builder === "object" && builder !== null && "prefix" in builder)
    ) {
      return [dsl.styleList(builder) as unknown as StyleListAst_WithMetadata];
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
    ] as (StyleListAst_WithMetadata | StyleRuleAst_WithMetadata)[];
  });
}
