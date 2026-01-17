import type { ColorAst } from "./color";
import type { CssVarAst } from "./cssvar";

export type CssValueAst<VarKeys extends string = string> = {
  type: "css-value";
  strings: TemplateStringsArray;
  values: (ColorAst | CssVarAst<VarKeys>)[];
};

export function cssv<VarKeys extends string = string>(
  strings: TemplateStringsArray,
  ...values: (ColorAst | CssVarAst<VarKeys>)[]
) {
  return {
    type: "css-value",
    strings,
    values,
  } as CssValueAst<VarKeys>;
}
