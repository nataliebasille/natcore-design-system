import { component, dsl, theme, utility } from "@nataliebasille/css-engine";

const TOGGLES_SELECTOR = [
  "input[type='checkbox']",
  "input[type='radio']",
] as const;

const BUTTON_SIZE_DEFAULT = dsl.primitive.length.rem(1);

const module = component("btn")
  .vars({
    "--size": BUTTON_SIZE_DEFAULT,
    "--px": dsl.calc`${dsl.cssvar("--size")} * 0.8`,
    "--py": dsl.calc`${dsl.cssvar("--size")} * 0.5`,
    "--gap": dsl.calc`${dsl.cssvar("--size")} * 0.2`,
  })
  .controlled(
    "--size",
    {
      sm: dsl.primitive.length.rem(0.75),
      md: BUTTON_SIZE_DEFAULT,
      lg: dsl.primitive.length.rem(1.25),
    },
    dsl.match.arbitrary.length(),
  )
  .variant("solid", {
    "--bg": dsl.current(800),
    "--fg": dsl.currentText(800),
    "--hover-bg": dsl.current(700),
    "--hover-fg": dsl.currentText(700),
    "--active-bg": dsl.current(500),
    "--active-fg": dsl.currentText(500),
    "--border-color": dsl.current(700),
  })
  .variant("soft", {
    "--bg": dsl.current(300),
    "--fg": dsl.currentText(300),
    "--hover-bg": dsl.current(200),
    "--hover-fg": dsl.currentText(200),
    "--active-bg": dsl.current(100),
    "--active-fg": dsl.currentText(100),
    "--border-color": dsl.current(300),
  })
  .variant("outline", {
    "--bg": dsl.cssvar("--tone-current-bg"),
    "--fg": dsl.cssvar("--tone-current-fg"),
    "--hover-bg": dsl.current(100, 0.4),
    "--hover-fg": dsl.currentText(100),
    "--active-bg": dsl.current(100),
    "--active-fg": dsl.currentText(100),
    "--border-color": dsl.current(500),
  })
  .variant("ghost", {
    "--bg": "transparent",
    "--fg": dsl.cssvar("--tone-current-fg"),
    "--hover-bg": dsl.current(500, 0.1),
    "--hover-fg": dsl.cssvar("--tone-current-fg"),
    "--border-color": "transparent",
    "--active-bg": dsl.current(500, 0.2),
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
  })
  .body(...buttonStyles(), {
    $: {
      [dsl.select.parent(dsl.select.pseudo("active"))]: {
        transform: dsl.cssv`scale(${dsl.primitive.number(0.98)})`,
      },
    },
  })
  .utility(
    "icon",
    {
      "--px": dsl.calc`${dsl.cssvar("--size")} * 0.5`,
      "--py": dsl.calc`${dsl.cssvar("--size")} * 0.5`,
    },

    "aspect-square",
    "rounded-full",
  )
  .derive("group", (child) =>
    child
      .variant("ghost", {
        "--border-radius": dsl.cssvar("--radius-lg"),
        "--border-inline-width-first-child": dsl.primitive.length.px(1),
        "--border-inline-width-last-child": dsl.primitive.length.px(1),
        "--border-inline-width-not-first-last-child":
          dsl.primitive.length.px(1),
      })
      .defaultVariant("outline")
      .body("inline-flex", {
        $: {
          [TOGGLES_SELECTOR.join(", ")]: ["hidden"],

          ["& > *"]: [
            ...buttonStyles(),
            {
              $: {
                ["&:hover"]: {
                  "background-color": dsl.cssvar("--hover-bg"),
                  color: dsl.cssvar("--hover-fg"),
                },

                ["&:first-child"]: [
                  "rounded-r-none",
                  "border-r-0",
                  {
                    "border-radius": dsl.cssvar("--border-radius"),
                    "border-inline-width": dsl.cssvar(
                      "--border-inline-width-first-child",
                    ),
                  },
                ],
                ["&:last-child"]: [
                  "rounded-l-none",
                  "border-l-0",
                  {
                    "border-radius": dsl.cssvar("--border-radius"),
                    "border-inline-width": dsl.cssvar(
                      "--border-inline-width-last-child",
                    ),
                  },
                ],
                ["&:not(:first-child):not(:last-child)"]: [
                  "rounded-none",
                  "border-x-0",
                  {
                    "border-radius": dsl.cssvar("--border-radius"),
                    "border-inline-width": dsl.cssvar(
                      "--border-inline-width-not-first-last-child",
                    ),
                  },
                ],
                ["&:has(:checked)"]: {
                  "background-color": dsl.cssvar("--active-bg"),
                  color: dsl.cssvar("--active-fg"),
                },
              },
            },
          ],
        },
      }),
  );

function buttonStyles() {
  return [
    "cursor-pointer",
    "rounded-lg",
    "border",
    "transition-all",
    "duration-250",
    "ease-in-out",

    {
      "font-size": dsl.cssvar("--size"),
      "padding-inline": dsl.cssvar("--px"),
      "padding-block": dsl.cssvar("--py"),
      gap: dsl.cssvar("--gap"),

      "background-color": dsl.cssvar(`--bg`),
      color: dsl.cssvar(`--fg`),
      "border-color": dsl.cssvar("--border-color"),

      $: {
        [dsl.select.parent(dsl.select.pseudo("hover"))]: {
          "background-color": dsl.cssvar(`--hover-bg`),
          color: dsl.cssvar(`--hover-fg`),
          "border-color": dsl.cssvar("--hover-border-color"),
        },
      },
    },
  ] as const;
}

export default module;
