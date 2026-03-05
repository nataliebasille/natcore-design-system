import { component, dsl } from "@nataliebasille/natcore-css-engine";

const allSiblingInputs = "~ input, ~ select, ~ textarea";
const allChildInputs = "> input, > select, > textarea";

export default component("form-control", {
  themeable: "surface",
  variants: {
    default: {
      "--form-control-bg": dsl.current(100),
      "--form-control-fg": dsl.currentText(100),
      "--form-control-border": dsl.current(300),
      "--form-control-active": dsl.current(700),
    },
  },
  styles: {
    transition: "all 0.2s ease-in-out",
    display: "grid",
    "grid-template-areas":
      '"label label label" "prefix input suffix" "hint hint hint"',
    "grid-template-columns": "max-content 1fr max-content",

    $: {
      ["> .form-control-label, > label, > .form-control-hint"]: {
        "font-size": ".75rem",
      },

      ["> .form-control-label, > label, > .form-control-prefix, > .form-control-suffix"]:
        {
          transition: "all 0.2s ease-in-out",
          "background-color": dsl.cssvar("--form-control-bg"),
          "border-color": dsl.cssvar("--form-control-border"),
          "font-weight": dsl.cssvar("--font-weight-medium"),
          color: dsl.colorMix(
            "srgb",
            {
              color: dsl.cssvar("--form-control-fg"),
              percentage: dsl.primitive.percentage(50),
            },
            { color: dsl.primitive.color.transparent() },
          ),
        },

      ["> .form-control-label, > label"]: {
        "grid-area": "label",
        "padding-left": "1.33333em",
        "padding-right": "2em",
        "border-style": "solid",
        "border-width": "1px",
        "border-bottom": "none",
        "border-top-left-radius": dsl.cssvar("--radius-md"),
        "border-top-right-radius": dsl.cssvar("--radius-md"),
        "padding-top": ".25em",

        $: {
          [allSiblingInputs]: {
            "border-top-left-radius": "0",
            "border-top-right-radius": "0",
            "border-top-style": "none",
            "padding-top": ".25em",
          },
          ["~ .form-control-prefix, ~ .form-control-suffix"]: {
            "border-top-style": "none",
            "border-top-left-radius": "0",
            "border-top-right-radius": "0",
          },
        },
      },

      [allChildInputs]: {
        "grid-area": "input",
        outline: "none",
        transition: "all 0.2s ease-in-out",
        "background-color": dsl.cssvar("--form-control-bg"),
        color: dsl.cssvar("--form-control-fg"),
        "border-color": dsl.cssvar("--form-control-border"),

        $: {
          [dsl.select.parent(":has(~ .form-control-suffix)")]: {
            "border-top-right-radius": "0",
            "border-bottom-right-radius": "0",
            "border-right": "none",
            "padding-right": ".25em",
          },
        },
      },

      ["> .form-control-hint"]: {
        "grid-area": "hint",
        "padding-left": "1.33333em",
      },

      [dsl.select.parent(".form-control-error")]: {
        $: {
          ["> .form-control-label, > label, > input, > select, > textarea, > .form-control-prefix, > .form-control-suffix"]:
            {
              "border-color": dsl.cssvar("--color-tone-600"),
            },
          ["> .form-control-label, > label, > .form-control-hint, > .form-control-prefix, > .form-control-suffix"]:
            {
              color: dsl.cssvar("--color-tone-600"),
            },
        },
      },

      ["> .form-control-prefix"]: {
        "grid-area": "prefix",
        display: "flex",
        "align-items": "center",
        "border-top-style": "solid",
        "border-top-width": "1px",
        "border-left-style": "solid",
        "border-left-width": "1px",
        "border-bottom-style": "solid",
        "border-bottom-width": "1px",
        "border-top-left-radius": dsl.cssvar("--radius-md"),
        "border-bottom-left-radius": dsl.cssvar("--radius-md"),
        "padding-left": ".25em",
        $: {
          [allSiblingInputs]: {
            "border-top-left-radius": "0",
            "border-bottom-left-radius": "0",
            "border-left": "none",
            "padding-left": ".25em",
          },
        },
      },

      ["> .form-control-suffix"]: {
        "grid-area": "suffix",
        display: "flex",
        "align-items": "center",
        "border-top-style": "solid",
        "border-top-width": "1px",
        "border-bottom-style": "solid",
        "border-bottom-width": "1px",
        "border-right-style": "solid",
        "border-right-width": "1px",
        "border-top-right-radius": dsl.cssvar("--radius-md"),
        "border-bottom-right-radius": dsl.cssvar("--radius-md"),
        "padding-right": ".25em",
      },

      [dsl.select.parent(":focus-within")]: {
        $: {
          [allChildInputs]: {
            "border-color": dsl.cssvar("--form-control-active"),
          },
          ["> .form-control-label, > label, > .form-control-prefix, > .form-control-suffix"]:
            {
              "border-color": dsl.cssvar("--form-control-active"),
              color: dsl.colorMix(
                "srgb",
                {
                  color: dsl.cssvar("--form-control-fg"),
                  percentage: dsl.primitive.percentage(70),
                },
                { color: dsl.primitive.color.transparent() },
              ),
            },
        },
      },
    },
  },
});
