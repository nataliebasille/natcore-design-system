import plugin from "tailwindcss/plugin";
import base from "./themes/base";
import utilities from "./themes/utilities";
import components from "./themes/components";
import { colors as colorSchema } from "./themes/colors";
import { toHex } from "./utils";

const colors = Object.entries(colorSchema).reduce(
  (props, [key, colorDefinition]) => {
    props[key] = {};
    Object.entries(colorDefinition.shades).forEach(([shade, color]) => {
      props[key][shade] = toHex(color);
    });

    Object.entries(colorDefinition).forEach(([prop, colorValue]) => {
      if (prop === "shades") return;

      props[key][prop] = props[key][colorValue];
    });

    return props;
  },
  {} as any,
);

export default plugin(
  ({ theme, addBase, addUtilities, addComponents }) => {
    addBase(base(theme));
    addUtilities(utilities);
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
