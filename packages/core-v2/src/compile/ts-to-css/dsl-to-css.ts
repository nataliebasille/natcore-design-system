import {
  css,
  cssv,
  dsl,
  stylesheetVisitorBuilder,
  type AnyCssValue,
} from "@nataliebasille/natcore-css-engine";
import { colorKey } from "../../shared/colors";

type TopLevelAst = dsl.StyleListAst | dsl.StyleRuleAst | dsl.AtRuleAst;
export function dslToCss(ast: TopLevelAst[]): css.StylesheetAst {
  const normalizedAst = normalizeCssValues(ast);

  return normalizedAst.flatMap(function transform(item):
    | css.StylesheetSimpleAst
    | css.StylesheetSimpleAst[] {
    return (
      item.$ast === "at-rule" ?
        css.atRule(item.name, item.prelude, ...item.rules.flatMap(transform))
      : item.$ast === "style-list" ? item.styles.map(css.styleList)
      : css.styleBlock(item.selector, item.body.flatMap(transform))
    );
  });
}

function normalizeCssValues(ast: TopLevelAst[]) {
  return stylesheetVisitorBuilder()
    .on("color", colorKey)
    .on("css-var", (ast) => {
      const fallback = ast.fallback !== undefined ? `, ${ast.fallback}` : "";
      return `var(--${ast.name}${fallback})`;
    })
    .on("css-function", cssFunctionToCssValue)
    .on("function-spacing", (ast) => cssv`--spacing(${ast.value})`)
    .on("css-value", {
      exit: (ast) => {
        return ast.strings.reduce(
          (result, str, i) => result + str + (ast.values[i] ?? ""),
          "",
        );
      },
    })
    .on("style-list", {
      exit: (ast) => {
        let tailwindClasses: string[] = [];
        const properties: [string, string][] = [];

        for (const item of ast.styles) {
          if ("$ast" in item && item.$ast === "tailwind-class") {
            tailwindClasses.push(
              typeof item.value === "string" ?
                item.value
              : `${item.value.prefix}-[${item.value.value}]`,
            );
          } else {
            properties.push(...Object.entries(item));
          }
        }

        if (tailwindClasses.length > 0) {
          properties.push(["@apply", tailwindClasses.join(" ")]);
        }

        return dsl.styleList(Object.fromEntries(properties));
      },
    })
    .visit(ast);
}

function cssFunctionToCssValue(ast: dsl.CssFunctionAst<AnyCssValue>) {
  return (
    ast.name === "calc" ? cssv`calc(${ast.expression})`
    : ast.name === "light-dark" ? cssv`light-dark(${ast.light}, ${ast.dark})`
    : ast.name === "min" ? cssv`min(${ast.values.join(", ")})`
    : ast.name === "max" ? cssv`max(${ast.values.join(", ")})`
    : ast.name === "clamp" ?
      cssv`clamp(${ast.min}, ${ast.preferred}, ${ast.max})`
    : ast.name === "rgb" ?
      cssv`rgb(${ast.r}, ${ast.g}, ${ast.b}${ast.alpha ? ` / ${ast.alpha}` : ""})`
    : ast.name === "hsl" ?
      cssv`hsl(${ast.h}, ${ast.s}, ${ast.l}${ast.alpha ? ` / ${ast.alpha}` : ""})`
    : exhaustive(ast)
  );
}

function exhaustive(_: never): never {
  throw new Error("Exhaustiveness check failed");
}
