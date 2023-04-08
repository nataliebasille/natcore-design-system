import { PluginAPI } from 'tailwindcss/types/config';

export default (theme: PluginAPI['theme']) => ({
  '.btn': {
    padding: '0.5rem 1rem',
    'letter-spacing': theme('letterSpacing.wide')!,
  },
  '.btn-primary': {
    'background-color': 'var(--primary)',
    color: 'var(--primaryContrast)',
    '&:hover': {},
  },
});
