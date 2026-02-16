import type { FunctionAst } from "./internal";

export type SpacingFunctionAst = FunctionAst<"spacing", { value: string }>;

export function spacing<V extends SpacingFunctionAst["value"]>(value: V) {
  return {
    $ast: "function-spacing",
    value,
  } satisfies SpacingFunctionAst;
}
