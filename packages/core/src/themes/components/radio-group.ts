import { PluginAPI } from 'tailwindcss/types/config';
import { createVariants } from '../colors';

export default (theme: PluginAPI['theme']) => ({
  '.radio-group': {
    display: 'flex',
    gap: theme('spacing.1')!,
    width: 'fit-content',
    padding: theme('spacing.1')!,
    ...createVariants('radio-group', { defaultColor: 'surface' }),

    border: '1px solid',
    borderColor: 'var(--radio-group-border)',
    borderRadius: theme('borderRadius.full')!,

    'input[type="radio"]': {
      display: 'none',
    },

    '> label': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: theme('height.8')!,
      padding: theme('spacing.2')!,
      fontSize: theme('fontSize.sm')!,
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      borderRadius: theme('borderRadius.full')!,

      '&:hover': {
        backgroundColor: 'var(--radio-group-backgroud-color-hover)',
      },
    },

    'input[type="radio"]:checked + label': {
      backgroundColor: 'var(--radio-group-base)',
      color: 'var(--radio-group-base-contrast)',
    },
  },
});
