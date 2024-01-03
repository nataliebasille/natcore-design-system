/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type PluginAPI } from "tailwindcss/types/config";
import { createVariants } from "../colors";

const radioGroupVariants = createVariants("radio-group", {
  defaultColor: "surface",
});
export default (theme: PluginAPI["theme"]) => ({
  ".radio-group": {
    ...radioGroupVariants,
    display: "flex",
    gap: theme("spacing.1")!,
    width: "fit-content",
    padding: "0.125rem",

    borderStyle: "solid",
    borderWidth: theme("borderWidth.2")!,
    borderColor: radioGroupVariants("border")!,
    borderRadius: theme("borderRadius.full")!,

    'input[type="radio"]': {
      display: "none",
    },

    "> label": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: theme("height.8")!,
      padding: `${theme("spacing.2")!} ${theme("spacing.4")!}`,
      fontSize: theme("fontSize.sm")!,
      transition: "all 0.2s ease-in-out",
      cursor: "pointer",
      borderRadius: theme("borderRadius.full")!,

      "&:hover": {
        backgroundColor: radioGroupVariants("background-color-hover"),
      },
    },

    'input[type="radio"]:checked + label': {
      backgroundColor: radioGroupVariants("base"),
      color: radioGroupVariants("base-text"),
    },

    'input[type="radio"]:active + label': {
      transform: "scale(0.95)",
    },

    'input[type="radio"]:disabled + label': {
      opacity: "0.5",
      cursor: "not-allowed",
      backgroundColor: "transparent",
    },
  },
});
