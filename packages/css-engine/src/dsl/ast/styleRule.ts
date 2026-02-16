/**
 * DSL Rule - CSS rule with selector and body
 */

import type { AstNode } from "../visitor/visitor-builder.types";
import type { css } from "../../css";
import type { CssValue, CssValueAst } from "./cssvalue";
import type { Selector } from "./selector";

export type ApplyValue<VarKeys extends string = string> =
  | CssValueAst<VarKeys>
  | string;

export type StyleList<VarKeys extends string = string> = {
  [K in keyof css.StyleProperties]?:
    | css.StyleProperties[K]
    | CssValue<VarKeys | (string & {})>;
};

export type StyleProperties<VarKeys extends string = string> =
  StyleList<VarKeys> & {
    "@apply"?: ApplyValue<VarKeys>[];
    $?: Record<string, StyleProperties<VarKeys>>;
  };

export type ExtractVarKeys<S> = Extract<keyof S, `--${string}`>;

export type StyleRuleAst<
  S extends Selector = Selector,
  B extends StyleProperties<any> = StyleProperties,
> = AstNode<
  "style-rule",
  {
    selector: S;
    body: B;
  }
>;

/**
 * DSL function to create a rule with type-safe selector and body
 */
export function styleRule<S extends Selector, B extends StyleProperties<any>>(
  selector: S,
  body: B,
) {
  return {
    $ast: "style-rule",
    selector,
    body,
  } satisfies StyleRuleAst<S, B>;
}

export function style<
  VarKeys extends string = string,
  P extends keyof StyleProperties<VarKeys> = keyof StyleProperties<VarKeys>,
  V extends StyleProperties<VarKeys>[P] = StyleProperties<VarKeys>[P],
>(property: P, value: V): { [K in P]: V } & StyleProperties<VarKeys> {
  return {
    [property]: value,
  } as { [K in P]: V };
}
