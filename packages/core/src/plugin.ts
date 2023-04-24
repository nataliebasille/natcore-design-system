import plugin from 'tailwindcss/plugin';
import base from './themes/base';
import utilities from './themes/utilities';
import components from './themes/components';
import colors from './themes/colors';

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
  }
);
