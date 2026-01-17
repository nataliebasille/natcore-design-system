import {
  type ColorAst,
  type ComponentAst,
  type CssVarAst,
  type DesignSystemAst,
  type Selector,
  type StyleProperties,
  type StyleRuleAst,
  type ThemeAst,
  type ThemeProperties,
} from "../ast";
import type {
  ExtendsNever,
  SelectWherePropOrArrayElementIs,
} from "../../utils/types";
import type { CssValueAst } from "../ast/cssvalue";
import type { css } from "../../css";
import type { Style } from "util";

export type ParentVisitorNode<N, T> =
  | (N extends T ? undefined : never)
  | (ExtendsNever<SelectWherePropOrArrayElementIs<T, N>> extends true ?
      undefined
    : SelectWherePropOrArrayElementIs<T, N>);

type VisitorFunction<T, R, N = R, P = ParentVisitorNode<N, T>> = (
  node: N,
  parent: P,
) => void | R;

type VisitorEventFunctions<T, R, N = R, P = ParentVisitorNode<N, T>> = {
  enter?: VisitorFunction<T, R, N, P>;
  exit?: VisitorFunction<T, R, N, P>;
};

type VisitorObject<T> = {
  apply?:
    | VisitorFunction<
        T,
        StyleProperties["@apply"] | StyleProperties,
        StyleProperties["@apply"],
        StyleProperties
      >
    | VisitorEventFunctions<
        T,
        StyleProperties["@apply"] | StyleProperties,
        StyleProperties["@apply"],
        StyleProperties
      >;
  color?:
    | VisitorFunction<T, ColorAst | string, ColorAst>
    | VisitorEventFunctions<T, ColorAst | string, ColorAst>;
  component?:
    | VisitorFunction<T, ComponentAst>
    | VisitorEventFunctions<T, ComponentAst>;
  "css-value"?:
    | VisitorFunction<T, CssValueAst | string, CssValueAst>
    | VisitorEventFunctions<T, CssValueAst | string, CssValueAst>;
  "css-var"?:
    | VisitorFunction<T, CssVarAst | string, CssVarAst>
    | VisitorEventFunctions<T, CssVarAst | string, CssVarAst>;
  selector?: VisitorFunction<T, Selector> | VisitorEventFunctions<T, Selector>;
  "style-rule"?:
    | VisitorFunction<T, StyleRuleAst>
    | VisitorEventFunctions<T, StyleRuleAst>;
  styles?:
    | VisitorFunction<T, StyleProperties>
    | {
        [K in keyof css.StyleProperties]: VisitorFunction<
          T,
          StyleProperties[K],
          StyleProperties
        >;
      };
  theme?:
    | VisitorFunction<T, ThemeAst>
    | {
        [K: css.ThemeProperty]: VisitorFunction<
          T,
          ThemeProperties[keyof ThemeProperties],
          ThemeProperties
        >;
      };
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
  parentNode: ParentVisitorNode<StyleRuleAst, DesignSystemAst>,
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
  if (typeof visitors.styles === "function") {
    const result = visitors.styles(node, parentNode);
    if (result) {
      return result;
    }
  }

  const newStyles: StyleProperties = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === "@apply") {
      const newValue = runVisitor(visitors?.apply, value as string[], node);

      if (newValue instanceof Array) {
        newStyles["@apply"] = newValue;
      } else {
        Object.assign(newStyles, newValue);
      }
    } else if (key === "$") {
      const nestedStyles: Record<string, StyleProperties> = {};
      for (const [selector, styles] of Object.entries(
        value as Record<string, StyleProperties>,
      )) {
        nestedStyles[selector] = visitStyles(visitors, styles, node);
      }
      newStyles["$"] = nestedStyles;
    } else if (!(value instanceof Array)) {
      const propertyVisitor = (visitors.styles as any)?.[key];
      const newValue =
        typeof propertyVisitor === "function" ?
          (propertyVisitor(value, node) ?? value)
        : typeof value === "string" || typeof value === "number" || !value ?
          value
        : value.type === "color" ? visitColor(visitors, value, node)
        : value.type === "css-value" ? visitCssValue(visitors, value, node)
        : value.type === "css-var" ? visitCssVar(visitors, value, node)
        : value;
      newStyles[key as any] = newValue ?? value;
    }
  }

  return newStyles;
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

  if (!modifiedDuringEnter && exit) {
    // Only run exit if enter didn't modify the node
    // because otherwise the exit might be working on a different node
    const exitResult = exit(node, parentNode);
    if (exitResult) {
      result = exitResult;
    }
  }

  return result;
}
