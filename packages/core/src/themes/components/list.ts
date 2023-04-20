import { PluginAPI } from 'tailwindcss/types/config';

export default (theme: PluginAPI['theme']) => ({
  '.list': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '0',
    margin: '0',
    listStyle: 'none',

    // '&.list-inline': {
    //   flexDirection: 'row',
    // },

    '&.list-disc': {
      '.list-item': {
        '&::before': {
          content: '"•"',
          fontSize: theme('fontSize.3xl')!,
          paddingRight: theme('spacing.3')!,
        },

        padding: '0',
      },
    },

    // '&.list-decimal': {
    //   listStyleType: 'decimal',
    // },

    '> .list-item': {
      display: 'flex',
      alignItems: 'center',
      padding: theme('spacing.2')!,
      margin: '0',
      cursor: 'pointer',
      width: theme('width.full')!,
      borderRadius: theme('borderRadius.DEFAULT')!,
      lineHeight: theme('lineHeight.tight')!,
      '&:hover,&:focus': {
        background: theme('colors.gray.100')!,
      },
    },

    '&.list-primary': {
      '> .list-item.active': {
        backgroundColor: 'var(--primary)',
        color: 'var(--primaryContrast)',
      },
    },

    '&.list-secondary': {
      '> .list-item.active': {
        backgroundColor: 'var(--secondary)',
        color: 'var(--secondaryContrast)',
      },
    },

    '&.list-tertiary': {
      '> .list-item.active': {
        backgroundColor: 'var(--tertiary)',
        color: 'var(--tertiaryContrast)',
      },
    },

    '&.list-warning': {
      '> .list-item.active': {
        backgroundColor: 'var(--warning)',
        color: 'var(--warningContrast)',
      },
    },

    '&.list-danger': {
      '> .list-item.active': {
        backgroundColor: 'var(--danger)',
        color: 'var(--dangerContrast)',
      },
    },
  },
});
