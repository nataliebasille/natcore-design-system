import { PluginAPI } from 'tailwindcss/types/config';
import { createVariants } from '../colors';

export default (theme: PluginAPI['theme']) => ({
  '.btn': {
    ...createVariants('btn'),

    padding: '0.5rem 1rem',
    letterSpacing: theme('letterSpacing.wider')!,
    borderRadius: theme('borderRadius.DEFAULT')!,
    borderWidth: '1px',
    borderStyle: 'solid',
    transitionProperty:
      'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
    transitionTimingFunction: 'ease-in-out',
    transitionDuration: '250ms',

    backgroundColor: 'var(--btn-base)',
    color: 'var(--btn-base-contrast)',

    '&:hover': {
      backgroundColor: 'var(--btn-base-hover)',
      color: 'var(--btn-base-hover-contrast)',
    },
    '&:focus': {
      boxShadow: `0 0 0 3px var(--btn-border)`,
    },
    '&.btn-outline': {
      color: 'var(--btn-base)',
      borderColor: 'var(--btn-base)'!,
      backgroundColor: 'var(--btn-background-color)',
      '&:hover': {
        backgroundColor: 'var(--btn-background-color-hover)'!,
      },
    },

    '&.btn-sm': {
      padding: '0.25rem 0.5rem',
      fontSize: theme('fontSize.sm')!,
    },

    '&.btn-md': {
      padding: '0.5rem 1rem',
      fontSize: theme('fontSize.base')!,
    },

    '&.btn-lg': {
      padding: '0.75rem 1.5rem',
      fontSize: theme('fontSize.lg')!,
    },

    '&:active': {
      transform: 'scale(0.95)',
    },

    '&.btn-ghost': {
      backgroundColor: 'transparent',
      color: theme('colors.gray.900')!,
      borderColor: 'transparent',
      '&:hover': {
        backgroundColor: theme('colors.gray.300')!,
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${theme('colors.gray.300')}`,
      },
      '&.btn-outline': {
        backgroundColor: 'transparent',
        color: theme('colors.gray.600')!,
        borderColor: theme('colors.gray.600')!,
        '&:hover': {
          backgroundColor: theme('colors.gray.100')!,
        },
      },
    },
  },
});
