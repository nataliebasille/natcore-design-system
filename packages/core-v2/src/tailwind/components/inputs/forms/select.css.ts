import { dsl, currentOrDefaultColor } from "@nataliebasille/css-engine";

const CHEVRON_SIZE = dsl.primitive.length.em(1);
export default dsl.layer.base(
  dsl.styleRule(dsl.select.element("select"), {
    appearance: "none",
    "background-image": `linear-gradient(45deg, transparent 45%, currentColor 45% 58%, transparent 58%), linear-gradient(135deg, transparent 45%, currentColor 45% 58%, transparent 58%);`,
    "background-position": `calc(100% - 1.15rem) 50%, calc(100% - 0.85rem) 50%`,
    "background-size": `0.35rem 0.35rem, 0.35rem 0.35rem`,
    "background-repeat": "no-repeat",
  }),

  dsl.supports(
    {
      appearance: "base-select",
    },

    dsl.styleRule("select", {
      appearance: "base-select",
      "background-image": "none",
    }),

    dsl.styleRule(
      "::picker(select)",
      "border",
      "rounded-md",
      "p-1",
      "cursor-pointer",
      {
        appearance: "base-select",
        color: currentOrDefaultColor({ role: "text", shade: 50 }, "surface"),
        "background-color": currentOrDefaultColor(
          { role: "base", shade: 50 },
          "surface",
        ),
        "border-color": currentOrDefaultColor(
          {
            role: "base",
            shade: 300,
          },
          "surface",
        ),
      },
    ),

    dsl.styleRule("::picker-icon", "self-center", {
      content: dsl.cssvar(
        "--select-chevron",
        dsl.cssvar("--select-chevron-surface"),
      ),
      "font-size": CHEVRON_SIZE,
      width: CHEVRON_SIZE,
      height: CHEVRON_SIZE,
    }),

    dsl.styleRule("option", "rounded-md", {
      "padding-block": dsl.primitive.length.rem(0.25),
      $: {
        "& + &": {
          "margin-top": dsl.primitive.length.rem(0.25),
        },
        "&:hover": {
          "background-color": currentOrDefaultColor(
            { role: "base", shade: 100 },
            "surface",
          ),
          color: currentOrDefaultColor({ role: "text", shade: 100 }, "surface"),
        },
        "&:checked": {
          "background-color": currentOrDefaultColor(
            { role: "base", shade: 200 },
            "surface",
          ),
          color: currentOrDefaultColor({ role: "text", shade: 100 }, "surface"),
        },
      },
    }),
    dsl.styleRule("option::checkmark", {
      content: '""',
    }),
  ),
);
