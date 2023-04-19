import { PluginAPI } from 'tailwindcss/types/config';
import button from './button';
import card from './card';
import drawer from './drawer';
import list from './list';

export default (theme: PluginAPI['theme']) => {
  return {
    ...button(theme),
    ...card(theme),
    ...drawer(theme),
    ...list(theme),
  } as const;
};
