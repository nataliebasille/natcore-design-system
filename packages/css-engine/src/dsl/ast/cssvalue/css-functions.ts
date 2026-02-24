import type { AstNode } from "../../visitor/visitor-builder.types";
import type { ColorAst } from "../color";
import type { CssVarAst } from "./cssvar";
import type { AnyCssValue, TemplateLiteralAst } from "./public";
/**
 * Color value type for CSS functions
 */
export type CssFunctionColorValue = string | ColorAst | CssVarAst;

/**
 * Length/numeric value type for CSS functions
 */
export type CssFunctionLengthValue<AllowedValue extends AnyCssValue> =
  | string
  | TemplateLiteralAst<AllowedValue>
  | CssVarAst;

/**
 * Base type for CSS function AST nodes
 */
export type CssFunctionAst<AllowedValue extends AnyCssValue> = AstNode<
  "css-function",
  | {
      name: "calc";
      expression: CssFunctionLengthValue<AllowedValue>;
    }
  | {
      name: "light-dark";
      light: CssFunctionColorValue;
      dark: CssFunctionColorValue;
    }
  | {
      name: "min";
      values: CssFunctionLengthValue<AllowedValue>[];
    }
  | {
      name: "max";
      values: CssFunctionLengthValue<AllowedValue>[];
    }
  | {
      name: "clamp";
      min: CssFunctionLengthValue<AllowedValue>;
      preferred: CssFunctionLengthValue<AllowedValue>;
      max: CssFunctionLengthValue<AllowedValue>;
    }
  | {
      name: "rgb";
      r: CssFunctionLengthValue<AllowedValue>;
      g: CssFunctionLengthValue<AllowedValue>;
      b: CssFunctionLengthValue<AllowedValue>;
      alpha?: CssFunctionLengthValue<AllowedValue>;
    }
  | {
      name: "hsl";
      h: CssFunctionLengthValue<AllowedValue>;
      s: CssFunctionLengthValue<AllowedValue>;
      l: CssFunctionLengthValue<AllowedValue>;
      alpha?: CssFunctionLengthValue<AllowedValue>;
    }
  | {
      name: "color-mix";
      colorspace: ColorMixColorspace;
      base: {
        color: CssFunctionColorValue;
        percentage?: CssFunctionLengthValue<AllowedValue>;
      };
      mix: {
        color: CssFunctionColorValue;
        percentage?: CssFunctionLengthValue<AllowedValue>;
      };
    }
>;

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
 * CSS calc() function
 * @example calc("100% - 1rem")
 */
export type CalcAst<AllowedValue extends AnyCssValue> = AstNode<
  "css-function",
  {
    name: "calc";
    expression: CssFunctionLengthValue<AllowedValue>;
  }
>;

