import plugin from 'tailwindcss/plugin';
import base from './base';
import utilities from './utilities';
import components from './components';
export default plugin(({ theme, addBase, addUtilities, addComponents }) => {
  addBase(base);
  addUtilities(utilities);
  addComponents(components(theme));
});
