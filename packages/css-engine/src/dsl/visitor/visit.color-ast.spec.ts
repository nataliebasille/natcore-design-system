import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { contrast, light, type ColorAst } from "../ast/color";
import { theme, type ThemeAst } from "../ast/theme";
import { stylesheetVisitorBuilder } from "../ast/stylesheet-visitor-builder";

describe("color ast visitor", () => {
  describe("type inference", () => {
    it("correctly infers node type in visitor function", () => {
      stylesheetVisitorBuilder()
        .on("color", (node) => {
          expectTypeOf(node).toEqualTypeOf<ColorAst>();
          return node;
        })
        .visit(theme({ "--test": light("primary", 500) }));
    });

    it("correctly infers parent type in visitor function", () => {
      stylesheetVisitorBuilder()
        .on("color", (node, context) => {
          expectTypeOf(context.parent).toMatchTypeOf<
            Record<string, any> | undefined
          >();
          return node;
        })
        .visit(theme({ "--test": light("primary", 500) }));
    });
  });

  describe("visitor invocation", () => {
    it("calls color visitor with ColorAst node", () => {
      const colorSpy = vi.fn().mockImplementation((node) => node);

      const ast = theme({
        "--primary": light("primary", 500),
        "--secondary": light("primary", 700),
      });

      stylesheetVisitorBuilder().on("color", colorSpy).visit(ast);

      expect(colorSpy).toHaveBeenCalledTimes(2);
      expect(colorSpy).toHaveBeenCalledWith(
        light("primary", 500),
        expect.objectContaining({
          parent: expect.objectContaining({
            "--primary": light("primary", 500),
            "--secondary": light("primary", 700),
          }),
        }),
      );
    });

    it("calls color visitor with correct node properties", () => {
      const ast = theme({
        "--test-color": light("primary", 300),
      });

      stylesheetVisitorBuilder()
        .on("color", (node) => {
          expect(node).toEqual(light("primary", 300));
          return node;
        })
        .visit(ast);
    });

    it("calls color visitor with opacity value", () => {
      const ast = theme({
        "--semi-transparent": light("primary", 500, 0.5),
      });

      stylesheetVisitorBuilder()
        .on("color", (node) => {
          expect(node).toEqual(light("primary", 500, 0.5));
          return node;
        })
        .visit(ast);
    });

    it("calls color visitor for each color in theme", () => {
      const colorSpy = vi.fn();

      const ast = theme({
        "--primary": light("primary", 500),
        "--secondary": light("primary", 600),
        "--tertiary": light("primary", 700),
        "--accent": light("primary", 800),
      });

      stylesheetVisitorBuilder().on("color", colorSpy).visit(ast);

      expect(colorSpy).toHaveBeenCalledTimes(4);
    });

    it("calls color visitor for text color values", () => {
      const ast = theme({
        "--text-color": contrast(light("primary", 500)),
      });

      stylesheetVisitorBuilder()
        .on("color", (node) => {
          expect(node).toEqual(light("primary", 500));
          return node;
        })
        .visit(ast);
    });

    it("handles multiple themes with color values", () => {
      const colorSpy = vi.fn();

      const ast = [
        theme({ "--primary": light("primary", 500) }),
        theme({ "--secondary": light("primary", 600) }),
      ];

      stylesheetVisitorBuilder().on("color", colorSpy).visit(ast);

      expect(colorSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("visitor context", () => {
    it("receives theme properties as parent", () => {
      const ast = theme({
        "--primary": light("primary", 500),
        "--secondary": "#ff0000",
      });

      stylesheetVisitorBuilder()
        .on("color", (node, context) => {
          expect(context.parent).toBeDefined();
          expect(context.parent).toHaveProperty("--primary");
          expect(context.parent).toHaveProperty("--secondary");
          return node;
        })
        .visit(ast);
    });

    it("receives correct parent context for nested properties", () => {
      const colorSpy = vi.fn().mockImplementation((node) => node);

      const themeProperties = {
        "--color-1": light("primary", 100),
        "--color-2": light("primary", 200),
        "--static": "#000000",
      };

      const ast = theme(themeProperties);
      const visitor = stylesheetVisitorBuilder().on("color", colorSpy);

      visitor.visit(ast);

      expect(colorSpy).toHaveBeenCalledWith(
        light("primary", 100),
        expect.objectContaining({
          parent: expect.objectContaining(themeProperties),
        }),
      );
      expect(colorSpy).toHaveBeenCalledWith(
        light("primary", 200),
        expect.objectContaining({
          parent: expect.objectContaining(themeProperties),
        }),
      );
    });
  });

  describe("visitor transformation", () => {
    it("allows visitor to return new color value", () => {
      const ast = [theme({ "--original": light("primary", 100) })];
      const result = stylesheetVisitorBuilder()
        .on("color", (node) => {
          return light("primary", 900);
        })
        .visit(ast);

      expect(result[0]?.theme["--original"]).toEqual(light("primary", 900));
    });

    it("allows visitor to transform based on node value", () => {
      const ast = theme({
        "--should-change": light("primary", 500),
        "--should-stay": light("primary", 300),
      });

      const result = stylesheetVisitorBuilder()
        .on("color", (node) => {
          if (node.shade === 500) {
            return light("primary", 600);
          }
          return node;
        })
        .visit(ast);

      expect(result.theme["--should-change"]).toEqual(light("primary", 600));
      expect(result.theme["--should-stay"]).toEqual(light("primary", 300));
    });

    it("allows visitor to add opacity to color", () => {
      const ast = theme({ "--color": light("primary", 500) });
      const result = stylesheetVisitorBuilder()
        .on("color", (node) => {
          return light(node.palette, node.shade, 0.8);
        })
        .visit(ast);

      expect(result.theme["--color"]).toEqual(light("primary", 500, 0.8));
    });
  });

  describe("complex scenarios", () => {
    it("handles theme with multiple color shades", () => {
      const colorSpy = vi.fn().mockImplementation((node) => node);

      const ast = theme({
        "--primary-50": light("primary", 50),
        "--primary-100": light("primary", 100),
        "--primary-200": light("primary", 200),
        "--primary-300": light("primary", 300),
        "--primary-400": light("primary", 400),
        "--primary-500": light("primary", 500),
        "--primary-600": light("primary", 600),
        "--primary-700": light("primary", 700),
        "--primary-800": light("primary", 800),
        "--primary-900": light("primary", 900),
      });

      stylesheetVisitorBuilder().on("color", colorSpy).visit(ast);

      expect(colorSpy).toHaveBeenCalledTimes(10);
    });

    it("transforms colors and contrast colors", () => {
      const ast = theme({
        "--primary": light("primary", 500),
        "--primary-text": contrast(light("primary", 500)),
        "--secondary": light("primary", 600),
        "--secondary-text": contrast(light("primary", 600)),
      });

      const visitor = stylesheetVisitorBuilder()
        .on("color", (node) => {
          return `${node.mode}-${node.palette}-${node.shade}`;
        })
        .on("contrast", (node) => {
          return `contrast-for-${node.for.mode}-${node.for.palette}-${node.for.shade}`;
        });

      const result = visitor.visit(ast);

      expect(result.theme["--primary"]).toEqual("light-primary-500");
      expect(result.theme["--primary-text"]).toEqual(
        "contrast-for-light-primary-500",
      );
      expect(result.theme["--secondary"]).toEqual("light-primary-600");
      expect(result.theme["--secondary-text"]).toEqual(
        "contrast-for-light-primary-600",
      );
    });

    it("handles theme with colors with various opacity values", () => {
      const opacityValues: (number | undefined)[] = [];

      const ast = theme({
        "--full": light("primary", 500),
        "--semi": light("primary", 500, 0.5),
        "--quarter": light("primary", 500, 0.25),
        "--transparent": light("primary", 500, 0.1),
      });

      stylesheetVisitorBuilder()
        .on("color", (node) => {
          opacityValues.push(node.opacity);
          return node;
        })
        .visit(ast);

      expect(opacityValues).toEqual([undefined, 0.5, 0.25, 0.1]);
    });
  });

  describe("mixed theme properties", () => {
    it("only calls color visitor for color nodes", () => {
      const colorSpy = vi.fn().mockImplementation((node) => node);

      const ast = theme({
        "--string-color": "#ff0000",
        "--color-node": light("primary", 500),
        "--another-string": "rgb(255, 0, 0)",
      });

      stylesheetVisitorBuilder().on("color", colorSpy).visit(ast);

      expect(colorSpy).toHaveBeenCalledTimes(1);
      expect(colorSpy).toHaveBeenCalledWith(
        light("primary", 500),
        expect.any(Object),
      );
    });

    it("preserves non-color properties while transforming colors", () => {
      const ast = [
        theme({
          "--static": "#ff0000",
          "--dynamic": light("primary", 500),
          "--spacing": "16px",
        }),
      ];

      const result = stylesheetVisitorBuilder()
        .on("color", () => light("primary", 999 as any))
        .visit(ast);

      expect((result[0] as ThemeAst).theme["--static"]).toBe("#ff0000");
      expect((result[0] as ThemeAst).theme["--dynamic"]).toEqual(
        light("primary", 999 as any),
      );
      expect((result[0] as ThemeAst).theme["--spacing"]).toBe("16px");
    });
  });
});
