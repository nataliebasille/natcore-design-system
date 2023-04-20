import { PluginAPI } from 'tailwindcss/types/config';

export default (theme: PluginAPI['theme']) => ({
  '.layer': {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridTemplateRows: 'auto 1fr auto',
    position: 'relative',
    width: theme('width.full')!,
    height: theme('height.full')!,
    overflow: 'hidden',

    '.layer-drawer-toggle': {
      display: 'none',

      '& ~ .layer-drawer': {
        transform: 'translateX(-100%)',

        '&.layer-drawer-fixed': {
          transform: 'translateX(0)',
        },
      },

      '&:checked ~ .layer-drawer': {
        transform: 'translateX(0)',
      },
    },

    '.layer-drawer': {
      position: 'absolute',
      top: '0',
      left: '0',
      bottom: '0',
      transition: 'transform 0.3s ease-in-out',
      '& ~ .layer-content': {
        gridColumn: '1 / -1',
        gridRow: '1 / -1',
      },

      '&.layer-drawer-fixed': {
        position: 'relative',
        gridColumn: '1',
        gridRow: '1 / -1',

        '& ~ .layer-content': {
          gridColumn: '2 / -1',
          gridRow: '1 / -1',
        },
      },

      '&.layer-drawer-right': {
        top: '0',
        right: '0',
        bottom: '0',

        '&.layer-drawer-fixed': {
          gridColumn: '-1 !important',
          gridRow: '1 / -1 !important',
        },

        '& ~ .layer-content': {
          gridColumn: '1 / -2 !important',
          gridRow: '1 / -1 !important',
        },
      },

      '&.layer-drawer-top': {
        top: '0',
        right: '0',
        left: '0',

        '&.layer-drawer-fixed': {
          gridColumn: '1 / -1 !important',
          gridRow: '1 !important',
        },
        '& ~ .layer-content': {
          gridColumn: '1 / -1 !important',
          gridRow: '2 / -1 !important',
        },
      },

      '&.layer-drawer-bottom': {
        right: '0',
        bottom: '0',
        left: '0',

        '&.layer-drawer-fixed': {
          gridColumn: '1 / -1 !important',
          gridRow: '-1 !important',
        },

        '& ~ .layer-content': {
          gridColumn: '1 / -1 !important',
          gridRow: '1 / 2 !important',
        },
      },
    },

    '.layer-content': {
      overflow: 'auto',
      position: 'relative',
    },
  },
});
