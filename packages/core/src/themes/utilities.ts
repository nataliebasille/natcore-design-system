export default {
  '.bg-primary': {
    backgroundColor: 'var(--primary)',
    color: 'var(--primaryContrast)',
  },

  '.bg-secondary': {
    backgroundColor: 'var(--secondary)',
    color: 'var(--secondaryContrast)',
  },

  '.bg-tertiary': {
    backgroundColor: 'var(--tertiary)',
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
    borderColor: 'var(--primary)',
  },

  '.border-secondary': {
    borderColor: 'var(--secondary)',
  },

  '.border-tertiary': {
    borderColor: 'var(--tertiary)',
  },

  '.border-accent': {
    borderColor: 'var(--accent)',
  },
} as const;
