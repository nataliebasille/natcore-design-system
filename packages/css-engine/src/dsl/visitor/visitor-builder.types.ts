// /* ============================================================
//    1) Core AST + parent inference

import type { Eager, ExtendsNever } from "../../utils";

export type AstNode<
  Id extends string,
  E extends Record<string, unknown> = {},
> = Eager<{ $ast: Id } & E>;

export type AstSpec = {
  $in: unknown;
  $out: unknown;
};

export type AstSpecIn<Spec extends AstSpec> = Spec["$in"];

export type AstSpecOut<Spec extends AstSpec> =
  Spec extends { $out: infer O } ? O : AstSpecIn<Spec>;

export type AstSpecDefinition =
  | AstNode<string>
  | { $in: AstNode<string>; $out: unknown }
  | {
      [K: string]: unknown | { $in: unknown; $out?: unknown };
    };

type NormalizeEntry<V> =
  V extends { $in: infer I; $out: infer O } ?
    { $in: I; $out: [I] extends [O] ? O : I | O }
  : V extends { $in: infer I } ? { $in: I; $out: I }
  : { $in: V; $out: V };

export type AstSpec_Normalize<Spec extends Record<string, unknown>> = {
  [K in keyof Spec & string]: NormalizeEntry<Spec[K]>;
};

export type NormalizedAstSpec = {
  [K: string]: AstSpec;
};

type IsAstNode<T> = T extends { $ast: string } ? true : false;
type AstIdOf<T> = T extends { $ast: infer I extends string } ? I : never;

type AstIndex<Spec extends NormalizedAstSpec> = {
  [K in keyof Spec & string as AstIdOf<Spec[K]["$in"]>]: K;
};

type NonAstKeys<Spec extends NormalizedAstSpec> = {
  [K in keyof Spec & string]: IsAstNode<Spec[K]["$in"]> extends true ? never
  : K;
}[keyof Spec & string];

type UpdateNode<
  Spec extends NormalizedAstSpec,
  OutMap extends VisitorOutMap<Spec>,
  Node,
> =
  // --- tuples: preserve readonly vs mutable ---
  Node extends readonly [infer First, ...infer Rest] ?
    readonly [
      ApplyOutMap<Spec, OutMap, First>,
      ...UpdateNode<Spec, OutMap, Rest>,
    ]
  : Node extends [infer First, ...infer Rest] ?
    [ApplyOutMap<Spec, OutMap, First>, ...UpdateNode<Spec, OutMap, Rest>]
  : Node extends readonly [] ? readonly []
  : Node extends [] ? []
  : // --- arrays: mutable first, then readonly ---
  Node extends (infer E)[] ? ApplyOutMap<Spec, OutMap, E>[]
  : Node extends readonly (infer E)[] ? readonly ApplyOutMap<Spec, OutMap, E>[]
  : // --- objects ---
  Node extends Record<string, unknown> ?
    {
      [K in keyof Node]: K extends "$ast" ? Node[K]
      : ApplyOutMap<Spec, OutMap, Node[K]>;
    }
  : Node;

type RemapMappedAstResult<
  Spec extends NormalizedAstSpec,
  OutMap extends VisitorOutMap<Spec>,
  MappedNode,
  SourceKey extends keyof Spec,
  Idx extends Record<string, keyof Spec>,
> =
  MappedNode extends unknown ?
    IsAstNode<MappedNode> extends true ?
      AstIdOf<MappedNode> extends infer ReturnedId extends string ?
        ReturnedId extends keyof Idx ?
          Idx[ReturnedId] extends infer ReturnedKey extends keyof Spec ?
            ReturnedKey extends SourceKey ?
              UpdateNode<Spec, OutMap, MappedNode>
            : ApplyOutMap<Spec, OutMap, MappedNode>
          : UpdateNode<Spec, OutMap, MappedNode>
        : UpdateNode<Spec, OutMap, MappedNode>
      : UpdateNode<Spec, OutMap, MappedNode>
    : UpdateNode<Spec, OutMap, MappedNode>
  : never;

type ApplyOne<
  Spec extends NormalizedAstSpec,
  OutMap extends VisitorOutMap<Spec>,
  Node,
  Idx extends Record<string, keyof Spec>,
  NonAst extends keyof Spec,
