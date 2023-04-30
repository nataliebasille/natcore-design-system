import { type PluginAPI } from "tailwindcss/types/config";
import { createVariants } from "../colors";

export default (theme: PluginAPI["theme"]) => ({
  ".btn, .btn-icon": {
    ...createVariants("btn"),

    padding: "0.75em 1em",
    fontSize: theme("fontSize.base")!,
    letterSpacing: theme("letterSpacing.wider")!,
    borderRadius: theme("borderRadius.lg")!,
    lineHeight: "1",
    borderWidth: "1px",
    borderStyle: "solid",
    transitionProperty:
      "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
    transitionTimingFunction: "ease-in-out",
    transitionDuration: "250ms",

    backgroundColor: "var(--btn-base)",
    color: "var(--btn-base-contrast)",

    "&:hover": {
      backgroundColor: "var(--btn-base-hover)",
      color: "var(--btn-base-hover-contrast)",
    },
    "&:active": {
      transform: "scale(0.95)",
    },
    "&.btn-outline": {
      color: "var(--btn-base)",
      borderColor: "var(--btn-base)",
      backgroundColor: "var(--btn-background-color)",
      "&:hover": {
        backgroundColor: "var(--btn-background-color-hover)",
      },
    },

    "&.btn-sm": {
      padding: "0.5em 0.75em",
      fontSize: theme("fontSize.sm")!,
    },

    "&.btn-lg": {
      padding: "1em 2em",
      fontSize: theme("fontSize.lg")!,
    },

    "&.btn-ghost": {
      backgroundColor: "transparent",
      color: theme("colors.gray.900")!,
      borderColor: "transparent",
      "&:hover": {
        backgroundColor: theme("colors.gray.300")!,
      },
      "&:focus": {
        boxShadow: `0 0 0 3px ${theme("colors.gray.300")}`,
      },
      "&.btn-outline": {
        backgroundColor: "transparent",
        color: theme("colors.gray.600")!,
        borderColor: theme("colors.gray.600")!,
        "&:hover": {
          backgroundColor: theme("colors.gray.100")!,
        },
      },
    },
  },

  ".btn-icon": {
    borderRadius: theme("borderRadius.full")!,
    aspectRatio: "1 / 1",
    padding: ".75em",

    "&.btn-sm": {
      padding: ".5em",
    },

    "&.btn-lg": {
      padding: "1em",
    },
  },
});
