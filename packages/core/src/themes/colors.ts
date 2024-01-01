// secondary | #CC3363

// tertiary | #9AD1D4

// success | #62C370
// "50": '#e7f6ea',
// "100":'#e0f3e2',
// "200":'#d8f0db',
// "300":'#c0e7c6',
// "400":'#91d59b',
// "500":'#62C370',
// "600":'#58b065',
// "700":'#4a9254',
// "800":'#3b7543',
// "900":'#306037',
// warning | #EAB308
// "50": '#fcf4da',
// "100":'#fbf0ce',
// "200":'#faecc1',
// "300":'#f7e19c',
// "400":'#f0ca52',
// "500":'#EAB308',
// "600":'#d3a107',
// "700":'#b08606',
// "800":'#8c6b05',
// "900":'#735804',
// error | #ff3333
// "50": '#ffe0e0',
// "100":'#ffd6d6',
// "200":'#ffcccc',
// "300":'#ffadad',
// "400":'#ff7070',
// "500":'#ff3333',
// "600":'#e62e2e',
// "700":'#bf2626',
// "800":'#991f1f',
// "900":'#7d1919',
// surface | #C2F9BB

const colors = {
  primary: {
    shades: {
      "50": "#dedae2",
      "100": "#d2cdd8",
      "200": "#c7c1ce",
      "300": "#a69bb1",
      "400": "#635176",
      "500": "#20063B",
      "600": "#1d0535",
      "700": "#18052c",
      "800": "#130423",
      "900": "#10031d",
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
      "50": "#f7e0e8",
      "100": "#f5d6e0",
      "200": "#f2ccd8",
      "300": "#ebadc1",
      "400": "#db7092",
      "500": "#CC3363",
      "600": "#b82e59",
      "700": "#99264a",
      "800": "#7a1f3b",
      "900": "#641931",
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
      "50": "#f0f8f9",
      "100": "#ebf6f6",
      "200": "#e6f4f4",
      "300": "#d7edee",
      "400": "#b8dfe1",
      "500": "#9AD1D4",
      "600": "#8bbcbf",
      "700": "#749d9f",
      "800": "#5c7d7f",
      "900": "#4b6668",
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
      "50": "#f6fef5",
      "100": "#f3fef1",
      "200": "#f0feee",
      "300": "#e7fde4",
      "400": "#d4fbcf",
      "500": "#C2F9BB",
      "600": "#afe0a8",
      "700": "#92bb8c",
      "800": "#749570",
      "900": "#5f7a5c",
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
    base: "700",
    "base-hover": "700",
    "background-color": "50",
    "background-color-hover": "200",
    active: "700",
    disable: "200",
    border: "700",
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
