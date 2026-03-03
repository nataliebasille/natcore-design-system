import {
  css,
  dsl,
  stylesheetVisitorBuilder,
  type CssDataType,
} from "@nataliebasille/natcore-css-engine";
import { colorKey } from "../../shared/colors";

type TopLevelAst = dsl.StyleListAst | dsl.StyleRuleAst | dsl.AtRuleAst;
export function dslToCss(ast: TopLevelAst[]): css.StylesheetAst {
  return ast.flatMap<css.StylesheetSimpleAst>((node) => {
    return (
      node.$ast === "at-rule" ? [atRuleToCss(node)]
      : node.$ast === "style-rule" ? [styleRuleToCss(node)]
      : node.$ast === "style-list" ? styleListToCss(node)
      : exhaustive(node)
    );
  });
}

function atRuleToCss(node: dsl.AtRuleAst): css.AtRuleAst {
  return css.atRule(
    node.name,
    node.prelude,
    ...Array.from(
      (function* () {
        let currentApply = "";

        for (const item of node.rules) {
          if (item.$ast !== "tailwind-class" && currentApply) {
            yield css.atRule("apply", currentApply);
            currentApply = "";
          }

          if (item.$ast === "tailwind-class") {
            currentApply += `${currentApply ? " " : ""}${item.value}`;
          } else if (item.$ast === "style-rule") {
            yield styleRuleToCss(item);
          } else if (item.$ast === "style-list") {
            yield* styleListToCss(item);
          } else if (item.$ast === "at-rule") {
            yield atRuleToCss(item);
          } else {
            exhaustive(item);
          }
        }
      })(),
    ),
  );
}

function styleRuleToCss(node: dsl.StyleRuleAst): css.StyleBlockAst {
  return css.styleBlock(
    node.selector,
    ...Array.from(
      (function* () {
        let currentApply = "";
        for (const item of node.body) {
          if (item.$ast !== "tailwind-class" && currentApply) {
            yield css.atRule("apply", currentApply);
            currentApply = "";
          }

          if (item.$ast === "tailwind-class") {
            currentApply += `${currentApply ? " " : ""}${item.value}`;
          } else if (item.$ast === "style-rule") {
            yield styleRuleToCss(item);
          } else if (item.$ast === "style-list") {
            yield* styleListToCss(item);
          } else {
            exhaustive(item);
          }
        }

        if (currentApply) {
          yield css.atRule("apply", currentApply);
        }
      })(),
    ),
  );
}

function styleListToCss(
  node: dsl.StyleListAst,
): (css.AtRuleAst | css.StyleListAst)[] {
  return Array.from(
    (function* () {
      let currentApply = "";
      let currentStyles: css.StyleProperties | undefined = undefined;

      for (const item of node.styles) {
        if ("$ast" in item && item.$ast === "tailwind-class") {
          if (currentStyles) {
            yield css.styleList(currentStyles);
            currentStyles = undefined;
          }

          currentApply += `${currentApply ? " " : ""}${item.value}`;
        } else {
          if (currentApply) {
            yield css.atRule("apply", currentApply);
            currentApply = "";
          }

          currentStyles = Object.assign(
            currentStyles || {},
            Object.fromEntries(
              Object.entries(item as dsl.StyleProperties)
                .filter(
                  (
                    entry,
                  ): entry is [string, Exclude<(typeof entry)[1], undefined>] =>
                    !!entry[1],
                )
                .map(([key, value]) => [
                  key,
                  transformStylePropertyValue(value),
                ]),
            ),
          );
        }
      }

      if (currentApply) {
        yield css.atRule("apply", currentApply);
      }

      if (currentStyles) {
        yield css.styleList(currentStyles);
      }
    })(),
  );
}

function transformStylePropertyValue(
  value: Exclude<
    dsl.StyleProperties[keyof dsl.StyleProperties],
    Array<unknown>
  >,
): css.StyleProperties[keyof css.StyleProperties] | false; // false is used to filter out undefined values;
function transformStylePropertyValue(
  value: Extract<
    dsl.StyleProperties[keyof dsl.StyleProperties],
    Array<unknown>
  >,
): css.StyleProperties[keyof css.StyleProperties];
function transformStylePropertyValue(
  value: dsl.StyleProperties[keyof dsl.StyleProperties],
): css.StyleProperties[keyof css.StyleProperties] | false;

function transformStylePropertyValue(
  value: dsl.StyleProperties[keyof dsl.StyleProperties],
): css.StyleProperties[keyof css.StyleProperties] | false {
  if (!value) {
    return false;
  }

  if (value instanceof Array) {
    return value
      .flatMap(transformStylePropertyValue)
      .filter((v): v is Exclude<typeof v, undefined | false> => !!v);
  }

  const intermediateTransformedValue = stylesheetVisitorBuilder()
    .on("color", (ast) => {
      const key = colorKey(ast);

      return dsl.cssvar(key);
    })
    .on("function-spacing", (value) => `--spacing(${value.value})`)
    .on("css-var", function cssVarToString(value): string {
      return `var(${value.name}${value.fallback ? `, ${typeof value.fallback === "object" ? cssVarToString(value.fallback) : ""}` : ""})`;
    })
    .on("match-value", (value) => matchToString("--value", value.candidates))
    .on("match-modifier", (value) =>
      matchToString("--modifier", value.candidates),
    )
    .visit(value);

  return (
    (
      !intermediateTransformedValue ||
        typeof intermediateTransformedValue === "string" ||
        typeof intermediateTransformedValue === "number"
    ) ?
      intermediateTransformedValue
    : (
      "$primitive" in intermediateTransformedValue ||
      "$function" in intermediateTransformedValue
    ) ?
      `${intermediateTransformedValue}`
    : transformCssTemplate(intermediateTransformedValue)
  );
}

function transformCssTemplate(value: {
  strings: string[];
  values: unknown[];
}): css.StylePropertyValue {
  let result = "";

  for (let i = 0; i < value.strings.length; i++) {
    result += value.strings[i] || "";
    const templateValue = value.values[i];
    if (templateValue !== undefined) {
      result += `${templateValue}`;
    }
  }

  return result;
}

function matchToString(
  functionName: string,
  candidates: dsl.TwValueCandidate<CssDataType>[],
) {
  const args = candidates.map((candidates) => {
    return (
      candidates.$twCandidate === "variable" ? `${candidates.root}-*`
      : candidates.$twCandidate === "arbitrary" ? `[${candidates.dataType}]`
      : candidates.dataType
    );
  });

  return `${functionName}(${args.join(", ")})`;
}

function exhaustive(_: never): never {
  throw new Error("Exhaustiveness check failed");
}
