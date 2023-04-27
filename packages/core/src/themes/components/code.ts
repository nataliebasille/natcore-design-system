import { PluginAPI } from 'tailwindcss/types/config';

export default (theme: PluginAPI['theme']) => ({
  code: {
    display: 'block',
    whiteSpace: 'pre',
    backgroundColor: theme('colors.slate.800')!,
    color: theme('colors.white')!,
    padding: theme('spacing.4')!,
    borderRadius: theme('borderRadius.DEFAULT')!,
    width: '100%',
    overflow: 'hidden',
    overflowX: 'auto',
    fontFamily:
      'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace',
  },
});
