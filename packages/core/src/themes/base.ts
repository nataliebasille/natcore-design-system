import { type PluginAPI } from "tailwindcss/types/config";
import { colors } from "./colors";

export default (theme: PluginAPI["theme"]) =>
  ({
    ":root": Object.entries(colors).reduce((props, [key, color]) => {
      const { shades, contrast } = color;

      Object.entries(shades).forEach(([shade, value]) => {
        props[`--${key}-${shade}`] = value;
      });

      Object.entries(contrast).forEach(([shade, value]) => {
        props[`--${key}-contrast-${shade}`] = value;
      });

      return props;
    }, {} as Record<string, string>),

    body: {
      backgroundColor: "var(--surface-50)",
      color: "var(--surface-contrast-50)",
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
