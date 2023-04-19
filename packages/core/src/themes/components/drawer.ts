import { PluginAPI } from 'tailwindcss/types/config';

export default (theme: PluginAPI['theme']) => ({
  '.drawer': {
    position: 'absolute',

    '&.drawer-left': {
      top: '0',
      bottom: '0',
      left: '0',

      '> .drawer-content': {
        transform: 'translateX(-100%)',
      },
    },

    '&.drawer-right': {
      top: '0',
      bottom: '0',
      right: '0',

      '> .drawer-content': {
        transform: 'translateX(100%)',
      },
    },

    '&.drawer-top': {
      top: '0',
      left: '0',
      right: '0',

      '> .drawer-content': {
        transform: 'translateY(-100%)',
      },
    },

    '&.drawer-bottom': {
      bottom: '0',
      left: '0',
      right: '0',

      '> .drawer-content': {
        transform: 'translateY(100%)',
      },
    },

    '> .drawer-toggle': {
      display: 'none',

      '&:checked + .drawer-content': {
        transform: 'translate(0, 0)',
      },
    },

    '> .drawer-content': {
      'transition-property': 'transform',
      'transition-timing-function': 'ease-in-out',
      'transition-duration': '250ms',
    },
  },
});
