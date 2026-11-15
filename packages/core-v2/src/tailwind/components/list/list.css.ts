import { component, dsl } from "@nataliebasille/css-engine";

const module = component("list")
  .vars({
    "--item-padding": dsl.spacing("2"),
    "--item-padding-right": "0",
    "--item-margin-left": "0",
    "--item-cursor": "pointer",
    "--item-active-background": dsl.current(500),
    "--item-active-color": dsl.currentText(500),
    "--item-marker-content": '""',
    "--item-marker-display": "none",
    "--item-marker-font-size": "1.875rem",
    "--item-marker-top": "-12px",
    "--item-counter-reset": "none",
    "--item-counter-increment": "none",
    "--item-hover-background": dsl.current(200),
    "--item-hover-color": dsl.currentText(200),
  })
  .variant("disc", {
    "--item-padding": "0",
    "--item-padding-right": "20px",
    "--item-margin-left": "20px",
    "--item-cursor": "inherit",
    "--item-marker-content": '"•"',
    "--item-marker-display": "inline-block",
    "--item-counter-reset": "none",
    "--item-counter-increment": "none",
    "--item-hover-background": "inherit",
    "--item-hover-color": "inherit",
    "--item-active-background": "inherit",
    "--item-active-color": "inherit",
  })
  .variant("decimal", {
    "--item-padding": "0",
    "--item-padding-right": "20px",
    "--item-margin-left": "20px",
    "--item-cursor": "inherit",
    "--item-marker-content": 'counter(list-counter) "."',
    "--item-marker-display": "inline-block",
    "--item-marker-font-size": "1rem",
    "--item-marker-top": "0px",
    "--item-counter-reset": "list-counter",
    "--item-counter-increment": "list-counter",
    "--item-hover-background": "inherit",
    "--item-hover-color": "inherit",
    "--item-active-background": "inherit",
    "--item-active-color": "inherit",
  })
  .slot("item", "data-attr")
  .optionalVariants()
  .body(({ slot }) => [
    "flex",
    "flex-col",
    "gap-2",
    {
      padding: "0",
      margin: "0",
      "list-style": "none",
      "counter-reset": dsl.cssvar("--item-counter-reset"),

      $: {
        [`> ${slot("item")}`]: [
          "block",
          "w-full",
          {
            padding: dsl.cssvar("--item-padding"),
            "padding-right": dsl.cssvar("--item-padding-right"),
            margin: "0",
            "margin-left": dsl.cssvar("--item-margin-left"),
            cursor: dsl.cssvar("--item-cursor"),
            "border-radius": dsl.cssvar("--radius-lg"),
            "line-height": dsl.cssvar("--leading-tight"),
            "counter-increment": dsl.cssvar("--item-counter-increment"),

            $: {
              [dsl.select.parent(":hover, &:focus")]: {
                background: dsl.cssvar("--item-hover-background"),
                color: dsl.cssvar("--item-hover-color"),
              },

              [dsl.select.parent(".active")]: {
                "background-color": dsl.cssvar("--item-active-background"),
                color: dsl.cssvar("--item-active-color"),

                $: {
                  [dsl.select.parent(":hover, &:focus")]: {
                    "background-color": dsl.cssvar("--item-active-background"),
                    color: dsl.cssvar("--item-active-color"),
                  },
                },
              },

              [dsl.select.parent("::before")]: {
                content: dsl.cssvar("--item-marker-content"),
                display: dsl.cssvar("--item-marker-display"),
                "font-size": dsl.cssvar("--item-marker-font-size"),
                "padding-right": "0.5rem",
                "margin-left": "-20px",
                width: "20px",
                height: "20px",
                position: "relative",
                top: dsl.cssvar("--item-marker-top"),
                "vertical-align": "top",
              },
            },
          },
        ],
      },
    },
  ]);

export default module;
