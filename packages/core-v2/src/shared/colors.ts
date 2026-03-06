import { dsl, type ColorAst } from "@nataliebasille/natcore-css-engine";

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
  return `${baseColorKey(color)}-${color.palette}` as const;
}

function baseColorKey(color: Pick<ColorAst, "role" | "mode" | "shade">) {
  const mode = color.mode === "adaptive" ? ("tone" as const) : color.mode;
  return `--color${color.role === "text" ? ("-on" as const) : ("" as const)}-${mode}-${color.shade}` as const;
}

export function toneKey(color: Pick<ColorAst, "shade" | "role">) {
  return `--${color.role === "text" ? ("on-" as const) : ("" as const)}tone-${color.shade}` as const;
}

export function renderPaletteMatcher(opt: { modifier?: true } = {}) {
  const tones = SHADES.flatMap(
    (shade) =>
      [
        { shade, role: "base" },
        { shade, role: "text" },
      ] as const,
  );

  const renderer = (tone: Pick<ColorAst, "shade" | "role">) => {
    const match = dsl.match.variable(
      baseColorKey({
        ...tone,
        mode: "adaptive",
      }),
    );

    return opt.modifier ? dsl.match.asModifier(match) : match;
  };

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
