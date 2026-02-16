import { describe, expectTypeOf, it, expect, vi } from "vitest";
import { stylesheetVisitorBuilder } from "../ast/stylesheet-visitor-builder";
import {
  styleRule,
  type StyleRuleAst,
  type StyleProperties,
} from "../ast/styleRule";
import { cls, element, id, type Selector } from "../ast/selector";
import { light } from "../ast/color";
import { cssv } from "../ast/cssvalue";

describe("style-rule ast visitor", () => {
  describe("type inference", () => {
    it("correctly infers node type in visitor function", () => {
      const visitor = stylesheetVisitorBuilder();
      visitor.on("style-rule", (node) => {
        expectTypeOf(node).toEqualTypeOf<StyleRuleAst>();
        return node;
      });
      visitor.visit(styleRule(cls("test"), { color: "red" }));
    });
  });

  describe("visitor invocation", () => {
    it("calls style-rule visitor with StyleRuleAst node", () => {
      const styleRuleSpy = vi.fn((node) => node);

      const ast = styleRule(cls("button"), {
        "background-color": light("primary", 500),
        padding: "16px",
      });

      const visitor = stylesheetVisitorBuilder();
      visitor.on("style-rule", styleRuleSpy);
      visitor.visit(ast);

      expect(styleRuleSpy).toHaveBeenCalledOnce();
      expect(styleRuleSpy).toHaveBeenCalledWith(
        ast,
        expect.objectContaining({ parent: undefined }),
      );
    });

    it("calls style-rule visitor with correct node properties", () => {
      expect.assertions(3);
      const ast = styleRule(cls("card"), {
        "border-radius": "8px",
        "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
      });

      const visitor = stylesheetVisitorBuilder();
      visitor.on("style-rule", (node) => {
        expect(node.$ast).toBe("style-rule");
        expect(node.selector).toBe(".card");
        expect(node.body).toEqual({
          "border-radius": "8px",
          "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
        });
        return node;
      });
      visitor.visit(ast);
    });

    it("handles rules with multiple body items", () => {
      const styleRuleSpy = vi.fn((node) => node);

      const ast = styleRule(cls("complex"), {
        display: "flex",
        "flex-direction": "column",
        gap: "16px",
      });

      const visitor = stylesheetVisitorBuilder();
      visitor.on("style-rule", styleRuleSpy);
      visitor.visit(ast);

      expect(styleRuleSpy).toHaveBeenCalledOnce();
    });

    it("handles array of style rules", () => {
      const styleRuleSpy = vi.fn((node) => node);

      const ast = [
        styleRule(cls("button"), { padding: "8px" }),
        styleRule(cls("input"), { border: "1px solid" }),
        styleRule(cls("label"), { "font-size": "14px" }),
      ];

      const visitor = stylesheetVisitorBuilder();
      visitor.on("style-rule", styleRuleSpy);
      visitor.visit(ast);

      expect(styleRuleSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("visitor context", () => {
    it("passes undefined as parent for top-level rules", () => {
      const ast = styleRule(cls("test"), { color: "#000" });

      const visitor = stylesheetVisitorBuilder();
      visitor.on("style-rule", (node, context) => {
        expect(context.parent).toBeUndefined();
        return node;
      });
      visitor.visit(ast);
    });
  });

  describe("visitor transformation", () => {
    it("allows visitor to return new style rule", () => {
      const ast = [styleRule(cls("original"), { color: "red" })];

      const visitor = stylesheetVisitorBuilder();
      visitor.on("style-rule", (node) => {
        return styleRule(node.selector, { modified: "true" });
      });
      const result = visitor.visit(ast);

      expect(result[0]!.body).toEqual({ modified: "true" });
    });

    it("allows visitor to transform based on selector", () => {
      const ast = [
        styleRule(cls("button"), { color: "blue" }),
        styleRule(cls("input"), { color: "red" }),
      ];

      const visitor = stylesheetVisitorBuilder();
      visitor.on("style-rule", (node) => {
        if (node.selector === ".button") {
          return styleRule(node.selector, { ...node.body, padding: "16px" });
        }
        return node;
      });
      const result = visitor.visit(ast);

      const buttonRule = result[0]!;
      expect(buttonRule.body).toEqual({ padding: "16px", color: "blue" });

      const inputRule = result[1]!;
      expect(inputRule.body).toEqual({ color: "red" });
    });
  });

  describe("complex scenarios", () => {
    it("handles rules with different selector types", () => {
      const selectors: string[] = [];

      const ast = [
        styleRule(element("div"), { display: "block" }),
        styleRule(cls("button"), { padding: "8px" }),
        styleRule(id("main"), { width: "100%" }),
        styleRule("*", { boxSizing: "border-box" }),
      ];

      const visitor = stylesheetVisitorBuilder();
      visitor.on("style-rule", (node) => {
        selectors.push(node.selector as string);
        return node;
      });
      visitor.visit(ast);

      expect(selectors).toEqual(["div", ".button", "#main", "*"]);
    });

    it("handles rules with color and css-value properties", () => {
      const ast = styleRule(cls("gradient"), {
        "background-color": light("primary", 500),
        "background-image": cssv`linear-gradient(${light("primary", 300)}, ${light("primary", 700)})`,
      });

      const visitor = stylesheetVisitorBuilder();
      visitor.on("style-rule", (node) => {
        const body = Array.isArray(node.body) ? node.body[0] : node.body;
        expect((body as StyleProperties)["background-color"]).toBeDefined();
        expect((body as StyleProperties)["background-image"]).toBeDefined();
        return node;
      });
      visitor.visit(ast);
    });

    it("handles complex pseudo-selectors", () => {
      const ast = [
        styleRule(":hover", { opacity: "0.8" }),
        styleRule("::before", { content: "''" }),
        styleRule(":nth-child(2n)", { "background-color": "#f0f0f0" }),
      ];

      const visitor = stylesheetVisitorBuilder();
      visitor.on("style-rule", (node) => {
        expect(typeof node.selector).toBe("string");
        return node;
      });
      visitor.visit(ast);
    });
  });

  describe("edge cases", () => {
    it("handles empty body", () => {
      const styleRuleSpy = vi.fn((node) => node);

      const ast = styleRule(cls("empty"), {});

      const visitor = stylesheetVisitorBuilder().on("style-rule", styleRuleSpy);
      visitor.visit(ast);

      expect(styleRuleSpy).toHaveBeenCalled();
    });
  });

  describe("nested-style-rule visitor", () => {
    describe("type inference", () => {
      it("correctly infers node type in visitor function", () => {
        const ast = styleRule(cls("parent"), {
          display: "block",
          $: {
            [cls("child")]: { margin: "8px" },
          },
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", (node) => {
            expectTypeOf(node).toEqualTypeOf<StyleRuleAst["body"]["$"]>();
            return node;
          })
          .visit(ast);
      });
    });

    describe("visitor invocation", () => {
      it("calls nested-style-rule visitor for $ property with nested selectors", () => {
        const nestedSpy = vi.fn((node) => node);

        const ast = styleRule(cls("parent"), {
          display: "block",
          $: {
            [cls("child")]: { margin: "8px" },
          },
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", nestedSpy)
          .visit(ast);

        expect(nestedSpy).toHaveBeenCalledOnce();
        expect(nestedSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            [cls("child")]: { margin: "8px" },
          }),
          expect.any(Object),
        );
      });

      it("calls nested-style-rule visitor for multiple nested selectors", () => {
        const nestedSpy = vi.fn((node) => node);

        const ast = styleRule(cls("parent"), {
          display: "flex",
          $: {
            [cls("child1")]: { padding: "4px" },
            [cls("child2")]: { padding: "8px" },
            [element("span")]: { "font-size": "12px" },
          },
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", nestedSpy)
          .visit(ast);

        expect(nestedSpy).toHaveBeenCalledOnce();
        const calledWith = nestedSpy.mock.calls[0]?.[0];
        expect(calledWith).toHaveProperty(cls("child1"));
        expect(calledWith).toHaveProperty(cls("child2"));
        expect(calledWith).toHaveProperty(element("span"));
      });

      it("calls nested-style-rule visitor for deeply nested $ properties", () => {
        const nestedSpy = vi.fn((node) => node);

        const ast = styleRule(cls("level1"), {
          display: "block",
          $: {
            [cls("level2")]: {
              margin: "8px",
              $: {
                [cls("level3")]: { padding: "4px" },
              },
            },
          },
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", nestedSpy)
          .visit(ast);

        expect(nestedSpy).toHaveBeenCalledTimes(2);
      });

      it("does not call nested-style-rule visitor when no $ property exists", () => {
        const nestedSpy = vi.fn((node) => node);

        const ast = styleRule(cls("simple"), {
          display: "block",
          margin: "8px",
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", nestedSpy)
          .visit(ast);

        expect(nestedSpy).not.toHaveBeenCalled();
      });
    });

    describe("visitor context", () => {
      it("receives parent style properties as parent", () => {
        const ast = styleRule(cls("parent"), {
          display: "block",
          $: {
            [cls("child")]: { margin: "8px" },
          },
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", (node, context) => {
            expect(context.parent).toBeDefined();
            expect(context.parent).toHaveProperty("display");
            expect(context.parent).toHaveProperty("$");
            return node;
          })
          .visit(ast);
      });

      it("receives correct path information", () => {
        const ast = styleRule(cls("test"), {
          display: "flex",
          $: {
            [cls("nested")]: { padding: "16px" },
          },
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", (node, context) => {
            expect(context.path).toBeDefined();
            expect(context.path?.at(-1)).toBe("$");
            return node;
          })
          .visit(ast);
      });
    });

    describe("visitor transformation", () => {
      it("allows visitor to return new nested rules", () => {
        const ast = styleRule(cls("parent"), {
          display: "block",
          $: {
            [cls("child")]: { margin: "8px" },
          },
        });

        const result = stylesheetVisitorBuilder()
          .on("nested-style-rule", (node) => {
            return {
              ...node,
              [cls("new-child")]: { padding: "4px" },
            };
          })
          .visit(ast) as StyleRuleAst;

        const body = result.body as StyleProperties;
        expect(body.$).toHaveProperty(cls("child"));
        expect(body.$).toHaveProperty(cls("new-child"));
      });

      it("allows visitor to transform nested selector properties", () => {
        const ast = styleRule(cls("parent"), {
          display: "block",
          $: {
            [cls("child")]: { margin: "8px" },
          },
        });

        const result = stylesheetVisitorBuilder()
          .on("nested-style-rule", (node) => {
            const transformed: StyleRuleAst["body"]["$"] = {};
            for (const [key, value] of Object.entries(node ?? {})) {
              transformed[key] = {
                ...value,
                "background-color": light("secondary", 500),
              };
            }
            return transformed;
          })
          .visit(ast);

        const body = result.body;
        const childStyles = body.$?.[cls("child")];
        expect(childStyles).toHaveProperty(
          "background-color",
          light("secondary", 500),
        );
        expect(childStyles).toHaveProperty("margin", "8px");
      });

      it("allows visitor to filter out selectors", () => {
        const ast = styleRule(cls("parent"), {
          display: "block",
          $: {
            [cls("keep")]: { margin: "8px" },
            [cls("remove")]: { padding: "8px" },
          },
        });

        const result = stylesheetVisitorBuilder()
          .on("nested-style-rule", (node) => {
            const filtered: StyleRuleAst["body"]["$"] = {};
            for (const [key, value] of Object.entries(node ?? {})) {
              if (!key.includes("remove")) {
                filtered[key] = value;
              }
            }
            return filtered;
          })
          .visit(ast);

        const body = result.body;
        expect(body.$).toHaveProperty(cls("keep"));
        expect(body.$).not.toHaveProperty(cls("remove"));
      });
    });

    describe("interaction with other visitors", () => {
      it("works alongside styles visitor", () => {
        const nestedSpy = vi.fn((node) => node);
        const stylesSpy = vi.fn((node) => node);

        const ast = styleRule(cls("parent"), {
          display: "block",
          $: {
            [cls("child")]: { margin: "8px" },
          },
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", nestedSpy)
          .on("styles", stylesSpy)
          .visit(ast);

        expect(nestedSpy).toHaveBeenCalledOnce();
        expect(stylesSpy).toHaveBeenCalledTimes(2); // parent styles + child styles
      });

      it("nested-style-rule transformation affects subsequent processing", () => {
        const ast = styleRule(cls("parent"), {
          display: "block",
          $: {
            [cls("original")]: { margin: "8px" },
          },
        });

        const result = stylesheetVisitorBuilder()
          .on("nested-style-rule", (node) => {
            return {
              [cls("transformed")]: node?.[cls("original")]!,
            };
          })
          .visit(ast);

        const body = result.body;
        expect(body.$).not.toHaveProperty(cls("original"));
        expect(body.$).toHaveProperty(cls("transformed"));
      });
    });

    describe("complex scenarios", () => {
      it("handles nested rules with pseudo-selectors", () => {
        const nestedSpy = vi.fn((node) => node);

        const ast = styleRule(cls("button"), {
          padding: "8px",
          $: {
            [":hover"]: { opacity: "0.8" },
            [":focus"]: { outline: "2px solid blue" },
            ["::before"]: { content: "''" },
          },
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", nestedSpy)
          .visit(ast);

        expect(nestedSpy).toHaveBeenCalledOnce();
        const calledWith = nestedSpy.mock.calls[0]?.[0];
        expect(calledWith).toHaveProperty(":hover");
        expect(calledWith).toHaveProperty(":focus");
        expect(calledWith).toHaveProperty("::before");
      });

      it("handles multiple levels of nested $ properties", () => {
        const nestedSpy = vi.fn((node) => node);

        const ast = styleRule(cls("level1"), {
          display: "flex",
          $: {
            [cls("level2")]: {
              margin: "8px",
              $: {
                [cls("level3")]: {
                  padding: "4px",
                  $: {
                    [cls("level4")]: { color: "red" },
                  },
                },
              },
            },
          },
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", nestedSpy)
          .visit(ast);

        expect(nestedSpy).toHaveBeenCalledTimes(3);
      });

      it("handles nested rules with complex selectors", () => {
        const nestedSpy = vi.fn((node) => node);

        const ast = styleRule(cls("parent"), {
          display: "grid",
          $: {
            [".child1, .child2"]: { margin: "8px" },
            [".child3 > span"]: { padding: "4px" },
            [".child4:hover"]: { opacity: "0.9" },
          },
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", nestedSpy)
          .visit(ast);

        expect(nestedSpy).toHaveBeenCalledOnce();
        const calledWith = nestedSpy.mock.calls[0]?.[0];
        expect(Object.keys(calledWith)).toHaveLength(3);
      });

      it("handles empty nested rules object", () => {
        const nestedSpy = vi.fn((node) => node);

        const ast = styleRule(cls("parent"), {
          display: "block",
          $: {},
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", nestedSpy)
          .visit(ast);

        expect(nestedSpy).toHaveBeenCalledOnce();
        expect(nestedSpy).toHaveBeenCalledWith({}, expect.any(Object));
      });
    });

    describe("edge cases", () => {
      it("handles nested rules with color values", () => {
        const nestedSpy = vi.fn((node) => node);

        const ast = styleRule(cls("parent"), {
          display: "block",
          $: {
            [cls("child")]: {
              color: light("primary", 500),
              "background-color": light("primary", 100),
            },
          },
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", nestedSpy)
          .visit(ast);

        expect(nestedSpy).toHaveBeenCalledOnce();
        const childStyles = nestedSpy.mock.calls[0]?.[0]?.[
          cls("child")
        ] as StyleProperties;
        expect(childStyles).toHaveProperty("color");
        expect(childStyles).toHaveProperty("background-color");
      });

      it("handles nested rules with css-value", () => {
        const nestedSpy = vi.fn((node) => node);

        const ast = styleRule(cls("parent"), {
          display: "block",
          $: {
            [cls("child")]: {
              background: cssv`linear-gradient(${light("primary", 300)}, ${light("primary", 700)})`,
            },
          },
        });

        stylesheetVisitorBuilder()
          .on("nested-style-rule", nestedSpy)
          .visit(ast);

        expect(nestedSpy).toHaveBeenCalledOnce();
      });

      it("handles transformation that returns empty object", () => {
        const ast = styleRule(cls("parent"), {
          display: "block",
          $: {
            [cls("child")]: { margin: "8px" },
          },
        });

        const result = stylesheetVisitorBuilder()
          .on("nested-style-rule", () => ({}))
          .visit(ast) as StyleRuleAst;

        const body = result.body as StyleProperties;
        expect(body.$).toEqual({});
      });
    });
  });
});
