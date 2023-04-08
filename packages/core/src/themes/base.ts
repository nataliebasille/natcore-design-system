import { main } from './colorSchemes';

export default {
  ':root': Object.entries(main).reduce((props, [vari, color]) => {
    props[`--${vari}`] = color;

    return props;
  }, {}),
} as const;
