import type { AstNode } from "../visitor/visitor-builder.types";
import type { Palette } from "./color";
import type { ExtractVarKeys, StyleProperties } from "./styleRule";

export type ComponentAst = AstNode<
  "component",
  {
    name: string;
    baseStyles: StyleProperties<string>;
    themeable: boolean | string;
    variants: Record<string, StyleProperties<string>>;
  }
>;

export function component<N extends string, P extends StyleProperties<string>>(
  name: N,
  baseStyles: P,
  options: NoInfer<{
    themeable?: boolean | Palette;
    variants?: Record<
      string,
      StyleProperties<ExtractVarKeys<P> | (string & {})>
    >;
  }> = {},
) {
  const { themeable = false, variants = {} } = options;
  return {
    $ast: "component",
    name,
    baseStyles,
    themeable,
    variants,
  } satisfies ComponentAst;
}
