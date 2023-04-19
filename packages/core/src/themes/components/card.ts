import { PluginAPI } from 'tailwindcss/types/config';

export default (theme: PluginAPI['theme']) => ({
  '.card': {
    backgroundColor: theme('colors.white')!,
    borderRadius: theme('borderRadius.DEFAULT')!,
    border: `1px solid ${theme('colors.gray.400')!}`,
    padding: theme('spacing.4')!,
  },
});
