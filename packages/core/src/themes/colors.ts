const colors = {
  primary: {
    shades: {
      "50": [222, 218, 226],
      "100": [210, 205, 216],
      "200": [199, 193, 206],
      "300": [166, 155, 177],
      "400": [99, 81, 118],
      "500": [32, 6, 59],
      "600": [29, 5, 53],
      "700": [24, 5, 44],
      "800": [19, 4, 35],
      "900": [16, 3, 29],
    },
    base: "500",
    "base-hover": "900",
    "background-color": "50",
    "background-color-hover": "100",
    active: "800",
    disable: "200",
    border: "200",
  },
  secondary: {
    shades: {
      "50": [247, 224, 232],
      "100": [245, 214, 224],
      "200": [242, 204, 216],
      "300": [235, 173, 193],
      "400": [219, 112, 146],
      "500": [204, 51, 99],
      "600": [184, 46, 89],
      "700": [153, 38, 74],
      "800": [122, 31, 59],
      "900": [100, 25, 49],
    },
    base: "500",
    "base-hover": "700",
    "background-color": "50",
    "background-color-hover": "100",
    active: "700",
    disable: "200",
    border: "200",
  },
  tertiary: {
    shades: {
      "50": [240, 248, 249],
      "100": [235, 246, 246],
      "200": [230, 244, 244],
      "300": [215, 237, 238],
      "400": [184, 223, 225],
      "500": [154, 209, 212],
      "600": [139, 188, 191],
      "700": [116, 157, 159],
      "800": [92, 125, 127],
      "900": [75, 102, 104],
    },
    base: "500",
    "base-hover": "700",
    "background-color": "50",
    "background-color-hover": "100",
    active: "700",
    disable: "200",
    border: "500",
  },
  surface: {
    shades: {
      "50": [246, 254, 245],
      "100": [243, 254, 241],
      "200": [240, 254, 238],
      "300": [231, 253, 228],
      "400": [212, 251, 207],
      "500": [194, 249, 187],
      "600": [175, 224, 168],
      "700": [146, 187, 140],
      "800": [116, 149, 112],
      "900": [95, 122, 92],
    },
    base: "700",
    "base-hover": "800",
    "background-color": "50",
    "background-color-hover": "200",
    active: "800",
    disable: "200",
    border: "700",
  },
} as const;

const COLOR_KEYS = Object.keys(colors) as (keyof typeof colors)[];
type Color = (typeof COLOR_KEYS)[number];
type VALID_VARIABLE_KEYS = Exclude<
  keyof (typeof colors)[keyof typeof colors],
  "shades"
>;

export { colors };
export const createVariants = <Id extends string>(
  identifier: Id,
  opts: { defaultColor: Color } = { defaultColor: "primary" },
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
    const shade = colors[color][variableKey] as `${number}`;

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
