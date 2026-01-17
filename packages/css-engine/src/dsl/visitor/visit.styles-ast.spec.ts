import { describe, expectTypeOf, it, expect, vi } from "vitest";
import { visit, type ParentVisitorNode } from "./visit";
import {
  styleRule,
  type StyleRuleAst,
  type StyleProperties,
} from "../ast/styleRule";
import { cls } from "../ast/selector";
import { color } from "../ast/color";
import { cssv } from "../ast/cssvalue";

describe("styles visitor", () => {
  describe("type inference", () => {
    it("correctly infers node type in visitor function", () => {
      const ast = styleRule(cls("test"), { color: "red" });
      visit(ast, {
        styles: (node) => {
          expectTypeOf(node).toEqualTypeOf<StyleProperties>();
        },
      });
    });
  });

  describe("visitor invocation", () => {
    it("calls styles visitor with StyleProperties node", () => {
      const stylesSpy = vi.fn();

      const ast = styleRule(cls("button"), {
        padding: "16px",
        margin: "8px",
        "background-color": color("500"),
      });

      visit(ast, {
        styles: stylesSpy,
      });

      expect(stylesSpy).toHaveBeenCalledOnce();
      expect(stylesSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          padding: "16px",
          margin: "8px",
          "background-color": color("500"),
        }),
        expect.any(Object),
      );
    });

    it("calls styles visitor for each style object in body", () => {
      const stylesSpy = vi.fn();

      const ast = styleRule(
        cls("complex"),
        { display: "flex" },
        { "flex-direction": "column" },
        { gap: "16px" },
      );

      visit(ast, {
        styles: stylesSpy,
      });

      expect(stylesSpy).toHaveBeenCalledTimes(3);
    });

    it("calls styles visitor for multiple rules", () => {
      const stylesSpy = vi.fn();

      const ast = [
        styleRule(cls("button"), { padding: "8px" }),
        styleRule(cls("input"), { margin: "4px" }),
      ];

      visit(ast, {
        styles: stylesSpy,
      });

      expect(stylesSpy).toHaveBeenCalledTimes(2);
    });

    it("calls styles visitor for nested rules", () => {
      const stylesSpy = vi.fn();

      const ast = styleRule(
        cls("parent"),
        { display: "block" },
        styleRule(cls("child"), { margin: "0" }),
      );

      visit(ast, {
        styles: stylesSpy,
      });

      expect(stylesSpy).toHaveBeenCalledTimes(2);
    });

    it("handles style objects with various CSS properties", () => {
      const ast = styleRule(cls("flex-container"), {
        display: "flex",
        "flex-direction": "row",
        "justify-content": "center",
        "align-items": "center",
      });

      visit(ast, {
        styles: (node) => {
          expect(node).toHaveProperty("display");
          expect(node).toHaveProperty("flex-direction");
          expect(node).toHaveProperty("justify-content");
          expect(node).toHaveProperty("align-items");
        },
      });
    });
  });

  describe("visitor context", () => {
    it("receives style rule as parent", () => {
      const ast = styleRule(cls("test"), { color: "red" });

      visit(ast, {
        styles: (node, parent) => {
          expect(parent).toBeDefined();
          expect((parent as StyleRuleAst).type).toBe("style-rule");
          expect((parent as StyleRuleAst).selector).toBe(".test");
        },
      });
    });

    it("receives correct parent for each style object", () => {
      const contexts: Array<{ styles: StyleProperties; selector: string }> = [];

      const ast = [
        styleRule(cls("button"), { padding: "8px" }),
        styleRule(cls("input"), { margin: "4px" }),
      ];

      visit(ast, {
        styles: (node, parent) => {
          if (parent) {
            contexts.push({
              styles: node,
              selector: (parent as StyleRuleAst).selector as string,
            });
          }
        },
      });

      expect(contexts).toEqual([
        { styles: { padding: "8px" }, selector: ".button" },
        { styles: { margin: "4px" }, selector: ".input" },
      ]);
    });

    it("receives correct parent for nested rules", () => {
      const contexts: Array<{ hasDisplay: boolean; selector: string }> = [];

      const ast = styleRule(
        cls("parent"),
        { display: "block" },
        styleRule(cls("child"), { margin: "0" }),
      );

      visit(ast, {
        styles: (node, parent) => {
          if (parent) {
            contexts.push({
              hasDisplay: "display" in node,
              selector: (parent as StyleRuleAst).selector as string,
            });
          }
        },
      });

      expect(contexts).toEqual([
        { hasDisplay: true, selector: ".parent" },
        { hasDisplay: false, selector: ".child" },
      ]);
    });
  });

  describe("visitor transformation", () => {
    it("allows visitor to return new styles object", () => {
      const ast = styleRule(cls("test"), { color: "red" });

      const result = visit(ast, {
        styles: () => ({
          color: "blue",
          "font-size": "16px",
        }),
      });

      expect(result.body[0]).toEqual({
        color: "blue",
        "font-size": "16px",
      });
    });

    it("allows visitor to merge properties", () => {
      const ast = styleRule(cls("test"), { color: "red", padding: "8px" });

      const result = visit(ast, {
        styles: (node) => ({
          ...node,
          modified: "true",
        }),
      });

      expect(result.body[0]).toEqual({
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

      const result = visit(ast, {
        styles: (node) => {
          const newStyles = { ...node };
          if (newStyles.padding === "8px") {
            newStyles.padding = "16px";
          }
          return newStyles;
        },
      });

      expect(result[0]?.body[0]).toEqual({ padding: "16px" });
      expect(result[1]?.body[0]).toEqual({ padding: "24px" });
    });

    it("allows visitor to return undefined", () => {
      const stylesSpy = vi.fn().mockReturnValue(undefined);

      const originalStyles = { color: "red", padding: "8px" };
      const ast = styleRule(cls("test"), originalStyles);

      const result = visit(ast, {
        styles: stylesSpy,
      });

      expect(stylesSpy).toHaveBeenCalled();
      expect(result.body[0]).toEqual(originalStyles);
    });

    it("preserves original styles when visitor returns void", () => {
      const originalStyles = { color: "green", margin: "16px" };
      const ast = styleRule(cls("preserved"), originalStyles);

      const result = visit(ast, {
        styles: () => {
          // Perform some side effect but don't return
        },
      });

      expect(result.body[0]).toEqual(originalStyles);
    });
  });

  describe("property-specific visitors", () => {
    it("allows property-specific visitor for single property", () => {
      const ast = styleRule(cls("test"), {
        color: "#ff0000",
        padding: "8px",
      });

      const result = visit(ast, {
        styles: {
          color: (value) => "#000000",
        },
      });
      expect((result.body[0] as StyleProperties).color).toBe("#000000");
      expect((result.body[0] as StyleProperties).padding).toBe("8px");
    });

    it("allows multiple property-specific visitors", () => {
      const ast = styleRule(cls("test"), {
        color: "#ff0000",
        padding: "8px",
        margin: "4px",
      });

      const result = visit(ast, {
        styles: {
          color: () => "#000000",
          padding: () => "16px",
        },
      });
      const styles = result.body[0] as StyleProperties;

      expect(styles.color).toBe("#000000");
      expect(styles.padding).toBe("16px");
      expect(styles.margin).toBe("4px");
    });

    it("property-specific visitor receives parent styles", () => {
      const ast = styleRule(cls("test"), {
        color: "red",
        padding: "8px",
      });

      visit(ast, {
        styles: {
          padding: (value, parent) => {
            expect(parent).toHaveProperty("color");
            expect(parent).toHaveProperty("padding");
            return "32px";
          },
        },
      });
    });

    it("property-specific visitor can return undefined", () => {
      const ast = styleRule(cls("test"), {
        color: "#ff0000",
        padding: "8px",
      });

      const result = visit(ast, {
        styles: {
          color: () => undefined,
        },
      });
      expect((result.body[0] as StyleProperties).color).toBe("#ff0000");
    });
  });

  describe("complex scenarios", () => {
    it("handles styles with color nodes", () => {
      const ast = styleRule(cls("button"), {
        "background-color": color("500"),
        padding: "16px",
      });

      visit(ast, {
        styles: (node) => {
          expect(node["background-color"]).toBeDefined();
          expect(node["background-color"]).toEqual(color("500"));
        },
      });
    });

    it("handles styles with css-value nodes", () => {
      const ast = styleRule(cls("gradient"), {
        "background-image": cssv`linear-gradient(${color("300")}, ${color("700")})`,
      });

      visit(ast, {
        styles: (node) => {
          expect(node["background-image"]).toBeDefined();
        },
      });
    });

    it("handles multiple style objects in single rule", () => {
      const callCount = { count: 0 };

      const ast = styleRule(
        cls("multi"),
        { display: "flex" },
        { "flex-direction": "column" },
        { gap: "16px" },
        { padding: "24px" },
      );

      visit(ast, {
        styles: () => {
          callCount.count++;
        },
      });

      expect(callCount.count).toBe(4);
    });

    it("transforms all style objects in complex nested structure", () => {
      const ast = styleRule(
        cls("parent"),
        { display: "block" },
        styleRule(
          cls("child"),
          { margin: "8px" },
          styleRule(cls("grandchild"), { padding: "4px" }),
        ),
      );

      const result = visit(ast, {
        styles: (node) => ({
          ...node,
          modified: "true",
        }),
      });

      expect(result.body[0]).toHaveProperty("modified");

      const childRule = result.body[1];
      expect(childRule.body[0]).toHaveProperty("modified");

      const grandchildRule = childRule.body[1];
      expect(grandchildRule.body[0]).toHaveProperty("modified");
    });

    it("handles empty style objects", () => {
      const stylesSpy = vi.fn();

      const ast = styleRule(cls("empty"), {});

      visit(ast, {
        styles: stylesSpy,
      });

      expect(stylesSpy).toHaveBeenCalledWith({}, expect.any(Object));
    });

    it("handles style objects with many properties", () => {
      const ast = styleRule(cls("complex"), {
        display: "flex",
        "flex-direction": "column",
        "justify-content": "center",
        "align-items": "stretch",
        gap: "16px",
        padding: "24px",
        margin: "0 auto",
        "max-width": "1200px",
        "background-color": color("50"),
        "border-radius": "8px",
      });

      visit(ast, {
        styles: (node) => {
          const keys = Object.keys(node);
          expect(keys.length).toBeGreaterThan(5);
        },
      });
    });
  });

  describe("interaction with other visitors", () => {
    it("works alongside color visitor (but color visitor doesn't affect style properties)", () => {
      const stylesSpy = vi.fn().mockImplementation((node) => node);
      const colorSpy = vi.fn().mockImplementation((node) => node);

      const ast = styleRule(cls("test"), {
        "background-color": color("500"),
        color: color("100"),
      });

      visit(ast, {
        styles: stylesSpy,
        color: colorSpy,
      });

      expect(stylesSpy).toHaveBeenCalled();
      // Color visitor only works on theme properties, not style properties
      expect(colorSpy).not.toHaveBeenCalled();
    });

    it("works alongside css-value visitor (but css-value visitor doesn't affect style properties)", () => {
      const stylesSpy = vi.fn().mockImplementation((node) => node);
      const cssValueSpy = vi.fn().mockImplementation((node) => node);

      const ast = styleRule(cls("test"), {
        "background-image": cssv`linear-gradient(${color("500")}, ${color("700")})`,
      });

      visit(ast, {
        styles: stylesSpy,
        "css-value": cssValueSpy,
      });

      expect(stylesSpy).toHaveBeenCalled();
      // CSS-value visitor only works on theme properties, not style properties
      expect(cssValueSpy).not.toHaveBeenCalled();
    });

    it("styles visitor can transform style properties including color nodes", () => {
      const ast = styleRule(cls("button"), {
        "background-color": color("500"),
        color: color("100"),
      });

      const result = visit(ast, {
        styles: (node) => {
          // Manually transform colors in styles visitor
          const newNode = { ...node };
          if (
            newNode["background-color"] &&
            typeof newNode["background-color"] === "object" &&
            "type" in newNode["background-color"]
          ) {
            newNode["background-color"] = color("900");
          }
          if (
            newNode.color &&
            typeof newNode.color === "object" &&
            "type" in newNode.color
          ) {
            newNode.color = color("900");
          }
          return newNode;
        },
      });
      const styles = result.body[0] as StyleProperties;

      expect(styles["background-color"]).toEqual(color("900"));
      expect(styles.color).toEqual(color("900"));
    });

    it("styles transformation can add properties and preserve existing ones", () => {
      const ast = styleRule(cls("card"), {
        "background-color": color("100"),
        color: color("900"),
      });

      const result = visit(ast, {
        styles: (node) => ({
          ...node,
          border: "1px solid black",
        }),
      });
      const styles = result.body[0] as StyleProperties;

      expect(styles["background-color"]).toEqual(color("100"));
      expect(styles.color).toEqual(color("900"));
      expect(styles.border).toBe("1px solid black");
    });
  });

  describe("edge cases", () => {
    it("handles styles in deeply nested rules", () => {
      const stylesSpy = vi.fn();

      const ast = styleRule(
        cls("level1"),
        { color: "red" },
        styleRule(
          cls("level2"),
          { color: "green" },
          styleRule(
            cls("level3"),
            { color: "blue" },
            styleRule(cls("level4"), { color: "yellow" }),
          ),
        ),
      );

      visit(ast, {
        styles: stylesSpy,
      });

      expect(stylesSpy).toHaveBeenCalledTimes(4);
    });

    it("handles mixed body items with rules and styles", () => {
      const stylesSpy = vi.fn();

      const ast = styleRule(
        cls("mixed"),
        { display: "flex" },
        styleRule(cls("nested"), { margin: "8px" }),
        { gap: "16px" },
        { padding: "24px" },
      );

      visit(ast, {
        styles: stylesSpy,
      });

      expect(stylesSpy).toHaveBeenCalledTimes(4); // parent + nested + 2 style objects
    });

    it("preserves style object reference when not transformed", () => {
      const originalStyles = { color: "red", padding: "8px" };

      const ast = styleRule(cls("test"), originalStyles);

      const result = visit(ast, {
        styles: () => {
          // No return
        },
      });

      expect(result.body[0]).toEqual(originalStyles);
    });

    it("handles styles with numeric values", () => {
      const ast = styleRule(cls("test"), {
        "z-index": "10",
        opacity: "0.8",
      });

      visit(ast, {
        styles: (node) => {
          expect(node).toHaveProperty("z-index");
          expect(node).toHaveProperty("opacity");
        },
      });
    });
  });

  describe("performance scenarios", () => {
    it("handles many style objects efficiently", () => {
      const stylesSpy = vi.fn().mockImplementation((node) => node);

      const rules = Array.from({ length: 100 }, (_, i) =>
        styleRule(cls(`rule-${i}`), { color: "red", padding: `${i}px` }),
      );

      visit(rules, {
        styles: stylesSpy,
      });

      expect(stylesSpy).toHaveBeenCalledTimes(100);
    });

    it("handles deeply nested structure efficiently", () => {
      const stylesSpy = vi.fn().mockImplementation((node) => node);

      let ast: StyleRuleAst = styleRule(cls("level-0"), { color: "red" });
      for (let i = 1; i < 10; i++) {
        ast = styleRule(cls(`level-${i}`), { color: "blue" }, ast);
      }

      visit(ast, {
        styles: stylesSpy,
      });

      expect(stylesSpy).toHaveBeenCalledTimes(10);
    });
  });
});
