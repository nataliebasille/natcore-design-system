import type { ShowcaseJsxElementType, ShowcaseJsxNode } from "./types.ts";
import { Fragment } from "./jsx-runtime.ts";

export { Fragment };

export type ShowcaseJsxDevSource = {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
};

export function jsxDEV<
  Type extends ShowcaseJsxElementType,
  Props extends Record<string, unknown>,
>(
  type: Type,
  props: Props,
  key?: string | number,
  _isStaticChildren?: boolean,
  source?: ShowcaseJsxDevSource,
  _self?: unknown,
): ShowcaseJsxNode<
  Type,
  Props & {
    __source?: ShowcaseJsxDevSource;
  }
> {
  return {
    type,
    props:
      source ?
        ({
          ...props,
          __source: source,
        } as Props & { __source?: ShowcaseJsxDevSource })
      : (props as Props & { __source?: ShowcaseJsxDevSource }),
    key: key ?? null,
  };
}
