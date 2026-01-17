// Natcore Design System v2 - Tailwind CSS 4.0 Plugin
// This plugin is designed specifically for Tailwind CSS 4.0

import plugin from "tailwindcss/plugin";
import {
  type ColorSchema,
  generateColorTheme,
  generateColorSemanticVariables,
} from "./colors.ts";

/**
 * Natcore Design System v2 Plugin Configuration
 */
export interface NatcorePluginOptions {
  // Plugin options will be defined here as the system grows
  prefix?: string;
  darkMode?: boolean | "class" | "media";
  colors?: ColorSchema;
}

/**
 * Default color schema
 */
const defaultColors: ColorSchema = {
  primary: "#230288",
  secondary: "#f44efd",
  accent: "#b88eae",
  surface: {
    color: "#ebe0ff",
    shade: 200,
    variables: {
      border: 300,
    },
  },
};

/**
 * Default plugin options
 */
const defaultOptions: NatcorePluginOptions = {
  prefix: "",
  darkMode: "class",
  colors: defaultColors,
};

/**
 * Natcore Design System v2 Plugin for Tailwind CSS 4.0
 *
 * This plugin provides the core design system utilities, components,
 * and theme configuration for Tailwind CSS 4.0.
 */
export const natcorePlugin: ReturnType<
  typeof plugin.withOptions<NatcorePluginOptions>
> = plugin.withOptions<NatcorePluginOptions>(
  (options = {}) => {
    const config = { ...defaultOptions, ...options };
    const colors = config.colors || defaultColors;

    return function ({ addBase, matchUtilities, theme }) {
      // Generate CSS variables in base layer
      const colorVariables: Record<string, string> = {};

      Object.entries(colors).forEach(([name, colorConfig]) => {
        const baseColor =
          typeof colorConfig === "string" ? colorConfig : colorConfig.color;
        const baseShade =
          typeof colorConfig === "string" ? 500 : colorConfig.shade;

        const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
        const shadeToLightness: Record<number, number> = {
          50: 0.97,
          100: 0.93,
          200: 0.85,
          300: 0.75,
          400: 0.65,
          500: 0.55,
          600: 0.45,
          700: 0.35,
          800: 0.25,
          900: 0.15,
        };

        const baseLightness = shadeToLightness[baseShade] || 0.55;

        shades.forEach((shade) => {
          const targetLightness = shadeToLightness[shade] || 0.55;
          const diff = targetLightness - baseLightness;
          const adjustment =
            diff === 0 ? ""
            : diff > 0 ? ` + ${diff.toFixed(2)}`
            : ` - ${Math.abs(diff).toFixed(2)}`;

          colorVariables[`--color-${shade}-bg-${name}`] =
            `oklch(from ${baseColor} calc(l${adjustment}) c h)`;
          colorVariables[`--color-${shade}-fg-${name}`] =
            `oklch(from var(--color-${shade}-bg-${name}) calc((l - 0.6) * -100) 0 h)`;
        });
      });

      addBase({
        ":root": colorVariables,
      });
    };
  },
  (options = {}) => {
    const config = { ...defaultOptions, ...options };
    const colors = config.colors || defaultColors;

    // Build theme color palette referencing CSS variables
    const themeColors: Record<string, Record<string | number, string>> = {};

    Object.keys(colors).forEach((name) => {
      const colorShades: Record<string | number, string> = {};
      const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

      shades.forEach((shade) => {
        colorShades[shade] = `var(--color-${shade}-bg-${name})`;
        colorShades[`${shade}-text`] = `var(--color-${shade}-fg-${name})`;
      });

      themeColors[name] = colorShades;
    });

    return {
      theme: {
        extend: {
          colors: themeColors,
        },
      },
    };
  },
);

/**
 * Default export for convenience
 */
export default natcorePlugin;

/**
 * Named export for explicit usage
 */
export { natcorePlugin as plugin };
