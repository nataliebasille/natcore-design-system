import { dsl, utility } from "@nataliebasille/css-engine";

// Bare integers are milliseconds (like Tailwind's `delay-*`); brackets take any value.
const DELAY = [
  dsl.calc`${dsl.match.bare.integer()} * ${dsl.primitive.time.ms(1)}`,
  dsl.match.arbitrary.any(),
];

/**
 * Interest delays for interest invokers (elements with `interestfor`). Put them on the
 * invoker: `interest-delay-*` is not inherited. `interest-delay-*` sets both delays to one
 * value (like `p-*`); use `interest-delay-start-*` / `-end-*` for different values.
 *
 * Each also sets `--interest-delay-start` / `--interest-delay-end`, which the `interestfor`
 * polyfill (github.com/mfreed7/interestfor) reads. It registers them as <time>, so the
 * browser resolves calc() there. Nothing sets `--interest-delay`: the polyfill falls back to
 * it whenever a longhand is `normal`, so an explicit `normal` wouldn't restore the default,
 * and it can't parse calc() in it.
 */
export default () => [
  utility("interest-delay", {
    "interest-delay": DELAY,
    "--interest-delay-start": DELAY,
    "--interest-delay-end": DELAY,
  }),
  utility("interest-delay-start", {
    "interest-delay-start": DELAY,
    "--interest-delay-start": DELAY,
  }),
  utility("interest-delay-end", {
    "interest-delay-end": DELAY,
    "--interest-delay-end": DELAY,
  }),
];
