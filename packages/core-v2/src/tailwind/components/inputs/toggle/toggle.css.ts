import {
  component,
  component_deprecated,
  dsl,
  theme,
  type Selector,
} from "@nataliebasille/css-engine";

const THUMB_SELECTOR = (thumbSelector: Selector) =>
  dsl.select.list("&::before", `& > ${thumbSelector}`);
const TOGGLE_ON_CONDITION =
  ":has(input:checked), [aria-checked='true'], .toggle-active" as const;
const CHECKED_SELECTOR = `&:is(${TOGGLE_ON_CONDITION})` as const;
const UNCHECKED_SELECTOR = `&:not(:is(${TOGGLE_ON_CONDITION}))` as const;

export default component("toggle")
  .vars({
    "--h": dsl.primitive.length.rem(1.75),
    "--p": dsl.calc`${dsl.cssvar("--h")} * ${dsl.primitive.number(0.125)}`,
  })
  .variant("solid", {
    "--track": dsl.current(600),
    "--thumb": dsl.currentText(600),
    "--thumb-fg": dsl.current(600),
    "--border": dsl.current(600),
  })
  .variant("soft", {
    "--track": dsl.current(200),
    "--thumb": dsl.current(700),
    "--thumb-fg": dsl.currentText(700),
    "--border": dsl.current(300),
  })
  .variant("ghost", {
    "--track": dsl.current(100, 0.3),
    "--thumb": dsl.current(600, 0.8),
    "--thumb-fg": dsl.currentText(600),
    "--border": dsl.current(400, 0.8),
  })
  .variant("outline", {
    "--track": dsl.current(50),
    "--thumb": dsl.current(400),
    "--thumb-fg": dsl.currentText(400),
    "--border": dsl.current(500),
  })
  .slot("thumb", "data-attr")
  .guard("on", TOGGLE_ON_CONDITION)
  .guard("off", UNCHECKED_SELECTOR)
  .body(({ slot }) => [
    "inline-block",
    "relative",
    "cursor-pointer",
    "rounded-full",
    "transition-all",
    "aspect-[2/1]",
    "border",
    dsl.cssv`h-[${dsl.cssvar("--h")}]`,
    dsl.cssv`p-[${dsl.cssvar("--p")}]`,
    {
      "background-color": dsl.cssvar("--track"),
      "border-color": dsl.cssvar("--border"),
      $: {
        [UNCHECKED_SELECTOR]: ["palette-disabled"],

        ["input[type='checkbox']"]: ["sr-only"],

        [`&:not(:has(${slot("thumb")}))`]: {
          $: {
            "&::before": {
              content: '""',
            },
          },
        },

        [THUMB_SELECTOR(slot("thumb"))]: [
          "block",
          "rounded-full",
          "aspect-square",
          "h-full",
          "transition-all",
          {
            "background-color": dsl.cssvar("--thumb"),
            color: dsl.cssvar("--thumb-fg"),
          },
        ],

        [CHECKED_SELECTOR]: {
          $: {
            [THUMB_SELECTOR(slot("thumb"))]: {
              transform: dsl.translateX(dsl.cssvar("--h")),
            },
          },
        },
      },
    },
  ]);
