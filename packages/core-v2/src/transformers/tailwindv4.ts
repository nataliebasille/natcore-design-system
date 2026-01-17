import {
  compile,
  css,
  dsl,
  visit,
  type DesignSystemAst,
} from "@nataliebasille/natcore-css-engine";
import { shades } from "../colors";

export function transformTailwindV4(ast: DesignSystemAst) {
  let hasThemeColor = false;
  const theme: css.ThemeProperties = {};
  const stylesheet: css.StylesheetAst = [];

  const createComponentStylesheetAst = (
    component: dsl.ComponentAst,
  ): css.StylesheetSimpleAst[] => {
    const stylesheet: css.StylesheetSimpleAst[] = [];
    // Object.assign(theme, component.theme);
    const body = transpileRuleBody(component.base, { component });
    stylesheet.push({
      type: "at-rule",
      name: "utility",
      prelude: component.name,
      body: [...body.css],
    } satisfies css.AtRuleAst);

    if (body.hasThemeColor) {
      for (const shade of shades) {
        theme[`--${component.name}-${shade}`] = `var(--color-${shade}-primary)`;
        theme[`--${component.name}-${shade}-text`] =
          `var(--color-${shade}-text-primary)`;
      }
    }

    return stylesheet;
  };

  visit(ast, {
    apply: () => {},
    color: () => {
      hasThemeColor = true;
    },
    component: (node) => {
      stylesheet.push(...createComponentStylesheetAst(node));
    },
    "css-value": () => {},
    selector: () => {},
    "style-rule": () => {},
    theme: (node) => {
      Object.assign(theme, node.theme);
    },
  });

  stylesheet.unshift({
    type: "at-rule",
    name: "theme",
    prelude: "",
    body: [
      {
        type: "style-list",
        styles: theme,
      } satisfies css.StyleListAst,
    ],
  } satisfies css.AtRuleAst);

  return compile(stylesheet);
}

type TranspileContext = {
  component?: dsl.ComponentAst;
};

type StylePropertiesCss = css.StyleListAst | css.StyleBlockAst | css.AtRuleAst;
function transpileStyleProperties(
  body: dsl.StyleProperties | undefined,
  context: TranspileContext,
): { css: StylePropertiesCss[]; hasThemeColor: boolean } {
  let hasThemeColor = false;
  const css: StylePropertiesCss[] = [];

  if (!body) return { css, hasThemeColor: false };

  visit(body, {
    apply: (node) => {
      css.push({
        type: "at-rule",
        name: "apply",
        prelude: node
          .map((n) =>
            typeof n === "string" ? n : transpileCssValue(n, context),
          )
          .join(" "),
        body: null,
      });
    },
    color: (node) => {
      hasThemeColor = true;
      return node.opacity != null ?
          `color-mix(in oklch, var(--${context.component.name}-${node.value}) ${(1 - node.opacity) * 100}%, transparent)`
        : `var(--${context.component.name}-${node.value})`;
    },
    "style-rule": (node) => {
      const body = transpileRuleBody(node.body, context);
      hasThemeColor = hasThemeColor || body.hasThemeColor;
      css.push({
        type: "style-block",
        selector: node.selector,
        body: body.css,
      });

      return node;
    },
    styles: (node) => {
      css.push({
        type: "style-list",
        styles: node as css.StyleProperties,
      });
    },
  });

  return { css, hasThemeColor };
}

function transpileCssValue(
  node: dsl.CssValueAst,
  context: TranspileContext,
): string {
  const parts: string[] = [];

  parts.push(node.strings?.[0] ?? "");

  node.values.forEach((value, i) => {
    if (value.type === "color") {
      parts.push(
        transpileStyleProperties({ color: value }, context).css[0] as string,
      );
    } else if (value.type === "css-var") {
      parts.push(`var(${value.name})`);
    }
    parts.push(node.strings?.[i + 1] ?? "");
  });

  return parts.join("");
}
