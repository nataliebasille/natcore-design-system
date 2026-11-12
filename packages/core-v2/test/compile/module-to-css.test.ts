import { describe, expect, it } from "vitest";
import { component, dsl, utility } from "@nataliebasille/css-engine";
import { moduleToCss } from "../../src/compile/ts-to-css/compile.ts";

describe("moduleToCss with time values", () => {
  it("emits a bare-integer match multiplied by a time unit", () => {
    const css = moduleToCss(
      utility("wait", {
        "transition-delay": dsl.calc`${dsl.match.bare.integer()} * ${dsl.primitive.time.ms(1)}`,
      }),
    );

    expect(normalize(css)).toContain(
      "@utility wait-* { transition-delay: calc(--value(integer) * 1ms); }",
    );
  });
});

describe("moduleToCss with nested at-rules", () => {
  it("emits at-rules nested in a component body, resolving variant vars", () => {
    const css = moduleToCss(
      component("fade")
        .variant("in", { "--from": "0" })
        .body(
          { opacity: "1" },
          dsl.startingStyle({ opacity: dsl.cssvar("--from") }),
          dsl.prefersReducedMotion({ transition: "none" }),
        ),
    );

    expect(normalize(css)).toContain(
      "@starting-style { opacity: --value(--fade-from-*); }",
    );
    expect(normalize(css)).toContain(
      "@media (prefers-reduced-motion: reduce) { transition: none; }",
    );
  });

  it("inlines base var defaults inside at-rules for optional variants", () => {
    const css = moduleToCss(
      component("fade")
        .vars({ "--from": "0.5" })
        .variant("in", { "--from": "0" })
        .optionalVariants()
        .body(
          { opacity: "1" },
          dsl.startingStyle({ opacity: dsl.cssvar("--from") }),
        ),
    );

    expect(normalize(css)).toContain(
      "@utility fade { @layer components { @layer base { opacity: 1; @starting-style { opacity: 0.5; } } } }",
    );
  });
});

function normalize(css: string) {
  return css.replace(/\s+/g, " ");
}
