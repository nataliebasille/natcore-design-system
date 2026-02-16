import { describe, it, expect, expectTypeOf } from "vitest";
import { theme, type ThemeAst } from "./theme";

describe("theme type tests", () => {
  describe("theme()", () => {
    it("returns ThemeAst with correct theme type", () => {
      const result = theme({ "--primary": "blue" });
      expectTypeOf(result).toEqualTypeOf<{
        $ast: "theme";
        theme: Readonly<{ "--primary": "blue" }>;
      }>();
      expect(result).toEqual({
        $ast: "theme",
        theme: { "--primary": "blue" },
      });
    });

    it("preserves exact theme type with literal values", () => {
      const themeProps = {
        "--primary": "blue",
        "--secondary": "red",
        "--spacing": "8px",
      } as const;
      const result = theme(themeProps);

      expectTypeOf(result).toEqualTypeOf<{
        $ast: "theme";
        theme: {
          readonly "--primary": "blue";
          readonly "--secondary": "red";
          readonly "--spacing": "8px";
        };
      }>();
      expect(result.theme).toBe(themeProps);
    });

    it("accepts multiple CSS custom properties", () => {
      const result = theme({
        "--color-primary": "#0066cc",
        "--color-secondary": "#ff6600",
        "--font-size-base": "16px",
        "--line-height": "1.5",
      });

      expect(result.$ast).toBe("theme");
      expect(result.theme).toEqual({
        "--color-primary": "#0066cc",
        "--color-secondary": "#ff6600",
        "--font-size-base": "16px",
        "--line-height": "1.5",
      });
    });

    it("accepts empty theme object", () => {
      const result = theme({});
      expectTypeOf(result).toEqualTypeOf<{
        $ast: "theme";
        theme: {};
      }>();
      expect(result).toEqual({
        $ast: "theme",
        theme: {},
      });
    });

    it("preserves theme reference", () => {
      const themeProps = { "--accent": "purple" };
      const result = theme(themeProps);
      expect(result.theme).toBe(themeProps);
    });
  });

  describe("type compatibility", () => {
    it("ThemeAst is assignable from theme() return type", () => {
      const result = theme({ "--test": "value" });
      expectTypeOf(result).toExtend<ThemeAst>();
    });

    it("preserves literal types with const assertion", () => {
      const result = theme({ "--size": "10px" } as const);
      expectTypeOf(result.theme["--size"]).toEqualTypeOf<"10px">();
    });
  });

  describe("runtime behavior", () => {
    it("creates object with correct structure", () => {
      const result = theme({ "--var": "test" });
      expect(result).toHaveProperty("$ast", "theme");
      expect(result).toHaveProperty("theme");
      expect(typeof result.theme).toBe("object");
    });

    it("preserves all theme properties", () => {
      const themeProps = {
        "--a": "1",
        "--b": "2",
        "--c": "3",
      };
      const result = theme(themeProps);
      expect(Object.keys(result.theme)).toEqual(["--a", "--b", "--c"]);
      expect(result.theme["--a"]).toBe("1");
      expect(result.theme["--b"]).toBe("2");
      expect(result.theme["--c"]).toBe("3");
    });
  });
});
