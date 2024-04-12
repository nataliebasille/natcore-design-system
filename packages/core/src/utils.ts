export type Color = readonly [red: number, green: number, blue: number];
export type Hex = `#${string}`;
export type ColorConfig =
  | Color
  | {
      color: Color;
      shade: (typeof shades)[number];
    };

export type ColorSchema = Record<string, ColorConfig>;
export type NormalizedThemeColor = [color: Color, contrast: Color];
export type NormalizedThemePalette = Record<
  `${(typeof shades)[number]}`,
  NormalizedThemeColor
>;
export type NormalizedColorSchema<TFrom extends ColorSchema> = {
  themes: {
    light: {
      variants: {
        [K in keyof TFrom]: NormalizedThemePalette;
      };
      variables: {
        [K in keyof typeof VARIABLES_TO_SHADES]: (typeof shades)[number];
      };
    };
  };
};

export const VARIABLES_TO_SHADES = {
  base: "500",
  "base-hover": "900",
  "background-color": "50",
  "background-color-hover": "100",
  active: "800",
  disable: "200",
  border: "200",
} as const;

export const shades = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
] as const;
export const WHITE = [255, 255, 255] as const;
export const BLACK = [0, 0, 0] as const;

const RED_FACTOR = 0.2126;
const GREEN_FACTOR = 0.7152;
const BLUE_FACTOR = 0.0722;

const GAMMA = 2.4;

export function toHex([red, green, blue]: Color) {
  return `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
}

export function toRgb(hex: Hex): Color {
  const [, r, g, b] = /^#(..)(..)(..)$/.exec(hex) || [];

  if (!r || !g || !b) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)] as Color;
}

export function lighten(color: Color, factor: number) {
  return color.map((c) => {
    const value = Math.round(c + (255 - c) * factor);
    return value > 255 ? 255 : value;
  }) as unknown as Color;
}

export function darken(color: Color, factor: number) {
  return color.map((c) => {
    const value = Math.round(c * (1 - factor));

    return value < 0 ? 0 : value > 255 ? 255 : value;
  }) as unknown as Color;
}

export function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, GAMMA);
  });
  return a[0] * RED_FACTOR + a[1] * GREEN_FACTOR + a[2] * BLUE_FACTOR;
}

export function contrast(rgb1: Color, rgb2: Color) {
  const l1 = luminance(...rgb1) + 0.05;
  const l2 = luminance(...rgb2) + 0.05;
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function formatColorForCssVariable(color: Color) {
  return color.join(" ");
}

export function getContrastingTextColor(color: Color) {
  return contrast(color, WHITE) > contrast(color, BLACK) ? WHITE : BLACK;
}
