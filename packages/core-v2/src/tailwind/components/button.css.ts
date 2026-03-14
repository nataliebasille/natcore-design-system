import {
  component,
  dsl,
  theme,
  utility,
} from "@nataliebasille/natcore-css-engine";

const solid = {
  "--bg": dsl.current(800),
  "--fg": dsl.currentText(800),
  "--hover-bg": dsl.current(700),
  "--hover-fg": dsl.currentText(700),
  "--active-bg": dsl.current(500),
  "--active-fg": dsl.currentText(500),
  "--border-color": dsl.current(700),
} as const;
const soft = {
  "--bg": dsl.current(300),
  "--fg": dsl.currentText(300),
  "--hover-bg": dsl.current(200),
  "--hover-fg": dsl.currentText(200),
  "--active-bg": dsl.current(100),
  "--active-fg": dsl.currentText(100),
  "--border-color": dsl.current(300),
} as const;
const outline = {
  "--bg": dsl.cssvar("--tone-current-bg"),
  "--fg": dsl.cssvar("--tone-current-fg"),
  "--hover-bg": dsl.current(100, 0.4),
  "--hover-fg": dsl.currentText(100),
  "--active-bg": dsl.current(100),
  "--active-fg": dsl.currentText(100),
  "--border-color": dsl.current(500),
} as const;
const ghost = {
  "--bg": "transparent",
  "--fg": dsl.cssvar("--tone-current-fg"),
  "--hover-bg": dsl.current(500, 0.1),
  "--hover-fg": dsl.cssvar("--tone-current-fg"),
  "--border-color": "transparent",
  "--active-hover-fg": dsl.colorMix(
    "srgb",
    { color: dsl.cssvar("--tone-current-fg") },
    {
      color: dsl.current(800),
      percentage: dsl.primitive.percentage(90),
    },
  ),
  "--hover-border-color": dsl.current(500, 0.2),
  "--box-shadow-focus": dsl.cssv`0 0 0 3px ${dsl.cssvar("--color-gray-300")}`,
} as const;

const TOGGLES_SELECTOR = [
  "input[type='checkbox']",
  "input[type='radio']",
] as const;

export default [
  theme("inline", {
    "--btn-padding-inline": dsl.cssvar(
      "--btn-px-override",
      dsl.cssvar("--btn-px", dsl.cssvar("--btn-px-md")),
    ),

    "--btn-padding-block": dsl.cssvar(
      "--btn-py-override",
      dsl.cssvar("--btn-py", dsl.cssvar("--btn-py-md")),
    ),
  }),
  component("btn", {
    variants: {
      solid,
      soft,
      outline,
      ghost,
    },
    styles: [
      ...buttonStyles(),
      {
        $: {
          [dsl.select.parent(dsl.select.pseudo("active"))]: {
            transform: dsl.cssv`scale(${dsl.primitive.number(0.98)})`,
          },
        },
      },
    ],
  }),

  component("btn-group", {
    variants: {
      solid,
      soft,
      outline,
      ghost: {
        ...ghost,
        "--border-radius": dsl.cssvar("--radius-lg"),
        "--border-inline-width-first-child": dsl.primitive.length.px(1),
        "--border-inline-width-last-child": dsl.primitive.length.px(1),
        "--border-inline-width-not-first-last-child":
          dsl.primitive.length.px(1),
      },
    },
    styles: [
      "inline-flex",

      {
        $: {
          [TOGGLES_SELECTOR.join(", ")]: ["hidden"],

          ["& > *"]: [
            ...buttonStyles(),
            {
              $: {
                ["&:hover"]: {
                  "background-color": dsl.match.variable("--hover-bg"),
                  color: dsl.match.variable("--hover-fg"),
                },

                ["&:first-child"]: [
                  "rounded-r-none",
                  "border-r-0",
                  {
                    "border-radius": dsl.match.variable("--border-radius"),
                    "border-inline-width": dsl.match.variable(
                      "--border-inline-width-first-child",
                    ),
                  },
                ],
                ["&:last-child"]: [
                  "rounded-l-none",
                  "border-l-0",
                  {
                    "border-radius": dsl.match.variable("--border-radius"),
                    "border-inline-width": dsl.match.variable(
                      "--border-inline-width-last-child",
                    ),
                  },
                ],
                ["&:not(:first-child):not(:last-child)"]: [
                  "rounded-none",
                  "border-x-0",
                  {
                    "border-radius": dsl.match.variable("--border-radius"),
                    "border-inline-width": dsl.match.variable(
                      "--border-inline-width-not-first-last-child",
                    ),
                  },
                ],
                ["&:has(:checked)"]: {
                  "background-color": dsl.match.variable("--active-bg"),
                  color: dsl.match.variable("--active-fg"),
                },
              },
            },
          ],
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

function buttonStyles() {
  return [
    "cursor-pointer",
    "rounded-lg",
    "border",
    "transition-all",
    "duration-250",
    "ease-in-out",

    {
      "padding-inline": dsl.cssvar("--btn-padding-inline"),
      "padding-block": dsl.cssvar("--btn-padding-block"),

      "background-color": dsl.match.variable(`--bg`),
      color: dsl.match.variable(`--fg`),
      "border-color": dsl.match.variable("--border-color"),

      $: {
        [dsl.select.parent(dsl.select.pseudo("hover"))]: {
          "background-color": dsl.match.variable(`--hover-bg`),
          color: dsl.match.variable(`--hover-fg`),
          "border-color": dsl.match.variable("--hover-border-color"),
        },
      },
    },
  ];
}
