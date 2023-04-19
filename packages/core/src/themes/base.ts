import { PluginAPI } from 'tailwindcss/types/config';
import colors from './colors';

export default (theme: PluginAPI['theme']) =>
  ({
    ':root': Object.entries(colors).reduce((props, [vari, color]) => {
      if (typeof color === 'object') {
        Object.entries(color).forEach(([shade, value]) => {
          props[`--${vari}-${shade}`] = value;

          if (shade === '500') props[`--${vari}`] = value;
        });

        return props;
      }

      props[`--${vari}`] = color;

      return props;
    }, {} as Record<string, string>),

    body: {
      backgroundColor: theme('colors.gray.100')!,
    },
  } as const);
