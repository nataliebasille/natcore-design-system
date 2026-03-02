import type {
  StylesheetSimpleAst,
  StyleProperties,
  StylePropertyValue,
  StylesheetAst,
  AtRuleAst,
} from "./ast";
import { combine } from "../utils";

export function compile(ast: StylesheetAst) {
  const astArray = ast instanceof Array ? ast : [ast];
  return combine(
    astArray.map((node) => compileAstNode(node, 0)),
    "\n\n",
  );
}

function compileAstNode(node: StylesheetSimpleAst, depth: number): string {
  return (
    node instanceof Array ?
      node.map((n) => compileAstNode(n, depth)).join("\n\n")
    : node.$css === "at-rule" ?
      compileAstBody(
        combine([`@${node.name}`, node.prelude], " "),
        node.body,
        depth,
      )
    : node.$css === "style-block" ?
      compileAstBody(node.selector, node.body, depth)
    : compileAstStyleList(node.styles, depth)
  );
}

function compileAstBody(
  prelude: string,
  body: Extract<StylesheetSimpleAst, { body: unknown }>["body"],
  depth: number,
): string {
  const indent = "  ".repeat(depth);

  if (body === null) {
    return `${indent}${prelude};`;
  }

  const bodyArray = body instanceof Array ? body : [body];
  const bodyContent = bodyArray
    .map((node) => compileAstNode(node, depth + 1))
    .join("\n");

  return `${indent}${prelude} {\n${bodyContent}\n${indent}}`;
}

function compileAstStyleList(
  styles: (StyleProperties | AtRuleAst)[],
  depth: number,
): string {
  return styles
    .map((style) =>
      isAtRuleStyleListItem(style) ?
        compileAstNode(style, depth)
      : compileAstStyleProperties(style, depth),
    )
    .join("\n");
}

function isAtRuleStyleListItem(
  style: StyleProperties | AtRuleAst,
): style is AtRuleAst {
  return (
    typeof style === "object" &&
    style !== null &&
    "$css" in style &&
    style.$css === "at-rule"
  );
}

function compileAstStyleProperties(
  styles: StyleProperties,
  depth: number,
): string {
  const indent = "  ".repeat(depth);
  return Object.entries(styles)
    .map(([key, value]: [string, StylePropertyValue]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${indent}${key}: ${v};`).join("\n");
      }
      return `${indent}${key}: ${value};`;
    })
    .join("\n");
}
