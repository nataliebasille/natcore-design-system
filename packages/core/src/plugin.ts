import plugin from "tailwindcss/plugin";
import base from "./themes/base.ts";
import components from "./themes/components/index.ts";
import {
  type NormalizedColorSchema,
  type ColorSchema,
  shades,
  darken,
  lighten,
  getContrastingTextColor,
  VARIABLES_TO_SHADES,
  type NormalizedThemePalette,
} from "./utils.ts";
import { colors as natcoreColors } from "./themes/colors.ts";

export default function (
  colorScheme: ColorSchema = natcoreColors,
): ReturnType<typeof plugin> {
  const normalizedColorSchema: NormalizedColorSchema<typeof colorScheme> =
    Object.entries(colorScheme).reduce(
      (schema, [key, colorDefinition]) => {
        colorDefinition =
          colorDefinition && colorDefinition instanceof Array
            ? { color: colorDefinition, shade: 500 }
            : colorDefinition;

        const {
          color: baseColor,
          shade: baseShade,
          variables: customVariables = {},
        } = colorDefinition;
        const shadeColors = shades.map((s) => {
          const factor = Math.abs(s - baseShade) / 1000;

          return s === baseShade
            ? baseColor
            : s > baseShade
            ? darken(baseColor, factor)
            : lighten(baseColor, factor);
        });

        schema.themes.light.variants[key] = {} as NormalizedThemePalette;

        shadeColors.forEach((color, index) => {
          if (shades[index] && schema.themes.light.variants[key]) {
            schema.themes.light.variants[key][shades[index]] = [
              color,
              getContrastingTextColor(color),
            ];
          }
        });

        Object.entries({
          ...VARIABLES_TO_SHADES,
          ...customVariables,
        }).forEach(([prop, shade]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (schema.themes.light.variables as any)[prop] = shade;
        });

        return schema;
      },
      {
        themes: {
          light: {
            variants: {},
            variables: {},
          },

          dark: {
            variants: {},
            variables: {},
          },
        },
      } as unknown as NormalizedColorSchema<typeof colorScheme>,
    );

  const colors = Object.fromEntries(
    Object.entries(normalizedColorSchema.themes.light.variants).map(
      ([key, palette]) => [
        key,
        Object.fromEntries([
          ...Object.entries(palette).map(([shade]) => [
            shade,
            `rgb(var(--${key}-${shade}))`,
          ]),
          ...Object.entries(normalizedColorSchema.themes.light.variables).map(
            ([variable, shade]) => {
              return [variable, `rgb(var(--${key}-${shade}))`];
            },
          ),
          [
            "contrast",
            Object.fromEntries([
              ...Object.entries(palette).map(([shade]) => [
                shade,
                `rgb(var(--${key}-text-${shade}))`,
              ]),
              ...Object.entries(
                normalizedColorSchema.themes.light.variables,
              ).map(([variable, shade]) => {
                return [variable, `rgb(var(--${key}-text-${shade}))`];
              }),
            ]),
          ],
        ]),
      ],
    ),
  );

  return plugin(
    ({ theme, addBase, addComponents }) => {
      addBase(base(theme, normalizedColorSchema));
      addComponents(components(theme));
    },
    {
      darkMode: ["selector", '[data-theme="dark"]'],
      theme: {
        extend: {
          colors,
        },
      },
    },
  );
}
