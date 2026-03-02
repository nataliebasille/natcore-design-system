import type { Palette } from "../dsl/ast/cssvalue/color";
import type {
  StyleProperties,
  StyleRuleBodyBuilder,
} from "../dsl/ast/style-rule";

export type ComponentConstruct = {
  $construct: "component";
  name: string;
  baseStyles: StyleRuleBodyBuilder;
  themeable: boolean | Palette;
  variants: Record<string, StyleRuleBodyBuilder>;
};

export function component<N extends string, P extends StyleProperties>(
  name: N,
  baseStyles: P,
  options: NoInfer<{
    themeable?: boolean | Palette;
    variants?: Record<string, StyleRuleBodyBuilder>;
  }> = {},
) {
  const { themeable = false, variants = {} } = options;
  return {
    $construct: "component",
    name,
    baseStyles,
    themeable,
    variants,
  } satisfies ComponentConstruct;
}
