import plugin from "tailwindcss/plugin";
import base from "./themes/base";
import components from "./themes/components";
import { normalizedColorSchema } from "./normalized";

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

export default plugin(
  ({ theme, addBase, addComponents }) => {
    addBase(base(theme));
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
