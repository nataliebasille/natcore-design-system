import { css, dsl } from "@nataliebasille/natcore-css-engine";

export default dsl.component("btn", {
  vars: {
    "size-base": dsl.cssvar("--text-base"),
    "size-line-height-base": dsl.cssvar("--text-base-line-height-base"),
    "padding-x": "1em",
    "padding-y": "0.75em",
  },

  base: {
    "@apply": [
      dsl.cssv`px-${dsl.cssvar("padding-x")}`,
      dsl.cssv`py-${dsl.cssvar("padding-y")}`,
      dsl.cssv`text-${dsl.cssvar("size-base")}/${dsl.cssvar("size-line-height-base")}`,
      "tracking-wider",
      "rounded-lg",
      "border-1",
      "border-solid",
      "transition-all",
      "ease-in-out",
      "duration-[250ms]",
    ],

    "background-color": dsl.color("500"),
    color: dsl.color("500-text"),

    $: {
      [dsl.parent(dsl.pseudo("hover"))]: {
        "background-color": dsl.color("900"),
      },

      [dsl.parent(dsl.pseudo("active"))]: {
        transform: "scale(0.95)",
      },
    },
  },

  variants: {
    filled: {},

    ghost: {
      "background-color": dsl.color("500", 0.2),
      color: dsl.color("700"),
      borderColor: dsl.color("500", 0.8),

      $: {
        [dsl.parent(dsl.pseudo("hover"))]: {
          "background-color": dsl.color("500", 0.4),
          color: dsl.color("700"),
          borderColor: dsl.color("500"),
        },

        [dsl.parent(dsl.pseudo("focus"))]: {
          "@apply": ["ring-2", "ring-gray-300"],
        },
      },
    },

    outline: {
      color: dsl.color("500"),
      borderColor: dsl.color("500"),
      "background-color": "transparent",

      $: {
        [dsl.parent(dsl.pseudo("hover"))]: {
          "background-color": dsl.color("100"),
        },
      },
    },
  },
});
