// Natcore Design System v2 - Tailwind CSS 4.0 Plugin
// This plugin is designed specifically for Tailwind CSS 4.0

import plugin from 'tailwindcss/plugin'

/**
 * Natcore Design System v2 Plugin Configuration
 */
export interface NatcorePluginOptions {
  // Plugin options will be defined here as the system grows
  prefix?: string
  darkMode?: boolean | 'class' | 'media'
}

/**
 * Default plugin options
 */
const defaultOptions: NatcorePluginOptions = {
  prefix: '',
  darkMode: 'class'
}

/**
 * Natcore Design System v2 Plugin for Tailwind CSS 4.0
 * 
 * This plugin provides the core design system utilities, components,
 * and theme configuration for Tailwind CSS 4.0.
 * 
 * @param options - Plugin configuration options
 * @returns Tailwind CSS plugin function
 */
export function natcorePlugin(options: NatcorePluginOptions = {}): ReturnType<typeof plugin> {
  const config = { ...defaultOptions, ...options }
  
  return plugin(function({ addUtilities, addComponents, addBase, theme }) {
    // Add base styles
    addBase({
      // Base styles will be added here
    })

    // Add component styles
    addComponents({
      // Component styles will be added here
    })

    // Add utility styles
    addUtilities({
      // Custom utilities will be added here
    })
  }, {
    // Plugin configuration
    theme: {
      extend: {
        // Theme extensions will be added here
      }
    }
  })
}

/**
 * Default export for convenience
 */
export default natcorePlugin

/**
 * Named export for explicit usage
 */
export { natcorePlugin as plugin }