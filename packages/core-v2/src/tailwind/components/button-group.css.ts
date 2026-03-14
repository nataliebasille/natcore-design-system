import { component, dsl } from "@nataliebasille/natcore-css-engine";

const TOGGLES_SELECTOR = [
  "input[type='checkbox']",
  "input[type='radio']",
] as const;

const BUTTON_SELECTOR = ["button", "input[type='button']"] as const;

export default component("btn-group", {
  variants: {
    solid: {
      "--btn-first-child-border-radius": dsl.cssv`${dsl.cssvar("--radius-lg")} 0 0 ${dsl.cssvar("--radius-lg")}`,
      "--btn-last-child-border-radius": dsl.cssv`0 ${dsl.cssvar("--radius-lg")} ${dsl.cssvar("--radius-lg")} 0`,
      // "--bg": dsl.current(100),
      // "--fg": dsl.currentText(100),
      // "--btn-bg": "transparent",
      // "--btn-fg": dsl.currentText(100),
      // "--btn-bg-active": dsl.current(500),
      // "--btn-fg-active": dsl.currentText(500),
      // "--btn-bg-hover": dsl.current(300),
      // "--btn-fg-hover": dsl.currentText(300),
    },
  },

  styles: [
    "inline-flex",
    "rounded-lg",
    "cursor-pointer",
    {
      background: dsl.match.variable("--btn-bg"),
      color: dsl.match.variable("--btn-fg"),

      $: {
        [TOGGLES_SELECTOR.join(", ")]: ["hidden"],

        ["& > *"]: [
          "transition-all",
          "duration-250",
          "ease-in-out",
          {
            cursor: "inherit",
            "border-radius": dsl.match.variable("--btn-border-radius"),
            "padding-inline": dsl.cssvar("--btn-padding-inline"),
            "padding-block": dsl.cssvar("--btn-padding-block"),
            "background-color": dsl.match.variable("--btn-bg"),
            color: dsl.match.variable("--btn-fg"),

            $: {
              ["&:hover"]: {
                "background-color": dsl.match.variable("--btn-bg-hover"),
                color: dsl.match.variable("--btn-fg-hover"),
              },

              ["&:first-child"]: {
                "border-radius": dsl.match.variable(
                  "--btn-first-child-border-radius",
                ),
              },

              ["&:last-child"]: {
                "border-radius": dsl.match.variable(
                  "--btn-last-child-border-radius",
                ),
              },

              ["&:has(:checked)"]: {
                "background-color": dsl.match.variable("--btn-bg-active"),
                color: dsl.match.variable("--btn-fg-active"),
              },
            },
          },
        ],
      },
    },
  ],
});
