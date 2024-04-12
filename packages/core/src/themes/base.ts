/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type PluginAPI } from "tailwindcss/types/config";
import {
  type NormalizedColorSchema,
  formatColorForCssVariable,
  type ColorSchema,
} from "../utils";

export default (
  theme: PluginAPI["theme"],
  normalizedColorSchema: NormalizedColorSchema<ColorSchema>,
) =>
  ({
    ":root": Object.entries(normalizedColorSchema.themes.light.variants).reduce(
      (props, [key, palette]) => {
        Object.entries(palette).forEach(([shade, [color, contrast]]) => {
          props[`--${key}-${shade}`] = formatColorForCssVariable(color);
          props[`--${key}-text-${shade}`] = formatColorForCssVariable(contrast);
        });

        return Object.entries(
          normalizedColorSchema.themes.light.variables,
        ).reduce((props, [variable, shade]) => {
          props[`--${key}-${variable}`] = `var(--${key}-${shade})`;
          props[`--${key}-${variable}-text`] = `var(--${key}-text-${shade})`;

          return props;
        }, props);
      },
      {} as Record<string, string>,
    ),

    body: {
      backgroundColor: "rgb(var(--surface-background-color))",
      color: "rgb(var(--surface-background-color-text))",
    },

    h1: {
      fontSize: theme("fontSize.5xl")!,
      letterSpacing: theme("letterSpacing.wide")!,
      lineHeight: theme("lineHeight.tight")!,
    },
    h2: {
      fontSize: theme("fontSize.3xl")!,
      letterSpacing: theme("letterSpacing.wide")!,
      lineHeight: theme("lineHeight.tight")!,
    },
    h3: {
      fontSize: theme("fontSize.xl")!,
      letterSpacing: theme("letterSpacing.wide")!,
      lineHeight: theme("lineHeight.tight")!,
    },
    h4: {
      fontSize: theme("fontSize.lg")!,
      letterSpacing: theme("letterSpacing.wide")!,
      lineHeight: theme("lineHeight.tight")!,
    },
    h5: {
      fontSize: theme("fontSize.base")!,
      letterSpacing: theme("letterSpacing.wide")!,
      lineHeight: theme("lineHeight.tight")!,
    },
    h6: {
      fontSize: theme("fontSize.sm")!,
      letterSpacing: theme("letterSpacing.wide")!,
      lineHeight: theme("lineHeight.tight")!,
    },

    article: {
      "p, .list-item": {
        lineHeight: `${theme("lineHeight.relaxed")!} !important`,
      },

      "> *:first-child": {
        marginTop: "0 !important",
      },

      p: {
        margin: `${theme("spacing.4")} 0`!,
      },

      "h1, h2, h3": {
        margin: `${theme("spacing.8")} 0 ${theme("spacing.4")} 0`!,
      },
    },
  } as const);
