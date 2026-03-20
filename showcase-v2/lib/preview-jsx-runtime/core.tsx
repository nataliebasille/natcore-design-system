import {
  createElement,
  Fragment as ReactFragment,
  type ReactNode,
} from "react";
import type { ShowcaseJsxChild, ShowcaseJsxNode } from "./types";
import { Fragment } from "./jsx-runtime";

export function renderToUi(jsx: ShowcaseJsxChild): ReactNode {
  return renderWithStructure<ReactNode>(jsx, {
    renderArray: (children, renderChild) =>
      children.map((child, index) => (
        <ReactFragment key={index}>{renderChild(child)}</ReactFragment>
      )),
    renderPrimitive: (value) => value,
    renderUiNode: (node, renderChild) => renderChild(node.props.children),
    renderMarkupNode: () => null,
    renderUiElementNode: (node, renderChild) => {
      const props = collectProps(node, "ui");
      const children =
        node.props.children ? renderChild(node.props.children) : undefined;
      return createElement(node.type as any, props, children);
    },
    renderMarkupElementNode: (node, renderChild) =>
      node.props.children ? renderChild(node.props.children) : null,
    renderElement: (node, renderChild) => {
      const props = collectProps(node, "ui");
      const children =
        node.props.children ? renderChild(node.props.children) : undefined;
      return createElement(node.type as any, props, children);
    },
  });
}

export function renderToMarkup(jsx: ShowcaseJsxChild): string {
  return renderWithStructure<string>(jsx, {
    renderArray: (children, renderChild) => {
      const renderedChildren = children
        .map((child) => ({ child, value: renderChild(child) }))
        .filter(({ value }) => value.length > 0);

      if (renderedChildren.length === 0) {
        return "";
      }

      const hasInlinePrimitive = children.some(isInlineMarkupPrimitive);
      if (hasInlinePrimitive) {
        return renderedChildren.map(({ value }) => value).join("");
      }

      return renderedChildren
        .filter(({ child }) => !isWhitespaceOnlyStringPrimitive(child))
        .map(({ value }) => value)
        .join("\n");
    },
    renderPrimitive: (value) => serializePrimitiveForMarkup(value),
    renderUiNode: () => "",
    renderMarkupNode: (node) => renderMarkupLiteral(node.props.children),
    renderUiElementNode: (node, renderChild) =>
      node.props.children ? renderChild(node.props.children) : "",
    renderMarkupElementNode: (node, renderChild) => {
      const props = collectProps(node, "markup");
      const children =
        node.props.children ? renderChild(node.props.children) : "";
      const tagName = String(node.type);
      const propsString = serializePropsForMarkup(props);

      if (VOID_HTML_ELEMENTS.has(tagName.toLowerCase())) {
        return `<${tagName}${propsString}>`;
      }

      return `<${tagName}${propsString}>${children}</${tagName}>`;
    },
    renderElement: (node, renderChild) => {
      const props = collectProps(node, "markup");
      const children =
        node.props.children ? renderChild(node.props.children) : "";
      const tagName = String(node.type);
      const propsString = serializePropsForMarkup(props);

      if (VOID_HTML_ELEMENTS.has(tagName.toLowerCase())) {
        return `<${tagName}${propsString}>`;
      }

      return `<${tagName}${propsString}>${children}</${tagName}>`;
    },
  });
}

function renderMarkupLiteral(jsx: ShowcaseJsxChild): string {
  if (jsx instanceof Array) {
    return jsx.map((child) => renderMarkupLiteral(child)).join("");
  }

  if (jsx === null || jsx === undefined || typeof jsx === "boolean") {
    return "";
  }

  if (!isShowcaseJsxNode(jsx)) {
    return String(jsx);
  }

  if (typeof jsx.type === "function") {
    return renderMarkupLiteral(jsx.type(jsx.props));
  }

  if (jsx.type === Fragment) {
    return renderMarkupLiteral(jsx.props.children);
  }

  if (jsx.type === "ui") {
    return "";
  }

  if (jsx.type === "markup") {
    return renderMarkupLiteral(jsx.props.children);
  }

  if (typeof jsx.type === "string" && jsx.type.startsWith("ui-")) {
    return jsx.props.children ? renderMarkupLiteral(jsx.props.children) : "";
  }

  if (typeof jsx.type === "string" && jsx.type.startsWith("markup-")) {
    const tagName = jsx.type.slice("markup-".length);
    const props = collectProps(jsx, "markup");
    const children =
      jsx.props.children ? renderMarkupLiteral(jsx.props.children) : "";
    const propsString = serializePropsForMarkup(props);

    if (VOID_HTML_ELEMENTS.has(tagName.toLowerCase())) {
      return `<${tagName}${propsString}>`;
    }

    return `<${tagName}${propsString}>${children}</${tagName}>`;
  }

  const props = collectProps(jsx, "markup");
  const children =
    jsx.props.children ? renderMarkupLiteral(jsx.props.children) : "";
  const tagName = String(jsx.type);
  const propsString = serializePropsForMarkup(props);

  if (VOID_HTML_ELEMENTS.has(tagName.toLowerCase())) {
    return `<${tagName}${propsString}>`;
  }

  return `<${tagName}${propsString}>${children}</${tagName}>`;
}

