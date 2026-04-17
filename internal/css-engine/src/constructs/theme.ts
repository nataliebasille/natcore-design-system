import { css } from "../css/index.ts";
import type { StylePropertyValue } from "../dsl/public.ts";
import type { Eager } from "../utils/index.ts";

export type ThemeMode = "static" | "inline" | "root";

export type ThemeConstruct<
  M extends ThemeMode | undefined = ThemeMode | undefined,
  P extends ThemeProperties | undefined = ThemeProperties,
> = {
  $construct: "theme";
  mode?: M;
  properties: P;
};

export type ThemeProperties = {
  [K in keyof css.ThemeProperties]: StylePropertyValue | StylePropertyValue[];
};

type CombinedThemes<T extends ThemeProperties[]> = Eager<{
  -readonly [K in keyof T[number]]: T[number][K];
}>;

export function theme<M extends ThemeMode, const P extends ThemeProperties>(
  mode: M,
  properties: P,
): ThemeConstruct<M, P>;
export function theme<const T extends ThemeProperties[]>(
  ...themes: T
): ThemeConstruct<never, CombinedThemes<T>>;

export function theme(
  first: ThemeMode | ThemeProperties,
  ...rest: ThemeProperties[]
) {
  return {
    $construct: "theme",
    ...(typeof first === "string" ? { mode: first } : {}),
    properties: Object.assign(
      {},
      typeof first === "object" ? first : {},
      ...rest,
    ),
  } as ThemeConstruct<any, any>;
}
