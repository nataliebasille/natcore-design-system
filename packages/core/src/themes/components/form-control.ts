/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type PluginAPI } from "tailwindcss/types/config";
import { createVariants } from "../colors";

const formControlVariants = createVariants("form-control", {
  defaultColor: "surface",
});
const ALL_SIBLING_INPUTS_SELECTOR = "~ input, ~ select, ~ textarea" as const;
const ALL_CHILD_INPUTS_SELECTOR = "> input, > select, > textarea" as const;

export default (theme: PluginAPI["theme"]) => ({
  ".form-control": {
    ...formControlVariants,

    transition: "all 0.2s ease-in-out",
    display: "grid",
    gridTemplateAreas: `
        "label label label"
        "prefix input suffix"
        "hint hint hint"
    `,
    gridTemplateColumns: "max-content 1fr max-content",

    "> .form-control-label, > label, > .form-control-hint": {
      fontSize: ".75rem",
    },

    "> .form-control-label, > label, > .form-control-prefix, > .form-control-suffix":
      {
        transition: "all 0.2s ease-in-out",
        backgroundColor: formControlVariants("background-color"),
        borderColor: formControlVariants("border"),
        fontWeight: theme("fontWeight.medium")!,
        color: formControlVariants("background-color-text", 0.5),
      },

    "> .form-control-label, > label": {
      gridArea: "label",
      paddingLeft: "1.33333em",
      paddingRight: "2em",
      borderStyle: "solid",
      borderWidth: "1px",
      borderBottom: "none",
      borderTopLeftRadius: theme("borderRadius.md")!,
      borderTopRightRadius: theme("borderRadius.md")!,
      paddingTop: ".25em",

      [ALL_SIBLING_INPUTS_SELECTOR]: {
        borderTopLeftRadius: "0",
        borderTopRightRadius: "0",
        borderTopStyle: "none",
        paddingTop: ".25em",
      },

      "~ .form-control-prefix, ~ .form-control-suffix": {
        borderTopStyle: "none",
        borderTopLeftRadius: "0",
        borderTopRightRadius: "0",
      },
    },

    [ALL_CHILD_INPUTS_SELECTOR]: {
      gridArea: "input",
      outline: "none",
      transition: "all 0.2s ease-in-out",
      backgroundColor: formControlVariants("background-color"),
      color: formControlVariants("background-color-text"),
      borderColor: formControlVariants("border"),

      "&:has(~ .form-control-suffix)": {
        borderTopRightRadius: "0",
        borderBottomRightRadius: "0",
        borderRight: "none",
        paddingRight: ".25em",
      },
    },

    "> .form-control-hint": {
      gridArea: "hint",
      paddingLeft: "1.33333em",
    },

    "&.form-control-error": {
      "> .form-control-label, > label, > input, > select, > textarea, > .form-control-prefix, > .form-control-suffix":
        {
          borderColor: theme("colors.red.600")!,
        },

      "> .form-control-label, > label, > .form-control-hint, > .form-control-prefix, > .form-control-suffix":
        {
          color: theme("colors.red.600")!,
        },
    },

    "> .form-control-prefix": {
      gridArea: "prefix",
      display: "flex",
      alignItems: "center",
      borderTopStyle: "solid",
      borderTopWidth: "1px",
      borderLeftStyle: "solid",
      borderLeftWidth: "1px",
      borderBottomStyle: "solid",
      borderBottomWidth: "1px",
      borderTopLeftRadius: theme("borderRadius.md")!,
      borderBottomLeftRadius: theme("borderRadius.md")!,
      paddingLeft: ".25em",
      [ALL_SIBLING_INPUTS_SELECTOR]: {
        borderTopLeftRadius: "0",
        borderBottomLeftRadius: "0",
        borderLeft: "none",
        paddingLeft: ".25em",
      },
    },

    "> .form-control-suffix": {
      gridArea: "suffix",
      display: "flex",
      alignItems: "center",
      borderTopStyle: "solid",
      borderTopWidth: "1px",
      borderBottomStyle: "solid",
      borderBottomWidth: "1px",
      borderRightStyle: "solid",
      borderRightWidth: "1px",
      borderTopRightRadius: theme("borderRadius.md")!,
      borderBottomRightRadius: theme("borderRadius.md")!,
      paddingRight: ".25em",
    },

    "&:focus-within": {
      [ALL_CHILD_INPUTS_SELECTOR]: {
        borderColor: formControlVariants("active"),
      },

      "> .form-control-label, > label, > .form-control-prefix, > .form-control-suffix":
        {
          borderColor: formControlVariants("active"),
          color: formControlVariants("background-color-text", 0.7),
        },
    },
  },
});
