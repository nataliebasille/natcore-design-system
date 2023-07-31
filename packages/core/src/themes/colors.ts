const colors = {
  primary: {
    shades: {
      "50": "#ebdeee",
      "100": "#e5d3e8",
      "200": "#dec8e2",
      "300": "#cba7d1",
      "400": "#a365af",
      "500": "#7C238C",
      "600": "#70207e",
      "700": "#5d1a69",
      "800": "#4a1554",
      "900": "#3d1145",
    },
    contrast: {
      "50": "#000000",
      "100": "#000000",
      "200": "#000000",
      "300": "#000000",
      "400": "#ffffff",
      "500": "#ffffff",
      "600": "#ffffff",
      "700": "#ffffff",
      "800": "#ffffff",
      "900": "#ffffff",
    },
    base: "500",
    "base-hover": "700",
    "background-color": "50",
    "background-color-hover": "100",
    active: "700",
    disable: "200",
    border: "200",
  },
  secondary: {
    shades: {
      "50": "#fee9ee",
      "100": "#fde2e8",
      "200": "#fddbe3",
      "300": "#fcc5d2",
      "400": "#f99ab0",
      "500": "#F76F8E",
      "600": "#de6480",
      "700": "#b9536b",
      "800": "#944355",
      "900": "#793646",
    },
    contrast: {
      "50": "#000000",
      "100": "#000000",
      "200": "#000000",
      "300": "#000000",
      "400": "#000000",
      "500": "#000000",
      "600": "#000000",
      "700": "#ffffff",
      "800": "#ffffff",
      "900": "#ffffff",
      "950": "#ffffff",
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
      "50": "#e6f9f5",
      "100": "#ddf7f2",
      "200": "#d5f5ef",
      "300": "#bbefe5",
      "400": "#88e2d2",
      "500": "#55D6BE",
      "600": "#4dc1ab",
      "700": "#40a18f",
      "800": "#338072",
      "900": "#2a695d",
    },
    contrast: {
      "50": "#000000",
      "100": "#000000",
      "200": "#000000",
      "300": "#000000",
      "400": "#000000",
      "500": "#ffffff",
      "600": "#ffffff",
      "700": "#ffffff",
      "800": "#ffffff",
      "900": "#ffffff",
      "950": "#ffffff",
    },
    base: "500",
    "base-hover": "700",
    "background-color": "50",
    "background-color-hover": "100",
    active: "700",
    disable: "200",
    border: "200",
  },
  accent: {
    shades: {
      "50": "#f3f7f8",
      "100": "#e1eaec",
      "200": "#c5d6dc",
      "300": "#9db9c3",
      "400": "#658e9c",
      "500": "#537a87",
      "600": "#476573",
      "700": "#3f545f",
      "800": "#394851",
      "900": "#333f46",
      "950": "#1e272e",
    },
    contrast: {
      "50": "#000000",
      "100": "#000000",
      "200": "#000000",
      "300": "#000000",
      "400": "#000000",
      "500": "#ffffff",
      "600": "#ffffff",
      "700": "#ffffff",
      "800": "#ffffff",
      "900": "#ffffff",
      "950": "#ffffff",
    },
    base: "500",
    "base-hover": "700",
    "background-color": "50",
    "background-color-hover": "100",
    active: "700",
    disable: "200",
    border: "200",
  },
  surface: {
    shades: {
      "50": "#ddecf6",
      "100": "#d1e6f3",
      "200": "#c6e0f0",
      "300": "#a3cde7",
      "400": "#5ea8d6",
      "500": "#1982C4",
      "600": "#1775b0",
      "700": "#136293",
      "800": "#0f4e76",
      "900": "#0c4060",
    },
    contrast: {
      "50": "#000000",
      "100": "#000000",
      "200": "#000000",
      "300": "#000000",
      "400": "#000000",
      "500": "#000000",
      "600": "#000000",
      "700": "#000000",
      "800": "#000000",
      "900": "#000000",
      "950": "#ffffff",
    },
    base: "500",
    "base-hover": "700",
    "background-color": "50",
    "background-color-hover": "200",
    active: "700",
    disable: "200",
    border: "500",
  },
} as const;

const COLOR_KEYS = Object.keys(colors) as (keyof typeof colors)[];
type Color = (typeof COLOR_KEYS)[number];
type VALID_VARIABLE_KEYS = Exclude<
  keyof (typeof colors)[keyof typeof colors],
  "shades" | "contrast"
>;

export { colors };
export const createVariants = <Id extends string>(
  identifier: Id,
  opts: { defaultColor: Color } = { defaultColor: "primary" },
): {
  [key in (typeof COLOR_KEYS)[number] as `&.${Id}-${key}`]: any;
} => {
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
      [`--${identifier}-${variableKey}-contrast`]: `var(--${color}-contrast-${shade})`,
    } as const;
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

    return {
      ...acc,
      ...(color === defaultColor
        ? variables
        : { [`&.${className}`]: variables }),
    };
  }, {}) as any;
};
