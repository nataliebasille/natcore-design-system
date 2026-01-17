import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { color, type ColorAst } from "../ast/color";
import { theme, type ThemeAst } from "../ast/theme";
import type { ParentVisitorNode } from "./visit";
import { visit } from "./visit";

describe("color ast visitor", () => {
  describe("type inference", () => {
    it("correctly infers node type in visitor function", () => {
      visit(theme({ "--test": color("500") }), {
        color: (node) => {
          expectTypeOf(node).toEqualTypeOf<ColorAst>();
        },
      });
    });

    it("correctly infers parent type in visitor function", () => {
      type Parent = ParentVisitorNode<ColorAst, ThemeAst>;
      visit(theme({ "--test": color("500") }), {
        color: (node, parent) => {
          expectTypeOf(parent).toEqualTypeOf<Parent>();
        },
      });
    });
  });

  describe("visitor invocation", () => {
    it("calls color visitor with ColorAst node", () => {
      const colorSpy = vi.fn();

      const ast = theme({
        "--primary": color("500"),
        "--secondary": color("700"),
      });

      visit(ast, {
        color: colorSpy,
      });

      expect(colorSpy).toHaveBeenCalledTimes(2);
      expect(colorSpy).toHaveBeenCalledWith(
        color("500"),
        expect.objectContaining({
          "--primary": color("500"),
          "--secondary": color("700"),
        }),
      );
    });

    it("calls color visitor with correct node properties", () => {
      const ast = theme({
        "--test-color": color("300"),
      });

      visit(ast, {
        color: (node) => {
          expect(node.type).toBe("color");
          expect(node.value).toBe("300");
          expect(node.opacity).toBeUndefined();
        },
      });
    });

    it("calls color visitor with opacity value", () => {
      const ast = theme({
        "--semi-transparent": color("500", 0.5),
      });

      visit(ast, {
        color: (node) => {
          expect(node.type).toBe("color");
          expect(node.value).toBe("500");
          expect(node.opacity).toBe(0.5);
        },
      });
    });

    it("calls color visitor for each color in theme", () => {
      const colorSpy = vi.fn();

      const ast = theme({
        "--primary": color("500"),
        "--secondary": color("600"),
        "--tertiary": color("700"),
        "--accent": color("800"),
      });

      visit(ast, {
        color: colorSpy,
      });

      expect(colorSpy).toHaveBeenCalledTimes(4);
    });

    it("calls color visitor for text color values", () => {
      const ast = theme({
        "--text-color": color("500-text"),
      });

      visit(ast, {
        color: (node) => {
          expect(node.value).toBe("500-text");
        },
      });
    });

    it("handles multiple themes with color values", () => {
      const colorSpy = vi.fn();

      const ast = [
        theme({ "--primary": color("500") }),
        theme({ "--secondary": color("600") }),
      ];

      visit(ast, {
        color: colorSpy,
      });

      expect(colorSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("visitor context", () => {
    it("receives theme properties as parent", () => {
      const ast = theme({
        "--primary": color("500"),
        "--secondary": "#ff0000",
      });

      visit(ast, {
        color: (node, parent) => {
          expect(parent).toBeDefined();
          expect(parent).toHaveProperty("--primary");
          expect(parent).toHaveProperty("--secondary");
        },
      });
    });

    it("receives correct parent context for nested properties", () => {
      const colorSpy = vi.fn();

      const themeProperties = {
        "--color-1": color("100"),
        "--color-2": color("200"),
        "--static": "#000000",
      };

      const ast = theme(themeProperties);
      visit(ast, {
        color: colorSpy,
      });

      expect(colorSpy).toHaveBeenCalledWith(
        color("100"),
        expect.objectContaining(themeProperties),
      );
      expect(colorSpy).toHaveBeenCalledWith(
        color("200"),
        expect.objectContaining(themeProperties),
      );
    });
  });

  describe("visitor transformation", () => {
    it("allows visitor to return new color value", () => {
      const ast = [theme({ "--original": color("100") })];
      const result = visit(ast, {
        color: (node) => {
          return color("900");
        },
      });

      expect(result[0]?.theme["--original"]).toEqual(color("900"));
    });

    it("allows visitor to transform based on node value", () => {
      const ast = [
        theme({
          "--should-change": color("500"),
          "--should-stay": color("300"),
        }),
      ];
      const result = visit(ast, {
        color: (node) => {
          if (node.value === "500") {
            return color("600");
          }
          return node;
        },
      });

      expect((result[0] as ThemeAst).theme["--should-change"]).toEqual(
        color("600"),
      );
      expect((result[0] as ThemeAst).theme["--should-stay"]).toEqual(
        color("300"),
      );
    });

    it("allows visitor to add opacity to color", () => {
      const ast = [theme({ "--color": color("500") })];
      const result = visit(ast, {
        color: (node) => {
          return color(node.value, 0.8);
        },
      });

      expect((result[0] as ThemeAst).theme["--color"]).toEqual(
        color("500", 0.8),
      );
    });

    it("allows visitor to return undefined", () => {
      const colorSpy = vi.fn().mockReturnValue(undefined);

      const originalColor = color("500");
      const ast = [theme({ "--test": originalColor })];
      const result = visit(ast, {
        color: colorSpy,
      });

      expect(colorSpy).toHaveBeenCalled();
      expect((result[0] as ThemeAst).theme["--test"]).toEqual(originalColor);
    });

    it("preserves original color when visitor returns void", () => {
      const originalColor = color("700", 0.5);

      const ast = [theme({ "--preserved": originalColor })];
      const result = visit(ast, {
        color: () => {
          // Perform some side effect but don't return
        },
      });

      expect((result[0] as ThemeAst).theme["--preserved"]).toEqual(
        originalColor,
      );
    });
  });

  describe("complex scenarios", () => {
    it("handles theme with multiple color shades", () => {
      const colorSpy = vi.fn().mockImplementation((node) => node);

      const ast = theme({
        "--primary-50": color("50"),
        "--primary-100": color("100"),
        "--primary-200": color("200"),
        "--primary-300": color("300"),
        "--primary-400": color("400"),
        "--primary-500": color("500"),
        "--primary-600": color("600"),
        "--primary-700": color("700"),
        "--primary-800": color("800"),
        "--primary-900": color("900"),
      });

      visit(ast, {
        color: colorSpy,
      });

      expect(colorSpy).toHaveBeenCalledTimes(10);
    });

    it("handles theme with color and text color pairs", () => {
      const colorValues: ColorAst[] = [];

      const ast = theme({
        "--primary": color("500"),
        "--primary-text": color("500-text"),
        "--secondary": color("600"),
        "--secondary-text": color("600-text"),
      });

      visit(ast, {
        color: (node) => {
          colorValues.push(node);
        },
      });

      expect(colorValues).toHaveLength(4);
      expect(colorValues[0]?.value).toBe("500");
      expect(colorValues[1]?.value).toBe("500-text");
      expect(colorValues[2]?.value).toBe("600");
      expect(colorValues[3]?.value).toBe("600-text");
    });

    it("handles theme with colors with various opacity values", () => {
      const opacityValues: (number | undefined)[] = [];

      const ast = theme({
        "--full": color("500"),
        "--semi": color("500", 0.5),
        "--quarter": color("500", 0.25),
        "--transparent": color("500", 0.1),
      });

      visit(ast, {
        color: (node) => {
          opacityValues.push(node.opacity);
        },
      });

      expect(opacityValues).toEqual([undefined, 0.5, 0.25, 0.1]);
    });

    it("transforms all colors in multiple themes", () => {
      const ast = [
        theme({ "--light": color("100") }),
        theme({ "--medium": color("500") }),
        theme({ "--dark": color("800") }),
      ];

      const result = visit(ast, {
        color: (node) => {
          // Darken all colors by increasing the shade
          const currentShade = parseInt(node.value);
          if (!isNaN(currentShade) && currentShade < 900) {
            return color(`${currentShade + 100}` as any, node.opacity);
          }
          return node;
        },
      });

      expect((result[0] as ThemeAst).theme["--light"]).toEqual(color("200"));
      expect((result[1] as ThemeAst).theme["--medium"]).toEqual(color("600"));
      expect((result[2] as ThemeAst).theme["--dark"]).toEqual(color("900"));
    });
  });

  describe("mixed theme properties", () => {
    it("only calls color visitor for color nodes", () => {
      const colorSpy = vi.fn().mockImplementation((node) => node);

      const ast = theme({
        "--string-color": "#ff0000",
        "--color-node": color("500"),
        "--another-string": "rgb(255, 0, 0)",
      });

      visit(ast, {
        color: colorSpy,
      });

      expect(colorSpy).toHaveBeenCalledTimes(1);
      expect(colorSpy).toHaveBeenCalledWith(color("500"), expect.any(Object));
    });

    it("preserves non-color properties while transforming colors", () => {
      const ast = [
        theme({
          "--static": "#ff0000",
          "--dynamic": color("500"),
          "--spacing": "16px",
        }),
      ];

      const result = visit(ast, {
        color: () => color("999" as any),
      });

      expect((result[0] as ThemeAst).theme["--static"]).toBe("#ff0000");
      expect((result[0] as ThemeAst).theme["--dynamic"]).toEqual(
        color("999" as any),
      );
      expect((result[0] as ThemeAst).theme["--spacing"]).toBe("16px");
    });
  });
});
