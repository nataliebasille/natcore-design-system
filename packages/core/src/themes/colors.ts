import { type ColorSchema, toRgb, VARIABLES_TO_SHADES } from "../utils";

const colors: ColorSchema = {
  primary: toRgb("#230288"),
  secondary: toRgb("#f44efd"),
  accent: toRgb("#b88eae"),
  surface: {
    color: toRgb("#ebe0ff"),
    shade: 200,
  },
};

const COLOR_KEYS = Object.keys(colors) as (keyof typeof colors)[];
type Color = (typeof COLOR_KEYS)[number];
type VALID_VARIABLE_KEYS = keyof typeof VARIABLES_TO_SHADES;

export { colors };

export const createVariants = <Id extends string>(
  identifier: Id,
  opts: { defaultColor: Color } = {
    defaultColor: Object.keys(colors)[0] as Color,
  },
): {
  [key in (typeof COLOR_KEYS)[number] as `&.${Id}-${key}`]: any;
} & ((
  variable: VALID_VARIABLE_KEYS | `${VALID_VARIABLE_KEYS}-text`,
  opacity?: number,
) => string) => {
  const { defaultColor } = opts;
  const createVariable = <
    TColor extends Color,
    TVarKey extends VALID_VARIABLE_KEYS,
  >(
    color: TColor,
    variableKey: TVarKey,
  ) => {
    const shade = VARIABLES_TO_SHADES[variableKey];

    return {
      [`--${identifier}-${variableKey}`]: `var(--${color}-${shade})`,
      [`--${identifier}-${variableKey}-text`]: `var(--${color}-text-${shade})`,
    } as const;
  };

  const generateCss = (
    variable: VALID_VARIABLE_KEYS | `${VALID_VARIABLE_KEYS}-text`,
    opacity?: number,
  ) => {
    return opacity
      ? `rgb(var(--${identifier}-${variable}) / ${opacity})`
      : `rgb(var(--${identifier}-${variable}))`;
  };

  return COLOR_KEYS.reduce((acc, color) => {
    const className = `${identifier}-${color}`;

    const variables = {
      ...createVariable(color, "base"),
      ...createVariable(color, "base-hover"),
      ...createVariable(color, "background-color"),
      ...createVariable(color, "background-color-hover"),
      ...createVariable(color, "active"),
      ...createVariable(color, "disable"),
      ...createVariable(color, "border"),
    };

    if (color === defaultColor) {
      Object.entries(variables).forEach(([key, value]) => {
        acc[key] = value;
      });
    } else {
      acc[`&.${className}`] = variables;
    }

    return acc;
  }, generateCss as any) as any;
};
