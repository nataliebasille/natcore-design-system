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
        | "length"
        | "percentage"
        | "number"
        | "integer"
        | "angle"
        | "ratio"
        | "time"
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
      $function: "oklch";
      from?: CssValue<"color">;
      l: OklchChannel;
      c: OklchChannel;
      h: OklchChannel;
      alpha?: CssValue<"number" | "percentage">;
      toString: () => string;
    }
  | {
      $function: "lch";
      from?: CssValue<"color">;
      l: LchChannel;
      c: LchChannel;
      h: LchChannel;
      alpha?: CssValue<"number" | "percentage">;
      toString: () => string;
    }
  | {
      $function: "translateX";
      value: CssValue<"length" | "percentage">;
      toString: () => string;
    }
  | {
      $function: "translateY";
      value: CssValue<"length" | "percentage">;
      toString: () => string;
    }
  | {
      $function: "scale";
      value: CssValue<"number" | "percentage">;
      toString: () => string;
    }
  | {
      $function: "anchor";
      name?: `--${string}`;
      side: AnchorSide;
      toString: () => string;
    }
  | {
      $function: "anchor-size";
      name?: `--${string}`;
      size: AnchorSize;
      toString: () => string;
    };

/** A side of an anchor box, for anchor(). */
export type AnchorSide =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "start"
  | "end"
  | "self-start"
  | "self-end"
  | "inside"
  | "outside"
  | "center";

/** A dimension of an anchor box, for anchor-size(). */
export type AnchorSize =
  | "width"
  | "height"
  | "block"
  | "inline"
  | "self-block"
  | "self-inline";

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
    "length" | "percentage" | "number" | "integer" | "angle" | "ratio" | "time"
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

export type OklchChannel =
  | CssValue<"number" | "angle" | "percentage">
  | "none"
  | (string & {});

export type LchChannel =
  | CssValue<"number" | "angle" | "percentage">
  | "none"
  | (string & {});

function oklchToString(this: {
  $function: "oklch";
  from?: any;
  l: any;
  c: any;
  h: any;
  alpha?: any;
}) {
  const from = this.from ? `from ${valueToString(this.from)} ` : "";
  const channels = `${valueToString(this.l)} ${valueToString(this.c)} ${valueToString(this.h)}`;
  return this.alpha !== undefined ?
      `oklch(${from}${channels} / ${valueToString(this.alpha)})`
    : `oklch(${from}${channels})`;
}

export function oklch(
  l: OklchChannel,
  c: OklchChannel,
  h: OklchChannel,
  options?: {
    from?: CssValue<"color">;
    alpha?: CssValue<"number" | "percentage">;
  },
) {
  return withToString(
    {
      $function: "oklch" as const,
      from: options?.from,
      l,
      c,
      h,
      alpha: options?.alpha,
    },
    oklchToString,
  );
}

function lchToString(this: {
  $function: "lch";
  from?: any;
  l: any;
  c: any;
  h: any;
  alpha?: any;
}) {
  const from = this.from ? `from ${valueToString(this.from)} ` : "";
  const channels = `${valueToString(this.l)} ${valueToString(this.c)} ${valueToString(this.h)}`;
  return this.alpha !== undefined ?
      `lch(${from}${channels} / ${valueToString(this.alpha)})`
    : `lch(${from}${channels})`;
}

export function lch(
  l: LchChannel,
  c: LchChannel,
  h: LchChannel,
  options?: {
    from?: CssValue<"color">;
    alpha?: CssValue<"number" | "percentage">;
  },
) {
  return withToString(
    {
      $function: "lch" as const,
      from: options?.from,
      l,
      c,
      h,
      alpha: options?.alpha,
    },
    lchToString,
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

export function translateY(value: CssValue<"length" | "percentage">) {
  return withToString(
    {
      $function: "translateY" as const,
      value,
    },
    translateYToString,
  );
}

export function scale(value: CssValue<"number" | "percentage">) {
  return withToString(
    {
      $function: "scale" as const,
      value,
    },
    scaleToString,
  );
}

/**
 * CSS anchor(): the position of a side of an anchor box. Without a name it
 * reads the element's default anchor (`position-anchor`). Valid in inset
 * properties, including inside math functions.
 */
export function anchor(side: AnchorSide): AnchorFunction;
export function anchor(name: `--${string}`, side: AnchorSide): AnchorFunction;
export function anchor(
  nameOrSide: `--${string}` | AnchorSide,
  side?: AnchorSide,
): AnchorFunction {
  return withToString(
    side === undefined ?
      { $function: "anchor" as const, side: nameOrSide as AnchorSide }
    : {
        $function: "anchor" as const,
        name: nameOrSide as `--${string}`,
        side,
      },
    anchorToString,
  );
}

type AnchorFunction = Extract<CssFunction, { $function: "anchor" }>;

function anchorToString(this: AnchorFunction) {
  return `anchor(${this.name ? `${this.name} ` : ""}${this.side})`;
}

/**
 * CSS anchor-size(): a dimension of an anchor box. Without a name it reads
 * the element's default anchor (`position-anchor`). Valid in sizing, inset,
 * and margin properties, including inside math functions.
 */
export function anchorSize(size: AnchorSize): AnchorSizeFunction;
export function anchorSize(
  name: `--${string}`,
  size: AnchorSize,
): AnchorSizeFunction;
export function anchorSize(
  nameOrSize: `--${string}` | AnchorSize,
  size?: AnchorSize,
): AnchorSizeFunction {
  return withToString(
    size === undefined ?
      { $function: "anchor-size" as const, size: nameOrSize as AnchorSize }
    : {
        $function: "anchor-size" as const,
        name: nameOrSize as `--${string}`,
        size,
      },
    anchorSizeToString,
  );
}

type AnchorSizeFunction = Extract<CssFunction, { $function: "anchor-size" }>;

function anchorSizeToString(this: AnchorSizeFunction) {
  return `anchor-size(${this.name ? `${this.name} ` : ""}${this.size})`;
}

function translateYToString(this: { $function: "translateY"; value: any }) {
  return `translateY(${valueToString(this.value)})`;
}

function scaleToString(this: { $function: "scale"; value: any }) {
  return `scale(${valueToString(this.value)})`;
}
