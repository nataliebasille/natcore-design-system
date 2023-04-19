import colors from './colors';

export default {
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
} as const;
