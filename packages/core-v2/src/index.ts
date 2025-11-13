// Natcore Design System v2 - Main entry point
// This package is designed for Tailwind CSS 4.0

export * from './utils.ts'
export * from './plugin.ts'

// Re-export types and utilities that will be used by consumers
export type { Config } from 'tailwindcss'

// Version identifier
export const VERSION = '2.0.0'
export const TAILWIND_VERSION = '4.0'

// Default export is the plugin function for convenience
export { default } from './plugin.ts'
