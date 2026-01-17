import { describe, expectTypeOf, it, expect, vi } from "vitest";
import { visit } from "./visit";
import { theme, type ThemeAst } from "../ast/theme";
import { cssv, type CssValueAst } from "../ast/cssvalue";
import { color } from "../ast/color";

describe("theme ast visitor", () => {
  describe("type inference", () => {
    it("correctly infers node type in visitor function", () => {
      visit(theme({ "--test": "value" }), {
        theme: (node) => {
          expectTypeOf(node).toEqualTypeOf<ThemeAst>();
        },
      });
    });

    it("correctly infers parent type in visitor function", () => {
      visit(theme({ "--test": "value" }), {
        theme: (node, parent) => {
          expectTypeOf(parent).toEqualTypeOf<undefined>();
        },
      });
    });
  });

  describe("visitor invocation", () => {
    it("calls theme visitor with ThemeAst node", () => {
      const themeSpy = vi.fn();

      const ast = theme({
        "--primary": "blue",
        "--secondary": "red",
      });

      visit(ast, {
        theme: themeSpy,
      });

      expect(themeSpy).toHaveBeenCalledOnce();
      expect(themeSpy).toHaveBeenCalledWith(ast, undefined);
    });

    it("calls theme visitor with correct node properties", () => {
      const ast = theme({
        "--color": "green",
        "--spacing": "16px",
      });

      visit(ast, {
        theme: (node) => {
          expect(node.type).toBe("theme");
          expect(node.theme).toEqual({
            "--color": "green",
            "--spacing": "16px",
          });
        },
      });
    });

    it("calls theme visitor for each theme in array", () => {
      const themeSpy = vi.fn();

      const ast = [
        theme({ "--primary": "blue" }),
        theme({ "--secondary": "red" }),
        theme({ "--accent": "green" }),
      ];

      visit(ast, {
        theme: themeSpy,
      });

      expect(themeSpy).toHaveBeenCalledTimes(3);
    });

    it("handles empty theme properties", () => {
      const themeSpy = vi.fn();

      const ast = theme({});

      visit(ast, {
        theme: themeSpy,
      });

      expect(themeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "theme",
          theme: {},
        }),
        undefined,
      );
    });
  });

  describe("visitor transformation", () => {
    it("allows visitor to return new theme value", () => {
      const ast = [theme({ "--original": "value" })];
      const result = visit(ast, {
        theme: (node) => {
          return theme({
            ...node.theme,
            "--modified": "true",
          });
        },
      });

      expect(result).toEqual([
        theme({
          "--original": "value",
          "--modified": "true",
        }),
      ]);
    });

    it("allows visitor to return undefined", () => {
      const themeSpy = vi.fn().mockReturnValue(undefined);

      const ast = [theme({ "--test": "value" })];
      const result = visit(ast, {
        theme: themeSpy,
      });

      expect(themeSpy).toHaveBeenCalled();
      expect(result).toEqual(ast);
    });

    it("calls visitor for each node when multiple returned", () => {
      let callCount = 0;

      const ast = [theme({ "--a": "1" }), theme({ "--b": "2" })];
      visit(ast, {
        theme: (node) => {
          callCount++;
          return theme({
            ...node.theme,
            [`--call-${callCount}`]: `${callCount}`,
          });
        },
      });

      expect(callCount).toBe(2);
    });
  });

  describe("visitor context", () => {
    it("passes undefined as parent for top-level theme", () => {
      const ast = theme({ "--test": "value" });
      visit(ast, {
        theme: (node, parent) => {
          expect(parent).toBeUndefined();
        },
      });
    });

    it("receives theme properties correctly", () => {
      const themeProps = {
        "--color-primary": "#0066cc",
        "--color-secondary": "#ff6600",
        "--spacing-base": "16px",
      };

      const ast = theme(themeProps);
      visit(ast, {
        theme: (node) => {
          expect(node.theme).toEqual(themeProps);
          expect(node.type).toBe("theme");
        },
      });
    });
  });

  describe("complex scenarios", () => {
    it("handles theme with many CSS variables", () => {
      const themeSpy = vi.fn();

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

      visit(ast, {
        theme: themeSpy,
      });

      expect(themeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: expect.objectContaining({
            "--primary-50": "#eff6ff",
            "--primary-900": "#1e3a8a",
          }),
        }),
        undefined,
      );
    });

    it("handles theme with CSS variables referencing other variables", () => {
      const ast = theme({
        "--base-color": "#0066cc",
        "--hover-color": "var(--base-color)",
      });

      visit(ast, {
        theme: (node) => {
          expect(node.theme["--base-color"]).toBe("#0066cc");
          expect(node.theme["--hover-color"]).toBe("var(--base-color)");
        },
      });
    });
  });

  describe("theme with css-value properties", () => {
    describe("no css-value visitor", () => {
      it("preserves css-value AST when no visitor is provided", () => {
        const cssValueNode = cssv`linear-gradient(${color("500")}, ${color("700")})`;

        const ast = theme({
          "--gradient": cssValueNode,
        });

        visit(ast, {
          theme: (node) => {
            expect(node.theme["--gradient"]).toEqual(cssValueNode);
          },
        });
      });

      it("preserves multiple css-value properties without visitor", () => {
        const gradient1 = cssv`linear-gradient(${color("500")}, ${color("700")})`;
        const gradient2 = cssv`radial-gradient(${color("300")}, ${color("900")})`;

        const ast = [
          theme({
            "--gradient-1": gradient1,
            "--gradient-2": gradient2,
          }),
        ];

        const result = visit(ast, {});

        expect(result).toEqual([
          theme({
            "--gradient-1": gradient1,
            "--gradient-2": gradient2,
          }),
        ]);
      });

      it("preserves css-value AST structure without visitor", () => {
        const cssValueNode = cssv`${color("500")} / 50%`;

        const ast = [
          theme({
            "--color-alpha": cssValueNode,
          }),
        ];

        const result = visit(ast, {});

        expect((result[0] as ThemeAst).theme["--color-alpha"]).toEqual(
          cssValueNode,
        );
        expect(
          ((result[0] as ThemeAst).theme["--color-alpha"] as CssValueAst).type,
        ).toBe("css-value");
      });
    });

    describe("css-value visitor that returns a value", () => {
      it("replaces css-value with returned value", () => {
        const originalCssValue = cssv`linear-gradient(${color("500")}, ${color("700")})`;
        const newCssValue = cssv`linear-gradient(${color("100")}, ${color("900")})`;

        const ast = [
          theme({
            "--gradient": originalCssValue,
          }),
        ];

        const result = visit(ast, {
          "css-value": () => newCssValue,
        });

        expect((result[0] as ThemeAst).theme["--gradient"]).toEqual(
          newCssValue,
        );
      });

      it("allows transforming css-value based on node content", () => {
        const originalCssValue = cssv`${color("500")}`;

        const ast = [
          theme({
            "--color": originalCssValue,
          }),
        ];

        const result = visit(ast, {
          "css-value": (node) => {
            // Transform by creating a new css-value
            return cssv`modified-${color("300")}`;
          },
        });

        expect(
          ((result[0] as ThemeAst).theme["--color"] as CssValueAst).type,
        ).toBe("css-value");
        expect((result[0] as ThemeAst).theme["--color"]).not.toEqual(
          originalCssValue,
        );
      });

      it("calls css-value visitor with correct parent", () => {
        const cssValueNode = cssv`${color("500")}`;
        const parentSpy = vi.fn().mockReturnValue(cssValueNode);

        const themeProperties = {
          "--color": cssValueNode,
        };
        const ast = [theme(themeProperties)];

        visit(ast, {
          "css-value": parentSpy,
        });

        expect(parentSpy).toHaveBeenCalledWith(
          cssValueNode,
          expect.objectContaining({
            "--color": cssValueNode,
          }),
        );
      });

      it("allows returning a string from css-value visitor", () => {
        const originalCssValue = cssv`${color("500")}`;

        const ast = [
          theme({
            "--color": originalCssValue,
          }),
        ];

        const result = visit(ast, {
          "css-value": () => "#ff0000",
        });

        expect((result[0] as ThemeAst).theme["--color"]).toBe("#ff0000");
      });

      it("processes multiple css-value properties with returning visitor", () => {
        let callCount = 0;

        const ast = [
          theme({
            "--gradient-1": cssv`${color("100")}`,
            "--gradient-2": cssv`${color("200")}`,
            "--gradient-3": cssv`${color("300")}`,
          }),
        ];

        visit(ast, {
          "css-value": (node) => {
            callCount++;
            return cssv`transformed-${color("500")}`;
          },
        });

        expect(callCount).toBe(3);
      });
    });

    describe("css-value visitor that does not return a value", () => {
      it("preserves original css-value when visitor returns undefined", () => {
        const originalCssValue = cssv`linear-gradient(${color("500")}, ${color("700")})`;

        const ast = [
          theme({
            "--gradient": originalCssValue,
          }),
        ];

        const result = visit(ast, {
          "css-value": () => undefined,
        });

        expect((result[0] as ThemeAst).theme["--gradient"]).toEqual(
          originalCssValue,
        );
      });

      it("preserves original css-value when visitor returns void", () => {
        const originalCssValue = cssv`${color("500")} / 50%`;

        const ast = [
          theme({
            "--color-alpha": originalCssValue,
          }),
        ];

        const result = visit(ast, {
          "css-value": () => {
            // Perform some side effect but don't return
          },
        });

        expect((result[0] as ThemeAst).theme["--color-alpha"]).toEqual(
          originalCssValue,
        );
      });

      it("calls css-value visitor for side effects", () => {
        const cssValueNode = cssv`${color("500")}`;
        const sideEffectSpy = vi.fn();

        const ast = [
          theme({
            "--color": cssValueNode,
          }),
        ];

        visit(ast, {
          "css-value": (node) => {
            sideEffectSpy(node);
            // No return value
          },
        });

        expect(sideEffectSpy).toHaveBeenCalledWith(cssValueNode);
      });

      it("processes all css-value properties even when not returning", () => {
        const processedNodes: CssValueAst[] = [];

        const cssValue1 = cssv`${color("100")}`;
        const cssValue2 = cssv`${color("200")}`;
        const cssValue3 = cssv`${color("300")}`;

        const ast = [
          theme({
            "--color-1": cssValue1,
            "--color-2": cssValue2,
            "--color-3": cssValue3,
          }),
        ];

        visit(ast, {
          "css-value": (node) => {
            processedNodes.push(node as CssValueAst);
            // No return
          },
        });

        expect(processedNodes).toHaveLength(3);
        expect(processedNodes).toContain(cssValue1);
        expect(processedNodes).toContain(cssValue2);
        expect(processedNodes).toContain(cssValue3);
      });

      it("preserves original values in theme after non-returning visitor", () => {
        const cssValue1 = cssv`${color("500")}`;
        const cssValue2 = cssv`${color("700")}`;

        const ast = [
          theme({
            "--primary": cssValue1,
            "--secondary": cssValue2,
            "--static": "#000000",
          }),
        ];

        const result = visit(ast, {
          "css-value": () => {
            // No return
          },
        });

        expect((result[0] as ThemeAst).theme["--primary"]).toEqual(cssValue1);
        expect((result[0] as ThemeAst).theme["--secondary"]).toEqual(cssValue2);
        expect((result[0] as ThemeAst).theme["--static"]).toBe("#000000");
      });
    });

    describe("mixed theme properties with css-value", () => {
      it("handles theme with string and css-value properties", () => {
        const cssValueNode = cssv`${color("500")}`;

        const ast = [
          theme({
            "--static-color": "#ff0000",
            "--dynamic-color": cssValueNode,
            "--spacing": "16px",
          }),
        ];

        const result = visit(ast, {
          "css-value": (node) => cssv`transformed`,
        });

        expect((result[0] as ThemeAst).theme["--static-color"]).toBe("#ff0000");
        expect(
          ((result[0] as ThemeAst).theme["--dynamic-color"] as CssValueAst)
            .type,
        ).toBe("css-value");
        expect((result[0] as ThemeAst).theme["--spacing"]).toBe("16px");
      });

      it("only invokes css-value visitor for css-value nodes", () => {
        const cssValueSpy = vi.fn().mockImplementation((node) => node);

        const cssValueNode = cssv`${color("500")}`;
        const ast = [
          theme({
            "--string-prop": "#ff0000",
            "--css-value-prop": cssValueNode,
            "--number-prop": "100",
          }),
        ];

        visit(ast, {
          "css-value": cssValueSpy,
        });

        expect(cssValueSpy).toHaveBeenCalledTimes(1);
        expect(cssValueSpy).toHaveBeenCalledWith(
          cssValueNode,
          expect.any(Object),
        );
      });
    });
  });
});
