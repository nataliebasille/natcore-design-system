/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type PluginAPI } from "tailwindcss/types/config";
import { createVariants } from "../colors.ts";

const btnVariants = createVariants("btn");
export default (theme: PluginAPI["theme"]) => ({
  ".btn, .btn-icon": {
    ...btnVariants,

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

    backgroundColor: btnVariants("base"),
    color: btnVariants("base-text"),

    "&.btn-ghost": {
      backgroundColor: btnVariants("base", 0.2),
      color: btnVariants("active"),
      borderColor: btnVariants("base", 0.8),

      "&:hover": {
        backgroundColor: btnVariants("base", 0.4),
        color: btnVariants("active"),
        borderColor: btnVariants("base"),
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

    "&:hover": {
      backgroundColor: btnVariants("base-hover"),
    },
    "&:active": {
      transform: "scale(0.95)",
    },
    "&.btn-outline": {
      color: btnVariants("base"),
      borderColor: btnVariants("base"),
      backgroundColor: "transparent",
      "&:hover": {
        backgroundColor: btnVariants("background-color"),
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
