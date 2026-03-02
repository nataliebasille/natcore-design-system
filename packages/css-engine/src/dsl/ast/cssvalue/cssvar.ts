import type { AstNode } from "../../visitor/visitor-builder.types";

export type VarLiteral = `--${string}`;
export type CssVarAst<
  N extends string = VarLiteral,
  F = string | number | undefined,
> = AstNode<
  "css-var",
  {
    name: N;
    fallback?: F;
  }
>;

export function cssvar<const N extends VarLiteral>(name: N): CssVarAst<N>;
export function cssvar<const N extends VarLiteral, const F>(
  name: N,
  fallback: F,
): CssVarAst<N, F>;
export function cssvar<const N extends VarLiteral, const F>(
  name: N,
  fallback?: F,
): CssVarAst<N, F> {
  return {
    $ast: "css-var",
    name,
    ...(fallback !== undefined && { fallback }),
  } as CssVarAst<N, F>;
}
