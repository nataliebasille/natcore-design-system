export type CssVarAst<N extends string = string> = {
  type: "css-var";
  name: N;
};

export function cssvar<const N extends string>(name: N): CssVarAst<N> {
  return {
    type: "css-var",
    name,
  } satisfies CssVarAst<N>;
}
