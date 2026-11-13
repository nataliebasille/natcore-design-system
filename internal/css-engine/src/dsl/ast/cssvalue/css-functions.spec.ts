import { describe, expect, expectTypeOf, it } from "vitest";
import {
  anchor,
  anchorSize,
  calc,
  clamp,
  cssColor,
  cssvar,
  match,
  max,
  primitive,
  scale,
  translateY,
  type CssFunction,
  type CssValue,
} from "./public.ts";

describe("time values", () => {
  it("primitive.time.ms() renders milliseconds", () => {
    expect(primitive.time.ms(150).toString()).toBe("150ms");
    expectTypeOf(primitive.time.ms(150)).toMatchTypeOf<CssValue<"time">>();
  });

  it("primitive.time.s() renders seconds", () => {
    expect(primitive.time.s(1.5).toString()).toBe("1.5s");
    expectTypeOf(primitive.time.s(1.5)).toMatchTypeOf<CssValue<"time">>();
  });

  it("keeps the unit for zero, because a unitless 0 is not a valid <time>", () => {
    expect(primitive.time.ms(0).toString()).toBe("0ms");
    expect(primitive.time.s(0).toString()).toBe("0s");
  });

  it("calc() accepts time values", () => {
    expect(
      calc`${primitive.integer(150)} * ${primitive.time.ms(1)}`.toString(),
    ).toBe("calc(150 * 1ms)");
  });

  it("calc() accepts a bare-integer match multiplied by a time unit", () => {
    const delay = calc`${match.bare.integer()} * ${primitive.time.ms(1)}`;

    expect(delay.values).toEqual([
      match.bare.integer(),
      primitive.time.ms(1),
    ]);
    expectTypeOf(delay).toMatchTypeOf<CssFunction>();
  });
});

describe("transform functions", () => {
  it("translateY() renders a vertical translation", () => {
    expect(translateY(primitive.length.percent(100)).toString()).toBe(
      "translateY(100%)",
    );
    expect(translateY(primitive.length.rem(-1)).toString()).toBe(
      "translateY(-1rem)",
    );
  });

  it("scale() renders a uniform scale factor", () => {
    expect(scale(0.95).toString()).toBe("scale(0.95)");
  });
});

describe("anchor()", () => {
  it("renders a side of the default anchor", () => {
    expect(anchor("bottom").toString()).toBe("anchor(bottom)");
    expect(anchor("center").toString()).toBe("anchor(center)");
  });

  it("renders a side of a named anchor", () => {
    expect(anchor("--popover", "top").toString()).toBe(
      "anchor(--popover top)",
    );
  });

  it("is a length, so it works in calc(), max(), and clamp()", () => {
    const top = anchor("--self", "top");

    expect(
      calc`${max(anchor("center"), top)} - ${top}`.toString(),
    ).toBe("calc(max(anchor(center), anchor(--self top)) - anchor(--self top))");
    expect(
      clamp(top, anchor("center"), anchor("--self", "bottom")).toString(),
    ).toBe("clamp(anchor(--self top), anchor(center), anchor(--self bottom))");
    expectTypeOf(top).toMatchTypeOf<CssValue<"length">>();
  });
});

describe("anchorSize()", () => {
  it("renders a size of the default anchor", () => {
    expect(anchorSize("width").toString()).toBe("anchor-size(width)");
    expect(anchorSize("block").toString()).toBe("anchor-size(block)");
  });

  it("renders a size of a named anchor", () => {
    expect(anchorSize("--popover", "height").toString()).toBe(
      "anchor-size(--popover height)",
    );
  });

  it("is a length, so it works in calc()", () => {
    const height = anchorSize("--self", "height");

    expect(calc`${height} - ${primitive.length.px(4)}`.toString()).toBe(
      "calc(anchor-size(--self height) - 4px)",
    );
    expectTypeOf(height).toMatchTypeOf<CssValue<"length">>();
  });
});

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
