const colors = {
  primary: {
    shades: {
      '50': '#ebeaff',
      '100': '#d9d8ff',
      '200': '#c0baff',
      '300': '#9d90ff',
      '400': '#8564ff',
      '500': '#7840ff',
      '600': '#741fff',
      '700': '#6a14ee',
      '800': '#5414bf',
      '900': '#451a95',
      '950': '#190933',
    },
    contrast: {
      '50': '#000000',
      '100': '#000000',
      '200': '#000000',
      '300': '#ffffff',
      '400': '#ffffff',
      '500': '#ffffff',
      '600': '#ffffff',
      '700': '#ffffff',
      '800': '#ffffff',
      '900': '#ffffff',
      '950': '#ffffff',
    },
    base: '500',
    'base-hover': '600',
    'backgroud-color': '50',
    'backgroud-color-hover': '100',
    active: '700',
    disable: '200',
    border: '200',
  },
  secondary: {
    shades: {
      '50': '#f9f6f8',
      '100': '#f5eef3',
      '200': '#eddde8',
      '300': '#dfc2d6',
      '400': '#cb9bbb',
      '500': '#b87ca3',
      '600': '#a5668b',
      '700': '#894d6f',
      '800': '#72425c',
      '900': '#613a50',
      '950': '#391e2d',
    },
    contrast: {
      '50': '#000000',
      '100': '#000000',
      '200': '#000000',
      '300': '#000000',
      '400': '#000000',
      '500': '#000000',
      '600': '#ffffff',
      '700': '#ffffff',
      '800': '#ffffff',
      '900': '#ffffff',
      '950': '#ffffff',
    },
    base: '500',
    'base-hover': '600',
    'backgroud-color': '50',
    'backgroud-color-hover': '100',
    active: '700',
    disable: '200',
    border: '200',
  },
  tertiary: {
    shades: {
      '50': '#fbf7f5',
      '100': '#f8ede8',
      '200': '#f2ded6',
      '300': '#eccfc3',
      '400': '#daa58f',
      '500': '#c9866a',
      '600': '#b36c4f',
      '700': '#96583f',
      '800': '#7d4b37',
      '900': '#694333',
      '950': '#382117',
    },
    contrast: {
      '50': '#000000',
      '100': '#000000',
      '200': '#000000',
      '300': '#000000',
      '400': '#000000',
      '500': '#000000',
      '600': '#000000',
      '700': '#ffffff',
      '800': '#ffffff',
      '900': '#ffffff',
      '950': '#ffffff',
    },
    base: '500',
    'base-hover': '600',
    'backgroud-color': '50',
    'backgroud-color-hover': '100',
    active: '700',
    disable: '200',
    border: '200',
  },
  accent: {
    shades: {
      '50': '#f3f7f8',
      '100': '#e1eaec',
      '200': '#c5d6dc',
      '300': '#9db9c3',
      '400': '#658e9c',
      '500': '#537a87',
      '600': '#476573',
      '700': '#3f545f',
      '800': '#394851',
      '900': '#333f46',
      '950': '#1e272e',
    },
    contrast: {
      '50': '#000000',
      '100': '#000000',
      '200': '#000000',
      '300': '#000000',
      '400': '#ffffff',
      '500': '#ffffff',
      '600': '#ffffff',
      '700': '#ffffff',
      '800': '#ffffff',
      '900': '#ffffff',
      '950': '#ffffff',
    },
    base: '500',
    'base-hover': '600',
    'backgroud-color': '50',
    'backgroud-color-hover': '100',
    active: '700',
    disable: '200',
    border: '200',
  },
  surface: {
    shades: {
      '50': '#FFFFFF',
      '100': '#FFFFFF',
      '200': '#E1EFFA',
      '300': '#BEDCF5',
      '400': '#9AC9EF',
      '500': '#77B6EA',
      '600': '#469CE2',
      '700': '#2081D1',
      '800': '#1963A0',
      '900': '#11456F',
      '950': '#0D3657',
    },
    contrast: {
      '50': '#000000',
      '100': '#000000',
      '200': '#000000',
      '300': '#000000',
      '400': '#000000',
      '500': '#000000',
      '600': '#000000',
      '700': '#ffffff',
      '800': '#ffffff',
      '900': '#ffffff',
      '950': '#ffffff',
    },
    base: '500',
    'base-hover': '600',
    'backgroud-color': '50',
    'backgroud-color-hover': '200',
    active: '700',
    disable: '200',
    border: '200',
  },
} as const;

const COLOR_KEYS = Object.keys(colors) as (keyof typeof colors)[];
type Color = (typeof COLOR_KEYS)[number];
type VALID_VARIABLE_KEYS = Exclude<
  keyof (typeof colors)[keyof typeof colors],
  'shades' | 'contrast'
>;

export { colors };
export const createVariants = <Id extends string>(
  identifier: Id,
  opts: { defaultColor: Color } = { defaultColor: 'primary' }
) => {
  const { defaultColor } = opts;
  const createVariable = <
    TColor extends Color,
    TVarKey extends VALID_VARIABLE_KEYS
  >(
    // :TODO: find out why indent isn't working
    // eslint-disable-next-line indent
    color: TColor,
    // eslint-disable-next-line indent
    variableKey: TVarKey
    // eslint-disable-next-line indent
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
      ...createVariable(color, 'base'),
      ...createVariable(color, 'base-hover'),
      ...createVariable(color, 'backgroud-color'),
      ...createVariable(color, 'backgroud-color-hover'),
      ...createVariable(color, 'active'),
      ...createVariable(color, 'disable'),
      ...createVariable(color, 'border'),
    };

    return {
      ...acc,
      ...(color === defaultColor
        ? variables
        : { [`&.${className}`]: variables }),
    };
  }, {});
};
