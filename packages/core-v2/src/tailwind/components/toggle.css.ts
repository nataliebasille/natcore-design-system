import { component, dsl, theme } from "@nataliebasille/natcore-css-engine";

const THUMB_SELECTOR = dsl.select.list("&::before", "& > .toggle-thumb");
const TOGGLE_ON_CONDITION =
  ":has(input:checked), [aria-checked='true'], .toggle-active" as const;
const CHECKED_SELECTOR = `&:is(${TOGGLE_ON_CONDITION})` as const;
const UNCHECKED_SELECTOR = `&:not(:is(${TOGGLE_ON_CONDITION}))` as const;
export default [
  theme({
    "--toggle-h": dsl.primitive.length.rem(1.75),
    "--toggle-p": dsl.calc`${dsl.cssvar("--toggle-h")} * ${dsl.primitive.number(0.125)}`,
  }),
  component("toggle", {
    variants: {
      solid: {
        "--track": dsl.current(600),
        "--thumb": dsl.currentText(600),
        "--thumb-fg": dsl.current(600),
        "--border": dsl.current(600),
      },

      soft: {
        "--track": dsl.current(200),
        "--thumb": dsl.current(700),
        "--thumb-fg": dsl.currentText(700),
        "--border": dsl.current(300),
      },

      ghost: {
        "--track": dsl.current(100, 0.3),
        "--thumb": dsl.current(600, 0.8),
        "--thumb-fg": dsl.currentText(600),
        "--border": dsl.current(400, 0.8),
      },

      outline: {
        "--track": dsl.current(50),
        "--thumb": dsl.current(400),
        "--thumb-fg": dsl.currentText(400),
        "--border": dsl.current(500),
      },
    },
    styles: [
      "inline-block",
      "relative",
      "cursor-pointer",
      "rounded-full",
      "transition-all",
      "aspect-[2/1]",
      "border",
      dsl.cssv`h-[${dsl.cssvar("--toggle-h")}]`,
      dsl.cssv`p-[${dsl.cssvar("--toggle-p")}]`,
      {
        "background-color": dsl.match.variable("--track"),
        "border-color": dsl.match.variable("--border"),
        $: {
          [UNCHECKED_SELECTOR]: ["palette-disabled"],

          ["input[type='checkbox']"]: ["sr-only"],

          ["&:not(:has(.toggle-thumb))"]: {
            $: {
              "&::before": {
                content: '""',
              },
            },
          },

          [THUMB_SELECTOR]: [
            "block",
            "rounded-full",
            "aspect-square",
            "h-full",
            "transition-all",
            {
              "background-color": dsl.match.variable("--thumb"),
              color: dsl.match.variable("--thumb-fg"),
            },
          ],

          [CHECKED_SELECTOR]: {
            $: {
              [THUMB_SELECTOR]: {
                transform: dsl.translateX(dsl.cssvar("--toggle-h")),
              },
            },
          },
        },
      },
    ],
  }),
  dsl.atRule("custom-variant", `toggle-on (${CHECKED_SELECTOR})`),
  dsl.atRule("custom-variant", `toggle-off (${UNCHECKED_SELECTOR})`),
];
