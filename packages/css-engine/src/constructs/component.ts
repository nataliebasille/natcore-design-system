import type {
  StyleListAst,
  StylePropertyValue,
  StyleRuleAst,
  StyleRuleBodyBuilder,
} from "../dsl/ast/style-rule.ts";
import { dsl } from "../dsl/public.ts";

export type ComponentConstruct = {
  $construct: "component";
  name: string;
  styles: (StyleListAst | StyleRuleAst)[];
  defaultVariant?: string;
  variants: ComponentVariants;
};

export type ComponentVariants = Record<
  string,
  { [K: `--${string}`]: StylePropertyValue }
> & {
  default?: { [K: `--${string}`]: StylePropertyValue };
};

type VariantName<T extends ComponentVariants> = Exclude<keyof T, "default"> &
  string;

export type ComponentBuilder<T extends ComponentVariants = {}> = {
  variants?: T;
  defaultVariant?: NoInfer<VariantName<T>>;
  styles: StyleRuleBodyBuilder | StyleRuleBodyBuilder[];
};

export function component<T extends ComponentVariants = {}>(
  name: string,
  body: ComponentBuilder<T>,
) {
  const { styles, variants = {} } = body;

  return {
    $construct: "component",
    name,
    defaultVariant: body.defaultVariant,
    styles: normalizeStyleBuilders(styles),
    variants: variants ?? {},
  } satisfies ComponentConstruct;
}

function normalizeStyleBuilders(
  builders: StyleRuleBodyBuilder | StyleRuleBodyBuilder[],
): (StyleListAst | StyleRuleAst)[] {
  const list = Array.isArray(builders) ? builders : [builders];

  return list.flatMap((builder): (StyleListAst | StyleRuleAst)[] => {
    if (typeof builder === "object" && builder !== null && "$ast" in builder) {
      return [builder as StyleListAst | StyleRuleAst];
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
  });
}
