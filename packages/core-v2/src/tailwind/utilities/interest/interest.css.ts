import { dsl, utility } from "@nataliebasille/css-engine";

// Bare integers are milliseconds (like Tailwind's `delay-*`); brackets take any value.
const BARE_DELAY = dsl.calc`${dsl.match.bare.integer()} * ${dsl.primitive.time.ms(1)}`;
const DELAY = [BARE_DELAY, dsl.match.arbitrary.any()];

/**
 * Interest delays for interest invokers (elements with `interestfor`). Put them on the
 * invoker: `interest-delay-*` is not inherited. Each also sets the `--`-prefixed custom
 * property that the `interestfor` polyfill (github.com/mfreed7/interestfor) reads.
 */
export default () => [
  utility("interest-delay", {
    "interest-delay": DELAY,
    "--interest-delay": DELAY,
    // The polyfill reads these longhands before `--interest-delay`. Bare integers set
    // them, since the polyfill registers them as <time> (so calc() resolves) but can't
    // parse calc() in `--interest-delay`. Every other value resets them to `normal`
    // (the later declaration wins when both apply), so the shorthand is read instead.
    "--interest-delay-start": ["normal", BARE_DELAY],
    "--interest-delay-end": ["normal", BARE_DELAY],
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
