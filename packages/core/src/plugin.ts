import plugin from "tailwindcss/plugin";
import base from "./themes/base";
import components from "./themes/components";
import {
  type NormalizedColorSchema,
  type ColorSchema,
  shades,
  darken,
  lighten,
  getContrastingTextColor,
  VARIABLES_TO_SHADES,
} from "./utils";
import { colors as natcoreColors } from "./themes/colors";

export default function (
  colorSchema: ColorSchema = natcoreColors,
): ReturnType<typeof plugin> {
  const normalizedColorSchema: NormalizedColorSchema = Object.entries(
    colorSchema,
  ).reduce((props, [key, colorDefinition]) => {
    colorDefinition =
      colorDefinition && colorDefinition instanceof Array
        ? { color: colorDefinition, shade: 500 }
        : colorDefinition;

    const { color: baseColor, shade: baseShade } = colorDefinition;
    const shadeColors = shades.map((s) => {
      const factor = Math.abs(s - baseShade) / 1000;

      return s === baseShade
        ? baseColor
        : s > baseShade
        ? darken(baseColor, factor)
        : lighten(baseColor, factor);
    });

    props[key] = {
      contrast: {},
    };

    shadeColors.forEach((color, index) => {
      props[key][shades[index]] = color;
      props[key].contrast[shades[index]] = getContrastingTextColor(color);
    });

    Object.entries(VARIABLES_TO_SHADES).forEach(([prop, shade]) => {
      props[key][prop] = props[key][shade];
      props[key].contrast[prop] = props[key].contrast[shade];
    });

    return props;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as any);

  const colors = Object.fromEntries(
    Object.entries(normalizedColorSchema).map(([key, value]) => [
      key,
      Object.fromEntries([
        ...Object.entries(value).map(([shade]) => [
          shade,
          `rgb(var(--${key}-${shade}))`,
        ]),
        [
          "contrast",
          Object.fromEntries(
            Object.entries(value).map(([shade]) => [
              shade,
              `rgb(var(--${key}-text-${shade}))`,
            ]),
          ),
        ],
      ]),
    ]),
  );

  return plugin(
    ({ theme, addBase, addComponents }) => {
      addBase(base(theme, normalizedColorSchema));
      //addUtilities(utilities);
      addComponents(components(theme));
    },
    {
      theme: {
        extend: {
          colors,
        },
      },
    },
  );
}
// export default plugin.withOptions<ColorSchema>(
//   function () {
//     return;
//   },
//   function (colorSchema) {
//

//     return;
//   },
// );
