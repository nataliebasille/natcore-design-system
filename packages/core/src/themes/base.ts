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

    h1: {
      fontSize: theme('fontSize.4xl')!,
      letterSpacing: theme('letterSpacing.wide')!,
      lineHeight: theme('lineHeight.tight')!,
    },
    h2: {
      fontSize: theme('fontSize.3xl')!,
      letterSpacing: theme('letterSpacing.wide')!,
      lineHeight: theme('lineHeight.tight')!,
    },
    h3: {
      fontSize: theme('fontSize.xl')!,
      letterSpacing: theme('letterSpacing.wide')!,
      lineHeight: theme('lineHeight.tight')!,
    },
    h4: {
      fontSize: theme('fontSize.lg')!,
      letterSpacing: theme('letterSpacing.wide')!,
      lineHeight: theme('lineHeight.tight')!,
    },
    h5: {
      fontSize: theme('fontSize.base')!,
      letterSpacing: theme('letterSpacing.wide')!,
      lineHeight: theme('lineHeight.tight')!,
    },
    h6: {
      fontSize: theme('fontSize.sm')!,
      letterSpacing: theme('letterSpacing.wide')!,
      lineHeight: theme('lineHeight.tight')!,
    },

    article: {
      p: {
        margin: `${theme('spacing.4')} 0`!,
        lineHeight: theme('lineHeight.relaxed')!,
      },
    },
  } as const);
