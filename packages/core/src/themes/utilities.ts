import { CSSRuleObject } from 'tailwindcss/types/config';
import { colors } from './colors';

export default Object.entries(colors).reduce(
  (props, [key, colorDefinition]) => {
    Object.keys(colorDefinition.shades).forEach((shade) => {
      const bgStyles = {
        backgroundColor: `var(--${key}-${shade})`,
        color: `var(--${key}-contrast-${shade})`,
      };
      const textStyles = {
        color: `var(--${key}-${shade})`,
      };

      props[`.bg-${key}-${shade}`] = bgStyles;
      props[`.text-${key}-${shade}`] = textStyles;
      if (shade === colorDefinition.base) {
        props[`.bg-${key}`] = bgStyles;
        props[`.text-${key}`] = textStyles;
      }
    });

    return props;
  },
  {} as Record<string, CSSRuleObject>
);
