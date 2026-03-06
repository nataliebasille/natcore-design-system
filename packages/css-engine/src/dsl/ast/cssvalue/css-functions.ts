import type { CssValue } from "./public.ts";

/**
 * Valid colorspaces for color-mix() function
 */
export type ColorMixColorspace =
  | "srgb"
  | "srgb-linear"
  | "lab"
  | "oklab"
  | "lch"
  | "oklch"
  | "xyz"
  | "xyz-d50"
  | "xyz-d65"
  | "hsl"
  | "hwb";

/**
 * Type for CSS function values
 */
export type CssFunction =
  | {
      $function: "calc";
      strings: string[];
      values: CssValue<
        "length" | "percentage" | "number" | "integer" | "angle"
      >[];
      toString: () => string;
    }
  | {
      $function: "min";
      values: CssValue<
        "length" | "percentage" | "number" | "integer" | "angle"
      >[];
      toString: () => string;
    }
  | {
      $function: "max";
      values: CssValue<
        "length" | "percentage" | "number" | "integer" | "angle"
      >[];
      toString: () => string;
    }
  | {
      $function: "clamp";
      min: CssValue<"length" | "percentage" | "number" | "integer" | "angle">;
      preferred: CssValue<
        "length" | "percentage" | "number" | "integer" | "angle"
      >;
      max: CssValue<"length" | "percentage" | "number" | "integer" | "angle">;
      toString: () => string;
    }
  | {
      $function: "light-dark";
      light: CssValue<"color">;
      dark: CssValue<"color">;
      toString: () => string;
    }
  | {
      $function: "rgb";
      r: CssValue<"number" | "integer" | "percentage">;
      g: CssValue<"number" | "integer" | "percentage">;
      b: CssValue<"number" | "integer" | "percentage">;
      alpha?: CssValue<"number" | "percentage">;
      toString: () => string;
    }
  | {
      $function: "hsl";
      h: CssValue<"angle" | "number">;
      s: CssValue<"percentage">;
      l: CssValue<"percentage">;
      alpha?: CssValue<"number" | "percentage">;
      toString: () => string;
    }
  | {
      $function: "color-mix";
      colorspace: ColorMixColorspace;
      base: {
        color: CssValue<"color">;
        percentage?: CssValue<"percentage">;
      };
      mix: {
        color: CssValue<"color">;
        percentage?: CssValue<"percentage">;
      };
      toString: () => string;
    };

// Helper to convert value to string
function valueToString(value: any): string {
  if (typeof value === "object" && value !== null && "toString" in value) {
    return value.toString();
  }
  return String(value);
}

// Reusable helper to add toString method to CSS functions
function withToString<T extends { $function: string }>(
  value: T,
  toStringFn: (v: T) => string,
): T & { toString: () => string } {
  return {
    ...value,
    toString() {
      return toStringFn(this as T);
    },
  };
}

export function calc(
  strings: TemplateStringsArray,
  ...values: CssValue<
    "length" | "percentage" | "number" | "integer" | "angle"
  >[]
) {
  return withToString(
    {
      $function: "calc" as const,
      strings: Array.from(strings),
      values,
    },
    (f) => {
      let result = "calc(";
      for (let i = 0; i < f.strings.length; i++) {
        result += f.strings[i];
        if (i < f.values.length) {
          result += valueToString(f.values[i]);
        }
      }
      result += ")";
      return result;
    },
  );
}

export function min(
  ...values: CssValue<
    "length" | "percentage" | "number" | "integer" | "angle"
  >[]
) {
  return withToString(
    {
      $function: "min" as const,
      values,
    },
    (f) => `min(${f.values.map(valueToString).join(", ")})`,
  );
}

export function max(
  ...values: CssValue<
    "length" | "percentage" | "number" | "integer" | "angle"
  >[]
) {
  return withToString(
    {
      $function: "max" as const,
      values,
    },
    (f) => `max(${f.values.map(valueToString).join(", ")})`,
  );
}

export function clamp(
  min: CssValue<"length" | "percentage" | "number" | "integer" | "angle">,
  preferred: CssValue<"length" | "percentage" | "number" | "integer" | "angle">,
  max: CssValue<"length" | "percentage" | "number" | "integer" | "angle">,
) {
  return withToString(
    {
      $function: "clamp" as const,
      min,
      preferred,
      max,
    },
    (f) =>
      `clamp(${valueToString(f.min)}, ${valueToString(f.preferred)}, ${valueToString(f.max)})`,
  );
}

export function lightDark(light: CssValue<"color">, dark: CssValue<"color">) {
  return withToString(
    {
      $function: "light-dark" as const,
      light,
      dark,
    },
    (f) => `light-dark(${valueToString(f.light)}, ${valueToString(f.dark)})`,
  );
}

export function rgb(
  r: CssValue<"number" | "integer" | "percentage">,
  g: CssValue<"number" | "integer" | "percentage">,
  b: CssValue<"number" | "integer" | "percentage">,
  alpha?: CssValue<"number" | "percentage">,
) {
  return withToString(
    {
      $function: "rgb" as const,
      r,
      g,
      b,
      alpha,
    },
    (f) => {
      const rgb = `${valueToString(f.r)} ${valueToString(f.g)} ${valueToString(f.b)}`;
      return f.alpha ?
          `rgb(${rgb} / ${valueToString(f.alpha)})`
        : `rgb(${rgb})`;
    },
  );
}

export function hsl(
  h: CssValue<"angle" | "number">,
  s: CssValue<"percentage">,
  l: CssValue<"percentage">,
  alpha?: CssValue<"number" | "percentage">,
) {
  return withToString(
    {
      $function: "hsl" as const,
      h,
      s,
      l,
      alpha,
    },
    (f) => {
      const hsl = `${valueToString(f.h)} ${valueToString(f.s)} ${valueToString(f.l)}`;
      return f.alpha ?
          `hsl(${hsl} / ${valueToString(f.alpha)})`
        : `hsl(${hsl})`;
    },
  );
}

export function colorMix(
  colorspace: ColorMixColorspace,
  base: {
    color: CssValue<"color">;
    percentage?: CssValue<"percentage">;
  },
  mix: {
    color: CssValue<"color">;
    percentage?: CssValue<"percentage">;
  },
) {
  return withToString(
    {
      $function: "color-mix" as const,
      colorspace,
      base,
      mix,
    },
    (f) => {
      const baseStr =
        f.base.percentage ?
          `${valueToString(f.base.color)} ${valueToString(f.base.percentage)}`
        : valueToString(f.base.color);
      const mixStr =
        f.mix.percentage ?
          `${valueToString(f.mix.color)} ${valueToString(f.mix.percentage)}`
        : valueToString(f.mix.color);
      return `color-mix(in ${f.colorspace}, ${baseStr}, ${mixStr})`;
    },
  );
}
