import { describe, it, expect, expectTypeOf } from "vitest";
import { theme } from "./theme";

describe("theme type tests", () => {
  describe("theme()", () => {
    it("returns ThemeAst with correct theme type", () => {
      const result = theme({ "--primary": "blue" });
      expectTypeOf(result).toEqualTypeOf<{
        $construct: "theme";
        properties: { "--primary": "blue" };
      }>();
      expect(result).toEqual({
        $construct: "theme",
        properties: { "--primary": "blue" },
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
        $construct: "theme";
        properties: {
          "--primary": "blue";
          "--secondary": "red";
          "--spacing": "8px";
        };
      }>();
      expect(result.properties).toEqual(themeProps);
    });

    it("accepts multiple CSS custom properties", () => {
      const result = theme({
        "--color-primary": "#0066cc",
        "--color-secondary": "#ff6600",
        "--font-size-base": "16px",
        "--line-height": "1.5",
      });

      expect(result.$construct).toBe("theme");
      expect(result.properties).toEqual({
        "--color-primary": "#0066cc",
        "--color-secondary": "#ff6600",
        "--font-size-base": "16px",
        "--line-height": "1.5",
      });
    });

    it("accepts empty theme object", () => {
      const result = theme({});
      expectTypeOf(result).toEqualTypeOf<{
        $construct: "theme";
        properties: {};
      }>();
      expect(result).toEqual({
        $construct: "theme",
        properties: {},
      });
    });
  });

  describe("type compatibility", () => {
    it("preserves literal types with const assertion", () => {
      const result = theme({ "--size": "10px" } as const);
      expectTypeOf(result.properties["--size"]).toEqualTypeOf<"10px">();
    });
  });

  describe("runtime behavior", () => {
    it("creates object with correct structure", () => {
      const result = theme({ "--var": "test" });
      expect(result).toEqual({
        $construct: "theme",
        properties: { "--var": "test" },
      });
    });

    it("preserves all theme properties", () => {
      const themeProps = {
        "--a": "1",
        "--b": "2",
        "--c": "3",
      };
      const result = theme(themeProps);
      expect(Object.keys(result.properties)).toEqual(["--a", "--b", "--c"]);
      expect(result.properties["--a"]).toBe("1");
      expect(result.properties["--b"]).toBe("2");
      expect(result.properties["--c"]).toBe("3");
    });
  });
});
