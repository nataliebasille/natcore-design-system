import { describe, expectTypeOf, it, expect, vi } from "vitest";
import { stylesheetVisitorBuilder } from "../ast/stylesheet-visitor-builder";
import { theme, type ThemeAst } from "../ast/theme";
import { cssv, type CssValueAst } from "../ast/cssvalue";
import { contrast, light } from "../ast/color";
import type { AstNode } from "./visitor-builder.types";

describe("theme ast visitor", () => {
  describe("type inference", () => {
    it("correctly infers node type in visitor function", () => {
      stylesheetVisitorBuilder().on("theme", (node) => {
        expectTypeOf(node).toEqualTypeOf<ThemeAst>();
        return node;
      });
    });

    it("correctly infers parent type in visitor function", () => {
      stylesheetVisitorBuilder()
        .on("theme", (node, context) => {
          expectTypeOf(context.parent).toEqualTypeOf<undefined>();
          return node;
        })
        .visit(theme({ "--test": "value" }));
    });

    it("correctly infers child node transforms", () => {
      const visitor = stylesheetVisitorBuilder()
        .on("color", (node) => {
          return `${node.mode}-${node.palette}-${node.shade}`;
        })
        .on("contrast", (node) => {
          return `contrast-for-${node.for.mode}-${node.for.palette}-${node.for.shade}`;
        });

      const ast = theme({
        "--primary": light("primary", 500),
        "--primary-text": contrast(light("primary", 500)),
      });

      const result = visitor.visit(ast);
      type Expected = ThemeAst<{
        "--primary": string;
        "--primary-text": string;
      }>;
      expectTypeOf(result).toEqualTypeOf<Expected>();
    });

    it.skip("correctly infers transformed result type", () => {
      const visitor = stylesheetVisitorBuilder().on("theme", (node) => {
        return theme({
          ...node.theme,
          "--modified": "true",
        });
      });
      const result = visitor.visit(theme({ "--original": "value" }));
      const expected = theme({
        "--original": "value",
        "--modified": "true",
      });

      type Actual = typeof result;
      type Expected = typeof expected;
      // @ts-expect-error - Doesn't currently work
      expectTypeOf(result).toEqualTypeOf<Expected>();
    });
  });

  describe("visitor invocation", () => {
    it("calls theme visitor with ThemeAst node", () => {
      const themeSpy = vi.fn((node) => node);

      const ast = theme({
        "--primary": "blue",
        "--secondary": "red",
      });

      stylesheetVisitorBuilder().on("theme", themeSpy).visit(ast);

      expect(themeSpy).toHaveBeenCalledOnce();
      expect(themeSpy).toHaveBeenCalledWith(
        ast,
        expect.objectContaining({ parent: undefined }),
      );
    });

    it("calls theme visitor with correct node properties", () => {
      const ast = theme({
        "--color": "green",
        "--spacing": "16px",
      });

      stylesheetVisitorBuilder()
        .on("theme", (node) => {
          expect(node.$ast).toBe("theme");
          expect(node.theme).toEqual({
            "--color": "green",
            "--spacing": "16px",
          });
          return node;
        })
        .visit(ast);
    });

    it("calls theme visitor for each theme in array", () => {
      const themeSpy = vi.fn((node) => node);

      const ast = [
        theme({ "--primary": "blue" }),
        theme({ "--secondary": "red" }),
        theme({ "--accent": "green" }),
      ];

      stylesheetVisitorBuilder().on("theme", themeSpy).visit(ast);

      expect(themeSpy).toHaveBeenCalledTimes(3);
    });

    it("handles empty theme properties", () => {
      const themeSpy = vi.fn((node) => node);

      const ast = theme({});

      stylesheetVisitorBuilder().on("theme", themeSpy).visit(ast);

      expect(themeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          $ast: "theme",
          theme: {},
        }),
        expect.objectContaining({ parent: undefined }),
      );
    });
  });

  describe("visitor transformation", () => {
    it("allows visitor to return new theme value", () => {
      const ast = [theme({ "--original": "value" })];
      const result = stylesheetVisitorBuilder()
        .on("theme", (node) => {
          return theme({
            ...node.theme,
            "--modified": "true",
          });
        })
        .visit(ast);

      expect(result).toEqual([
        theme({
          "--original": "value",
          "--modified": "true",
        }),
      ]);
    });

    it("calls visitor for each node when multiple returned", () => {
      let callCount = 0;

      const ast = [theme({ "--a": "1" }), theme({ "--b": "2" })];
      stylesheetVisitorBuilder()
        .on("theme", (node) => {
          callCount++;
          return theme({
            ...node.theme,
            [`--call-${callCount}`]: `${callCount}`,
          });
        })
        .visit(ast);

      expect(callCount).toBe(2);
    });
  });

  describe("visitor context", () => {
    it("passes undefined as parent for top-level theme", () => {
      const ast = theme({ "--test": "value" });
      stylesheetVisitorBuilder()
        .on("theme", (node, context) => {
          expect(context.parent).toBeUndefined();
          return node;
        })
        .visit(ast);
    });

    it("receives theme properties correctly", () => {
      const themeProps = {
        "--color-primary": "#0066cc",
        "--color-secondary": "#ff6600",
        "--spacing-base": "16px",
      };

      const ast = theme(themeProps);
      stylesheetVisitorBuilder()
        .on("theme", (node) => {
          expect(node.theme).toEqual(themeProps);
          expect(node.$ast).toBe("theme");
          return node;
        })
        .visit(ast);
    });
  });

  describe("complex scenarios", () => {
    it("handles theme with many CSS variables", () => {
      const themeSpy = vi.fn((node) => node);

      const ast = theme({
        "--primary-50": "#eff6ff",
        "--primary-100": "#dbeafe",
        "--primary-200": "#bfdbfe",
        "--primary-300": "#93c5fd",
        "--primary-400": "#60a5fa",
        "--primary-500": "#3b82f6",
        "--primary-600": "#2563eb",
        "--primary-700": "#1d4ed8",
        "--primary-800": "#1e40af",
        "--primary-900": "#1e3a8a",
      });

      stylesheetVisitorBuilder().on("theme", themeSpy).visit(ast);

      expect(themeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: expect.objectContaining({
            "--primary-50": "#eff6ff",
            "--primary-900": "#1e3a8a",
          }),
        }),
        expect.objectContaining({ parent: undefined }),
      );
    });

    it("handles theme with CSS variables referencing other variables", () => {
      const ast = theme({
        "--base-color": "#0066cc",
        "--hover-color": "var(--base-color)",
      });

      stylesheetVisitorBuilder()
        .on("theme", (node) => {
          expect(node.theme["--base-color"]).toBe("#0066cc");
          expect(node.theme["--hover-color"]).toBe("var(--base-color)");
          return node;
        })
        .visit(ast);
    });
  });

  describe("theme with css-value properties", () => {
    describe("no css-value visitor", () => {
      it("preserves css-value AST when no visitor is provided", () => {
        const cssValueNode = cssv`linear-gradient(${light("primary", 500)}, ${light("primary", 700)})`;

        const ast = theme({
          "--gradient": cssValueNode,
        });

        const visitor = stylesheetVisitorBuilder();
        visitor.on("theme", (node) => {
          expect(node.theme["--gradient"]).toEqual(cssValueNode);
          return node;
        });
        visitor.visit(ast);
      });

      it("preserves multiple css-value properties without visitor", () => {
        const gradient1 = cssv`linear-gradient(${light("primary", 500)}, ${light("primary", 700)})`;
        const gradient2 = cssv`radial-gradient(${light("primary", 300)}, ${light("primary", 900)})`;

        const ast = [
          theme({
            "--gradient-1": gradient1,
            "--gradient-2": gradient2,
          }),
        ];

        const visitor = stylesheetVisitorBuilder();
        const result = visitor.visit(ast);

        expect(result).toEqual([
          theme({
            "--gradient-1": gradient1,
            "--gradient-2": gradient2,
          }),
        ]);
      });

      it("preserves css-value AST structure without visitor", () => {
        const cssValueNode = cssv`${light("primary", 500)} / 50%`;

        const ast = [
          theme({
            "--color-alpha": cssValueNode,
          }),
        ];

        const visitor = stylesheetVisitorBuilder();
        const result = visitor.visit(ast);

        expect((result[0] as ThemeAst).theme["--color-alpha"]).toEqual(
          cssValueNode,
        );
        expect(
          ((result[0] as ThemeAst).theme["--color-alpha"] as CssValueAst).$ast,
        ).toBe("css-value");
      });
    });

    describe("css-value visitor that returns a value", () => {
      it("replaces css-value with returned value", () => {
        const originalCssValue = cssv`linear-gradient(${light("primary", 500)}, ${light("primary", 700)})`;
        const newCssValue = cssv`linear-gradient(${light("primary", 100)}, ${light("primary", 900)})`;

        const ast = [
          theme({
            "--gradient": originalCssValue,
          }),
        ];

        const visitor = stylesheetVisitorBuilder();
        visitor.on("css-value", () => newCssValue);
        const result = visitor.visit(ast);

        expect((result[0] as ThemeAst).theme["--gradient"]).toEqual(
          newCssValue,
        );
      });

      it("allows transforming css-value based on node content", () => {
        const originalCssValue = cssv`${light("primary", 500)}`;

        const ast = [
          theme({
            "--color": originalCssValue,
          }),
        ];

        const visitor = stylesheetVisitorBuilder();
        visitor.on("css-value", (node) => {
          // Transform by creating a new css-value
          return cssv`modified-${light("primary", 300)}`;
        });
        const result = visitor.visit(ast);

        expect(
          ((result[0] as ThemeAst).theme["--color"] as CssValueAst).$ast,
        ).toBe("css-value");
        expect((result[0] as ThemeAst).theme["--color"]).not.toEqual(
          originalCssValue,
        );
      });

      it("calls css-value visitor with correct parent", () => {
        const cssValueNode = cssv`${light("primary", 500)}`;
        const parentSpy = vi.fn().mockReturnValue(cssValueNode);

        const themeProperties = {
          "--color": cssValueNode,
        };
        const ast = [theme(themeProperties)];

        const visitor = stylesheetVisitorBuilder();
        visitor.on("css-value", parentSpy);
        visitor.visit(ast);

        expect(parentSpy).toHaveBeenCalledWith(
          cssValueNode,
          expect.objectContaining({
            parent: expect.objectContaining({
              "--color": cssValueNode,
            }),
          }),
        );
      });

      it("allows returning a string from css-value visitor", () => {
        const originalCssValue = cssv`${light("primary", 500)}`;

        const ast = [
          theme({
            "--color": originalCssValue,
          }),
        ];

        const visitor = stylesheetVisitorBuilder();
        visitor.on("css-value", () => "#ff0000");
        const result = visitor.visit(ast);

        expect((result[0] as ThemeAst).theme["--color"]).toBe("#ff0000");
      });

      it("processes multiple css-value properties with returning visitor", () => {
        let callCount = 0;

        const ast = [
          theme({
            "--gradient-1": cssv`${light("primary", 100)}`,
            "--gradient-2": cssv`${light("primary", 200)}`,
            "--gradient-3": cssv`${light("primary", 300)}`,
          }),
        ];

        const visitor = stylesheetVisitorBuilder();
        visitor.on("css-value", (node) => {
          callCount++;
          return cssv`transformed-${light("primary", 500)}`;
        });
        visitor.visit(ast);

        expect(callCount).toBe(3);
      });
    });

    describe("mixed theme properties with css-value", () => {
      it("handles theme with string and css-value properties", () => {
        const cssValueNode = cssv`${light("primary", 500)}`;

        const ast = [
          theme({
            "--static-color": "#ff0000",
            "--dynamic-color": cssValueNode,
            "--spacing": "16px",
          }),
        ];

        const visitor = stylesheetVisitorBuilder();
        visitor.on("css-value", (node) => cssv`transformed`);
        const result = visitor.visit(ast);

        expect((result[0] as ThemeAst).theme["--static-color"]).toBe("#ff0000");
        expect(
          ((result[0] as ThemeAst).theme["--dynamic-color"] as CssValueAst)
            .$ast,
        ).toBe("css-value");
        expect((result[0] as ThemeAst).theme["--spacing"]).toBe("16px");
      });

      it("only invokes css-value visitor for css-value nodes", () => {
        const cssValueSpy = vi.fn().mockImplementation((node) => node);

        const cssValueNode = cssv`${light("primary", 500)}`;
        const ast = [
          theme({
            "--string-prop": "#ff0000",
            "--css-value-prop": cssValueNode,
            "--number-prop": "100",
          }),
        ];

        const visitor = stylesheetVisitorBuilder();
        visitor.on("css-value", cssValueSpy);
        visitor.visit(ast);

        expect(cssValueSpy).toHaveBeenCalledTimes(1);
        expect(cssValueSpy).toHaveBeenCalledWith(
          cssValueNode,
          expect.any(Object),
        );
      });
    });

    describe("css-value type inference during transformation", () => {
      it("infers correct type when css-value visitor returns a new css-value", () => {
        const visitor = stylesheetVisitorBuilder().on(
          "css-value",
          () => "transformed-css-value" as const,
        );
        const result = visitor.visit(
          theme({
            "--color": cssv`${light("primary", 500)}`,
          }),
        );

        type Actual = typeof result;
        type Expected = ThemeAst<{
          "--color": "transformed-css-value";
        }>;
        expectTypeOf<Actual>().toEqualTypeOf<Expected>();
      });
    });
  });
});
