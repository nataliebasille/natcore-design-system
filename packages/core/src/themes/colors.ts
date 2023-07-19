const colors = {
  primary: {
    shades: {
      "50": "#CFD4E9",
      "100": "#B0B0DA",
      "200": "#9C91CA",
      "300": "#8E72BA",
      "400": "#8554A9",
      "500": "#803798",
      "600": "#801A86",
      "700": "#771568",
      "800": "#671147",
      "900": "#570D2C",
      "950": "#470916",
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
  secondary: {
    shades: {
      "50": "#D3F6D9",
      "100": "#B6EECA",
      "200": "#99E7C3",
      "300": "#7EDEC4",
      "400": "#63D5CB",
      "500": "#49BECB",
      "600": "#2F97C1",
      "700": "#2769AB",
      "800": "#1F4195",
      "900": "#19207D",
      "950": "#1E1266",
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
      "50": "#DDE6E8",
      "100": "#C6D2D8",
      "200": "#B0BCC8",
      "300": "#9AA3B8",
      "400": "#8489A7",
      "500": "#716F97",
      "600": "#645986",
      "700": "#604D76",
      "800": "#5A4266",
      "900": "#523655",
      "950": "#452B42",
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
      "50": "#FBF7E5",
      "100": "#F8F8D5",
      "200": "#ECF5C5",
      "300": "#DBF1B5",
      "400": "#C6EDA6",
      "500": "#ACE897",
      "600": "#8FE388",
      "700": "#76C881",
      "800": "#64AD7D",
      "900": "#529175",
      "950": "#417569",
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
    border: "200",
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
) => {
  const { defaultColor } = opts;
  const createVariable = <
    TColor extends Color,
    TVarKey extends VALID_VARIABLE_KEYS,
  >(
    color: TColor,
    variableKey: TVarKey,
  ) => {
    const shade = colors[color][variableKey] satisfies `${number}`;
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
  }, {});
};
