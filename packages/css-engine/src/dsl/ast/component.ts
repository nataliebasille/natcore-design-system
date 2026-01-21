import type { CssVarAst } from "./cssvar";
import type { StyleProperties } from "./styleRule";

type ComponentFactoryOptions<VarKeys extends string = string> = {
  vars?: Record<string, unknown>;
  base?: StyleProperties<VarKeys>;
  variants?: Record<string, StyleProperties<VarKeys>>;
};

export type ComponentVars = Record<string, string | number | CssVarAst>;

export type ComponentAst<
  Vars extends Readonly<ComponentVars> | undefined = Readonly<ComponentVars>,
> = {
  type: "component";
  name: string;
  vars?: Vars;
  base?: StyleProperties<keyof Vars & string>;
  variants?: Record<string, StyleProperties<keyof Vars & string>>;
};

export function component<
  const T extends string,
  const V extends ComponentVars,
  const F extends ComponentFactoryOptions<keyof V & string>,
>(name: T, { vars, base, variants }: F & { vars: V }) {
  return {
    type: "component",
    name,
    vars,
    base,
    variants,
  } satisfies ComponentAst<V>;
}

// Example usage showing typed cssvar autocomplete
// const x = component("btn", {
//   vars: {
//     "size-base": "1rem",
//     "bg-color": "#fff",
//   },
//   base: {
//     padding: cssvar("size-base"), // should autocomplete "size-base" and "bg-color"
//     backgroundColor: cssvar("bg-color"),
//   },
//   variants: {
//     large: {
//       padding: cssvar("size-base"), // should autocomplete "size-base" and "bg-color"
//     }
//   }
// });
