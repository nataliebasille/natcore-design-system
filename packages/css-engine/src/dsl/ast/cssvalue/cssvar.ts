import type { AstNode } from "../../visitor/visitor-builder.types.ts";

export type VarLiteral = `--${string}`;
export type CssVarAst<
  N extends string = VarLiteral,
  F extends CssVarAst<VarLiteral, any> | string | number | undefined =
    | CssVarAst<VarLiteral, any>
    | string
    | number
    | undefined,
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
  const F extends CssVarAst<VarLiteral, any> | string | number | undefined,
>(name: N, fallback: F): CssVarAst<N, F>;
export function cssvar<
  const N extends VarLiteral,
  const F extends CssVarAst<VarLiteral, any> | string | number | undefined,
>(name: N, fallback?: F): CssVarAst<N, F> {
  return {
    $ast: "css-var",
    name,
    ...(fallback !== undefined && { fallback }),
  } as CssVarAst<N, F>;
}