> =
  IsAstNode<Node> extends true ?
    AstIdOf<Node> extends infer Id extends string ?
      Id extends keyof Idx ?
        Idx[Id] extends infer K extends keyof Spec ?
          K extends keyof OutMap ?
            RemapMappedAstResult<Spec, OutMap, OutMap[K], K, Idx>
          : UpdateNode<Spec, OutMap, Node>
        : UpdateNode<Spec, OutMap, Node>
      : UpdateNode<Spec, OutMap, Node>
    : UpdateNode<Spec, OutMap, Node>
  : // only attempt non-ast handlers when node isn't ast
  Extract<NonAst, keyof OutMap> extends infer K2 ?
    [K2] extends [never] ?
      UpdateNode<Spec, OutMap, Node>
    : OutMap[K2 & keyof OutMap]
  : UpdateNode<Spec, OutMap, Node>;

type UnionKeys<U> = U extends U ? keyof U : never;

type MergeUnionObjects<U> = {
  [K in UnionKeys<U>]: U extends Record<K, unknown> ? U[K] : never;
};

type UnifiedSpec<Specs extends AstSpecDefinition> = MergeUnionObjects<
  // 1) Plain AstNode<string> members -> keyed by $ast, { $in: node; $out: node }
  | (Extract<Specs, AstNode<string>> extends infer N ?
      N extends AstNode<infer Id> ?
        { [K in Id]: { $in: N; $out: N } }
      : never
    : never)

  // 2) Explicit { $in: AstNode<string>; $out: unknown } members -> keyed by $in.$ast
  | (Extract<Specs, { $in: AstNode<string>; $out: unknown }> extends infer S ?
      S extends { $in: AstNode<infer Id> } ?
        { [K in Id]: S }
      : never
    : never)

  // 3) Object-map members { [K: string]: ... } pass through as-is
  | Exclude<Specs, AstNode<string> | { $in: unknown; $out: unknown }>
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
  Node extends unknown ?
    ApplyOne<Spec, OutMap, Node, AstIndex<Spec>, NonAstKeys<Spec>>
  : never;

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
  Out,
> = (
  node: AstSpecIn<Spec[Id]>,
  context: VisitorContext<Spec, AstSpecIn<Spec[Id]>, OutMap>,
) => Out;

type WithSelfDeclared<
  Spec extends NormalizedAstSpec,
  OutMap extends VisitorOutMap<Spec>,
  K extends keyof Spec,
> = OutMap & { [P in K]: AstSpecOut<Spec[K]> };

export type VisitorBuilder<
  Spec extends NormalizedAstSpec,
  OutMap extends VisitorOutMap<Spec>,
> = {
  // enter+exit
  on<K extends keyof Spec, EnterOut, ExitOut extends AstSpecOut<Spec[K]>>(
    type: K,
    handler: {
      enter: VisitorFunctionEnter<Spec, OutMap, K, EnterOut>;
      exit: (
        node: ApplyOutMap<Spec, WithSelfDeclared<Spec, OutMap, K>, EnterOut>,
        context: VisitorContext<
          Spec,
          AstSpecIn<Spec[K]>,
          WithSelfDeclared<Spec, OutMap, K>
        >,
      ) => ExitOut;
    },
  ): VisitorBuilder<Spec, OutMap & { [P in K]: ExitOut }>;

  // enter-only (single function)
  on<K extends keyof Spec, Out extends AstSpecOut<Spec[K]>>(
    type: K,
    handler: VisitorFunctionEnter<Spec, OutMap, K, Out>,
  ): VisitorBuilder<Spec, OutMap & { [P in K]: Out }>;

  // enter-only (object)
  on<K extends keyof Spec, EnterOut extends AstSpecOut<Spec[K]>>(
    type: K,
    handler: {
      enter: VisitorFunctionEnter<Spec, OutMap, K, EnterOut>;
      exit?: never;
    },
  ): VisitorBuilder<Spec, OutMap & { [P in K]: EnterOut }>;

  // exit-only  ✅ recursion works, no circular inference
  on<K extends keyof Spec, ExitOut extends AstSpecOut<Spec[K]>>(
    type: K,
    handler: {
      enter?: never;
      exit: (
        node: ApplyOutMap<
          Spec,
          WithSelfDeclared<Spec, OutMap, K>,
          AstSpecIn<Spec[K]>
        >,
        context: VisitorContext<
          Spec,
          AstSpecIn<Spec[K]>,
          WithSelfDeclared<Spec, OutMap, K>
        >,
      ) => ExitOut;
    },
  ): VisitorBuilder<Spec, OutMap & { [P in K]: ExitOut }>;

  visit<Node extends readonly any[]>(
    node: Node,
  ): ApplyOutMap<Spec, OutMap, Node>;

  visit<Node>(node: Node): ApplyOutMap<Spec, OutMap, Node>;
};
