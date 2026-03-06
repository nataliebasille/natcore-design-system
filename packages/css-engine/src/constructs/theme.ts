import { css } from "../css/index.ts";
import type { StyleProperties } from "../dsl/public.ts";
import type { Eager } from "../utils/index.ts";

export type ThemeConstruct = {
  $construct: "theme";
  properties: ThemeProperties;
};

export type ThemeProperties = {
  [K in keyof css.ThemeProperties]: StyleProperties[keyof StyleProperties];
};

type CombinedThemes<T extends ThemeProperties[]> = Eager<{
  -readonly [K in keyof T[number]]: T[number][K];
}>;

export function theme<const T extends ThemeProperties[]>(...themes: T) {
  return {
    $construct: "theme",
    properties: Object.assign({}, ...themes) as CombinedThemes<T>,
  } satisfies ThemeConstruct;
}
