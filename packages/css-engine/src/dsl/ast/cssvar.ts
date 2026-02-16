import type { AstNode } from "../visitor/visitor-builder.types";

export type CssVarAst<N extends string = string> = AstNode<
  "css-var",
  {
    name: N;
  }
>;

export function cssvar<const N extends string>(name: N): CssVarAst<N> {
  return {
    $ast: "css-var",
    name,
  } satisfies CssVarAst<N>;
}
