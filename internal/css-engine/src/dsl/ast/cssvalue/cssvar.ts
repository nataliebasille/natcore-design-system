import type { AstNode } from "../../visitor/visitor-builder.types.ts";

export type VarLiteral = `--${string}`;
export type CssFunctionLike = { $function: string; toString(): string };
export type CssVarFallback =
  | CssVarAst<VarLiteral, any>
  | CssFunctionLike
  | string
  | number
  | undefined;
export type CssVarAst<
  N extends string = VarLiteral,
  F extends CssVarFallback = CssVarFallback,
> = AstNode<
  "css-var",
  {
    name: N;
    fallback?: F;
  }
>;

export function cssvar<const N extends VarLiteral>(name: N): CssVarAst<N>;
export function cssvar<
  const N extends VarLiteral,
  const F extends CssVarFallback,
>(name: N, fallback: F): CssVarAst<N, F>;
export function cssvar<
  const N extends VarLiteral,
  const F extends CssVarFallback,
>(name: N, fallback?: F): CssVarAst<N, F> {
  return {
    $ast: "css-var",
    name,
    ...(fallback !== undefined && { fallback }),
  } as CssVarAst<N, F>;
}
