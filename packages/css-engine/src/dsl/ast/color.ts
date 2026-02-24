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
    mode: "light" | "dark" | "adaptive";
    palette: Palette;
    shade: Shade;
    role: "base" | "text";
    opacity?: number;
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
    role: "base",
    opacity,
  } satisfies ColorAst;
}

export function lightText<
  P extends Palette,
  S extends Shade,
  O extends number | undefined,
>(palette: P, shade: S, opacity?: O) {
  return {
    $ast: "color",
    mode: "light",
    palette,
    shade,
    role: "text",
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
    role: "base",
    opacity,
  } satisfies ColorAst;
}

export function darkText<
  P extends Palette,
  S extends Shade,
  O extends number | undefined,
>(palette: P, shade: S, opacity?: O) {
  return {
    $ast: "color",
    mode: "dark",
    palette,
    shade,
    role: "text",
    opacity,
  } satisfies ColorAst;
}

export function adaptive<
  P extends Palette,
  S extends Shade,
  O extends number | undefined,
>(palette: P, shade: S, opacity?: O) {
  return {
    $ast: "color",
    mode: "adaptive",
    palette,
    shade,
    role: "base",
    opacity,
  } satisfies ColorAst;
}

export function adaptiveText<
  P extends Palette,
  S extends Shade,
  O extends number | undefined,
>(palette: P, shade: S, opacity?: O) {
  return {
    $ast: "color",
    mode: "adaptive",
    palette,
    shade,
    role: "text",
    opacity,
  } satisfies ColorAst;
}
