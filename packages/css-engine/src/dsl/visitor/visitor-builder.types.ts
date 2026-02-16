// /* ============================================================
//    1) Core AST + parent inference

import type { Eager, ExtendsNever, UnionToIntersection } from "../../utils";

export type AstNode<
  Id extends string,
  E extends Record<string, unknown> = {},
> = Eager<{ $ast: Id } & E>;
export type AstSpec = {
  $in: unknown;
  $out: unknown;
};

export type AstSpecIn<Spec extends AstSpec> =
  Spec extends { $in: infer I } ? I : never;

export type AstSpecOut<Spec extends AstSpec> =
  Spec extends { $out: infer O } ? O : AstSpecIn<Spec>;

export type AstSpecDefinition =
  | AstNode<string>
  | { $in: AstNode<string>; $out: unknown }
  | {
      [K: string]: unknown | { $in: unknown; $out?: unknown };
    };

export type AstSpec_Normalize<Spec extends AstSpecDefinition> = {
  [K in keyof Spec & string]: Spec[K] extends { $in: infer I; $out: infer O } ?
    { $in: I; $out: I extends O ? O : I | O }
  : Spec[K] extends { $in: infer I } ? { $in: I; $out: I }
  : { $in: Spec[K]; $out: Spec[K] };
};

export type NormalizedAstSpec = {
  [K: string]: AstSpec;
};

type UnifiedSpec<Specs extends AstSpecDefinition> = {
  [K in Extract<Specs, AstNode<string>> as K["$ast"]]: { $in: K; $out: K };
} & {
  [K in Extract<
    Specs,
    { $in: AstNode<string>; $out: unknown }
  > as K["$in"]["$ast"]]: K;
} & UnionToIntersection<
    Specs extends infer S ?
      S extends { $in: AstNode<infer Id> } ?
        { [K in Id]: S }
      : never
    : never
  > &
  UnionToIntersection<
    Exclude<Specs, AstNode<string> | { $in: unknown; $out: unknown }>
  >;

export type CombinedAstSpec<Specs extends AstSpecDefinition> =
  AstSpec_Normalize<{
    [K in keyof UnifiedSpec<Specs>]: UnifiedSpec<Specs>[K];
  }>;

export type VisitorOutMap<Spec extends NormalizedAstSpec> = {
  [K in keyof Spec]?: AstSpecOut<Spec[K]>;
};

export type ApplyOutMap<
  Spec extends NormalizedAstSpec,
  OutMap extends VisitorOutMap<Spec>,
  Node,
> =
  KeysForNode<Spec, Node> extends infer K ?
    ExtendsNever<K> extends true ? UpdateNodeWithOutMap<Spec, OutMap, Node>
    : Extract<K, keyof OutMap> extends infer HandlerKeys ?
      ExtendsNever<HandlerKeys> extends true ?
        // No handlers for this node type
        UpdateNodeWithOutMap<Spec, OutMap, Node>
      : // Has handler(s) - pick first/any since they should be mutually exclusive
        UpdateNodeWithOutMap<Spec, OutMap, OutMap[HandlerKeys & keyof OutMap]>
    : never
  : UpdateNodeWithOutMap<Spec, OutMap, Node>;

type UpdateNodeWithOutMap<
  Spec extends NormalizedAstSpec,
  OutMap extends VisitorOutMap<Spec>,
  Node,
> =
  Node extends readonly (infer E)[] ? UpdateNodeWithOutMap<Spec, OutMap, E>[]
  : Node extends Record<string, unknown> ?
    {
      [K in keyof Node]: K extends "$ast" ? Node[K]
      : ApplyOutMap<Spec, OutMap, Node[K]>;
    }
  : Node;

type KeysForNode<Spec extends NormalizedAstSpec, Node> = {
  [K in keyof Spec]: Node extends AstNode<infer NodeId> ?
    // Node is an AST node - only match if Spec $in is same AST node type
    Spec[K]["$in"] extends AstNode<NodeId> ?
      K
    : never
  : // Node is NOT an AST node - only match if Spec $in is also not an AST node
  Spec[K]["$in"] extends AstNode<string> ? never
  : Node extends Spec[K]["$in"] ? K
  : never;
}[keyof Spec];

