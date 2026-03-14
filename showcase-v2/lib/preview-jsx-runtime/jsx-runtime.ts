import { type JSX as ReactJSX } from "react";
import type { ShowcaseJsxElementType, ShowcaseJsxNode } from "./types";

type ScopedAttributes = Record<string, unknown>;

type ScopeBag = {
  ui?: ScopedAttributes;
  markup?: ScopedAttributes;
};

type AddChildren<T> = Omit<T, "children"> & {
  children?:
    | ShowcaseJsxNode
    | string
    | number
    | boolean
    | null
    | undefined
    | Array<ShowcaseJsxNode | string | number | boolean | null | undefined>;
};

type FrameworkExtras<T = {}> = T & {
  [K in keyof T as `ui:${string & K}`]?: T[K];
} & {
  [K in keyof T as `markup:${string & K}`]?: T[K];
};

type IntrinsicAttributesExtras = {
  key?: string | number;
};

type IntrinsicElementsWithChildren = {
  [K in keyof ReactJSX.IntrinsicElements]: AddChildren<
    FrameworkExtras<ReactJSX.IntrinsicElements[K]>
  >;
} & {
  ui: AddChildren<{}>;
  markup: AddChildren<{}>;
};

function createNode<
  Type extends ShowcaseJsxElementType,
  Props extends Record<string, unknown>,
>(
  type: Type,
  props: Props | null | undefined,
  key?: string | number,
): ShowcaseJsxNode<Type, Props> {
  return {
    type,
    props: (props ?? {}) as Props,
    key: key ?? null,
  };
}

export function jsx<
  Type extends ShowcaseJsxElementType,
  Props extends Record<string, unknown>,
>(
  type: Type,
  props: Props,
  key?: string | number,
): ShowcaseJsxNode<Type, Props> {
  return createNode(type, props, key);
}

export const jsxs = jsx;

export function jsxDEV<
  Type extends ShowcaseJsxElementType,
  Props extends Record<string, unknown>,
>(
  type: Type,
  props: Props,
  key?: string | number,
): ShowcaseJsxNode<Type, Props> {
  return createNode(type, props, key);
}

export const Fragment = Symbol.for("my-jsx.fragment");

export function scopeAttr(
  ui?: ScopedAttributes,
  markup?: ScopedAttributes,
): ScopedAttributes;
export function scopeAttr(bag?: ScopeBag): ScopedAttributes;
export function scopeAttr(
  first?: ScopedAttributes | ScopeBag,
  second?: ScopedAttributes,
): ScopedAttributes {
  const ui = isScopeBag(first) ? first.ui : first;
  const markup = isScopeBag(first) ? first.markup : second;

  return {
    ...toScopedAttributes("ui", ui),
    ...toScopedAttributes("markup", markup),
  };
}

export function uiAttr(attrs: ScopedAttributes): ScopedAttributes {
  return toScopedAttributes("ui", attrs);
}

export function markupAttr(attrs: ScopedAttributes): ScopedAttributes {
  return toScopedAttributes("markup", attrs);
}

function isScopeBag(value: unknown): value is ScopeBag {
  return (
    typeof value === "object" &&
    value !== null &&
    ("ui" in value || "markup" in value)
  );
}

function toScopedAttributes(
  scopeType: "ui" | "markup",
  attrs?: ScopedAttributes,
): ScopedAttributes {
  if (!attrs) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(attrs).map(([key, value]) => [`${scopeType}:${key}`, value]),
  );
}

export namespace JSX {
  export type Element = ShowcaseJsxNode;

  export interface ElementChildrenAttribute {
    children: {};
  }

  export interface IntrinsicAttributes extends IntrinsicAttributesExtras {}

  export interface IntrinsicElements extends IntrinsicElementsWithChildren {}

  export type LibraryManagedAttributes<C, P> = AddChildren<P>;
}
