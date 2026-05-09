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
    "--gap": dsl.spacing("2"),
    "--height": dsl.primitive.length.px(1),
  })
  .variant("v", {
    "--flex-direction": "column",
    "--width": dsl.primitive.length.px(1),
    "--height": "auto",
  })
  .optionalVariants()
  .body("flex", "items-center", "tracking-wide", "font-bold", {
    "flex-direction": dsl.cssvar("--flex-direction"),
    gap: dsl.cssvar("--gap"),
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
      [dsl.select.parent(":empty")]: {
        gap: dsl.primitive.length.px(0),
      },
      [dsl.select.parent("::before")]: {
        flex: dsl.cssvar("--place-content"),
      },
      [dsl.select.parent("::after")]: {
        flex: dsl.calc`${dsl.primitive.percentage(100)} - ${dsl.cssvar("--place-content")}`,
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
