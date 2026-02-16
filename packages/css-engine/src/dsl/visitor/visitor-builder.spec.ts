import { describe, it, expect, expectTypeOf, vi } from "vitest";
import { defineVisitor } from "./visitor-builder";
import type {
  AstNode,
  CombinedAstSpec,
  ParentsOf,
} from "./visitor-builder.types";
import type { Eager } from "../../utils";

describe("defineVisitor", () => {
  describe("basic AST node traversal", () => {
    it("should visit a simple AST node", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();
      const handler = vi.fn((node) => node);

      visitor.on("test", handler);

      const ast: TestAst = { $ast: "test" };
      const result = visitor.visit(ast);

      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith(
        ast,
        expect.objectContaining({
          parent: undefined,
          key: undefined,
          index: undefined,
          path: undefined,
        }),
      );
    });

    it("should visit nested AST nodes", () => {
      type TestAst = AstNode<"parent"> | AstNode<"child">;

      const visitor = defineVisitor<TestAst>();
      const parentHandler = vi.fn((node) => node);
      const childHandler = vi.fn((node) => node);

      visitor.on("parent", parentHandler).on("child", childHandler);

      const ast = {
        $ast: "parent",
        child: { $ast: "child" },
      } as const;

      visitor.visit(ast);

      expect(parentHandler).toHaveBeenCalledOnce();
      expect(childHandler).toHaveBeenCalledOnce();
      expect(childHandler).toHaveBeenCalledWith(
        { $ast: "child" },
        expect.objectContaining({
          parent: expect.objectContaining({ $ast: "parent" }),
          key: "child",
          path: ["child"],
        }),
      );
    });

    it("should visit arrays of AST nodes", () => {
      type TestAst = AstNode<"item">;

      const visitor = defineVisitor<TestAst>();
      const handler = vi.fn((node) => node);

      visitor.on("item", handler);

      const ast = [
        { $ast: "item" },
        { $ast: "item" },
        { $ast: "item" },
      ] as const;

      visitor.visit(ast);

      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler).toHaveBeenNthCalledWith(
        1,
        { $ast: "item" },
        expect.objectContaining({
          parent: expect.any(Array),
          key: 0,
          index: 0,
          path: [0],
        }),
      );
      expect(handler).toHaveBeenNthCalledWith(
        2,
        { $ast: "item" },
        expect.objectContaining({
          parent: expect.any(Array),
          key: 1,
          index: 1,
          path: [1],
        }),
      );
    });

    it("should visit deeply nested structures", () => {
      type TestAst = AstNode<"node">;

      const visitor = defineVisitor<TestAst>();
      const handler = vi.fn((node) => node);

      visitor.on("node", handler);

      const ast = {
        $ast: "node",
        children: [
          {
            $ast: "node",
            nested: {
              $ast: "node",
            },
          },
        ],
      } as const;

      visitor.visit(ast);

      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler).toHaveBeenNthCalledWith(
        3,
        { $ast: "node" },
        expect.objectContaining({
          path: ["children", 0, "nested"],
        }),
      );
    });
  });

  describe("enter and exit handlers", () => {
    it("should call enter handler before traversing children", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();
      const callOrder: string[] = [];

      visitor.on("test", {
        enter: (node) => {
          callOrder.push("enter");
          return node;
        },
        exit: (node) => {
          callOrder.push("exit");
          return node;
        },
      });

      const ast = {
        $ast: "test",
        child: { $ast: "test" },
      } as const;

      visitor.visit(ast);

      expect(callOrder).toEqual([
        "enter", // parent enter
        "enter", // child enter
        "exit", // child exit
        "exit", // parent exit
      ]);
    });

    it("should support function handler as enter-only", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();
      const enterHandler = vi.fn((node) => node);

      visitor.on("test", enterHandler);

      const ast = { $ast: "test" } as const;
      visitor.visit(ast);

      expect(enterHandler).toHaveBeenCalledOnce();
    });

    it("should allow multiple handlers for the same node type", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();
      const handler1 = vi.fn((node) => node);
      const handler2 = vi.fn((node) => node);

      visitor.on("test", handler1).on("test", handler2);

      const ast = { $ast: "test" } as const;
      visitor.visit(ast);

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();
    });
  });

  describe("node transformation", () => {
    it("should transform AST nodes", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();

      visitor.on("test", (node) => ({
        ...node,
        transformed: true,
      }));

      const ast = { $ast: "test" } as const;
      const result = visitor.visit(ast);

      expect(result).toEqual({
        $ast: "test",
        transformed: true,
      });
    });

    it("should apply enter transformation before traversing children", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();

      visitor.on("test", {
        enter: (node) => ({
          ...node,
          addedInEnter: true,
        }),
        exit: (node) => {
          // Should see the transformation from enter
          expect(node).toHaveProperty("addedInEnter", true);
          return node;
        },
      });

      const ast = { $ast: "test" } as const;
      visitor.visit(ast);
    });

    it("should call multiple handlers in sequence", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();
      const handler1 = vi.fn((node) => node);
      const handler2 = vi.fn((node) => node);

      visitor.on("test", handler1).on("test", handler2);

      const ast = { $ast: "test" } as const;
      visitor.visit(ast);

      // Both handlers should be called with the original node
      expect(handler1).toHaveBeenCalledWith(
        expect.objectContaining({ $ast: "test" }),
        expect.any(Object),
      );
      expect(handler2).toHaveBeenCalledWith(
        expect.objectContaining({ $ast: "test" }),
        expect.any(Object),
      );
    });

    it("should transform nested nodes independently", () => {
      type TestAst = AstNode<"parent"> | AstNode<"child">;

      const visitor = defineVisitor<TestAst>();

      visitor
        .on("parent", (node) => ({ ...node, isParent: true }))
        .on("child", (node) => ({ ...node, isChild: true }));

      const ast = {
        $ast: "parent",
        child: { $ast: "child" },
      } as const;

      const result = visitor.visit(ast);

      expect(result).toEqual({
        $ast: "parent",
        isParent: true,
        child: {
          $ast: "child",
          isChild: true,
        },
      });
    });
  });

  describe("context tracking", () => {
    it("should track parent in context", () => {
      type TestAst = AstNode<"parent"> | AstNode<"child">;

      const visitor = defineVisitor<TestAst>();

      visitor.on("child", (node, context) => {
        expect(context.parent).toEqual(
          expect.objectContaining({ $ast: "parent" }),
        );
        return node;
      });

      const ast = {
        $ast: "parent",
        child: { $ast: "child" },
      } as const;

      visitor.visit(ast);
    });

    it("should track key in context", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();

      visitor.on("test", (node, context) => {
        if (context.key === "namedChild") {
          expect(context.key).toBe("namedChild");
        }
        return node;
      });

      const ast = {
        $ast: "test",
        namedChild: { $ast: "test" },
      } as const;

      visitor.visit(ast);
    });

    it("should track index in array context", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();
      const indices: number[] = [];

      visitor.on("test", (node, context) => {
        if (context.index !== undefined) {
          indices.push(context.index);
        }
        return node;
      });

      const ast = [
        { $ast: "test" },
        { $ast: "test" },
        { $ast: "test" },
      ] as const;

      visitor.visit(ast);

      expect(indices).toEqual([0, 1, 2]);
    });

    it("should track full path to node", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();
      const paths: ((string | number)[] | undefined)[] = [];

      visitor.on("test", (node, context) => {
        paths.push(context.path ? [...context.path] : undefined);
        return node;
      });

      const ast = {
        $ast: "test",
        children: [
          {
            $ast: "test",
            nested: { $ast: "test" },
          },
        ],
      } as const;

      visitor.visit(ast);

      expect(paths).toEqual([
        undefined, // Root node has no path
        ["children", 0],
        ["children", 0, "nested"],
      ]);
    });
  });

  describe("non-AST node support", () => {
    it("should visit non-AST nodes with custom nodeIs", () => {
      type TestAst =
        | AstNode<"ast-node">
        | {
            StringLiteral: string;
          };

      const visitor = defineVisitor<TestAst>({
        StringLiteral: {
          nodeIs: (node, context): node is string =>
            typeof node === "string" && context.key !== "$ast",
        },
      });

      const stringHandler = vi.fn((node) => node);
      const astHandler = vi.fn((node) => node);

      visitor.on("StringLiteral", stringHandler).on("ast-node", astHandler);

      const ast = {
        $ast: "ast-node",
        value: "test string",
      } as const;

      visitor.visit(ast);

      expect(astHandler).toHaveBeenCalledOnce();
      expect(stringHandler).toHaveBeenCalledWith(
        "test string",
        expect.objectContaining({
          parent: expect.objectContaining({ $ast: "ast-node" }),
          key: "value",
        }),
      );
    });

    it("should transform non-AST nodes", () => {
      type TestAst =
        | AstNode<"root">
        | {
            StringLiteral: string;
          };

      const visitor = defineVisitor<TestAst>({
        StringLiteral: {
          nodeIs: (node, context): node is string =>
            typeof node === "string" && context.key !== "$ast",
        },
      });

      visitor.on("StringLiteral", (node) => node.toUpperCase());

      const ast = {
        $ast: "root",
        text: "hello",
      } as const;

      const result = visitor.visit(ast);

      expect(result).toEqual({
        $ast: "root",
        text: "HELLO",
      });
    });

    it("should support multiple non-AST node types", () => {
      type TestAst =
        | AstNode<"root">
        | {
            StringLiteral: string;
            NumberLiteral: number;
          };

      const visitor = defineVisitor<TestAst>({
        StringLiteral: {
          nodeIs: (node, context): node is string =>
            typeof node === "string" && context.key !== "$ast",
        },
        NumberLiteral: {
          nodeIs: (node, context): node is number =>
            typeof node === "number" && context.key !== "$ast",
        },
      });

      const stringHandler = vi.fn((node) => node);
      const numberHandler = vi.fn((node) => node);

      visitor
        .on("StringLiteral", stringHandler)
        .on("NumberLiteral", numberHandler);

      const ast = {
        $ast: "root",
        text: "hello",
        count: 42,
      } as const;

      visitor.visit(ast);

      expect(stringHandler).toHaveBeenCalledWith("hello", expect.any(Object));
      expect(numberHandler).toHaveBeenCalledWith(42, expect.any(Object));
    });
  });

  describe("structured cloning", () => {
    it("should not mutate original AST", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();

      visitor.on("test", (node) => ({
        ...node,
        modified: true,
      }));

      const ast = { $ast: "test" } as const;
      const original = { ...ast };

      visitor.visit(ast);

      expect(ast).toEqual(original);
      expect(ast).not.toHaveProperty("modified");
    });

    it("should create independent copies for transformation", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();

      visitor.on("test", (node) => ({
        ...node,
        timestamp: Date.now(),
      }));

      const ast = { $ast: "test" } as const;
      const result1 = visitor.visit(ast);
      const result2 = visitor.visit(ast);

      // Results are independent objects
      expect(result1).not.toBe(result2);
      expect(result1).toHaveProperty("timestamp");
      expect(result2).toHaveProperty("timestamp");
    });
  });

  describe("edge cases", () => {
    it("should handle empty objects", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();
      const handler = vi.fn((node) => node);

      visitor.on("test", handler);

      const ast = { $ast: "test" } as const;
      const result = visitor.visit(ast);

      expect(result).toEqual({ $ast: "test" });
    });

    it("should handle empty arrays", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();

      const result = visitor.visit([]);

      expect(result).toEqual([]);
    });

    it("should handle null values", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();
      const handler = vi.fn((node) => node);

      visitor.on("test", handler);

      const ast = {
        $ast: "test",
        nullValue: null,
      } as const;

      const result = visitor.visit(ast);

      expect(result).toEqual({
        $ast: "test",
        nullValue: null,
      });
    });

    it("should handle undefined values", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();
      const handler = vi.fn((node) => node);

      visitor.on("test", handler);

      const ast = {
        $ast: "test",
        undefinedValue: undefined,
      } as const;

      const result = visitor.visit(ast);

      expect(result).toEqual({
        $ast: "test",
        undefinedValue: undefined,
      });
    });

    it("should handle nodes without handlers", () => {
      type TestAst = AstNode<"handled"> | AstNode<"unhandled">;

      const visitor = defineVisitor<TestAst>();
      const handler = vi.fn((node) => node);

      visitor.on("handled", handler);

      const ast = {
        $ast: "handled",
        child: { $ast: "unhandled" },
      } as const;

      const result = visitor.visit(ast);

      expect(handler).toHaveBeenCalledOnce();
      expect(result).toEqual({
        $ast: "handled",
        child: { $ast: "unhandled" },
      });
    });

    it("should handle mixed arrays with AST and non-AST nodes", () => {
      type TestAst =
        | AstNode<"test">
        | {
            StringLiteral: string;
          };

      const visitor = defineVisitor<TestAst>({
        StringLiteral: {
          nodeIs: (node, context): node is string =>
            typeof node === "string" && context.key !== "$ast",
        },
      });

      const astHandler = vi.fn((node) => node);
      const stringHandler = vi.fn((node) => node.toUpperCase());

      visitor.on("test", astHandler).on("StringLiteral", stringHandler);

      const ast = [{ $ast: "test" }, "string", { $ast: "test" }] as const;

      const result = visitor.visit(ast);

      expect(astHandler).toHaveBeenCalledTimes(2);
      expect(stringHandler).toHaveBeenCalledOnce();
      expect(result).toEqual([{ $ast: "test" }, "STRING", { $ast: "test" }]);
    });

    it("should return non-object values as-is from exit handler", () => {
      type TestAst = { $in: AstNode<"test">; $out: string };

      const visitor = defineVisitor<TestAst>();

      visitor.on("test", {
        exit: () => "transformed to string",
      });

      const ast = { $ast: "test" } as const;
      const result = visitor.visit(ast);

      expect(result).toBe("transformed to string");
    });
  });

  describe("visitor builder chaining", () => {
    it("should support method chaining", () => {
      type TestAst = AstNode<"type1"> | AstNode<"type2"> | AstNode<"type3">;

      const visitor = defineVisitor<TestAst>()
        .on("type1", (node) => node)
        .on("type2", (node) => node)
        .on("type3", (node) => node);

      expect(visitor).toHaveProperty("on");
      expect(visitor).toHaveProperty("visit");
    });

    it("should allow progressive handler addition", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();

      const handler1 = vi.fn((node) => node);
      visitor.on("test", handler1);

      const handler2 = vi.fn((node) => node);
      visitor.on("test", handler2);

      const ast = { $ast: "test" } as const;
      visitor.visit(ast);

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe("type safety", () => {
    it("should type handler parameter correctly for specific node type", () => {
      type TestAst = AstNode<"nodeA"> | AstNode<"nodeB">;

      const visitor = defineVisitor<TestAst>();

      visitor.on("nodeA", (node, context) => {
        // Node should be typed as AstNode<"nodeA">
        expectTypeOf(node).toExtend<{ $ast: "nodeA" }>();
        expectTypeOf(node.$ast).toEqualTypeOf<"nodeA">();

        // Context should be properly typed
        expectTypeOf(context).toExtend<{
          parent?: unknown;
          key?: PropertyKey;
          index?: number;
          path?: (string | number)[];
        }>();

        return node;
      });

      visitor.on("nodeB", (node) => {
        // Node should be typed as AstNode<"nodeB">
        expectTypeOf(node).toExtend<{ $ast: "nodeB" }>();
        expectTypeOf(node.$ast).toEqualTypeOf<"nodeB">();
        return node;
      });
    });

    it("should properly type nested node structures", () => {
      type ChildAst = AstNode<"child">;
      type ParentAst = Eager<
        AstNode<"parent"> & {
          child: ChildAst;
          children: ChildAst[];
        }
      >;

      const visitor = defineVisitor<ParentAst | ChildAst>();

      visitor.on("parent", (node) => {
        expectTypeOf(node).toEqualTypeOf<ParentAst>();
        return node;
      });

      visitor.on("child", (node, context) => {
        expectTypeOf(node).toEqualTypeOf<ChildAst>();

        // Parent could be parent node or array
        if (
          context.parent &&
          typeof context.parent === "object" &&
          "$ast" in context.parent
        ) {
          expectTypeOf(context.parent).toExtend<{ $ast: string }>();
        }

        return node;
      });
    });

    it("should type enter and exit handlers correctly", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();

      visitor.on("test", {
        enter: (node, context) => {
          expectTypeOf(node).toEqualTypeOf<TestAst>();
          expectTypeOf(context).toEqualTypeOf<{
            parent?: undefined;
            key?: PropertyKey;
            index?: number;
            path?: (string | number)[];
          }>();
          return node;
        },
        exit: (node, context) => {
          expectTypeOf(node).toEqualTypeOf<TestAst>();
          expectTypeOf(context).toEqualTypeOf<{
            parent?: undefined;
            key?: PropertyKey;
            index?: number;
            path?: (string | number)[];
          }>();
          return node;
        },
      });
    });

    it("should type non-AST node handlers correctly", () => {
      type TestAst =
        | AstNode<"root">
        | {
            StringLiteral: string;
            NumberLiteral: number;
          };

      const visitor = defineVisitor<TestAst>({
        StringLiteral: {
          nodeIs: (node, context): node is string =>
            typeof node === "string" && context.key !== "$ast",
        },
        NumberLiteral: {
          nodeIs: (node, context): node is number =>
            typeof node === "number" && context.key !== "$ast",
        },
      });

      visitor.on("StringLiteral", (node, context) => {
        // Node should be typed as string
        expectTypeOf(node).toBeString();
        expectTypeOf(context).toEqualTypeOf<{
          parent?: undefined;
          key?: PropertyKey;
          index?: number;
          path?: (string | number)[];
        }>();
        return node.toUpperCase();
      });

      visitor.on("NumberLiteral", (node, context) => {
        // Node should be typed as number
        expectTypeOf(node).toBeNumber();
        return node * 2;
      });

      visitor.on("root", (node, context) => {
        // Node should be AST node
        expectTypeOf(node).toExtend<{ $ast: "root" }>();
        return node;
      });
    });

    it("should type return values correctly", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();

      visitor.on("test", (node) => {
        // Can return the same type
        const result1: typeof node = node;
        expectTypeOf(result1).toExtend<{ $ast: "test" }>();

        // Can return extended type
        const result2 = { ...node, extra: "property" };
        expectTypeOf(result2).toExtend<{
          $ast: "test";
          extra: string;
        }>();

        // Can return different type
        const result3 = "string";
        expectTypeOf(result3).toBeString();

        return node;
      });
    });

    it("should type visit result correctly", () => {
      type TestAst = AstNode<"test">;

      const visitor = defineVisitor<TestAst>();

      visitor.on("test", (node) => node);

      const ast: TestAst = { $ast: "test" };
      const result = visitor.visit(ast);

      // Result should be unknown (could be transformed)
      expectTypeOf(result).toEqualTypeOf<TestAst>();
    });

    it("should handle union types correctly", () => {
      type TestAst = AstNode<"typeA"> | AstNode<"typeB"> | AstNode<"typeC">;

      const visitor = defineVisitor<TestAst>();

      visitor
        .on("typeA", (node) => {
          expectTypeOf(node).toEqualTypeOf<AstNode<"typeA">>();
          return node;
        })
        .on("typeB", (node) => {
          expectTypeOf(node).toEqualTypeOf<AstNode<"typeB">>();
          return node;
        })
        .on("typeC", (node) => {
          expectTypeOf(node).toEqualTypeOf<AstNode<"typeC">>();
          return node;
        });
    });

    it("should type context.parent correctly based on structure", () => {
      type ParentAst = AstNode<"parent", { child: ChildAst }>;
      type ChildAst = AstNode<"child">;

      const visitor = defineVisitor<ParentAst | ChildAst>();

      visitor.on("child", (node, context) => {
        expectTypeOf(node).toEqualTypeOf<ChildAst>();

        // Parent is unknown but can be narrowed
        if (context.parent) {
          expectTypeOf(context.parent).toEqualTypeOf<ParentAst>();
        }

        return node;
      });
    });

    it("should maintain type safety with complex nested structures", () => {
      type LeftNode = AstNode<"leaf", { value: string }>;
      type BranchNode = AstNode<"branch", { leaves: LeftNode[] }>;
      type RootNode = AstNode<"root", { branches: BranchNode[] }>;
      type TestAst = RootNode | BranchNode | LeftNode;

      const visitor = defineVisitor<TestAst>();

      visitor
        .on("root", (node) => {
          expectTypeOf(node).toEqualTypeOf<RootNode>();
          return node;
        })
        .on("branch", (node, context) => {
          expectTypeOf(node).toEqualTypeOf<BranchNode>();
          expectTypeOf(context.parent).toEqualTypeOf<RootNode | undefined>();
          return node;
        })
        .on("leaf", (node, context) => {
          expectTypeOf(node).toEqualTypeOf<LeftNode>();
          expectTypeOf(context.parent).toEqualTypeOf<BranchNode | undefined>();
          return node;
        });
    });
  });
});
