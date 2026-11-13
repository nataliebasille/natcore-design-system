import { describe, expect, it } from "vitest";
import postcss, { type AtRule, type Declaration } from "postcss";
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

describe("moduleToCss with anchor positioning", () => {
  it("emits anchor() in inset properties and in math functions", () => {
    const top = dsl.anchor("--self", "top");
    const css = moduleToCss(
      component("tip").body({
        top: dsl.anchor("--a", "bottom"),
        left: dsl.calc`${dsl.max(dsl.anchor("center"), top)} - ${top}`,
      }),
    );

    expect(normalize(css)).toContain("top: anchor(--a bottom);");
    expect(normalize(css)).toContain(
      "left: calc(max(anchor(center), anchor(--self top)) - anchor(--self top));",
    );
  });

  it("emits anchor-size() in margins, inside calc()", () => {
    const css = moduleToCss(
      component("tip").body({
        width: dsl.anchorSize("width"),
        margin: dsl.calc`${dsl.anchorSize("--self", "height")} - 4px`,
      }),
    );

    expect(normalize(css)).toContain("width: anchor-size(width);");
    expect(normalize(css)).toContain(
      "margin: calc(anchor-size(--self height) - 4px);",
    );
  });
});

describe("moduleToCss with registered component properties", () => {
  it("emits them as top-level @property rules with a quoted syntax", async () => {
    const css = moduleToCss(
      component("tip")
        .property("--delay", {
          syntax: "<time>",
          inherits: false,
          initialValue: "500ms",
        })
        .body({ "transition-delay": dsl.cssvar("--delay") }),
    );
    const root = postcss.parse(css);
    const property = root.nodes.find(
      (node): node is AtRule =>
        node.type === "atrule" &&
        node.name === "property" &&
        node.params === "--tip-delay",
    );

    expect(property).toBeDefined();
    expect(
      Object.fromEntries(
        (property!.nodes ?? []).map((node) => [
          (node as Declaration).prop,
          (node as Declaration).value,
        ]),
      ),
    ).toEqual({
      syntax: '"<time>"',
      inherits: "false",
      "initial-value": "500ms",
    });
    expect(normalize(css)).toContain("transition-delay: var(--tip-delay);");
  });

  it("keeps a numeric initial value of 0", () => {
    const css = moduleToCss(
      component("bar").property("--progress", {
        syntax: "<number>",
        inherits: false,
        initialValue: 0,
      }),
    );
    const property = postcss
      .parse(css)
      .nodes.find(
        (node): node is AtRule =>
          node.type === "atrule" && node.params === "--bar-progress",
      );

    expect(
      (property!.nodes ?? []).map((node) => [
        (node as Declaration).prop,
        (node as Declaration).value,
      ]),
    ).toContainEqual(["initial-value", "0"]);
  });

  it("serializes a DSL initial value like any other value", () => {
    const css = moduleToCss(
      component("bar").property("--edges", {
        syntax: "<length>+",
        inherits: false,
        initialValue: dsl.cssv`${dsl.primitive.length.px(1)} ${dsl.primitive.length.px(2)}`,
      }),
    );
    const property = postcss
      .parse(css)
      .nodes.find(
        (node): node is AtRule =>
          node.type === "atrule" && node.params === "--bar-edges",
      );

    expect(
      (property!.nodes ?? []).map((node) => [
        (node as Declaration).prop,
        (node as Declaration).value,
      ]),
    ).toContainEqual(["initial-value", "1px 2px"]);
  });
});

function normalize(css: string) {
  return css.replace(/\s+/g, " ");
}
