import type { FunctionAst } from "./internal.ts";

export type SpacingFunctionAst = FunctionAst<"spacing", { value: string }> & {
  toString: () => string;
};

export function spacing<V extends SpacingFunctionAst["value"]>(value: V) {
  return {
    $ast: "function-spacing",
    value,
    toString() {
      return `--spacing(${value})`;
    },
  } satisfies SpacingFunctionAst;
}
