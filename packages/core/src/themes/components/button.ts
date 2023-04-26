import { PluginAPI } from 'tailwindcss/types/config';

export default (theme: PluginAPI['theme']) => ({
  '.btn': {
    padding: '0.5rem 1rem',
    letterSpacing: theme('letterSpacing.wider')!,
    borderRadius: theme('borderRadius.DEFAULT')!,
    fontWeight: theme('fontWeight.bold')!,
    borderWidth: '1px',
    borderStyle: 'solid',
    transitionProperty:
      'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
    transitionTimingFunction: 'ease-in-out',
    transitionDuration: '250ms',

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

    '&.btn-primary': {
      backgroundColor: theme('colors.primary.600')!,
      color: theme('colors.primary.contrast.600')!,
      '&:hover': {
        backgroundColor: theme('colors.primary.700')!,
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${theme('colors.primary.100')}`,
      },
      '&.btn-outline': {
        backgroundColor: 'transparent',
        color: theme('colors.primary.600')!,
        borderColor: theme('colors.primary.600')!,
        '&:hover': {
          backgroundColor: theme('colors.primary.100')!,
        },
      },
    },

    '&.btn-secondary': {
      backgroundColor: theme('colors.secondary.600')!,
      color: theme('colors.secondary.contrast.600')!,
      '&:hover': {
        backgroundColor: theme('colors.secondary.700')!,
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${theme('colors.secondary.100')}`,
      },
      '&.btn-outline': {
        backgroundColor: 'transparent',
        color: theme('colors.secondary.600')!,
        borderColor: theme('colors.secondary.600')!,
        '&:hover': {
          backgroundColor: theme('colors.secondary.200')!,
        },
      },
    },

    '&.btn-tertiary': {
      backgroundColor: theme('colors.accent.600')!,
      color: theme('colors.accent.contrast.600')!,
      '&:hover': {
        backgroundColor: theme('colors.accent.700')!,
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${theme('colors.accent.100')}`,
      },
      '&.btn-outline': {
        backgroundColor: 'transparent',
        color: theme('colors.accent.600')!,
        borderColor: theme('colors.accent.600')!,
        '&:hover': {
          backgroundColor: theme('colors.accent.100')!,
        },
      },
    },

    '&.btn-warning': {
      backgroundColor: theme('colors.yellow.400')!,
      color: theme('colors.gray.800')!,
      '&:hover': {
        backgroundColor: theme('colors.yellow.500')!,
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${theme('colors.yellow.100')}`,
      },
      '&.btn-outline': {
        backgroundColor: 'transparent',
        color: theme('colors.yellow.600')!,
        borderColor: theme('colors.yellow.600')!,
        '&:hover': {
          backgroundColor: theme('colors.yellow.50')!,
        },
      },
    },

    '&.btn-danger': {
      backgroundColor: theme('colors.red.600')!,
      color: theme('colors.gray.100')!,
      '&:hover': {
        backgroundColor: theme('colors.red.700')!,
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${theme('colors.red.100')}`,
      },
      '&.btn-outline': {
        backgroundColor: 'transparent',
        color: theme('colors.red.600')!,
        borderColor: theme('colors.red.600')!,
        '&:hover': {
          backgroundColor: theme('colors.red.100')!,
        },
      },
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
