import type { css } from "../../css";
import type {
  ExtendsNever,
  ReplaceType,
  SelectWherePropOrArrayElementIs,
} from "../../utils";
import type {
  ApplyValue,
  ColorAst,
  ComponentAst,
  CssValueAst,
  CssVarAst,
  DesignSystemAst,
  Selector,
  StyleList,
  StyleProperties,
  StyleRuleAst,
  ThemeAst,
  ThemeProperties,
} from "../ast";

export type ParentVisitorNode<N, T> =
  | (N extends T ? undefined : never)
  | (ExtendsNever<SelectWherePropOrArrayElementIs<T, N>> extends true ?
      undefined
    : SelectWherePropOrArrayElementIs<T, N>);

type VisitorFunction<R, N, P> = (node: N, parent: P) => void | R;

type VisitorEventFunctions<R, N, P> = {
  enter?: VisitorFunction<R, N, P>;
  exit?: VisitorFunction<R, R, P>;
};

type VisitorHandler<T, R, N = R, P = ParentVisitorNode<N, T>> =
  | VisitorFunction<R, N, P>
  | VisitorEventFunctions<R, N, P>;

export type VisitorObject<T> = {
  apply?: VisitorHandler<T, ApplyValue[] | StyleProperties, ApplyValue[]>;
  color?: VisitorHandler<T, ColorAst | string, ColorAst>;
  component?: VisitorHandler<T, ComponentAst>;
  "css-value"?: VisitorHandler<T, CssValueAst | string, CssValueAst>;
  "css-var"?: VisitorHandler<T, CssVarAst | string, CssVarAst>;
  selector?: VisitorHandler<T, Selector>;
  "style-rule"?: VisitorHandler<
    T,
    StyleRuleAst,
    StyleRuleAst,
    ParentVisitorNode<StyleRuleAst, T> | StyleProperties
  >;
  styles?:
    | VisitorFunction<StyleList, StyleList, ParentVisitorNode<StyleList, T>>
    | ({
        [K in keyof StyleList]?: VisitorFunction<
          StyleList[K] | StyleList,
          StyleList[K],
          StyleList
        >;
      } & VisitorEventFunctions<
        StyleList,
        StyleList,
        ParentVisitorNode<StyleList, T>
      >);
  theme?:
    | VisitorFunction<ThemeAst, ThemeAst, ParentVisitorNode<ThemeAst, T>>
    | {
        [K: css.ThemeProperty]: VisitorFunction<
          T,
          ThemeProperties[keyof ThemeProperties],
          ThemeProperties
        >;
      };
};

type Eager<T> =
  T extends Array<any> ? Eager<T[number]>[]
  : T extends object ? { [K in keyof T]: Eager<T[K]> }
  : T;

type GetChanges<T extends DesignSystemAst, V extends VisitorObject<T>> = {
  [K in keyof V]: V[K] extends (node: infer N, ...args: any[]) => infer R ?
    [N, R]
  : V[K] extends (
    {
      enter?: (node: infer N, ...args: any[]) => infer R1;
      exit?: (node: infer N2, ...args: any[]) => infer R2;
    }
  ) ?
    ExtendsNever<Exclude<R1, void>> extends true ?
      ExtendsNever<Exclude<R2, void>> extends true ?
        never
      : [N2, R2]
    : [N, R1]
  : never;
}[keyof V];

type ApplyAstChanges<
  T extends DesignSystemAst,
  V extends VisitorObject<T>,
> = Eager<
  GetChanges<T, V> extends [infer From, infer To] ?
    T extends DesignSystemAst ?
      ReplaceType<T, From, To>
    : T
  : T
>;
