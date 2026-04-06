export type SupportedArbitraryDataType =
  | "absolute-size"
  | "angle"
  | "bg-size"
  | "color"
  | "family-name"
  | "generic-name"
  | "image"
  | "integer"
  | "length"
  | "line-width"
  | "number"
  | "percentage"
  | "position"
  | "ratio"
  | "relative-size"
  | "url"
  | "vector"
  | "*";

export type SupportedBareDataType =
  | "number"
  | "integer"
  | "ratio"
  | "percentage";

export type LiteralDataType = string & {};

export type CssDataType =
  | SupportedArbitraryDataType
  | SupportedBareDataType
  | LiteralDataType;

export type CssAbsoluteValue =
  | "xx-small"
  | "x-small"
  | "small"
  | "medium"
  | "large"
  | "x-large"
  | "xx-large"
  | "xxx-large";

export type CssAngleUnit = "deg" | "grad" | "rad" | "turn";

export type CssLengthUnit =
  | "px"
  | "em"
  | "rem"
  | "vh"
  | "vw"
  | "vmin"
  | "vmax"
  | "ch"
  | "ex"
  | "cm"
  | "mm"
  | "in"
  | "pt"
  | "pc"
  | "%";

export type CssLengthValue = `${number}${CssLengthUnit}` | 0;

export type CssBgSizeValue = "auto" | "cover" | "contain" | CssLengthValue;

export type CssColorValue =
  | `#${string}`
  | `rgb(${string})`
  | `rgba(${string})`
  | `hsl(${string})`
  | `hsla(${string})`
  | `var(${string})`
  | "currentColor"
  | "transparent"
  | (string & {});

export type CssFamilyName = string & {};

export type CssGenericName =
  | "serif"
  | "sans-serif"
  | "monospace"
  | "cursive"
  | "fantasy"
  | "system-ui"
  | "ui-serif"
  | "ui-sans-serif"
  | "ui-monospace"
  | "ui-rounded"
  | "emoji"
  | "math"
  | "fangsong";

export type CssImageValue =
  | `url(${string})`
  | `linear-gradient(${string})`
  | `radial-gradient(${string})`
  | `conic-gradient(${string})`
  | `repeating-linear-gradient(${string})`
  | `repeating-radial-gradient(${string})`
  | `repeating-conic-gradient(${string})`
  | `image(${string})`
  | `image-set(${string})`
  | `cross-fade(${string})`
  | `element(${string})`
  | (string & {});

export type CssLineWidthValue = "thin" | "medium" | "thick" | CssLengthValue;

export type CssPositionValue = "top" | "bottom" | "left" | "right" | "center";

export type CssRelativeSize = "larger" | "smaller";

type DataTypeToValue<T extends CssDataType> =
  T extends "absolute-size" ? CssAbsoluteValue
  : T extends "angle" ? `${number}${CssAngleUnit}` | 0
  : T extends "bg-size" ? CssBgSizeValue
  : T extends "color" ? CssColorValue
  : T extends "family-name" ? CssFamilyName
  : T extends "generic-name" ? CssGenericName
  : T extends "image" ? CssImageValue
  : T extends "integer" ? number
  : T extends "length" ? CssLengthValue
  : T extends "line-width" ? CssLineWidthValue
  : T extends "number" ? number
  : T extends "percentage" ? `${number}%`
  : T extends "position" ? CssPositionValue
  : T extends "ratio" ? `${number}/${number}`
  : T extends "relative-size" ? CssRelativeSize
  : T extends "url" ? `url(${string})`
  : T extends "vector" ? string & {}
  : T extends "*" ? string & {}
  : string & {};

export type CssPrimitiveValue =
  CssDataType extends infer T ?
    T extends CssDataType ?
      DataTypeToValue<T> extends infer V ?
        V extends any ?
          { $primitive: T; value: V; toString: () => string }
        : never
      : never
    : never
  : never;

export type ColorPrimitive = Extract<
  CssPrimitiveValue,
  { $primitive: "color" }
>;
export type NumericPrimitive = Extract<
  CssPrimitiveValue,
  | { $primitive: "length" }
  | { $primitive: "percentage" }
  | { $primitive: "number" }
  | { $primitive: "integer" }
  | { $primitive: "angle" }
>;

// Reusable helper to add toString method to primitives
function withToString<T extends { $primitive: string; value: any }>(
  primitive: T,
): T & { toString: () => string } {
  return {
    ...primitive,
    toString() {
      return String(primitive.value);
    },
  };
}

