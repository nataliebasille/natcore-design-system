import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { light } from "../ast/cssvalue/color";
import { cssv } from "../ast/cssvalue/public";
import { select } from "../ast/selector";
import {
  styleRule,
  type StyleProperties,
  type StyleRuleAst,
  type StyleListAst,
  styleList,
} from "../ast/style-rule";
import { stylesheetVisitorBuilder } from "../ast/stylesheet-visitor-builder";

describe("style-list visitor", () => {
  describe("type inference", () => {
    it("correctly infers node type in visitor function", () => {
      const ast = styleRule(select.cls("test"), { color: "red" });
      const visitor = stylesheetVisitorBuilder().on("style-list", (node) => {
        expectTypeOf(node).toEqualTypeOf<StyleListAst>();
        return node;
      });
      visitor.visit(ast);
    });

    it("correctly infers return type of transformation", () => {
      const ast = styleRule(select.cls("test"), { color: "red" });
      const visitor = stylesheetVisitorBuilder().on("style-list", (node) =>
        styleList({
          color: "blue",
          "font-size": "16px",
        }),
      );
      const actual = visitor.visit(ast);
      const expected = styleRule(select.cls("test"), {
        color: "blue",
        "font-size": "16px",
      });

      expectTypeOf(actual).toEqualTypeOf(expected);
    });
  });

  describe("visitor invocation", () => {
    it("calls style-list visitor with StyleListAst node", () => {
      const stylesSpy = vi.fn().mockImplementation((node) => node);

      const ast = styleRule(select.cls("button"), {
        padding: "16px",
        margin: "8px",
        "background-color": light("primary", 500),
      });

      stylesheetVisitorBuilder().on("style-list", stylesSpy).visit(ast);

      expect(stylesSpy).toHaveBeenCalledOnce();
      expect(stylesSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          $ast: "style-list",
          styles: [
            expect.objectContaining({
              padding: "16px",
              margin: "8px",
              "background-color": light("primary", 500),
            }),
          ],
        }),
        expect.any(Object),
      );
    });

    it("calls style-list visitor for multiple rules", () => {
      const stylesSpy = vi.fn().mockImplementation((node) => node);

      const ast = [
        styleRule(select.cls("button"), { padding: "8px" }),
        styleRule(select.cls("input"), { margin: "4px" }),
      ];

      stylesheetVisitorBuilder().on("style-list", stylesSpy).visit(ast);

      expect(stylesSpy).toHaveBeenCalledTimes(2);
    });

    it("calls style-list visitor for nested rules", () => {
      const stylesSpy = vi.fn().mockImplementation((node) => node);

      const ast = styleRule(select.cls("parent"), {
        display: "block",
        $: {
          [select.cls("child")]: { margin: "8px" },
        },
      });

      stylesheetVisitorBuilder().on("style-list", stylesSpy).visit(ast);

      expect(stylesSpy).toHaveBeenCalledTimes(2);
    });

    it("handles style objects with various CSS properties", () => {
      const ast = styleRule(select.cls("flex-container"), {
        display: "flex",
        "flex-direction": "row",
        "justify-content": "center",
        "align-items": "center",
      });

      stylesheetVisitorBuilder()
        .on("style-list", (node) => {
          expect(node.styles[0]).toHaveProperty("display");
          expect(node.styles[0]).toHaveProperty("flex-direction");
          expect(node.styles[0]).toHaveProperty("justify-content");
          expect(node.styles[0]).toHaveProperty("align-items");
          return node;
        })
        .visit(ast);
    });
  });

  describe("visitor context", () => {
    it("receives array as parent when in style rule body", () => {
      const ast = styleRule(select.cls("test"), { color: "red" });

      stylesheetVisitorBuilder()
        .on("style-list", (node, context) => {
          expect(context.parent).toBeDefined();
          expect(Array.isArray(context.parent)).toBe(true);
          return node;
        })
        .visit(ast);
    });

    it("receives correct parent for each style object", () => {
      const contexts: Array<{ hasStyles: boolean }> = [];

      const ast = [
        styleRule(select.cls("button"), { padding: "8px" }),
        styleRule(select.cls("input"), { margin: "4px" }),
      ];

      stylesheetVisitorBuilder()
        .on("style-list", (node, context) => {
          if (context.parent) {
            contexts.push({
              hasStyles: node.styles.length > 0,
            });
          }
          return node;
        })
        .visit(ast);

      expect(contexts).toHaveLength(2);
      expect(contexts[0]).toEqual({ hasStyles: true });
      expect(contexts[1]).toEqual({ hasStyles: true });
    });

    it("receives correct parent for nested rules", () => {
      const contexts: Array<{
        hasDisplay: boolean;
      }> = [];

      const ast = styleRule(select.cls("parent"), {
        display: "block",
        $: {
          [select.cls("child")]: { margin: "8px" },
        },
      });

      const visitor = stylesheetVisitorBuilder().on(
        "style-list",
        (node, context) => {
          if (
            context.parent &&
            node.styles[0] &&
            typeof node.styles[0] === "object" &&
            !("$ast" in node.styles[0])
          ) {
            const styleProps = node.styles[0] as StyleProperties;
            contexts.push({
              hasDisplay: "display" in styleProps,
            });
          }
          return node;
        },
      );
      visitor.visit(ast);

      expect(contexts).toEqual([{ hasDisplay: true }, { hasDisplay: false }]);
    });
  });

  describe("visitor transformation", () => {
    it("allows visitor to return new styles object", () => {
      const ast = styleRule(select.cls("test"), { color: "red" });

      const visitor = stylesheetVisitorBuilder().on("style-list", (node) => ({
        ...node,
        styles: [
          {
            color: "blue",
            "font-size": "16px",
          },
        ],
      }));
      const result = visitor.visit(ast);

      expect(result.body[0].styles).toEqual([
        {
          color: "blue",
          "font-size": "16px",
        },
      ]);
    });

    it("allows visitor to merge properties", () => {
      const ast = styleRule(select.cls("test"), { color: "red", padding: "8px" });

      const visitor = stylesheetVisitorBuilder().on("style-list", (node) => ({
        ...node,
        styles: [
          {
            ...node.styles[0],
            modified: "true",
          },
        ],
      }));
      const result = visitor.visit(ast);

      expect(result.body[0].styles[0]).toEqual({
        color: "red",
        padding: "8px",
        modified: "true",
      });
    });

    it("allows visitor to transform based on property values", () => {
      const ast = [
        styleRule(select.cls("small"), { padding: "8px" }),
        styleRule(select.cls("large"), { padding: "24px" }),
      ];

      const visitor = stylesheetVisitorBuilder().on("style-list", (node) => {
        const newStyles: StyleProperties = { ...node.styles[0] };
        if (newStyles.padding === "8px") {
          newStyles.padding = "16px";
        }
        return {
          ...node,
          styles: [newStyles],
        };
      });
      const result = visitor.visit(ast);

      expect(result[0]?.body[0].styles).toEqual([{ padding: "16px" }]);
      expect(result[1]?.body[0].styles).toEqual([{ padding: "24px" }]);
    });
  });

  describe("complex scenarios", () => {
    it("handles styles with color nodes", () => {
      expect.assertions(2);
      const ast = styleRule(select.cls("button"), {
        "background-color": light("primary", 500),
        padding: "16px",
      });

      stylesheetVisitorBuilder()
        .on("style-list", (node) => {
          expect(
            (node.styles[0] as StyleProperties)?.["background-color"],
          ).toBeDefined();
          expect(
            (node.styles[0] as StyleProperties)?.["background-color"],
          ).toEqual(light("primary", 500));
          return node;
        })
        .visit(ast);
    });

    it("handles styles with css-value nodes", () => {
      const ast = styleRule(select.cls("gradient"), {
        "background-image": cssv`linear-gradient(${light("primary", 300)}, ${light("primary", 700)})`,
      });

      stylesheetVisitorBuilder()
        .on("style-list", (node) => {
          expect(
            (node.styles[0] as StyleProperties)?.["background-image"],
          ).toBeDefined();
          return node;
        })
        .visit(ast);
    });

    it("transforms all style objects in complex nested structure", () => {
      const ast = styleRule(select.cls("parent"), {
        display: "block",
        $: {
          [select.cls("child")]: {
            margin: "8px",
            $: {
              [select.cls("grandchild")]: { padding: "4px" },
            },
          },
        },
      });

      const visitor = stylesheetVisitorBuilder().on("style-list", (node) => ({
        ...node,
        styles: [
          {
            ...node.styles[0],
            modified: "true",
          },
        ],
      }));
      const result = visitor.visit(ast);

      expect(result.body[0].styles[0]).toHaveProperty("modified");

      const childRule = result.body[1];
      expect(
        ((childRule as StyleRuleAst).body?.[0] as StyleListAst).styles[0],
      ).toHaveProperty("modified");

      const grandchildRule = (childRule as StyleRuleAst).body[1];
      expect(
        ((grandchildRule as StyleRuleAst).body?.[0] as StyleListAst).styles[0],
      ).toHaveProperty("modified");
    });

    it("handles empty style objects", () => {
      const stylesSpy = vi.fn((node) => node);

      const ast = styleRule(select.cls("empty"), {});

      stylesheetVisitorBuilder().on("style-list", stylesSpy).visit(ast);

      expect(stylesSpy).not.toHaveBeenCalled();
    });

    it("handles style objects with many properties", () => {
      expect.assertions(1);
      const ast = styleRule(select.cls("complex"), {
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
        .on("style-list", (node) => {
          const styleObj = node.styles[0];
          if (styleObj) {
            const keys = Object.keys(styleObj);
            expect(keys.length).toBeGreaterThan(5);
          }
          return node;
        })
        .visit(ast);
    });
  });

  describe("interaction with other visitors", () => {
    it("style-list visitor can transform style properties including color nodes", () => {
      const ast = styleRule(select.cls("button"), {
        "background-color": light("primary", 500),
        color: light("primary", 100),
      });

      const result = stylesheetVisitorBuilder()
        .on("style-list", (node) => {
          // Manually transform colors in style-list visitor
          const newStyles = { ...(node.styles[0] as StyleProperties) };
          if (
            newStyles["background-color"] &&
            typeof newStyles["background-color"] === "object" &&
            "$ast" in newStyles["background-color"]
          ) {
            newStyles["background-color"] = light("primary", 900);
          }
          if (
            newStyles.color &&
            typeof newStyles.color === "object" &&
            "$ast" in newStyles.color
          ) {
            newStyles.color = light("primary", 900);
          }
          return {
            ...node,
            styles: [newStyles],
          };
        })
        .visit(ast);
      const styles = result.body[0]?.styles[0] as StyleProperties;

      expect(styles["background-color"]).toEqual(light("primary", 900));
      expect(styles.color).toEqual(light("primary", 900));
    });

    it("style-list transformation can add properties and preserve existing ones", () => {
      const ast = styleRule(select.cls("card"), {
        "background-color": light("primary", 100),
        color: light("primary", 900),
      });

      const visitor = stylesheetVisitorBuilder().on("style-list", (node) => ({
        ...node,
        styles: [
          {
            ...(node.styles[0] as StyleProperties),
            border: "1px solid black",
          },
        ],
      }));
      const result = visitor.visit(ast);
      const styles = result.body[0]?.styles[0] as StyleProperties & {
        border: string;
      };

      expect(styles["background-color"]).toEqual(light("primary", 100));
      expect(styles.color).toEqual(light("primary", 900));
      expect(styles.border).toBe("1px solid black");
    });
  });

  describe("edge cases", () => {
    it("handles styles in deeply nested rules", () => {
      const stylesSpy = vi.fn((node) => node);

      const ast = styleRule(select.cls("level1"), {
        color: "red",
        $: {
          [select.cls("level2")]: {
            color: "green",
            $: {
              [select.cls("level3")]: {
                color: "blue",
                $: {
                  [select.cls("level4")]: { color: "yellow" },
                },
              },
            },
          },
        },
      });

      stylesheetVisitorBuilder().on("style-list", stylesSpy).visit(ast);

      expect(stylesSpy).toHaveBeenCalledTimes(4);
    });

    it("handles styles with numeric values", () => {
      expect.assertions(2);
      const ast = styleRule(select.cls("test"), {
        "z-index": "10",
        opacity: "0.8",
      });

      stylesheetVisitorBuilder()
        .on("style-list", (node) => {
          expect(node.styles[0]).toHaveProperty("z-index");
          expect(node.styles[0]).toHaveProperty("opacity");
          return node;
        })
        .visit(ast);
    });
  });
});
