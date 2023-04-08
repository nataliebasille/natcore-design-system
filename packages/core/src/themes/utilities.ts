export default {
  '.bg-primary': {
    'background-color': 'var(--primary)',
    color: 'var(--primaryContrast)',
  },

  '.bg-secondary': {
    'background-color': 'var(--secondary)',
    color: 'var(--secondaryContrast)',
  },

  '.bg-tertiary': {
    'background-color': 'var(--tertiary)',
    color: 'var(--tertiaryContrast)',
  },

  '.text-primary': {
    color: 'var(--primary)',
  },

  '.text-secondary': {
    color: 'var(--secondary)',
  },

  '.text-tertiary': {
    color: 'var(--tertiary)',
  },

  '.text-accent': {
    color: 'var(--accent)',
  },

  '.border-primary': {
    'border-color': 'var(--primary)',
  },

  '.border-secondary': {
    'border-color': 'var(--secondary)',
  },

  '.border-tertiary': {
    'border-color': 'var(--tertiary)',
  },

  '.border-accent': {
    'border-color': 'var(--accent)',
  },
} as const;