// Helper functions to create primitive values
export const primitive = {
  // Size helpers
  size: {
    xxSmall: () =>
      withToString({
        $primitive: "absolute-size" as const,
        value: "xx-small" as const,
      }),
    xSmall: () =>
      withToString({
        $primitive: "absolute-size" as const,
        value: "x-small" as const,
      }),
    small: () =>
      withToString({
        $primitive: "absolute-size" as const,
        value: "small" as const,
      }),
    medium: () =>
      withToString({
        $primitive: "absolute-size" as const,
        value: "medium" as const,
      }),
    large: () =>
      withToString({
        $primitive: "absolute-size" as const,
        value: "large" as const,
      }),
    xLarge: () =>
      withToString({
        $primitive: "absolute-size" as const,
        value: "x-large" as const,
      }),
    xxLarge: () =>
      withToString({
        $primitive: "absolute-size" as const,
        value: "xx-large" as const,
      }),
    xxxLarge: () =>
      withToString({
        $primitive: "absolute-size" as const,
        value: "xxx-large" as const,
      }),
    larger: () =>
      withToString({
        $primitive: "relative-size" as const,
        value: "larger" as const,
      }),
    smaller: () =>
      withToString({
        $primitive: "relative-size" as const,
        value: "smaller" as const,
      }),
  },

  // Angle helpers
  angle: {
    deg: (value: number) =>
      withToString({
        $primitive: "angle" as const,
        value: value === 0 ? (0 as const) : (`${value}deg` as const),
      }),
    grad: (value: number) =>
      withToString({
        $primitive: "angle" as const,
        value: `${value}grad` as const,
      }),
    rad: (value: number) =>
      withToString({
        $primitive: "angle" as const,
        value: `${value}rad` as const,
      }),
    turn: (value: number) =>
      withToString({
        $primitive: "angle" as const,
        value: `${value}turn` as const,
      }),
  },

  // Length helpers
  length: {
    px: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}px` as const),
      }),
    em: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}em` as const),
      }),
    rem: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}rem` as const),
      }),
    vh: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}vh` as const),
      }),
    vw: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}vw` as const),
      }),
    vmin: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}vmin` as const),
      }),
    vmax: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}vmax` as const),
      }),
    ch: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}ch` as const),
      }),
    ex: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}ex` as const),
      }),
    cm: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}cm` as const),
      }),
    mm: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}mm` as const),
      }),
    in: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}in` as const),
      }),
    pt: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}pt` as const),
      }),
    pc: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}pc` as const),
      }),
    percent: (value: number) =>
      withToString({
        $primitive: "length" as const,
        value: value === 0 ? (0 as const) : (`${value}%` as const),
      }),
  },

  // Color helpers
  color: {
    hex: (value: string) =>
      withToString({
        $primitive: "color" as const,
        value: `#${value.replace(/^#/, "")}` as CssColorValue,
      }),
    rgb: (r: number, g: number, b: number) =>
      withToString({
        $primitive: "color" as const,
        value: `rgb(${r}, ${g}, ${b})` as CssColorValue,
      }),
    rgba: (r: number, g: number, b: number, a: number) =>
      withToString({
        $primitive: "color" as const,
        value: `rgba(${r}, ${g}, ${b}, ${a})` as CssColorValue,
      }),
    hsl: (h: number, s: number, l: number) =>
      withToString({
        $primitive: "color" as const,
        value: `hsl(${h}, ${s}%, ${l}%)` as CssColorValue,
      }),
    hsla: (h: number, s: number, l: number, a: number) =>
      withToString({
        $primitive: "color" as const,
        value: `hsla(${h}, ${s}%, ${l}%, ${a})` as CssColorValue,
      }),
    var: (varName: string) =>
      withToString({
        $primitive: "color" as const,
        value: `var(--${varName.replace(/^--/, "")})` as CssColorValue,
      }),
    currentColor: () =>
      withToString({
        $primitive: "color" as const,
        value: "currentColor" as const,
      }),
    transparent: () =>
      withToString({
        $primitive: "color" as const,
        value: "transparent" as const,
      }),
    custom: (value: string) =>
      withToString({
        $primitive: "color" as const,
        value: value as CssColorValue,
      }),
  },

  // Background size helpers
  bgSize: {
    auto: () =>
      withToString({ $primitive: "bg-size" as const, value: "auto" as const }),
    cover: () =>
      withToString({ $primitive: "bg-size" as const, value: "cover" as const }),
    contain: () =>
      withToString({
        $primitive: "bg-size" as const,
        value: "contain" as const,
      }),
    custom: (value: CssLengthValue) =>
      withToString({
        $primitive: "bg-size" as const,
        value,
      }),
  },

  // Image helpers
  image: {
    url: (path: string) =>
      withToString({
        $primitive: "image" as const,
        value: `url(${path})` as CssImageValue,
      }),
    linearGradient: (value: string) =>
      withToString({
        $primitive: "image" as const,
        value: `linear-gradient(${value})` as CssImageValue,
      }),
    radialGradient: (value: string) =>
      withToString({
        $primitive: "image" as const,
        value: `radial-gradient(${value})` as CssImageValue,
      }),
    conicGradient: (value: string) =>
      withToString({
        $primitive: "image" as const,
        value: `conic-gradient(${value})` as CssImageValue,
      }),
    repeatingLinearGradient: (value: string) =>
      withToString({
        $primitive: "image" as const,
        value: `repeating-linear-gradient(${value})` as CssImageValue,
      }),
    repeatingRadialGradient: (value: string) =>
      withToString({
        $primitive: "image" as const,
        value: `repeating-radial-gradient(${value})` as CssImageValue,
      }),
    repeatingConicGradient: (value: string) =>
      withToString({
        $primitive: "image" as const,
        value: `repeating-conic-gradient(${value})` as CssImageValue,
      }),
    imageSet: (value: string) =>
      withToString({
        $primitive: "image" as const,
        value: `image-set(${value})` as CssImageValue,
      }),
    crossFade: (value: string) =>
      withToString({
        $primitive: "image" as const,
        value: `cross-fade(${value})` as CssImageValue,
      }),
    element: (id: string) =>
      withToString({
        $primitive: "image" as const,
        value: `element(${id})` as CssImageValue,
      }),
    custom: (value: string) =>
      withToString({
        $primitive: "image" as const,
        value: value as CssImageValue,
      }),
  },

  // Font helpers
  font: {
    family: (name: string) =>
      withToString({
        $primitive: "family-name" as const,
        value: name as CssFamilyName,
      }),
    generic: {
      serif: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "serif" as const,
        }),
      sansSerif: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "sans-serif" as const,
        }),
      monospace: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "monospace" as const,
        }),
      cursive: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "cursive" as const,
        }),
      fantasy: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "fantasy" as const,
        }),
      systemUi: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "system-ui" as const,
        }),
      uiSerif: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "ui-serif" as const,
        }),
      uiSansSerif: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "ui-sans-serif" as const,
        }),
      uiMonospace: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "ui-monospace" as const,
        }),
      uiRounded: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "ui-rounded" as const,
        }),
      emoji: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "emoji" as const,
        }),
      math: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "math" as const,
        }),
      fangsong: () =>
        withToString({
          $primitive: "generic-name" as const,
          value: "fangsong" as const,
        }),
    },
  },

  // Line width helpers
  lineWidth: {
    thin: () =>
      withToString({
        $primitive: "line-width" as const,
        value: "thin" as const,
      }),
    medium: () =>
      withToString({
        $primitive: "line-width" as const,
        value: "medium" as const,
      }),
    thick: () =>
      withToString({
        $primitive: "line-width" as const,
        value: "thick" as const,
      }),
    custom: (value: CssLengthValue) =>
      withToString({
        $primitive: "line-width" as const,
        value,
      }),
  },

  // Position helpers
  position: {
    top: () =>
      withToString({ $primitive: "position" as const, value: "top" as const }),
    bottom: () =>
      withToString({
        $primitive: "position" as const,
        value: "bottom" as const,
      }),
    left: () =>
      withToString({ $primitive: "position" as const, value: "left" as const }),
    right: () =>
      withToString({
        $primitive: "position" as const,
        value: "right" as const,
      }),
    center: () =>
      withToString({
        $primitive: "position" as const,
        value: "center" as const,
      }),
  },

  // Basic type helpers
  number: (value: number) =>
    withToString({ $primitive: "number" as const, value }),
  integer: (value: number) =>
    withToString({
      $primitive: "integer" as const,
      value: Math.floor(value),
    }),
  percentage: (value: number) =>
    withToString({
      $primitive: "percentage" as const,
      value: `${value}%` as const,
    }),
  ratio: (width: number, height: number) =>
    withToString({
      $primitive: "ratio" as const,
      value: `${width}/${height}` as const,
    }),

  // URL helper
  url: (path: string) =>
    withToString({
      $primitive: "url" as const,
      value: `url(${path})` as const,
    }),

  // Vector helper
  vector: (value: string) =>
    withToString({ $primitive: "vector" as const, value }),
};
