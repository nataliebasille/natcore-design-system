import type { Eager, ExtendsNever, UnionToIntersection } from "../../utils";
import type {
  AstNode,
  AstSpecDefinition,
  CombinedAstSpec,
  VisitorBuilder,
} from "./visitor-builder.types";

type NonAstNodeOptions<Spec extends AstSpecDefinition> = Eager<{
  [K in keyof CombinedAstSpec<Spec> as CombinedAstSpec<Spec>[K]["$in"] extends (
    AstNode<string>
  ) ?
    never
  : K]: {
    nodeIs(
      node: unknown,
      context: {
        parent?: Record<PropertyKey, unknown> | Array<unknown>;
        key?: PropertyKey | number;
        index?: number;
        path?: (PropertyKey | number)[];
      },
    ): node is CombinedAstSpec<Spec>[K]["$in"];
  };
}>;

type DefineVisitorParameters<Spec extends AstSpecDefinition> =
  ExtendsNever<
    Exclude<Spec, AstNode<string> | { $in: AstNode<string>; $out: unknown }>
  > extends true ?
    []
  : [NonAstNodeOptions<Spec>];

type GenericVisitorContext = {
  parent?: Record<PropertyKey, unknown> | Array<unknown>;
  key?: PropertyKey | number;
  index?: number;
  path?: (PropertyKey | number)[];
};

export function defineVisitor<Spec extends AstSpecDefinition>(
  ...parameters: DefineVisitorParameters<Spec>
): VisitorBuilder<CombinedAstSpec<Spec>, {}> {
  const [options] = parameters;
  const handlers: {
    [K: string]: {
      enter: Function[];
      exit: Function[];
    };
  } = {};

  function walk(node: unknown, context: GenericVisitorContext): unknown {
    if (node && node instanceof Array) {
      return node.map((child, index) =>
        walk(child, {
          parent: node,
          key: index,
          index,
          path: context.path ? [...context.path, index] : [index],
        }),
      );
    }

    const nodeType =
      isAstNode(node) ?
        node.$ast
      : maybeNonAstNode(node, options, context)?.type;
    const handler = getHandlers(handlers, nodeType);

    let result = handler.enter(node, context);

    if (result && typeof result === "object") {
      for (const key in result) {
        const child = (result as Record<PropertyKey, unknown>)[key];
        (result as Record<PropertyKey, unknown>)[key] = walk(child, {
          parent: result as Record<PropertyKey, unknown>,
          key,
          index: typeof key === "number" ? key : undefined,
          path: context.path ? [...context.path, key] : [key],
        });
      }
    }

    result = handler.exit(result, context);
    return result;
  }

  return {
    on(
      type: keyof Spec,
      handler: Function | { enter?: Function; exit?: Function },
    ) {
      if (!handlers[type as string]) {
        handlers[type as string] = {
          enter: [],
          exit: [],
        };
      }

      const enter = typeof handler === "function" ? handler : handler.enter;
      const exit = typeof handler === "function" ? undefined : handler.exit;
      if (enter) handlers[type as string]!.enter.push(enter);
      if (exit) handlers[type as string]!.exit.push(exit);
      return this;
    },

    visit(node: unknown) {
      const result = walk(structuredClone(node), {
        parent: undefined,
        key: undefined,
        index: undefined,
        path: undefined,
      });
      return result;
    },
  } as VisitorBuilder<CombinedAstSpec<Spec>, {}>;
}

function isAstNode<Spec extends AstSpecDefinition>(
  node: unknown,
): node is AstNode<Extract<Spec, AstNode<string>>["$ast"]> {
  return typeof node === "object" && node !== null && "$ast" in node;
}

function maybeNonAstNode<Spec extends AstSpecDefinition>(
  node: unknown,
  options: NonAstNodeOptions<Spec> | undefined,
  visitorContext: GenericVisitorContext,
) {
  if (!options) return undefined;

  for (const key in options) {
    const option =
      typeof key === "string" &&
      (
        options as NonAstNodeOptions<{
          [K: string]: { $in: unknown; $out: unknown };
        }>
      )[key];

    if (option && option.nodeIs?.(node, visitorContext)) {
      return { type: key, value: options[key] };
    }
  }

  return undefined;
}

function getHandlers(
  handlers: {
    [K: string]: {
      enter: Function[];
      exit: Function[];
    };
  },
  type: string | undefined,
) {
  const handlersForType = type ? handlers[type] : undefined;
  return {
    enter: (node: unknown, context: GenericVisitorContext) =>
      [...(handlersForType?.enter ?? [])].reduce(
        (prev, handler) => (handler ? handler(node, context) : prev),
        node,
      ),

    exit: (node: unknown, context: GenericVisitorContext) =>
      [...(handlersForType?.exit ?? [])].reduce(
        (prev, handler) => (handler ? handler(node, context) : prev),
        node,
      ),
  };
}
