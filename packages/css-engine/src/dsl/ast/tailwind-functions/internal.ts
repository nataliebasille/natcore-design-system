import type { AstNode } from "../../visitor/visitor-builder.types";

export type FunctionAst<
  T extends string,
  P extends Record<string, unknown>,
> = AstNode<`function-${T}`, P>;
