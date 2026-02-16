import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { light } from "../ast/color";
import { cssv } from "../ast/cssvalue";
import { cls } from "../ast/selector";
import {
  styleRule,
  type StyleProperties,
  type StyleRuleAst,
} from "../ast/styleRule";
import { stylesheetVisitorBuilder } from "../ast/stylesheet-visitor-builder";

describe("styles visitor", () => {
  describe("type inference", () => {
    it("correctly infers node type in visitor function", () => {
      const ast = styleRule(cls("test"), { color: "red" });
      const visitor = stylesheetVisitorBuilder().on("styles", (node) => {
        expectTypeOf(node).toEqualTypeOf<StyleProperties>();
        return node;
      });
      visitor.visit(ast);
    });

    it("correctly infers return type of transformation", () => {
      const ast = styleRule(cls("test"), { color: "red" });
      const visitor = stylesheetVisitorBuilder().on("styles", () => ({
        color: "blue",
        "font-size": "16px",
      }));
      const actual = visitor.visit(ast);
      const expected = styleRule(cls("test"), {
        color: "blue",
        "font-size": "16px",
      });

      expectTypeOf(actual).toEqualTypeOf(expected);
    });
  });

  describe("visitor invocation", () => {
    it("calls styles visitor with StyleProperties node", () => {
      const stylesSpy = vi.fn().mockImplementation((node) => node);

      const ast = styleRule(cls("button"), {
        padding: "16px",
        margin: "8px",
        "background-color": light("primary", 500),
      });

      stylesheetVisitorBuilder().on("styles", stylesSpy).visit(ast);

      expect(stylesSpy).toHaveBeenCalledOnce();
      expect(stylesSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          padding: "16px",
          margin: "8px",
          "background-color": light("primary", 500),
        }),
        expect.any(Object),
      );
    });

    it("calls styles visitor for multiple rules", () => {
      const stylesSpy = vi.fn().mockImplementation((node) => node);

      const ast = [
        styleRule(cls("button"), { padding: "8px" }),
        styleRule(cls("input"), { margin: "4px" }),
      ];

      stylesheetVisitorBuilder().on("styles", stylesSpy).visit(ast);

      expect(stylesSpy).toHaveBeenCalledTimes(2);
    });

    it("calls styles visitor for nested rules", () => {
      const stylesSpy = vi.fn().mockImplementation((node) => node);

      const ast = styleRule(cls("parent"), {
        display: "block",
        $: {
          [cls("child")]: { margin: "8px" },
        },
      });

      stylesheetVisitorBuilder().on("styles", stylesSpy).visit(ast);

      expect(stylesSpy).toHaveBeenCalledTimes(2);
    });

    it("handles style objects with various CSS properties", () => {
      const ast = styleRule(cls("flex-container"), {
        display: "flex",
        "flex-direction": "row",
        "justify-content": "center",
        "align-items": "center",
      });

      stylesheetVisitorBuilder()
        .on("styles", (node) => {
          expect(node).toHaveProperty("display");
          expect(node).toHaveProperty("flex-direction");
          expect(node).toHaveProperty("justify-content");
          expect(node).toHaveProperty("align-items");
          return node;
        })
        .visit(ast);
    });
  });

  describe("visitor context", () => {
    it("receives style rule as parent", () => {
      const ast = styleRule(cls("test"), { color: "red" });

      stylesheetVisitorBuilder()
        .on("styles", (node, context) => {
          expect(context.parent).toBeDefined();
          expect((context.parent as StyleRuleAst).$ast).toBe("style-rule");
          expect((context.parent as StyleRuleAst).selector).toBe(".test");
          return node;
        })
        .visit(ast);
    });

    it("receives correct parent for each style object", () => {
      const contexts: Array<{ styles: StyleProperties; selector: string }> = [];

      const ast = [
        styleRule(cls("button"), { padding: "8px" }),
        styleRule(cls("input"), { margin: "4px" }),
      ];

      stylesheetVisitorBuilder()
        .on("styles", (node, context) => {
          if (context.parent) {
            contexts.push({
              styles: node,
              selector: (context.parent as StyleRuleAst).selector as string,
            });
          }
          return node;
        })
        .visit(ast);

      expect(contexts).toEqual([
        { styles: { padding: "8px" }, selector: ".button" },
        { styles: { margin: "4px" }, selector: ".input" },
      ]);
    });

    it("receives correct parent for nested rules", () => {
      const contexts: Array<{
        hasDisplay: boolean;
        selector: PropertyKey | undefined;
      }> = [];

      const ast = styleRule(cls("parent"), {
        display: "block",
        $: {
          [cls("child")]: { margin: "8px" },
        },
      });

      const visitor = stylesheetVisitorBuilder().on(
        "styles",
        (node, context) => {
          if (context.parent) {
            contexts.push({
              hasDisplay: "display" in node,
              selector:
                "$ast" in context.parent ?
                  (context.parent as StyleRuleAst).selector
                : context.path?.at(-1),
            });
          }
          return node;
        },
      );
      visitor.visit(ast);

      expect(contexts).toEqual([
        { hasDisplay: true, selector: ".parent" },
        { hasDisplay: false, selector: ".child" },
      ]);
    });
  });

  describe("visitor transformation", () => {
    it("allows visitor to return new styles object", () => {
      const ast = styleRule(cls("test"), { color: "red" });

      const visitor = stylesheetVisitorBuilder().on("styles", () => ({
        color: "blue",
        "font-size": "16px",
      }));
      const result = visitor.visit(ast);

      expect(result.body).toEqual({
        color: "blue",
        "font-size": "16px",
      });
    });

    it("allows visitor to merge properties", () => {
      const ast = styleRule(cls("test"), { color: "red", padding: "8px" });

      const visitor = stylesheetVisitorBuilder().on("styles", (node) => ({
        ...node,
        modified: "true",
      }));
      const result = visitor.visit(ast);

      expect(result.body).toEqual({
        color: "red",
        padding: "8px",
        modified: "true",
      });
    });

    it("allows visitor to transform based on property values", () => {
      const ast = [
        styleRule(cls("small"), { padding: "8px" }),
        styleRule(cls("large"), { padding: "24px" }),
      ];

      const visitor = stylesheetVisitorBuilder().on("styles", (node) => {
        const newStyles = { ...node };
        if (newStyles.padding === "8px") {
          newStyles.padding = "16px";
        }
        return newStyles;
      });
      const result = visitor.visit(ast);

      expect(result[0]?.body).toEqual({ padding: "16px" });
      expect(result[1]?.body).toEqual({ padding: "24px" });
    });
  });

  describe("complex scenarios", () => {
    it("handles styles with color nodes", () => {
      expect.assertions(2);
      const ast = styleRule(cls("button"), {
        "background-color": light("primary", 500),
        padding: "16px",
      });

      stylesheetVisitorBuilder()
        .on("styles", (node) => {
          expect(node["background-color"]).toBeDefined();
          expect(node["background-color"]).toEqual(light("primary", 500));
          return node;
        })
        .visit(ast);
    });

    it("handles styles with css-value nodes", () => {
      const ast = styleRule(cls("gradient"), {
        "background-image": cssv`linear-gradient(${light("primary", 300)}, ${light("primary", 700)})`,
      });

      stylesheetVisitorBuilder()
        .on("styles", (node) => {
          expect(node["background-image"]).toBeDefined();
          return node;
        })
        .visit(ast);
    });

    it("transforms all style objects in complex nested structure", () => {
      const ast = styleRule(cls("parent"), {
        display: "block",
        $: {
          [cls("child")]: {
            margin: "8px",
            $: {
              [cls("grandchild")]: { padding: "4px" },
            },
          },
        },
      });

      const visitor = stylesheetVisitorBuilder().on("styles", (node) => ({
        ...node,
        modified: "true",
      }));
      const result = visitor.visit(ast);

      expect(result.body).toHaveProperty("modified");

      const childRule = result.body.$?.[cls("child")];
      expect(childRule).toHaveProperty("modified");

      const grandchildRule = childRule?.$?.[cls("grandchild")];
      expect(grandchildRule).toHaveProperty("modified");
    });

    it("handles empty style objects", () => {
      const stylesSpy = vi.fn((node) => node);

      const ast = styleRule(cls("empty"), {});

      stylesheetVisitorBuilder().on("styles", stylesSpy).visit(ast);

      expect(stylesSpy).toHaveBeenCalledWith({}, expect.any(Object));
    });

    it("handles style objects with many properties", () => {
      expect.assertions(1);
      const ast = styleRule(cls("complex"), {
        display: "flex",
        "flex-direction": "column",
        "justify-content": "center",
        "align-items": "stretch",
        gap: "16px",
        padding: "24px",
        margin: "0 auto",
        "max-width": "1200px",
        "background-color": light("primary", 50),
        "border-radius": "8px",
      });

      stylesheetVisitorBuilder()
        .on("styles", (node) => {
          const keys = Object.keys(node);
          expect(keys.length).toBeGreaterThan(5);
          return node;
        })
        .visit(ast);
    });
  });

  describe("interaction with other visitors", () => {
    it("styles visitor can transform style properties including color nodes", () => {
      const ast = styleRule(cls("button"), {
        "background-color": light("primary", 500),
        color: light("primary", 100),
      });

      const result = stylesheetVisitorBuilder()
        .on("styles", (node) => {
          // Manually transform colors in styles visitor
          const newNode = { ...node };
          if (
            newNode["background-color"] &&
            typeof newNode["background-color"] === "object" &&
            "$ast" in newNode["background-color"]
          ) {
            newNode["background-color"] = light("primary", 900);
          }
          if (
            newNode.color &&
            typeof newNode.color === "object" &&
            "$ast" in newNode.color
          ) {
            newNode.color = light("primary", 900);
          }
          return newNode;
        })
        .visit(ast);
      const styles = result.body;

      expect(styles["background-color"]).toEqual(light("primary", 900));
      expect(styles.color).toEqual(light("primary", 900));
    });

    it("styles transformation can add properties and preserve existing ones", () => {
      const ast = styleRule(cls("card"), {
        "background-color": light("primary", 100),
        color: light("primary", 900),
      });

      const visitor = stylesheetVisitorBuilder().on("styles", (node) => ({
        ...node,
        border: "1px solid black",
      }));
      const result = visitor.visit(ast);
      const styles = result.body;

      expect(styles["background-color"]).toEqual(light("primary", 100));
      expect(styles.color).toEqual(light("primary", 900));
      expect(styles.border).toBe("1px solid black");
    });
  });

  describe("edge cases", () => {
    it("handles styles in deeply nested rules", () => {
      const stylesSpy = vi.fn((node) => node);

      const ast = styleRule(cls("level1"), {
        color: "red",
        $: {
          [cls("level2")]: {
            color: "green",
            $: {
              [cls("level3")]: {
                color: "blue",
                $: {
                  [cls("level4")]: { color: "yellow" },
                },
              },
            },
          },
        },
      });

      stylesheetVisitorBuilder().on("styles", stylesSpy).visit(ast);

      expect(stylesSpy).toHaveBeenCalledTimes(4);
    });

    it("handles styles with numeric values", () => {
      expect.assertions(2);
      const ast = styleRule(cls("test"), {
        "z-index": "10",
        opacity: "0.8",
      });

      stylesheetVisitorBuilder()
        .on("styles", (node) => {
          expect(node).toHaveProperty("z-index");
          expect(node).toHaveProperty("opacity");
          return node;
        })
        .visit(ast);
    });
  });
});
