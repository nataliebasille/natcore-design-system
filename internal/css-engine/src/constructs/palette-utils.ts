import {
  SHADES,
  type ColorAst,
  type Palette,
} from "../dsl/ast/cssvalue/color.ts";
import { dsl } from "../dsl/public.ts";

export function colorKey(
  color: Pick<ColorAst, "role" | "palette" | "mode" | "shade">,
) {
  if (color.palette === "current") {
    return toneKey(color);
  }

  const mode = color.mode === "adaptive" ? ("tone" as const) : color.mode;
  return `${colorKeyWithoutPalette(color)}-${color.palette}` as const;
}

export function currentOrDefaultColor(
  color: Pick<ColorAst, "shade" | "role" | "opacity"> &
    Partial<Pick<ColorAst, "mode">>,
  defaultPalette: Palette = "primary",
) {
  return applyOpacity({
    default: dsl.color({
      mode: "adaptive",
      palette: "current",
      ...color,
    }),
    fallback: dsl.color({
      mode: "adaptive",
      palette: defaultPalette,
      ...color,
    }),
    opacity: color.opacity,
  });
}

export function applyOpacity(
  color:
    | ColorAst
    | {
        default: Omit<ColorAst, "opacity">;
        fallback?: Omit<ColorAst, "opacity">;
        opacity?: number;
      },
) {
  const defaultKey = colorKey("default" in color ? color.default : color);
  const fallbackKey =
    "fallback" in color && color.fallback ?
      colorKey(color.fallback)
    : undefined;

  const v = dsl.cssvar(
    defaultKey,
    fallbackKey ? dsl.cssvar(fallbackKey) : undefined,
  );

  return color.opacity === undefined ?
      v
    : dsl.colorMix(
        "srgb",
        {
          color: v,
          percentage: dsl.primitive.percentage(color.opacity * 100),
        },
        { color: dsl.primitive.color.transparent() },
      );
}

export function matchColor() {
  return dsl.match.variable("--color");
}

export function matchTextColor() {
  return dsl.match.variable("--color-on");
}

export function toneKey(color: Pick<ColorAst, "shade" | "role">) {
  return `--${color.role === "text" ? ("on-" as const) : ("" as const)}tone-${color.shade}` as const;
}

export function colorKeyWithoutPalette(
  color: Pick<ColorAst, "role" | "mode" | "shade">,
) {
  const mode = color.mode === "adaptive" ? ("tone" as const) : color.mode;
  return `--color${color.role === "text" ? ("-on" as const) : ("" as const)}-${mode}-${color.shade}` as const;
}

export function renderPalette(
  renderer: (
    color: Pick<ColorAst, "shade" | "role">,
    key: ReturnType<typeof toneKey>,
  ) => dsl.StylePropertyValue | [`--${string}`, dsl.StylePropertyValue],
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
    Array.from(dedup.entries()).map(([key, tone]) => {
      const value = renderer(tone, key);

      return value instanceof Array ? value : ([key, value] as const);
    }),
  );
}
