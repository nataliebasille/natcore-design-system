import {
  cssvar,
  stylesheetVisitorBuilder,
  type ColorAst,
  type ColorValue,
  type css,
  type DesignSystemAst,
  type ToneAst,
} from "@nataliebasille/natcore-css-engine";

export function dslToCss(ast: DesignSystemAst): css.StylesheetAst {}

function normalizeCssValues(ast: DesignSystemAst) {
  return stylesheetVisitorBuilder()
    .on("contrast", (ast) => {
      return ast.for.$ast === "color" ?
          `--color-on-${colorValueKey(ast.for)}`
        : `--tone-on-${toneValueKey(ast.for)}`;
    })
    .on("color", (ast) => `--color-${colorValueKey(ast)}`)
    .on("tone", (ast) => `--tone-${toneValueKey(ast)}`)
    .on("");
}

function colorValueKey(color: ColorAst) {
  return `${color.palette}-${color.mode}-${color.shade}`;
}

function toneValueKey(tone: ToneAst) {
  return `${tone.shade}`;
}
