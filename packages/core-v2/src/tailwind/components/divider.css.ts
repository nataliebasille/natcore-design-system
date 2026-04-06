import {
  component,
  dsl,
  theme,
  utility,
} from "@nataliebasille/css-engine";

const COLOR = dsl.current(500);

export default [
  component("divider", {
    variants: {
      default: {
        "--margin-inline-before": `0 ${dsl.spacing("2")}`,
        "--margin-inline-after": `${dsl.spacing("2")} 0`,
        "--margin-inline-no-content": "0",
      },

      v: {
        "--flex-direction": "column",
        "--margin-block-before": `0 ${dsl.spacing("2")}`,
        "--margin-block-after": `${dsl.spacing("2")} 0`,
        "--margin-block-no-content": "0",
      },
    },
    styles: [
      "flex",
      "items-center",
      "tracking-wide",
      "font-bold",
      {
        "--divider-before-flex": dsl.primitive.percentage(50),
        "--divider-after-flex": dsl.calc`${dsl.primitive.percentage(100)} - ${dsl.cssvar("--divider-before-flex")}`,
        "flex-direction": dsl.match.variable("--flex-direction"),
        color: COLOR,

        $: {
          [dsl.select.list(
            dsl.select.parent("::before"),
            dsl.select.parent("::after"),
          )]: {
            content: '""',
            height: "1px",
            "background-color": COLOR,
          },
          [dsl.select.parent(":empty::after")]: {
            "margin-inline": dsl.match.variable("--margin-inline-no-content"),
            "margin-block": dsl.match.variable("--margin-block-no-content"),
          },
          [dsl.select.parent(":empty::before")]: {
            "margin-inline": dsl.match.variable("--margin-inline-no-content"),
            "margin-block": dsl.match.variable("--margin-block-no-content"),
          },
          [dsl.select.parent("::before")]: {
            flex: dsl.cssvar("--divider-before-flex", "1"),
            "margin-inline": dsl.match.variable("--margin-inline-before"),
            "margin-block": dsl.match.variable("--margin-block-before"),
          },
          [dsl.select.parent("::after")]: {
            flex: dsl.cssvar("--divider-after-flex", "1"),
            "margin-inline": dsl.match.variable("--margin-inline-after"),
            "margin-block": dsl.match.variable("--margin-block-after"),
          },
        },
      },
    ],
  }),

  utility(
    "divider-place-content",
    theme({
      "--divider-place-content-before-start": dsl.primitive.percentage(0),
      "--divider-place-content-before-center": dsl.primitive.percentage(50),
      "--divider-place-content-before-end": dsl.primitive.percentage(100),
    }),
    {
      "--divider-before-flex": [
        dsl.match.oneOf(
          dsl.match.variable("--divider-place-content-before"),
          dsl.match.bare.percentage(),
          dsl.match.arbitraryPercentage(),
        ),
        dsl.calc`${dsl.match.oneOf(
          dsl.match.bare.integer(),
          dsl.match.bare.number(),
          dsl.match.arbitraryNumber(),
        )} * ${dsl.primitive.percentage(1)}`,
        dsl.calc`${dsl.match.bare.ratio()} * ${dsl.primitive.percentage(100)}`,
      ],
    },
  ),
];
