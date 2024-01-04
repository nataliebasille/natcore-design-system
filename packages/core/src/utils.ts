export type Color = readonly [red: number, green: number, blue: number];

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

const WHITE_FORMATTED = formatColorForCssVariable(WHITE);
const BLACK_FORMATTED = formatColorForCssVariable(BLACK);

export function getContrastingTextColor(color: Color) {
  return contrast(color, WHITE) > contrast(color, BLACK)
    ? WHITE_FORMATTED
    : BLACK_FORMATTED;
}
