import { describe, expectTypeOf, it, expect, vi } from "vitest";
import { visit, type ParentVisitorNode } from "./visit";
import {
  styleRule,
  type StyleRuleAst,
  type StyleProperties,
} from "../ast/styleRule";
import { cls, element, id } from "../ast/selector";
import { color } from "../ast/color";
import { cssv } from "../ast/cssvalue";

describe("style-rule ast visitor", () => {
  describe("type inference", () => {
    it("correctly infers node type in visitor function", () => {
      visit(styleRule(cls("test"), { color: "red" }), {
        "style-rule": (node) => {
          expectTypeOf(node).toEqualTypeOf<StyleRuleAst>();
        },
      });
    });
  });

  describe("visitor invocation", () => {
    it("calls style-rule visitor with StyleRuleAst node", () => {
      const styleRuleSpy = vi.fn();

      const ast = styleRule(cls("button"), {
        "background-color": color("500"),
        padding: "16px",
      });

      visit(ast, {
        "style-rule": styleRuleSpy,
      });

      expect(styleRuleSpy).toHaveBeenCalledOnce();
      expect(styleRuleSpy).toHaveBeenCalledWith(ast, undefined);
    });

    it("calls style-rule visitor with correct node properties", () => {
      const ast = styleRule(cls("card"), {
        "border-radius": "8px",
        "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
      });

      visit(ast, {
        "style-rule": (node) => {
          expect(node.type).toBe("style-rule");
          expect(node.selector).toBe(".card");
          expect(node.body).toEqual([
            {
              "border-radius": "8px",
              "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
            },
          ]);
        },
      });
    });

    it("calls style-rule visitor for nested rules", () => {
      const styleRuleSpy = vi.fn();

      const ast = styleRule(
        cls("parent"),
        { margin: "0" },
        styleRule(cls("child"), { padding: "8px" }),
      );

      visit(ast, {
        "style-rule": styleRuleSpy,
      });

      expect(styleRuleSpy).toHaveBeenCalledTimes(2);
    });

    it("handles rules with multiple body items", () => {
      const styleRuleSpy = vi.fn();

      const ast = styleRule(
        cls("complex"),
        { display: "flex" },
        { "flex-direction": "column" },
        { gap: "16px" },
      );

      visit(ast, {
        "style-rule": styleRuleSpy,
      });

      expect(styleRuleSpy).toHaveBeenCalledOnce();
    });

    it("handles array of style rules", () => {
      const styleRuleSpy = vi.fn();

      const ast = [
        styleRule(cls("button"), { padding: "8px" }),
        styleRule(cls("input"), { border: "1px solid" }),
        styleRule(cls("label"), { "font-size": "14px" }),
      ];

      visit(ast, {
        "style-rule": styleRuleSpy,
      });

      expect(styleRuleSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("visitor context", () => {
    it("passes undefined as parent for top-level rules", () => {
      const ast = styleRule(cls("test"), { color: "#000" });

      visit(ast, {
        "style-rule": (node, parent) => {
          expect(parent).toBeUndefined();
        },
      });
    });

    it("passes parent rule for nested rules", () => {
      const ast = styleRule(
        cls("parent"),
        { display: "block" },
        styleRule(cls("child"), { margin: "0" }),
      );

      visit(ast, {
        "style-rule": (node, parent) => {
          if (node.selector === ".child") {
            expect(parent).toBeDefined();
            expect((parent as StyleRuleAst).selector).toBe(".parent");
          }
        },
      });
    });

    it("receives correct parent context for deeply nested rules", () => {
      const contexts: Array<{ selector: string; parentSelector?: string }> = [];

      const ast = styleRule(
        cls("level1"),
        { color: "red" },
        styleRule(
          cls("level2"),
          { color: "green" },
          styleRule(cls("level3"), { color: "blue" }),
        ),
      );

      visit(ast, {
        "style-rule": (node, parent) => {
          contexts.push({
            selector: node.selector as string,
            parentSelector:
              parent ?
                ((parent as StyleRuleAst).selector as string)
              : undefined,
          });
        },
      });

      expect(contexts).toEqual([
        { selector: ".level1", parentSelector: undefined },
        { selector: ".level2", parentSelector: ".level1" },
        { selector: ".level3", parentSelector: ".level2" },
      ]);
    });
  });

  describe("visitor transformation", () => {
    it("allows visitor to return new style rule", () => {
      const ast = [styleRule(cls("original"), { color: "red" })];

      const result = visit(ast, {
        "style-rule": (node) => {
          return styleRule(node.selector, { modified: "true" });
        },
      });

      expect((result[0] as StyleRuleAst).body).toEqual([{ modified: "true" }]);
    });

    it("allows visitor to transform based on selector", () => {
      const ast = [
        styleRule(cls("button"), { color: "blue" }),
        styleRule(cls("input"), { color: "red" }),
      ];

      const result = visit(ast, {
        "style-rule": (node) => {
          if (node.selector === ".button") {
            return styleRule(
              node.selector,
              { padding: "16px" },
              ...(Array.isArray(node.body) ? node.body : [node.body]),
            );
          }
          return node;
        },
      });

      const buttonRule = result[0] as StyleRuleAst;
      expect(buttonRule.body).toEqual([{ padding: "16px" }, { color: "blue" }]);

      const inputRule = result[1] as StyleRuleAst;
      expect(inputRule.body).toEqual([{ color: "red" }]);
    });

    it("allows visitor to return undefined", () => {
      const styleRuleSpy = vi.fn().mockReturnValue(undefined);

      const ast = [styleRule(cls("test"), { color: "red" })];

      const result = visit(ast, {
        "style-rule": styleRuleSpy,
      });

      expect(styleRuleSpy).toHaveBeenCalled();
      expect(result).toEqual(ast);
    });

    it("preserves original rule when visitor returns void", () => {
      const originalRule = styleRule(cls("preserved"), { color: "green" });

      const ast = [originalRule];

      const result = visit(ast, {
        "style-rule": () => {
          // Perform some side effect but don't return
        },
      });

      expect(result).toEqual([originalRule]);
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

      visit(ast, {
        "style-rule": (node) => {
          selectors.push(node.selector as string);
        },
      });

      expect(selectors).toEqual(["div", ".button", "#main", "*"]);
    });

    it("handles rules with color and css-value properties", () => {
      const ast = styleRule(cls("gradient"), {
        "background-color": color("500"),
        "background-image": cssv`linear-gradient(${color("300")}, ${color("700")})`,
      });

      visit(ast, {
        "style-rule": (node) => {
          const body = Array.isArray(node.body) ? node.body[0] : node.body;
          expect((body as StyleProperties)["background-color"]).toBeDefined();
          expect((body as StyleProperties)["background-image"]).toBeDefined();
        },
      });
    });

    it("transforms nested rules while preserving structure", () => {
      let callCount = 0;

      const ast = styleRule(
        cls("parent"),
        { margin: "0" },
        styleRule(
          cls("child1"),
          { padding: "8px" },
          styleRule(cls("grandchild"), { "font-size": "12px" }),
        ),
        styleRule(cls("child2"), { padding: "16px" }),
      );

      const result = visit(ast, {
        "style-rule": (node) => {
          callCount++;
          // Don't return to allow nested processing
        },
      }) as StyleRuleAst;

      expect(callCount).toBe(4);
      expect(result.body).toHaveLength(3);
    });

    it("handles complex pseudo-selectors", () => {
      const ast = [
        styleRule(":hover", { opacity: "0.8" }),
        styleRule("::before", { content: "''" }),
        styleRule(":nth-child(2n)", { "background-color": "#f0f0f0" }),
      ];

      visit(ast, {
        "style-rule": (node) => {
          expect(typeof node.selector).toBe("string");
        },
      });
    });
  });

  describe("interaction with other visitors", () => {
    it("color visitor is not called for colors in style properties", () => {
      const colorSpy = vi.fn();

      const ast = styleRule(cls("button"), {
        "background-color": color("500"),
        color: color("100"),
      });

      visit(ast, {
        color: colorSpy,
      });

      // Color visitor only works for theme properties, not style properties
      expect(colorSpy).not.toHaveBeenCalled();
    });

    it("css-value visitor is not called for css values in style properties", () => {
      const cssValueSpy = vi.fn();

      const ast = styleRule(cls("gradient"), {
        "background-image": cssv`linear-gradient(${color("500")}, ${color("700")})`,
      });

      visit(ast, {
        "css-value": cssValueSpy,
      });

      // CSS-value visitor only works for theme properties, not style properties
      expect(cssValueSpy).not.toHaveBeenCalled();
    });

    it("selector visitor transforms selector in style rules", () => {
      const ast = styleRule(cls("old"), { color: "red" });

      const result = visit(ast, {
        selector: (selector) => {
          if (selector === ".old") {
            return ".new";
          }
          return selector;
        },
      }) as StyleRuleAst;

      expect(result.selector).toBe(".new");
    });

    it("styles visitor transforms style properties", () => {
      const ast = styleRule(cls("test"), { color: "red" });

      const result = visit(ast, {
        styles: (styles) => {
          return { ...styles, modified: "true" };
        },
      });
      const body = result.body[0];

      expect(body).toHaveProperty("modified", "true");
      expect(body).toHaveProperty("color", "red");
    });
  });

  describe("edge cases", () => {
    it("handles empty body", () => {
      const styleRuleSpy = vi.fn();

      const ast = styleRule(cls("empty"));

      visit(ast, {
        "style-rule": styleRuleSpy,
      });

      expect(styleRuleSpy).toHaveBeenCalled();
    });

    it("handles single style property in body", () => {
      const ast = styleRule(cls("single"), { margin: "0" });

      visit(ast, {
        "style-rule": (node) => {
          expect(Array.isArray(node.body)).toBe(true);
          expect(node.body).toHaveLength(1);
        },
      });
    });

    it("handles mixed nested rules and style objects", () => {
      const styleRuleSpy = vi.fn();

      const ast = styleRule(
        cls("mixed"),
        { display: "flex" },
        styleRule(cls("nested"), { margin: "8px" }),
        { gap: "16px" },
      );

      visit(ast, {
        "style-rule": styleRuleSpy,
      });

      expect(styleRuleSpy).toHaveBeenCalledTimes(2);
    });
  });
});
