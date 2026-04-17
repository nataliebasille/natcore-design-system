import type { FunctionAst } from "./internal.ts";

export type SpacingFunctionAst = FunctionAst<"spacing", { value: string }> & {
  toString: () => string;
};

export function spacing<V extends SpacingFunctionAst["value"]>(value: V) {
  const result = {
    $ast: "function-spacing" as const,
    value,
  };
  Object.defineProperty(result, "toString", {
    value() {
      return `--spacing(${value})`;
    },
    enumerable: false,
    configurable: true,
    writable: true,
  });
  return result as typeof result & { toString: () => string };
}
