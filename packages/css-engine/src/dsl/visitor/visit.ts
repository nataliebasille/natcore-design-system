import type { css } from "../../css";
import {
  styleRule,
  type ApplyValue,
  type ColorAst,
  type ComponentAst,
  type CssVarAst,
  type DesignSystemAst,
  type Selector,
  type StyleList,
  type StyleProperties,
  type StyleRuleAst,
  type ThemeAst,
} from "../ast";
import type { CssValueAst } from "../ast/cssvalue";
import type { ParentVisitorNode, VisitorObject } from "./visitor-object";

type VisitorFunction<T, R, N = R, P = ParentVisitorNode<N, T>> = (
  node: N,
  parent: P,
) => void | R;

type VisitorEventFunctions<T, R, N = R, P = ParentVisitorNode<N, T>> = {
  enter?: VisitorFunction<T, R, N, P>;
  exit?: VisitorFunction<T, R, N, P>;
};

export type {
  ParentVisitorNode,
  VisitorEventFunctions,
  VisitorFunction,
  VisitorObject,
};

export function visit<T extends DesignSystemAst>(
  ast: T,
  visitors: VisitorObject<T>,
): T;
export function visit<T extends DesignSystemAst[]>(
  ast: T,
  visitors: VisitorObject<T[number]>,
): T;

export function visit(
  ast: DesignSystemAst | DesignSystemAst[],
  visitors: VisitorObject<DesignSystemAst>,
): DesignSystemAst | DesignSystemAst[] {
  return visitDesignSystemAst(
    visitors as unknown as VisitorObject<DesignSystemAst>,
    ast as DesignSystemAst | DesignSystemAst[],
  );
}

function visitDesignSystemAst(
  visitors: VisitorObject<DesignSystemAst>,
  node: DesignSystemAst | DesignSystemAst[],
): DesignSystemAst | DesignSystemAst[] {
  if (node instanceof Array) {
    return node.flatMap((c) => visitDesignSystemAst(visitors, c));
  }

  const hasType = "type" in node;
  if (hasType && node.type === "theme") {
    return visitTheme(
      visitors,
      node,
      undefined as ParentVisitorNode<ThemeAst, DesignSystemAst>,
    );
  }

  if (hasType && node.type === "style-rule") {
    return visitStyleRule(
      visitors,
      node,
      undefined as ParentVisitorNode<StyleRuleAst, DesignSystemAst>,
    );
  }

  if (hasType && node.type === "component") {
    return visitComponent(
      visitors,
      node,
      undefined as ParentVisitorNode<ComponentAst, DesignSystemAst>,
    );
  }

  return visitStyles(
    visitors,
    node,
    undefined as ParentVisitorNode<StyleProperties, DesignSystemAst>,
  );
}

function visitTheme(
  visitors: VisitorObject<DesignSystemAst>,
  node: ThemeAst,
  parentNode: ParentVisitorNode<ThemeAst, DesignSystemAst>,
) {
  if (typeof visitors.theme === "function") {
    const result = visitors.theme(node, parentNode as any);
    if (result) {
      return result;
    }
  }

  for (const [key, value] of Object.entries(node.theme)) {
    const propertyVisitor = (visitors.theme as any)?.[key as css.ThemeProperty];

    const newValue =
      typeof propertyVisitor === "function" ?
        (propertyVisitor(value, node.theme) ?? value)
      : typeof value === "string" || typeof value === "number" || !value ? value
      : value.type === "color" ? visitColor(visitors, value, node.theme)
      : value.type === "css-value" ? visitCssValue(visitors, value, node.theme)
      : value;

    node.theme[key as css.ThemeProperty] = newValue ?? value;
  }

  return node;
}

function visitColor(
  visitors: VisitorObject<DesignSystemAst>,
  node: ColorAst,
  parentNode: ParentVisitorNode<ColorAst, DesignSystemAst>,
) {
  return runVisitor(visitors?.color, node, parentNode);
}

function visitCssValue(
  visitors: VisitorObject<DesignSystemAst>,
  node: CssValueAst,
  parentNode: ParentVisitorNode<CssValueAst, DesignSystemAst>,
) {
  return runVisitor(visitors?.["css-value"], node, parentNode);
}

function visitCssVar(
  visitors: VisitorObject<DesignSystemAst>,
  node: CssVarAst,
  parentNode: ParentVisitorNode<CssVarAst, DesignSystemAst>,
) {
  return runVisitor(visitors?.["css-var"], node, parentNode);
}