type Renderer<T> = {
  renderArray: (
    children: ShowcaseJsxChild[],
    renderChild: (child: ShowcaseJsxChild) => T,
  ) => T;
  renderPrimitive: (
    value: Exclude<ShowcaseJsxChild, ShowcaseJsxNode | ShowcaseJsxChild[]>,
  ) => T;
  renderUiNode: (
    node: ShowcaseJsxNode,
    renderChild: (child: ShowcaseJsxChild) => T,
  ) => T;
  renderMarkupNode: (
    node: ShowcaseJsxNode,
    renderChild: (child: ShowcaseJsxChild) => T,
  ) => T;
  renderUiElementNode: (
    node: ShowcaseJsxNode,
    renderChild: (child: ShowcaseJsxChild) => T,
  ) => T;
  renderMarkupElementNode: (
    node: ShowcaseJsxNode,
    renderChild: (child: ShowcaseJsxChild) => T,
  ) => T;
  renderElement: (
    node: ShowcaseJsxNode,
    renderChild: (child: ShowcaseJsxChild) => T,
  ) => T;
};

function renderWithStructure<T>(
  jsx: ShowcaseJsxChild,
  renderer: Renderer<T>,
): T {
  const renderChild = (child: ShowcaseJsxChild) =>
    renderWithStructure(child, renderer);

  if (jsx instanceof Array) {
    return renderer.renderArray(jsx, renderChild);
  }

  if (!isShowcaseJsxNode(jsx)) {
    return renderer.renderPrimitive(jsx);
  }

  if (typeof jsx.type === "function") {
    return renderChild(jsx.type(jsx.props));
  }

  if (jsx.type === Fragment) {
    return renderChild(jsx.props.children);
  }

  if (jsx.type === "ui") {
    return renderer.renderUiNode(jsx, renderChild);
  }

  if (jsx.type === "markup") {
    return renderer.renderMarkupNode(jsx, renderChild);
  }

  if (typeof jsx.type === "string" && jsx.type.startsWith("ui-")) {
    const elementType = jsx.type.slice("ui-".length);
    return renderer.renderUiElementNode(
      { ...jsx, type: elementType as any },
      renderChild,
    );
  }

  if (typeof jsx.type === "string" && jsx.type.startsWith("markup-")) {
    const elementType = jsx.type.slice("markup-".length);
    return renderer.renderMarkupElementNode(
      { ...jsx, type: elementType as any },
      renderChild,
    );
  }

  return renderer.renderElement(jsx, renderChild);
}

function isShowcaseJsxNode(jsx: ShowcaseJsxChild): jsx is ShowcaseJsxNode {
  return typeof jsx === "object" && jsx !== null && "type" in jsx;
}

function collectProps(jsx: ShowcaseJsxNode, type: "ui" | "markup") {
  return Object.fromEntries(
    Object.entries(jsx.props)
      .filter(
        ([key]) =>
          key !== "__source" &&
          key !== "children" &&
          (!key.includes(":") || key.startsWith(`${type}:`)),
      )
      .map(([key, value]) => [normalizeScopedPropKey(key, type), value]),
  );
}

function normalizeScopedPropKey(key: string, type: "ui" | "markup") {
  const scopedKey = key.replace(`${type}:`, "");

  if (type === "ui") {
    if (scopedKey === "class") {
      return "className";
    }

    if (scopedKey === "for") {
      return "htmlFor";
    }

    return scopedKey;
  }

  return scopedKey === "className" ? "class" : scopedKey;
}

function serializePrimitiveForMarkup(
  value: Exclude<ShowcaseJsxChild, ShowcaseJsxNode | ShowcaseJsxChild[]>,
) {
  if (value === null || value === undefined || typeof value === "boolean") {
    return "";
  }

  return escapeHtml(String(value));
}

function isWhitespaceOnlyStringPrimitive(child: ShowcaseJsxChild) {
  return typeof child === "string" && child.trim().length === 0;
}

function isInlineMarkupPrimitive(child: ShowcaseJsxChild) {
  if (child === null || child === undefined || typeof child === "boolean") {
    return false;
  }

  if (typeof child === "string") {
    return child.trim().length > 0;
  }

  return typeof child === "number";
}

function serializePropsForMarkup(props: Record<string, unknown>) {
  return Object.entries(props)
    .flatMap(([key, value]) => serializeAttributeForMarkup(key, value))
    .join("");
}

function serializeAttributeForMarkup(key: string, value: unknown): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  const normalizedKey = key.trim();
  if (!normalizedKey) {
    return [];
  }

  if (typeof value === "boolean") {
    const lowerKey = normalizedKey.toLowerCase();
    if (HTML_BOOLEAN_ATTRIBUTES.has(lowerKey)) {
      return value ? [` ${normalizedKey}`] : [];
    }

    return [` ${normalizedKey}="${value}"`];
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return [` ${normalizedKey}="${value}"`];
  }

  if (typeof value === "string") {
    return [` ${normalizedKey}="${escapeHtmlAttribute(value)}"`];
  }

  if (normalizedKey === "class" && value instanceof Array) {
    const classList = value
      .filter(
        (entry): entry is string | number =>
          typeof entry === "string" || typeof entry === "number",
      )
      .map((entry) => String(entry).trim())
      .filter(Boolean)
      .join(" ");

    return classList ?
        [` ${normalizedKey}="${escapeHtmlAttribute(classList)}"`]
      : [];
  }

  return [];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlAttribute(value: string) {
  return escapeHtml(value).replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

const VOID_HTML_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const HTML_BOOLEAN_ATTRIBUTES = new Set([
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected",
]);
