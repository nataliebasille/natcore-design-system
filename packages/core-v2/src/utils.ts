// Natcore Design System v2 - Utility functions
// Utilities for working with Tailwind CSS 4.0

import classNames from 'classnames'

// Re-export classnames for convenience
export { default as cn } from 'classnames'
export { default as classNames } from 'classnames'

/**
 * Utility function to conditionally join class names
 * This is a re-export of the popular classnames library
 */
export function clsx(...args: Parameters<typeof classNames>): string {
  return classNames(...args)
}

/**
 * Type for CSS class values
 */
export type ClassValue = string | number | boolean | undefined | null | ClassValue[]

/**
 * Utility to merge class names with proper handling of conflicting classes
 * This will be enhanced in the future to handle Tailwind CSS conflicts intelligently
 */
export function mergeClasses(...classes: ClassValue[]): string {
  return classNames(...classes)
}

/**
 * Version utilities
 */
export const DESIGN_SYSTEM_VERSION = '2.0.0'
export const TAILWIND_COMPAT_VERSION = '4.0'

/**
 * Theme utilities - placeholder for future theme system
 */
export interface ThemeConfig {
  // Will be defined when implementing the theme system
}

/**
 * Component variant utilities - placeholder for future variant system
 */
export interface VariantConfig {
  // Will be defined when implementing the variant system
}