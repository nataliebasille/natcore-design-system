import { component, dsl } from "@nataliebasille/natcore-css-engine";

export default component("radio-group", {
  themeable: "surface",
  variants: {
    default: {
      "--radio-group-border": dsl.current(300),
      "--radio-group-hover": dsl.current(200),
      "--radio-group-active": dsl.current(500),
      "--radio-group-active-fg": dsl.currentText(500),
    },
  },
  styles: [
    "flex",
    "w-fit",
    "gap-1",
    {
      padding: "0.125rem",
      "border-style": "solid",
      "border-width": "2px",
      "border-color": dsl.cssvar("--radio-group-border"),
      "border-radius": dsl.cssvar("--radius-full"),

      $: {
        ['input[type="radio"]']: {
          display: "none",
        },

        ["> label"]: {
          display: "inline-flex",
          "align-items": "center",
          "justify-content": "center",
          "min-height": "2rem",
          padding: `${dsl.spacing("2")} ${dsl.spacing("4")}`,
          "font-size": dsl.cssvar("--text-sm"),
          transition: "all 0.2s ease-in-out",
          cursor: "pointer",
          "border-radius": dsl.cssvar("--radius-full"),

          $: {
            [dsl.select.parent(":hover")]: {
              "background-color": dsl.cssvar("--radio-group-hover"),
            },
          },
        },

        ['input[type="radio"]:checked + label']: {
          "background-color": dsl.cssvar("--radio-group-active"),
          color: dsl.cssvar("--radio-group-active-fg"),
        },

        ['input[type="radio"]:active + label']: {
          transform: "scale(0.95)",
        },

        ['input[type="radio"]:disabled + label']: {
          opacity: "0.5",
          cursor: "not-allowed",
          "background-color": "transparent",
        },
      },
    },
  ],
});
