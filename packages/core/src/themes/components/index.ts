import { PluginAPI } from 'tailwindcss/types/config';
import button from './button';

export default (theme: PluginAPI['theme']) => {
  return {
    ...button(theme),
  } as const;
};
