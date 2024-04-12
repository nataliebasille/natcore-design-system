/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type PluginAPI } from "tailwindcss/types/config";
import {
  formatColorForCssVariable,
  type NormalizedColorSchema,
  VARIABLES_TO_SHADES,
} from "../utils";

const VARIABLE_KEYS = new Set(Object.keys(VARIABLES_TO_SHADES));
export default (
  theme: PluginAPI["theme"],
  normalizedColorSchema: NormalizedColorSchema,
) =>
  ({
    ":root": Object.entries(normalizedColorSchema).reduce(
      (props, [key, schema]) => {
        Object.entries(schema).forEach(
          ([shade, value]: [shade: string, value: any]) => {
            if (VARIABLE_KEYS.has(shade)) return;
            if (shade === "contrast") return;
            props[`--${key}-${shade}`] = formatColorForCssVariable(value);
            props[`--${key}-text-${shade}`] = (schema as any).contrast[shade];
          },
        );

        return props;
      },
      {} as Record<string, string>,
    ),

    body: {
      backgroundColor: "rgb(var(--surface-50))",
      color: "rgb(var(--surface-text-50))",
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
