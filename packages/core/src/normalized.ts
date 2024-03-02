import {
  shades,
  type NormalizedColorSchema,
  VARIABLES_TO_SHADES,
  lighten,
  darken,
  getContrastingTextColor,
} from "./utils";
import { colors as colorSchema } from "./themes/colors";

export const normalizedColorSchema: NormalizedColorSchema = Object.entries(
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
}, {} as any);
