import { css } from "../css/index.ts";
import type { StyleProperties } from "../dsl/public.ts";
import type { Eager } from "../utils/index.ts";

export type ThemeMode = "static" | "inline" | "root";

export type ThemeConstruct = {
  $construct: "theme";
  mode?: ThemeMode;
  properties: ThemeProperties;
};

export type ThemeProperties = {
  [K in keyof css.ThemeProperties]: StyleProperties[keyof StyleProperties];
};

type CombinedThemes<T extends ThemeProperties[]> = Eager<{
  -readonly [K in keyof T[number]]: T[number][K];
}>;

export function theme<M extends ThemeMode, const P extends ThemeProperties>(
  mode: M,
  properties: P,
): ThemeConstruct & { mode: M; properties: P };
export function theme<const T extends ThemeProperties[]>(
  ...themes: T
): ThemeConstruct & { mode?: never; properties: CombinedThemes<T> };

export function theme(
  first: ThemeMode | ThemeProperties,
  ...rest: ThemeProperties[]
): ThemeConstruct {
  return {
    $construct: "theme",
    ...(typeof first === "string" ? { mode: first } : {}),
    properties: Object.assign(
      {},
      typeof first === "object" ? first : {},
      ...rest,
    ),
  } satisfies ThemeConstruct;
}
