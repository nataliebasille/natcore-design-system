import type { StyleProperties } from "./styleRule";

type ComponentFactoryOptions<VarKeys extends string = string> = {
  vars?: Record<string, unknown>;
  base?: StyleProperties<VarKeys>;
  variants?: Record<string, StyleProperties<VarKeys>>;
};

export type ComponentAst<
  VarKeys extends string = string,
  V extends Readonly<Record<string, unknown>> | undefined = undefined,
> = {
  type: "component";
  name: string;
  vars?: V;
  base?: StyleProperties<VarKeys>;
  variants?: Record<string, StyleProperties<VarKeys>>;
};

export function component<
  const T extends string,
  const V extends Record<string, unknown>,
  const F extends ComponentFactoryOptions<keyof V & string>,
>(name: T, { vars, base, variants }: F & { vars: V }) {
  return null as unknown as ComponentAst<keyof V & string, V>;
  // return {
  //   type: "component",
  //   name,
  //   vars,
  //   base,
  //   variants,
  // } as const satisfies ComponentAst<keyof V & string, V>;
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