export type ParentsOf<
  Spec extends NormalizedAstSpec,
  Node extends AstSpecIn<Spec[keyof Spec & string]>,
> = {
  [K in keyof Spec & string]: ContainsChild<Spec[K]["$in"], Node> extends true ?
    Spec[K]["$in"]
  : never;
}[keyof Spec & string];

type PropContainsChild<Prop, Child> =
  // Distribute over unions so each member is checked individually
  Prop extends infer U ?
    [Child] extends [U] ?
      // Guard against vacuous index-signature matches:
      // if key sets don't overlap, check the value type instead
      ExtendsNever<keyof U & keyof Child> extends true ?
        [Child] extends [U[keyof U]] ?
          true
        : false
      : true
    : U extends readonly (infer E)[] ?
      [Child] extends [E] ?
        true
      : false
    : false
  : false;

type ContainsChild<Parent, Child> =
  true extends (
    {
      [K in keyof Parent]-?: PropContainsChild<Parent[K], Child>;
    }[keyof Parent]
  ) ?
    true
  : false;

export type VisitorContext<
  Spec extends NormalizedAstSpec,
  Node extends AstSpecIn<Spec[keyof Spec]>,
  OutMap extends VisitorOutMap<Spec>,
> = {
  parent?: ApplyOutMap<Spec, OutMap, ParentsOf<Spec, Node>>;
  key?: PropertyKey;
  index?: number;
  path?: (string | number)[];
};

type VisitorFunctionEnter<
  Spec extends NormalizedAstSpec,
  OutMap extends VisitorOutMap<Spec>,
  Id extends keyof Spec,
  Out extends AstSpecOut<Spec[Id]>,
> = (
  node: AstSpecIn<Spec[Id]>,
  context: VisitorContext<Spec, AstSpecIn<Spec[Id]>, OutMap>,
) => Out;

type VisitorFunctionExit<
  Spec extends NormalizedAstSpec,
  OutMap extends VisitorOutMap<Spec>,
  Id extends keyof Spec,
  Out extends AstSpecOut<Spec[Id]>,
> = (
  node: ApplyOutMap<Spec, OutMap, AstSpecIn<Spec[Id]>>,
  context: VisitorContext<Spec, AstSpecIn<Spec[Id]>, OutMap>,
) => Out;

type VisitorEventFunctions<
  Spec extends NormalizedAstSpec,
  OutMap extends VisitorOutMap<Spec>,
  Id extends keyof Spec,
  EnterOut extends AstSpecOut<Spec[Id]>,
  ExitOut extends AstSpecOut<Spec[Id]> = EnterOut,
> = {
  enter?: VisitorFunctionEnter<Spec, OutMap, Id, EnterOut>;
  exit?: VisitorFunctionExit<Spec, OutMap, Id, ExitOut>;
};

export type VisitorBuilder<
  Spec extends NormalizedAstSpec,
  OutMap extends VisitorOutMap<Spec>,
> = {
  on<K extends keyof Spec, Out extends AstSpecOut<Spec[K]>>(
    type: K,
    handler: VisitorFunctionEnter<Spec, OutMap, K, Out>,
  ): VisitorBuilder<Spec, OutMap & { [P in K]: Out }>;

  on<
    K extends keyof Spec,
    EnterOut extends AstSpecOut<Spec[K]>,
    ExitOut extends AstSpecOut<Spec[K]> = EnterOut,
  >(
    type: K,
    handler: VisitorEventFunctions<Spec, OutMap, K, EnterOut, ExitOut>,
  ): VisitorBuilder<Spec, OutMap & { [P in K]: ExitOut }>;

  visit<Node extends readonly AstSpecIn<Spec[keyof Spec]>[]>(
    node: Node,
  ): ApplyOutMap<Spec, OutMap, Node>;
  visit<Node extends AstSpecIn<Spec[keyof Spec]>>(
    node: Node,
  ): ApplyOutMap<Spec, OutMap, Node>;
};
