import type { AstNode } from "../visitor/visitor-builder.types";

export const SHADES = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;
export type Shade = (typeof SHADES)[number];

export const PALETTE = ["primary", "secondary", "accent", "surface"] as const;
export type Palette = (typeof PALETTE)[number];

export type ColorAst = AstNode<
  "color",
  {
    mode: "light" | "dark";
    palette: Palette;
    shade: Shade;
    opacity?: number;
  }
>;

export type ToneAst = AstNode<
  "tone",
  {
    shade: Shade;
    opacity?: number;
  }
>;

export type ContrastAst = AstNode<
  "contrast",
  {
    for: ColorAst;
  }
>;

export function light<
  P extends Palette,
  S extends Shade,
  O extends number | undefined,
>(palette: P, shade: S, opacity?: O) {
  return {
    $ast: "color",
    mode: "light",
    palette,
    shade,
    opacity,
  } satisfies ColorAst;
}

export function dark<
  P extends Palette,
  S extends Shade,
  O extends number | undefined,
>(palette: P, shade: S, opacity?: O) {
  return {
    $ast: "color",
    mode: "dark",
    palette,
    shade,
    opacity,
  } satisfies ColorAst;
}

export function tone<S extends Shade, O extends number | undefined>(
  shade: S,
  opacity?: O,
) {
  return {
    $ast: "tone",
    shade,
    opacity,
  } satisfies ToneAst;
}

export function contrast(forColor: ColorAst) {
  return {
    $ast: "contrast",
    for: forColor,
  } satisfies ContrastAst;
}
