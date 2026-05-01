import { describe, expect, expectTypeOf, it } from "vitest";
import { cssColor, cssvar, primitive, type CssFunction } from "./public.ts";

describe("css function values", () => {
  describe("cssColor()", () => {
    it("creates a CSS color() function value", () => {
      const result = cssColor("display-p3", [1, 0.5, 0]);

      expect(result).toEqual({
        $function: "color",
        colorspace: "display-p3",
        channels: [1, 0.5, 0],
        alpha: undefined,
        toString: expect.any(Function),
      });
      expect(result.toString()).toBe("color(display-p3 1 0.5 0)");
      expectTypeOf(result).toMatchTypeOf<CssFunction>();
    });

    it("supports alpha values and none channels", () => {
      const result = cssColor("srgb", ["none", "50%", 0], primitive.number(0));

      expect(result.toString()).toBe("color(srgb none 50% 0 / 0)");
    });

    it("supports custom color profile names", () => {
      const result = cssColor("--brand-profile", [0.1, 0.2, 0.3], "75%");

      expect(result.toString()).toBe("color(--brand-profile 0.1 0.2 0.3 / 75%)");
    });

    it("supports relative color syntax with raw channel math", () => {
      const shade = 500;
      const palette = "primary";
      const contrastChannel = "clamp(0, (.36 / y - 1) * 100, 1)";
      const result = cssColor(
        "xyz",
        [contrastChannel, contrastChannel, contrastChannel],
        1,
        {
          from: cssvar(`--color-light-${shade}-${palette}`),
        },
      );

      expect(result.toString()).toBe(
        "color(from var(--color-light-500-primary) xyz clamp(0, (.36 / y - 1) * 100, 1) clamp(0, (.36 / y - 1) * 100, 1) clamp(0, (.36 / y - 1) * 100, 1) / 1)",
      );
    });
  });
});
