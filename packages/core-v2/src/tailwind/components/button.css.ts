import {
  component,
  dsl,
  theme,
  utility,
} from "@nataliebasille/natcore-css-engine";

export default [
  component("btn", {
    variants: {
      solid: {
        "--btn-bg": dsl.current(500),
        "--btn-fg": dsl.currentText(500),
        "--btn-hover-bg": dsl.current(900),
        "--btn-hover-fg": dsl.currentText(900),
      },
      outline: {
        "--btn-bg": "transparent",
        "--btn-fg": dsl.current(500),
        "--btn-border-color": dsl.current(500),
        "--btn-hover-bg": dsl.current(50),
        "--btn-hover-fg": dsl.currentText(50),
      },
      ghost: {
        "--btn-bg": "transparent",
        "--btn-hover-bg": dsl.current(500, 0.1),
        "--btn-fg": dsl.cssvar("--tone-current-fg"),
        "--btn-border-color": "transparent",
        "--btn-hover-fg": dsl.colorMix(
          "srgb",
          { color: dsl.cssvar("--tone-current-fg") },
          {
            color: dsl.current(800),
            percentage: dsl.primitive.percentage(90),
          },
        ),
        "--btn-hover-border-color": dsl.current(500, 0.2),
        "--btn-box-shadow-focus": dsl.cssv`0 0 0 3px ${dsl.cssvar("--color-gray-300")}`,
      },
    },
    styles: [
      "cursor-pointer",
      "rounded-lg",
      "border",
      "transition-all",
      "duration-250",
      "ease-in-out",

      {
        "padding-inline": dsl.cssvar(
          "--btn-px-override",
          dsl.cssvar("--btn-px", dsl.cssvar("--btn-px-md")),
        ),
        "padding-block": dsl.cssvar(
          "--btn-py-override",
          dsl.cssvar("--btn-py", dsl.cssvar("--btn-py-md")),
        ),

        "background-color": dsl.match.variable("--btn-bg"),
        "border-color": dsl.match.variable("--btn-border-color"),
        color: dsl.match.variable("--btn-fg"),

        $: {
          [dsl.select.parent(dsl.select.pseudo("hover"))]: {
            "background-color": dsl.match.variable("--btn-hover-bg"),
            color: dsl.match.variable("--btn-hover-fg"),
            "border-color": dsl.match.variable("--btn-hover-border-color"),
          },

          [dsl.select.parent(dsl.select.pseudo("active"))]: {
            transform: dsl.cssv`scale(${dsl.primitive.number(0.98)})`,
          },
        },
      },
    ],
  }),

  utility(
    "btn-size",
    theme({
      "--btn-px-sm": dsl.primitive.length.em(0.75),
      "--btn-py-sm": dsl.primitive.length.em(0.5),
      "--btn-px-md": dsl.primitive.length.em(1),
      "--btn-py-md": dsl.primitive.length.em(0.75),
      "--btn-px-lg": dsl.primitive.length.em(1.25),
      "--btn-py-lg": dsl.primitive.length.em(1),
    }),
    {
      "--btn-px": dsl.match.variable("--btn-px"),
      "--btn-py": dsl.match.variable("--btn-py"),
      "font-size": dsl.match.variable("--text"),
    },
  ),

  utility(
    "btn-icon",
    {
      "--btn-px-override": dsl.min(
        dsl.cssvar("--btn-px", dsl.cssvar("--btn-px-md")),
        dsl.cssvar("--btn-py", dsl.cssvar("--btn-py-md")),
      ),

      "--btn-py-override": dsl.cssvar("--btn-px-override"),
    },

    "aspect-square",
    "rounded-full",
  ),
];