export function calc<AllowedValue extends AnyCssValue>(
  expression: CssFunctionLengthValue<AllowedValue>,
): CalcAst<AllowedValue> {
  return {
    $ast: "css-function",
    name: "calc",
    expression,
  } satisfies CalcAst<AllowedValue>;
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
export type MinAst<AllowedValue extends AnyCssValue> = AstNode<
  "css-function",
  {
    name: "min";
    values: CssFunctionLengthValue<AllowedValue>[];
  }
>;

export function min<AllowedValue extends AnyCssValue>(
  ...values: CssFunctionLengthValue<AllowedValue>[]
): MinAst<AllowedValue> {
  return {
    $ast: "css-function",
    name: "min",
    values,
  } satisfies MinAst<AllowedValue>;
}

/**
 * CSS max() function
 * @example max("100px", "10vw")
 */
export type MaxAst<AllowedValue extends AnyCssValue> = AstNode<
  "css-function",
  {
    name: "max";
    values: CssFunctionLengthValue<AllowedValue>[];
  }
>;

export function max<AllowedValue extends AnyCssValue>(
  ...values: CssFunctionLengthValue<AllowedValue>[]
): MaxAst<AllowedValue> {
  return {
    $ast: "css-function",
    name: "max",
    values,
  } satisfies MaxAst<AllowedValue>;
}

/**
 * CSS clamp() function
 * @example clamp("1rem", "5vw", "3rem")
 */
export type ClampAst<AllowedValue extends AnyCssValue> = AstNode<
  "css-function",
  {
    name: "clamp";
    min: CssFunctionLengthValue<AllowedValue>;
    preferred: CssFunctionLengthValue<AllowedValue>;
    max: CssFunctionLengthValue<AllowedValue>;
  }
>;

export function clamp<AllowedValue extends AnyCssValue>(
  min: CssFunctionLengthValue<AllowedValue>,
  preferred: CssFunctionLengthValue<AllowedValue>,
  max: CssFunctionLengthValue<AllowedValue>,
): ClampAst<AllowedValue> {
  return {
    $ast: "css-function",
    name: "clamp",
    min,
    preferred,
    max,
  } satisfies ClampAst<AllowedValue>;
}

/**
 * CSS rgb() function
 * @example rgb("255", "255", "255")
 */
export type RgbAst<AllowedValue extends AnyCssValue> = AstNode<
  "css-function",
  {
    name: "rgb";
    r: CssFunctionLengthValue<AllowedValue>;
    g: CssFunctionLengthValue<AllowedValue>;
    b: CssFunctionLengthValue<AllowedValue>;
    alpha?: CssFunctionLengthValue<AllowedValue>;
  }
>;

export function rgb<AllowedValue extends AnyCssValue>(
  r: CssFunctionLengthValue<AllowedValue>,
  g: CssFunctionLengthValue<AllowedValue>,
  b: CssFunctionLengthValue<AllowedValue>,
  alpha?: CssFunctionLengthValue<AllowedValue>,
): RgbAst<AllowedValue> {
  return {
    $ast: "css-function",
    name: "rgb",
    r,
    g,
    b,
    alpha,
  } satisfies RgbAst<AllowedValue>;
}

/**
 * CSS hsl() function
 * @example hsl("200", "50%", "50%")
 */
export type HslAst<AllowedValue extends AnyCssValue> = AstNode<
  "css-function",
  {
    name: "hsl";
    h: CssFunctionLengthValue<AllowedValue>;
    s: CssFunctionLengthValue<AllowedValue>;
    l: CssFunctionLengthValue<AllowedValue>;
    alpha?: CssFunctionLengthValue<AllowedValue>;
  }
>;

export function hsl<AllowedValue extends AnyCssValue>(
  h: CssFunctionLengthValue<AllowedValue>,
  s: CssFunctionLengthValue<AllowedValue>,
  l: CssFunctionLengthValue<AllowedValue>,
  alpha?: CssFunctionLengthValue<AllowedValue>,
): HslAst<AllowedValue> {
  return {
    $ast: "css-function",
    name: "hsl",
    h,
    s,
    l,
    alpha,
  } satisfies HslAst<AllowedValue>;
}

/**
 * CSS color-mix() function
 * @example colorMix("srgb", "red", "50%", "blue")
 */
export type ColorMixAst<AllowedValue extends AnyCssValue> = AstNode<
  "css-function",
  {
    name: "color-mix";
    colorspace: ColorMixColorspace;
    base: {
      color: CssFunctionColorValue;
      percentage?: CssFunctionLengthValue<AllowedValue>;
    };
    mix: {
      color: CssFunctionColorValue;
      percentage?: CssFunctionLengthValue<AllowedValue>;
    };
  }
>;

export function colorMix<AllowedValue extends AnyCssValue>(
  colorspace: ColorMixColorspace,
  base: {
    color: CssFunctionColorValue;
    percentage?: CssFunctionLengthValue<AllowedValue>;
  },
  mix: {
    color: CssFunctionColorValue;
    percentage?: CssFunctionLengthValue<AllowedValue>;
  },
): ColorMixAst<AllowedValue> {
  return {
    $ast: "css-function",
    name: "color-mix",
    colorspace,
    base,
    mix,
  } satisfies ColorMixAst<AllowedValue>;
}

/**
 * Union of all CSS function AST types
 */
export type CssFunction<AllowedValue extends AnyCssValue> =
  CssFunctionAst<AllowedValue>;
