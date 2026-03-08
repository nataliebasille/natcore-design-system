import {
  dsl,
  type ColorAst,
  type Palette,
} from "@nataliebasille/natcore-css-engine";

export type Shade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950;
export const SHADES: Shade[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
];

export function colorKey(
  color: Pick<ColorAst, "role" | "palette" | "mode" | "shade">,
) {
  if (color.palette === "current") {
    return toneKey(color);
  }

  const mode = color.mode === "adaptive" ? ("tone" as const) : color.mode;
  return `${colorKeyWithoutPalette(color)}-${color.palette}` as const;
}

export function colorKeyWithoutPalette(
  color: Pick<ColorAst, "role" | "mode" | "shade">,
) {
  const mode = color.mode === "adaptive" ? ("tone" as const) : color.mode;
  return `--color${color.role === "text" ? ("-on" as const) : ("" as const)}-${mode}-${color.shade}` as const;
}

export function toneKey(color: Pick<ColorAst, "shade" | "role">) {
  return `--${color.role === "text" ? ("on-" as const) : ("" as const)}tone-${color.shade}` as const;
}

export function currentOrDefaultColor(
  color: Pick<ColorAst, "shade" | "role" | "opacity"> &
    Partial<Pick<ColorAst, "mode">>,
  defaultPalette: Palette = "primary",
) {
  return dsl.cssv`var(${dsl.color({
    mode: "adaptive",
    palette: "current",
    ...color,
  })}, ${dsl.color({
    mode: "adaptive",
    palette: defaultPalette,
    ...color,
  })})`;
}

export function applyOpacity(color: {
  default: ColorAst;
  fallback?: ColorAst;
  opacity: number;
}) {}

export function renderPalette(
  renderer: (color: Pick<ColorAst, "shade" | "role">) => dsl.StylePropertyValue,
) {
  const tones = SHADES.flatMap(
    (shade) =>
      [
        { shade, role: "base" },
        { shade, role: "text" },
      ] as const,
  );

  const dedup = new Map(tones.map((tone) => [toneKey(tone), tone]));

  return Object.fromEntries(
    Array.from(dedup.entries()).map(
      ([key, tone]) => [key, renderer(tone)] as const,
    ),
  );
}

export function matchColor() {
  return dsl.match.variable("--color");
}

export function matchTextColor() {
  return dsl.match.variable("--color-on");
}
