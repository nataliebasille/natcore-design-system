import { component, dsl } from "@nataliebasille/natcore-css-engine";

export default component("list", {
  variants: {
    default: {
      "--list-item-hover-bg": dsl.current(200),
      "--list-item-hover-fg": dsl.currentText(200),
      "--list-item-active-bg": dsl.current(500),
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

        [dsl.select.parent(":not(.list-disc):not(.list-decimal) > .list-item")]:
          {
            $: {
              [dsl.select.parent(":hover, &:focus")]: {
                background: dsl.cssvar("--list-item-hover-bg"),
                color: dsl.cssvar("--list-item-hover-fg"),
              },

              [dsl.select.parent(".active")]: {
                "background-color": dsl.cssvar("--list-item-active-bg"),
                color: dsl.cssvar("--list-item-active-fg"),

                $: {
                  [dsl.select.parent(":hover, &:focus")]: {
                    "background-color": dsl.cssvar("--list-item-active-bg"),
                    color: dsl.cssvar("--list-item-active-fg"),
                  },
                },
              },
            },
          },

        [dsl.select.parent(".list-disc .list-item, &.list-decimal .list-item")]:
          {
            "margin-left": "20px",
            padding: "0",
            "padding-right": "20px",
            "line-height": dsl.cssvar("--leading-tight"),
            cursor: "inherit",

            $: {
              [dsl.select.pseudo("before")]: {
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
              [dsl.select.parent(":hover, &:focus")]: {
                background: "inherit",
                color: "inherit",
              },
            },
          },

        [dsl.select.parent(".list-decimal")]: {
          "counter-reset": "list-counter",

          $: {
            [".list-item"]: {
              "counter-increment": "list-counter",

              $: {
                [dsl.select.pseudo("before")]: {
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
