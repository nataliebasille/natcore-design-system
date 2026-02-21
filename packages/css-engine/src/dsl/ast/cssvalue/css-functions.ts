import type { AstNode } from "../../visitor/visitor-builder.types";
import type { ColorAst, ContrastAst, ToneAst } from "../color";
import type { CssVarAst } from "./cssvar";

/**
 * Color value type for CSS functions
 */
export type CssFunctionColorValue =
  | string
  | ColorAst
  | ContrastAst
  | ToneAst
  | CssVarAst;

/**
 * Length/numeric value type for CSS functions
 */
export type CssFunctionLengthValue = string | CssVarAst;

/**
 * Base type for CSS function AST nodes
 */
export type CssFunctionAst = AstNode<
  "css-function",
  | {
      name: "calc";
      expression: CssFunctionLengthValue;
    }
  | {
      name: "light-dark";
      light: CssFunctionColorValue;
      dark: CssFunctionColorValue;
    }
  | {
      name: "min";
      values: CssFunctionLengthValue[];
    }
  | {
      name: "max";
      values: CssFunctionLengthValue[];
    }
  | {
      name: "clamp";
      min: CssFunctionLengthValue;
      preferred: CssFunctionLengthValue;
      max: CssFunctionLengthValue;
    }
  | {
      name: "rgb";
      r: CssFunctionLengthValue;
      g: CssFunctionLengthValue;
      b: CssFunctionLengthValue;
      alpha?: CssFunctionLengthValue;
    }
  | {
      name: "hsl";
      h: CssFunctionLengthValue;
      s: CssFunctionLengthValue;
      l: CssFunctionLengthValue;
      alpha?: CssFunctionLengthValue;
    }
>;

/**
 * CSS calc() function
 * @example calc("100% - 1rem")
 */
export type CalcAst = AstNode<
  "css-function",
  {
    name: "calc";
    expression: CssFunctionLengthValue;
  }
>;

export function calc(expression: CssFunctionLengthValue): CalcAst {
  return {
    $ast: "css-function",
    name: "calc",
    expression,
  } satisfies CalcAst;
}

/**
 * CSS light-dark() function for color scheme based values
 * @example lightDark("#fff", "#000")
 */
export type LightDarkAst = AstNode<
  "css-function",
  {
    name: "light-dark";
    light: CssFunctionColorValue;
    dark: CssFunctionColorValue;
  }
>;

export function lightDark(
  light: CssFunctionColorValue,
  dark: CssFunctionColorValue,
): LightDarkAst {
  return {
    $ast: "css-function",
    name: "light-dark",
    light,
    dark,
  } satisfies LightDarkAst;
}

/**
 * CSS min() function
 * @example min("100%", "500px")
 */
export type MinAst = AstNode<
  "css-function",
  {
    name: "min";
    values: CssFunctionLengthValue[];
  }
>;

export function min(...values: CssFunctionLengthValue[]): MinAst {
  return {
    $ast: "css-function",
    name: "min",
    values,
  } satisfies MinAst;
}

/**
 * CSS max() function
 * @example max("100px", "10vw")
 */
export type MaxAst = AstNode<
  "css-function",
  {
    name: "max";
    values: CssFunctionLengthValue[];
  }
>;

export function max(...values: CssFunctionLengthValue[]): MaxAst {
  return {
    $ast: "css-function",
    name: "max",
    values,
  } satisfies MaxAst;
}

/**
 * CSS clamp() function
 * @example clamp("1rem", "5vw", "3rem")
 */
export type ClampAst = AstNode<
  "css-function",
  {
    name: "clamp";
    min: CssFunctionLengthValue;
    preferred: CssFunctionLengthValue;
    max: CssFunctionLengthValue;
  }
>;

export function clamp(
  min: CssFunctionLengthValue,
  preferred: CssFunctionLengthValue,
  max: CssFunctionLengthValue,
): ClampAst {
  return {
    $ast: "css-function",
    name: "clamp",
    min,
    preferred,
    max,
  } satisfies ClampAst;
}

/**
 * CSS rgb() function
 * @example rgb("255", "255", "255")
 */
export type RgbAst = AstNode<
  "css-function",
  {
    name: "rgb";
    r: CssFunctionLengthValue;
    g: CssFunctionLengthValue;
    b: CssFunctionLengthValue;
    alpha?: CssFunctionLengthValue;
  }
>;

export function rgb(
  r: CssFunctionLengthValue,
  g: CssFunctionLengthValue,
  b: CssFunctionLengthValue,
  alpha?: CssFunctionLengthValue,
): RgbAst {
  return {
    $ast: "css-function",
    name: "rgb",
    r,
    g,
    b,
    alpha,
  } satisfies RgbAst;
}

/**
 * CSS hsl() function
 * @example hsl("200", "50%", "50%")
 */
export type HslAst = AstNode<
  "css-function",
  {
    name: "hsl";
    h: CssFunctionLengthValue;
    s: CssFunctionLengthValue;
    l: CssFunctionLengthValue;
    alpha?: CssFunctionLengthValue;
  }
>;

export function hsl(
  h: CssFunctionLengthValue,
  s: CssFunctionLengthValue,
  l: CssFunctionLengthValue,
  alpha?: CssFunctionLengthValue,
): HslAst {
  return {
    $ast: "css-function",
    name: "hsl",
    h,
    s,
    l,
    alpha,
  } satisfies HslAst;
}

/**
 * Union of all CSS function AST types
 */
export type CssFunction = CssFunctionAst;
