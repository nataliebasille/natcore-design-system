import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { light } from "../ast/cssvalue/color";
import { cssv } from "../ast/cssvalue/public";
import { cls, element, id } from "../ast/selector";
import {
  styleRule,
  type StyleListAst,
  type StyleProperties,
  type StyleRuleAst,
} from "../ast/style-rule";
import { stylesheetVisitorBuilder } from "../ast/stylesheet-visitor-builder";

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
        expect(
          ((node.body[0] as StyleListAst).styles as StyleProperties[])[0],
        ).toEqual({
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

      expect(result[0]!.body[0].styles[0]).toEqual({ modified: "true" });
    });

    it("allows visitor to transform based on selector", () => {
      const ast = [
        styleRule(cls("button"), { color: "blue" }),
        styleRule(cls("input"), { color: "red" }),
      ];

      const visitor = stylesheetVisitorBuilder();
      visitor.on("style-rule", (node) => {
        if (node.selector === ".button") {
          return styleRule(node.selector, { color: "blue", padding: "16px" });
        }
        return node;
      });
      const result = visitor.visit(ast);

      const buttonRule = result[0]?.body[0].styles[0]!;
      expect(buttonRule).toEqual({ padding: "16px", color: "blue" });

      const inputRule = result[1]?.body[0].styles[0]!;
      expect(inputRule).toEqual({ color: "red" });
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
        const body = (
          Array.isArray(node.body) ?
            node.body[0]
          : node.body) as StyleListAst;
        expect(
          (body.styles[0] as StyleProperties)?.["background-color"],
        ).toBeDefined();
        expect(
          (body.styles[0] as StyleProperties)?.["background-image"],
        ).toBeDefined();
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
});
