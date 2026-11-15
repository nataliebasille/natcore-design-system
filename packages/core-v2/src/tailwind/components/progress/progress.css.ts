import { component, dsl } from "@nataliebasille/css-engine";

const { rem } = dsl.primitive.length;

const BASE_SIZE = rem(1);

/**
 * A progress indicator. `progress-radial` is a plain ring (it doesn't style
 * its content): the first `--progress-value` of the circle, clockwise from
 * the top, is filled with the palette's 500 shade over a 200 shade track.
 * `progress-radial/<palette>` picks the palette, `progress-size-*` the
 * diameter, `progress-thickness-*` how thick the ring is, and
 * `progress-value-*` or an inline `--progress-value` the value. The value is
 * a registered `<percentage>`, so changes animate.
 */
export default component("progress")
  .vars({
    "--size": BASE_SIZE,
    // A length, or a percentage of the radius: 25% is 1/8 of the size.
    "--thickness": dsl.primitive.percentage(25),
    "--value": dsl.primitive.percentage(0),
  })
  // Named sizes match Tailwind's default text sizes; brackets take any length.
  .controlled(
    "--size",
    {
      xs: rem(0.75),
      sm: rem(0.875),
      base: BASE_SIZE,
      lg: rem(1.125),
      xl: rem(1.25),
      "2xl": rem(1.5),
      "3xl": rem(1.875),
      "4xl": rem(2.25),
      "5xl": rem(3),
      "6xl": rem(3.75),
      "7xl": rem(4.5),
      "8xl": rem(6),
      "9xl": rem(8),
    },
    dsl.match.arbitrary.length(),
  )
  // Bare integers are percentages of the radius; brackets take any length or percentage.
  .controlled(
    "--thickness",
    dsl.calc`${dsl.match.bare.integer()} * ${dsl.primitive.percentage(1)}`,
    dsl.match.arbitrary.length(),
    dsl.match.arbitrary.percentage(),
  )
  // Registered, so it can animate, and a nested ring never inherits its
  // parent's value.
  .property("--value", {
    syntax: "<percentage>",
    inherits: false,
    initialValue: dsl.primitive.percentage(0),
  })
  // Bare integers are percentages; brackets take any percentage.
  .utility("value-*", {
    "--value": [
      dsl.calc`${dsl.match.bare.integer()} * ${dsl.primitive.percentage(1)}`,
      dsl.match.arbitrary.percentage(),
    ],
  })
  .variant("radial", {
    "--fill": dsl.cssv`conic-gradient(${dsl.current(500)} ${dsl.cssvar("--value")}, ${dsl.current(200)} 0%)`,
    "--mask": dsl.cssv`radial-gradient(farthest-side, transparent ${dsl.calc`${dsl.primitive.percentage(100)} - ${dsl.cssvar("--thickness")}`}, black 0)`,
  })
  .body(
    "inline-block",
    "aspect-square",
    "rounded-full",
    {
      width: dsl.cssvar("--size"),
      background: dsl.cssvar("--fill"),
      "mask-image": dsl.cssvar("--mask"),
      "transition-property": "--progress-value",
      "transition-duration": "500ms",
      "transition-timing-function": "linear",
    },
    dsl.prefersReducedMotion({ "transition-duration": "0s" }),
  );
