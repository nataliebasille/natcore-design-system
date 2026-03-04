import { component, dsl } from "@nataliebasille/natcore-css-engine";
import { currentBaseColor } from "../../shared/colors";

export default component("list", {
  themeable: "primary",
  variants: {
    default: {
      "--list-item-hover-bg": currentBaseColor(200),
      "--list-item-hover-fg": dsl.currentText(200),
      "--list-item-active-bg": currentBaseColor(500),
      "--list-item-active-fg": dsl.currentText(500),
    },
  },
  styles: [
    "flex",
    "flex-col",
    "gap-2",
    {
      padding: "0",
      margin: "0",
      "list-style": "none",

      $: {
        ["> .list-item"]: {
          display: "block",
          padding: `${dsl.spacing("2")}`,
          margin: "0",
          cursor: "pointer",
          width: "100%",
          "border-radius": dsl.cssvar("--radius-lg"),
          "line-height": dsl.cssvar("--leading-tight"),
        },

        [dsl.parent(":not(.list-disc):not(.list-decimal) > .list-item")]: {
          $: {
            [dsl.parent(":hover, &:focus")]: {
              background: dsl.cssvar("--list-item-hover-bg"),
              color: dsl.cssvar("--list-item-hover-fg"),
            },

            [dsl.parent(".active")]: {
              "background-color": dsl.cssvar("--list-item-active-bg"),
              color: dsl.cssvar("--list-item-active-fg"),

              $: {
                [dsl.parent(":hover, &:focus")]: {
                  "background-color": dsl.cssvar("--list-item-active-bg"),
                  color: dsl.cssvar("--list-item-active-fg"),
                },
              },
            },
          },
        },

        [dsl.parent(".list-disc .list-item, &.list-decimal .list-item")]: {
          "margin-left": "20px",
          padding: "0",
          "padding-right": "20px",
          "line-height": dsl.cssvar("--leading-tight"),
          cursor: "inherit",

          $: {
            [dsl.pseudo("before")]: {
              content: '"•"',
              display: "inline-block",
              "font-size": "1.875rem",
              "padding-right": "0.5rem",
              "margin-left": "-20px",
              width: "20px",
              height: "20px",
              position: "relative",
              top: "-12px",
              "vertical-align": "top",
            },
            [dsl.parent(":hover, &:focus")]: {
              background: "inherit",
              color: "inherit",
            },
          },
        },

        [dsl.parent(".list-decimal")]: {
          "counter-reset": "list-counter",

          $: {
            [".list-item"]: {
              "counter-increment": "list-counter",

              $: {
                [dsl.pseudo("before")]: {
                  content: 'counter(list-counter) "."',
                  "font-size": "1rem",
                  top: "0px",
                },
              },
            },
          },
        },
      },
    },
  ],
});
