import type * as React from "react";
import type { Fragment } from "./jsx-runtime.ts";

export type ShowcaseJsxPrimitive = string | number | boolean | null | undefined;

export type ShowcaseJsxChild =
  | ShowcaseJsxNode
  | ShowcaseJsxPrimitive
  | ShowcaseJsxChild[];

export type ShowcaseJsxFunctionComponent<Props = {}> = (
  props: Props,
) => ShowcaseJsxNode | ShowcaseJsxPrimitive | ShowcaseJsxChild;

export type ShowcaseJsxElementType =
  | keyof React.JSX.IntrinsicElements
  | "ui"
  | "markup"
  | `ui-${string}`
  | `markup-${string}`
  | ShowcaseJsxFunctionComponent<any>
  | typeof Fragment;

export type ShowcaseJsxNode<
  Type extends ShowcaseJsxElementType = ShowcaseJsxElementType,
  Props = Record<string, unknown>,
> = {
  type: Type;
  props: Props & {
    children?: ShowcaseJsxChild;
  };
  key: string | number | null;
};
