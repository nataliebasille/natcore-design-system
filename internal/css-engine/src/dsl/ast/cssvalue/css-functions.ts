import type { CssValue, CssVarAst } from "./public.ts";

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
 * Valid color spaces for the CSS color() function.
 */
export type CssColorFunctionColorspace =
  | "srgb"
  | "srgb-linear"
  | "display-p3"
  | "a98-rgb"
  | "prophoto-rgb"
  | "rec2020"
  | "xyz"
  | "xyz-d50"
  | "xyz-d65"
  | (string & {});

export type CssColorFunctionChannel =
  | CssValue<"number" | "percentage">
  | "none"
  | (string & {});

/**
 * Type for CSS function values
 */
export type CssFunction =
  | {
      $function: "calc";
      strings: string[];
      values: CssValue<
        "length" | "percentage" | "number" | "integer" | "angle" | "ratio"
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
      $function: "color";
      colorspace: CssColorFunctionColorspace;
      from?: CssValue<"color">;
      channels: CssColorFunctionChannel[];
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
    }
  | {
      $function: "translateX";
      value: CssValue<"length" | "percentage">;
      toString: () => string;
    };

// Helper to convert value to string
function valueToString(value: any): string {
  if (
    typeof value === "object" &&
    value !== null &&
    (value as CssVarAst).$ast === "css-var"
  ) {
    return `var(${(value as CssVarAst).name})`;
  }

  if (typeof value === "object" && value !== null && "toString" in value) {
    return value.toString();
  }

  return String(value);
}

// Reusable helper to add toString method to CSS functions
function withToString<T extends { $function: string }>(
  value: T,
  toStringFn: (this: T) => string,
): T & { toString: () => string } {
  return {
    ...value,
    toString: toStringFn,
  };
}

function calcToString(this: {
  $function: "calc";
  strings: string[];
  values: any[];
}) {
  let result = "calc(";
  for (let i = 0; i < this.strings.length; i++) {
    result += this.strings[i];
    if (i < this.values.length) {
      result += valueToString(this.values[i]);
    }
  }
  result += ")";
  return result;
}

export function calc(
  strings: TemplateStringsArray,
  ...values: CssValue<
    "length" | "percentage" | "number" | "integer" | "angle" | "ratio"
  >[]
) {
  return withToString(
    {
      $function: "calc" as const,
      strings: Array.from(strings),
      values,
    },
    calcToString,
  );
}

function minToString(this: { $function: "min"; values: any[] }) {
  return `min(${this.values.map(valueToString).join(", ")})`;
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
    minToString,
  );
}

function maxToString(this: { $function: "max"; values: any[] }) {
  return `max(${this.values.map(valueToString).join(", ")})`;
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
    maxToString,
  );
}

function clampToString(this: {
  $function: "clamp";
  min: any;
  preferred: any;
  max: any;
}) {
  return `clamp(${valueToString(this.min)}, ${valueToString(this.preferred)}, ${valueToString(this.max)})`;
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
    clampToString,
  );
}

function lightDarkToString(this: {
  $function: "light-dark";
  light: any;
  dark: any;
}) {
  return `light-dark(${valueToString(this.light)}, ${valueToString(this.dark)})`;
}

export function lightDark(light: CssValue<"color">, dark: CssValue<"color">) {
  return withToString(
    {
      $function: "light-dark" as const,
      light,
      dark,
    },
    lightDarkToString,
  );
}

function rgbToString(this: {
  $function: "rgb";
  r: any;
  g: any;
  b: any;
  alpha?: any;
}) {
  const rgb = `${valueToString(this.r)} ${valueToString(this.g)} ${valueToString(this.b)}`;
  return this.alpha ?
      `rgb(${rgb} / ${valueToString(this.alpha)})`
    : `rgb(${rgb})`;
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
    rgbToString,
  );
}

function hslToString(this: {
  $function: "hsl";
  h: any;
  s: any;
  l: any;
  alpha?: any;
}) {
  const hsl = `${valueToString(this.h)} ${valueToString(this.s)} ${valueToString(this.l)}`;
  return this.alpha ?
      `hsl(${hsl} / ${valueToString(this.alpha)})`
    : `hsl(${hsl})`;
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
    hslToString,
  );
}

function cssColorToString(this: {
  $function: "color";
  colorspace: CssColorFunctionColorspace;
  from?: any;
  channels: CssColorFunctionChannel[];
  alpha?: any;
}) {
  const channels = this.channels.map(valueToString).join(" ");
  const from = this.from ? `from ${valueToString(this.from)} ` : "";
  const color =
    channels ?
      `${from}${this.colorspace} ${channels}`
    : `${from}${this.colorspace}`;
  return this.alpha !== undefined ?
      `color(${color} / ${valueToString(this.alpha)})`
    : `color(${color})`;
}

export function cssColor(
  colorspace: CssColorFunctionColorspace,
  channels: CssColorFunctionChannel[],
  alpha?: CssValue<"number" | "percentage">,
  options?: {
    from?: CssValue<"color">;
  },
) {
  return withToString(
    {
      $function: "color" as const,
      colorspace,
      from: options?.from,
      channels,
      alpha,
    },
    cssColorToString,
  );
}

function colorMixToString(this: {
  $function: "color-mix";
  colorspace: ColorMixColorspace;
  base: { color: any; percentage?: any };
  mix: { color: any; percentage?: any };
}) {
  const baseStr =
    this.base.percentage ?
      `${valueToString(this.base.color)} ${valueToString(this.base.percentage)}`
    : valueToString(this.base.color);
  const mixStr =
    this.mix.percentage ?
      `${valueToString(this.mix.color)} ${valueToString(this.mix.percentage)}`
    : valueToString(this.mix.color);
  return `color-mix(in ${this.colorspace}, ${baseStr}, ${mixStr})`;
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
    colorMixToString,
  );
}

function translateXToString(this: { $function: "translateX"; value: any }) {
  return `translateX(${valueToString(this.value)})`;
}

export function translateX(value: CssValue<"length" | "percentage">) {
  return withToString(
    {
      $function: "translateX" as const,
      value,
    },
    translateXToString,
  );
}