function visitStyleRule(
  visitors: VisitorObject<DesignSystemAst>,
  node: StyleRuleAst,
  parentNode:
    | ParentVisitorNode<StyleRuleAst, DesignSystemAst>
    | StyleProperties,
) {
  return runVisitor(visitors?.["style-rule"], node, parentNode, (node) => {
    node.selector = runVisitor(visitors.selector, node.selector, node);
    node.body = visitStyles(visitors, node.body, node);
    return node;
  });
}

function visitStyles(
  visitors: VisitorObject<DesignSystemAst>,
  node: StyleProperties,
  parentNode: ParentVisitorNode<StyleProperties, DesignSystemAst>,
) {
  const { $: nestedStyles, "@apply": applyStyles, ...styleList } = node;
  const newStyles: StyleProperties = {};

  if (applyStyles) {
    const newValue = runVisitor(
      visitors?.apply,
      applyStyles,
      node,
      (applyValues) =>
        applyValues.map((v) => {
          return typeof v === "object" ? visitCssValue(visitors, v, node) : v;
        }),
    );

    if (newValue instanceof Array) {
      newStyles["@apply"] = newValue;
    } else {
      Object.assign(newStyles, newValue);
    }
  }

  Object.assign(
    newStyles,
    runVisitor(visitors.styles, styleList, parentNode, (styles) => {
      const expandedStyles: StyleList = {};

      for (const key of Object.keys(styles)) {
        Object.assign(
          expandedStyles,
          visitStyleProperty(visitors, key as keyof StyleList, styles),
        );
      }

      return expandedStyles;
    }),
  );

  if (nestedStyles) {
    for (const [selector, styles] of Object.entries(
      nestedStyles as Record<string, StyleProperties>,
    )) {
      nestedStyles[selector] = visitStyleRule(
        visitors,
        styleRule(selector as Selector, styles),
        node,
      ).body;
    }
    newStyles["$"] = nestedStyles;
  }

  return newStyles;
}

function visitStyleProperty(
  visitors: VisitorObject<DesignSystemAst>,
  property: keyof StyleList,
  styles: StyleList,
) {
  const value = styles[property];
  const propertyVisitor =
    typeof visitors.styles !== "function" && visitors.styles?.[property];
  const newValue =
    typeof propertyVisitor === "function" ?
      (propertyVisitor(value as any, styles) ?? value)
    : typeof value === "string" || typeof value === "number" || !value ? value
    : value.type === "color" ? visitColor(visitors, value, styles)
    : value.type === "css-value" ? visitCssValue(visitors, value, styles)
    : value.type === "css-var" ? visitCssVar(visitors, value, styles)
    : exhaustive(value);

  return typeof newValue === "object" && !("type" in newValue) ?
      newValue
    : { [property]: newValue };
}

function visitComponent(
  visitors: VisitorObject<DesignSystemAst>,
  node: ComponentAst,
  parentNode: ParentVisitorNode<ComponentAst, DesignSystemAst>,
) {
  return runVisitor(visitors?.component, node, parentNode, (node) => {
    if (node.base) {
      node.base = visitStyles(visitors, node.base, node);
    }

    if (node.variants) {
      for (const [variantName, variantBody] of Object.entries(node.variants)) {
        node.variants[variantName] = visitStyles(visitors, variantBody, node);
      }
    }

    return node;
  });
}

function runVisitor<T, R, N, P>(
  visitor:
    | VisitorFunction<T, R, N, P>
    | VisitorEventFunctions<T, R, N, P>
    | undefined,
  node: N,
  parentNode: P,
  action?: (result: N) => N,
) {
  const enter = typeof visitor === "function" ? visitor : visitor?.enter;
  const exit = typeof visitor === "function" ? undefined : visitor?.exit;

  let modifiedDuringEnter = false;
  let result: R | N = node;

  if (enter) {
    const enterResult = enter(node, parentNode);
    if (enterResult) {
      result = enterResult;
      modifiedDuringEnter = true;
    }
  }

  if (!modifiedDuringEnter && action) {
    result = action(result as N);
  }

  if (exit) {
    // Only run exit if enter didn't modify the node
    // because otherwise the exit might be working on a different node
    const exitResult = exit(result as N, parentNode);
    if (exitResult) {
      result = exitResult;
    }
  }

  return result;
}

function exhaustive(value: never): never {
  throw new Error(`Unhandled case: ${value}`);
}
