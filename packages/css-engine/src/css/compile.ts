import type {
  StylesheetSimpleAst,
  StyleProperties,
  StylesheetAst,
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
    : node.type === "at-rule" ?
      compileAstBody(
        combine([`@${node.name}`, node.prelude], " "),
        node.body,
        depth,
      )
    : node.type === "style-block" ?
      compileAstBody(node.selector, node.body, depth)
    : compileAstStyleProperties(node.styles, depth)
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

function compileAstStyleProperties(
  styles: StyleProperties,
  depth: number,
): string {
  const indent = "  ".repeat(depth);
  return Object.entries(styles)
    .map(([key, value]) => `${indent}${key}: ${value};`)
    .join("\n");
}
