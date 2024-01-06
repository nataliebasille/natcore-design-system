/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type PluginAPI } from "tailwindcss/types/config";
import { createVariants } from "../colors";

const cardVariants = createVariants("card", { defaultColor: "surface" });
export default (theme: PluginAPI["theme"]) => ({
  ".card": {
    ...cardVariants,

    backgroundColor: cardVariants("background-color"),
    color: cardVariants("background-color-text"),
    borderRadius: theme("borderRadius.lg")!,
    border: `1px solid ${cardVariants("border")}`,

    "> .card-header": {
      padding: theme("spacing.4")!,
      borderBottom: `1px solid ${cardVariants("border")}`,
    },

    "> .card-content": {
      padding: theme("spacing.4")!,
    },

    "> .card-footer": {
      padding: theme("spacing.4")!,
      borderTop: `1px solid ${cardVariants("border")}`,
    },

    "&.card-hover": {
      transitionProperty:
        "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
      transitionTimingFunction: "ease-in-out",
      transitionDuration: "250ms",
      cursor: "pointer",

      "&:hover": {
        backgroundColor: cardVariants("background-color-hover"),
        color: cardVariants("background-color-hover-text"),
        transform: "scale(1.01)",
      },
    },

    "&.card-soft": {
      backgroundColor: cardVariants("background-color"),
      color: cardVariants("background-color-text"),
      borderRadius: theme("borderRadius.lg")!,
      border: `1px solid ${cardVariants("border")}`,

      "> .card-footer": {
        padding: theme("spacing.4")!,
        borderTop: `1px solid ${cardVariants("border")}`,
      },

      "&.card-hover": {
        "&:hover": {
          backgroundColor: cardVariants("background-color-hover"),
          color: cardVariants("background-color-hover-text"),
        },
      },
    },

    "&.card-filled": {
      backgroundColor: cardVariants("base"),
      color: cardVariants("base-text"),

      "> .card-footer": {
        padding: theme("spacing.4")!,
        borderTop: `1px solid ${cardVariants("base-text", 0.25)}`,
      },

      "&.card-hover": {
        "&:hover": {
          backgroundColor: cardVariants("base-hover"),
          color: cardVariants("base-hover-text"),
        },
      },
    },

    "&.card-ghost": {
      backgroundColor: cardVariants("base", 0.2),
      color: cardVariants("active"),
      borderColor: cardVariants("base", 0.8),

      "> .card-header": {
        borderBottom: `1px solid ${cardVariants("base", 0.25)}`,
      },

      "> .card-footer": {
        borderTop: `1px solid ${cardVariants("base", 0.25)}`,
      },

      "&.card-hover": {
        "&:hover": {
          backgroundColor: cardVariants("base", 0.4),
          color: cardVariants("active"),
          borderColor: cardVariants("base"),
        },
      },
    },
  },
});
