import type { Eager, ExtendsNever, UnionToIntersection } from "../../utils/index.ts";
import type {
  AstNode,
  AstSpecDefinition,
  CombinedAstSpec,
  VisitorBuilder,
} from "./visitor-builder.types.ts";

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

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // Preserve toString methods and skip other functions
      if (typeof value !== "function" || key === "toString") {
        (cloned as Record<string, unknown>)[key] =
          typeof value === "function" ? value : deepClone(value);
      }
    }
  }

  return cloned;
}

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

    const nodeType = getNodeType(node, options, context);
    const handler = getHandlers(handlers, nodeType);

    let result = handler.enter(node, context);

    const resultNodeType = getNodeType(result, options, context);

    if (nodeType !== resultNodeType) {
      result = walk(result, context);
    } else if (result && typeof result === "object") {
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
      const result = walk(deepClone(node), {
        parent: undefined,
        key: undefined,
        index: undefined,
        path: undefined,
      });
      return result;
    },
  } as VisitorBuilder<CombinedAstSpec<Spec>, {}>;
}

function getNodeType(
  node: unknown,
  options: NonAstNodeOptions<AstSpecDefinition> | undefined,
  context: GenericVisitorContext,
) {
  return isAstNode(node) ?
      node.$ast
    : maybeNonAstNode(node, options, context)?.type;
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
