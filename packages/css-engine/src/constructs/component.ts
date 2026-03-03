import type { Palette } from "../dsl/ast/cssvalue/color";
import type {
  StyleListAst,
  StylePropertyValue,
  StyleRuleAst,
  StyleRuleBodyBuilder,
} from "../dsl/ast/style-rule";
import { dsl } from "../dsl/public";

export type ComponentConstruct = {
  $construct: "component";
  name: string;
  styles: (StyleListAst | StyleRuleAst)[];
  themeable: boolean | Palette;
  variants: Record<string, { [K: `--${string}`]: StylePropertyValue }>;
};

export function component(
  name: string,
  config: {
    styles: StyleRuleBodyBuilder | StyleRuleBodyBuilder[];
    themeable?: boolean | Palette;
    variants?: Record<string, { [K: `--${string}`]: StylePropertyValue }>;
  },
) {
  const { styles, themeable = false, variants = {} } = config;

  return {
    $construct: "component",
    name,
    styles: normalizeStyleBuilders(styles),
    themeable,
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
