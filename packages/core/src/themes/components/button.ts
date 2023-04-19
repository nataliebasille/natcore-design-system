import { PluginAPI } from 'tailwindcss/types/config';

export default (theme: PluginAPI['theme']) => ({
  '.btn': {
    padding: '0.5rem 1rem',
    'letter-spacing': theme('letterSpacing.wider')!,
    'border-radius': theme('borderRadius.DEFAULT')!,
    'font-weight': theme('fontWeight.bold')!,
    'border-width': '1px',
    'border-style': 'solid',
    'transition-property':
      'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
    'transition-timing-function': 'ease-in-out',
    'transition-duration': '250ms',

    '&.btn-sm': {
      padding: '0.25rem 0.5rem',
      'font-size': theme('fontSize.sm')!,
    },

    '&.btn-md': {
      padding: '0.5rem 1rem',
      'font-size': theme('fontSize.base')!,
    },

    '&.btn-lg': {
      padding: '0.75rem 1.5rem',
      'font-size': theme('fontSize.lg')!,
    },

    '&:active': {
      transform: 'scale(0.95)',
    },

    '&.btn-primary': {
      'background-color': theme('colors.primary.600')!,
      color: theme('colors.primaryContrast.600')!,
      '&:hover': {
        'background-color': theme('colors.primary.700')!,
      },
      '&:focus': {
        'box-shadow': `0 0 0 3px ${theme('colors.primary.100')}`,
      },
      '&.btn-outline': {
        'background-color': 'transparent',
        color: theme('colors.primary.600')!,
        'border-color': theme('colors.primary.600')!,
        '&:hover': {
          'background-color': theme('colors.primary.100')!,
        },
      },
    },

    '&.btn-secondary': {
      'background-color': theme('colors.secondary.600')!,
      color: theme('colors.secondaryContrast.600')!,
      '&:hover': {
        'background-color': theme('colors.secondary.700')!,
      },
      '&:focus': {
        'box-shadow': `0 0 0 3px ${theme('colors.secondary.100')}`,
      },
      '&.btn-outline': {
        'background-color': 'transparent',
        color: theme('colors.secondary.600')!,
        'border-color': theme('colors.secondary.600')!,
        '&:hover': {
          'background-color': theme('colors.secondary.200')!,
        },
      },
    },

    '&.btn-tertiary': {
      'background-color': theme('colors.accent.600')!,
      color: theme('colors.accentContrast.600')!,
      '&:hover': {
        'background-color': theme('colors.accent.700')!,
      },
      '&:focus': {
        'box-shadow': `0 0 0 3px ${theme('colors.accent.100')}`,
      },
      '&.btn-outline': {
        'background-color': 'transparent',
        color: theme('colors.accent.600')!,
        'border-color': theme('colors.accent.600')!,
        '&:hover': {
          'background-color': theme('colors.accent.100')!,
        },
      },
    },

    '&.btn-warning': {
      'background-color': theme('colors.yellow.400')!,
      color: theme('colors.gray.800')!,
      '&:hover': {
        'background-color': theme('colors.yellow.500')!,
      },
      '&:focus': {
        'box-shadow': `0 0 0 3px ${theme('colors.yellow.100')}`,
      },
      '&.btn-outline': {
        'background-color': 'transparent',
        color: theme('colors.yellow.600')!,
        'border-color': theme('colors.yellow.600')!,
        '&:hover': {
          'background-color': theme('colors.yellow.50')!,
        },
      },
    },

    '&.btn-danger': {
      'background-color': theme('colors.red.600')!,
      color: theme('colors.gray.100')!,
      '&:hover': {
        'background-color': theme('colors.red.700')!,
      },
      '&:focus': {
        'box-shadow': `0 0 0 3px ${theme('colors.red.100')}`,
      },
      '&.btn-outline': {
        'background-color': 'transparent',
        color: theme('colors.red.600')!,
        'border-color': theme('colors.red.600')!,
        '&:hover': {
          'background-color': theme('colors.red.100')!,
        },
      },
    },
  },
});
