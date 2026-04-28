import {
  component,
  component_deprecated,
  dsl,
  theme,
  utility,
} from "@nataliebasille/css-engine";

const COLOR = dsl.current(500);

export default component("divider")
  .vars({
    "--place-content": dsl.primitive.percentage(50),
    "--margin-inline-before": `0 ${dsl.spacing("2")}`,
    "--margin-inline-after": `${dsl.spacing("2")} 0`,
    "--margin-inline-no-content": dsl.primitive.length.px(0),
    "--height": dsl.primitive.length.px(1),
  })
  .variant("v", {
    "--flex-direction": "column",
    "--margin-inline-before": dsl.primitive.length.px(0),
    "--margin-inline-after": dsl.primitive.length.px(0),
    "--margin-inline-no-content": dsl.primitive.length.px(0),
    "--margin-block-before": `0 ${dsl.spacing("2")}`,
    "--margin-block-after": `${dsl.spacing("2")} 0`,
    "--margin-block-no-content": dsl.primitive.length.px(0),
    "--width": dsl.primitive.length.px(1),
    "--height": "auto",
  })
  .optionalVariants()
  .body("flex", "items-center", "tracking-wide", "font-bold", {
    "flex-direction": dsl.cssvar("--flex-direction"),
    color: COLOR,

    $: {
      [dsl.select.list(
        dsl.select.parent("::before"),
        dsl.select.parent("::after"),
      )]: {
        content: '""',
        width: dsl.cssvar("--width"),
        height: dsl.cssvar("--height"),
        "background-color": COLOR,
      },
      [dsl.select.parent(":empty::after")]: {
        "margin-inline": dsl.cssvar("--margin-inline-no-content"),
        "margin-block": dsl.cssvar("--margin-block-no-content"),
      },
      [dsl.select.parent(":empty::before")]: {
        "margin-inline": dsl.cssvar("--margin-inline-no-content"),
        "margin-block": dsl.cssvar("--margin-block-no-content"),
      },
      [dsl.select.parent("::before")]: {
        flex: dsl.cssvar("--place-content"),
        "margin-inline": dsl.cssvar("--margin-inline-before"),
        "margin-block": dsl.cssvar("--margin-block-before"),
      },
      [dsl.select.parent("::after")]: {
        flex: dsl.calc`${dsl.primitive.percentage(100)} - ${dsl.cssvar("--place-content")}`,
        "margin-inline": dsl.cssvar("--margin-inline-after"),
        "margin-block": dsl.cssvar("--margin-block-after"),
      },
    },
  })
  .controlled(
    "--place-content",
    {
      start: dsl.primitive.percentage(0),
      center: dsl.primitive.percentage(50),
      end: dsl.primitive.percentage(100),
    },
    dsl.match.oneOf(
      dsl.match.bare.percentage(),
      dsl.match.arbitraryPercentage(),
    ),
    // dsl.calc`${dsl.match.oneOf(
    //   dsl.match.bare.integer(),
    //   dsl.match.bare.number(),
    //   dsl.match.arbitraryNumber(),
    // )} * ${dsl.primitive.percentage(1)}`,
    // dsl.calc`${dsl.match.bare.ratio()} * ${dsl.primitive.percentage(100)}`,
  );
