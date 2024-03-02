import { type CSSRuleObject } from "tailwindcss/types/config";
import { normalizedColorSchema } from "../normalized";

export default Object.entries(normalizedColorSchema).reduce(
  (props, [key, colorDefinition]) => {
    Object.keys(colorDefinition).forEach((shade) => {
      const bgStyles = {
        backgroundColor: `rgb(var(--${key}-${shade}))`,
        color: `rgb(var(--${key}-text-${shade}))`,
      };
      const textStyles = {
        color: `rgb(var(--${key}-${shade}))`,
      };

      props[`.bg-${key}-${shade}`] = bgStyles;
      props[`.text-${key}-${shade}`] = textStyles;
    });

    return props;
  },
  {} as Record<string, CSSRuleObject>,
);
