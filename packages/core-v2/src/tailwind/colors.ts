/**
 * Color utilities for generating theme colors using OKLCH color space
 */

export type ColorConfig =
  | string // Hex color
  | {
      color: string; // Hex color
      shade: number; // Base shade (50-900)
      variables?: Record<string, number>; // Custom variable shades
    };

export interface ColorSchema {
  [key: string]: ColorConfig;
}

export const shades = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
] as const;

export const VARIABLES_TO_SHADES = {
  base: 500,
  "base-hover": 600,
  "background-color": 100,
  "background-color-hover": 200,
  active: 700,
  disable: 200,
  border: 300,
} as const;

/**
 * Generate CSS custom properties for color shades using OKLCH
 * This allows dynamic shade generation entirely in CSS
 */
export function generateColorVariables(
  colorName: string,
  baseColor: string,
  baseShade: number = 500,
): Record<string, string> {
  const variables: Record<string, string> = {};

  // Store the base color in OKLCH format
  // Convert hex to OKLCH and store L, C, H components separately
  variables[`--color-${colorName}-base`] = baseColor;
  variables[`--color-${colorName}-base-shade`] = baseShade.toString();

  // Generate all shade variables
  shades.forEach((shade) => {
    // Calculate lightness adjustment based on shade
    // 50 is lightest (L close to 1), 900 is darkest (L close to 0)
    const lightnessAdjust = calculateLightnessAdjust(shade, baseShade);

    variables[`--color-${colorName}-${shade}`] =
      `oklch(from var(--color-${colorName}-base) calc(l ${lightnessAdjust}) c h)`;
    variables[`--color-${colorName}-${shade}-rgb`] =
      `srgb(from var(--color-${colorName}-${shade}) r g b)`;

    // Generate contrasting text color (uses OKLCH relative lightness)
    // If color is light (L > 0.6), use dark text, otherwise light text
    variables[`--color-${colorName}-${shade}-text`] =
      `oklch(from var(--color-${colorName}-${shade}) calc((l - 0.6) * -100) 0 h)`;
    variables[`--color-${colorName}-${shade}-text-rgb`] =
      `srgb(from var(--color-${colorName}-${shade}-text) r g b)`;
  });

  return variables;
}

/**
 * Calculate lightness adjustment for OKLCH based on target shade and base shade
 */
function calculateLightnessAdjust(
  targetShade: number,
  baseShade: number,
): string {
  // Map shades to approximate lightness values in OKLCH (0-1 scale)
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
  const targetLightness = shadeToLightness[targetShade] || 0.55;
  const diff = targetLightness - baseLightness;

  if (diff === 0) return "";
  if (diff > 0) return `+ ${diff.toFixed(2)}`;
  return `- ${Math.abs(diff).toFixed(2)}`;
}

/**
 * Generate CSS for all colors in the schema
 */
export function generateColorTheme(colors: ColorSchema): string {
  const cssVariables: string[] = [];

  Object.entries(colors).forEach(([name, config]) => {
    const baseColor = typeof config === "string" ? config : config.color;
    const baseShade = typeof config === "string" ? 500 : config.shade;

    const variables = generateColorVariables(name, baseColor, baseShade);

    Object.entries(variables).forEach(([key, value]) => {
      cssVariables.push(`  ${key}: ${value};`);
    });
  });

  return `@theme {\n${cssVariables.join("\n")}\n}`;
}

/**
 * Generate variable mappings for semantic color names
 */
export function generateColorSemanticVariables(
  colors: ColorSchema,
): Record<string, string> {
  const variables: Record<string, string> = {};

  Object.keys(colors).forEach((colorName) => {
    Object.entries(VARIABLES_TO_SHADES).forEach(([varName, shade]) => {
      variables[`--${colorName}-${varName}`] =
        `var(--color-${colorName}-${shade})`;
      variables[`--${colorName}-${varName}-text`] =
        `var(--color-${colorName}-${shade}-text)`;
    });
  });

  return variables;
}
