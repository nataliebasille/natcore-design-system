/**
 * Cascade layer contract for `component()` modules, tested on test-only `fx-*`
 * components so it doesn't depend on how natcore's own components are built.
 * Inside Tailwind's `utilities` layer, component bodies sit in
 * `components.base` and a component's own utilities (`.utility()`,
 * `.controlled()`) in `components`. Styles directly in a layer beat its nested
 * layers, so by layer alone:
 *
 *   plain Tailwind utility  >  component utility  >  component body
 *
 * Element defaults from `.applyTo()` sit outside `utilities`, in
 * `components.base`. Every case also runs on the minified output, because the
 * lightningcss minifier un-nests and rewrites at-rules.
 *
 * Bodies set `cursor: wait`, component utilities `cursor: pointer`, and the
 * plain Tailwind utility is `cursor-default`.
 */
import { describe, expect, it } from "vitest";
import type { Root } from "postcss";
import { component, dsl } from "@nataliebasille/css-engine";
import { moduleToCss } from "../src/compile/ts-to-css/compile.ts";
import {
  buildNatcoreCss,
  findDecls,
  minify,
  winsByLayer,
} from "./helpers/build-natcore-css.ts";

const FIXTURES = moduleToCss([
  component("fx-static")
    .body({ cursor: "wait" })
    .utility("flush", { cursor: "pointer" }),
  component("fx-dynamic")
    .vars({ "--size": "1rem" })
    .variant("a", { "--cursor": "wait" })
    .controlled("--size", dsl.match.arbitrary.length())
    .body({ cursor: dsl.cssvar("--cursor"), width: dsl.cssvar("--size") }),
  component("fx-tone").body({ cursor: "wait", color: dsl.current(500) }),
  component("fx-parent")
    .body({ cursor: "wait" })
    .derive("child", (child) => child.body({ cursor: "wait" })),
  // Themeable with a default variant: `fx-group/<palette>` is an alias that
  // only applies `fx-group-solid/<palette>`.
  component("fx-group")
    .variant("solid", { "--cursor": "wait" })
    .defaultVariant("solid")
    .body({ cursor: dsl.cssvar("--cursor"), color: dsl.current(500) }),
  component("fx-element")
    .body({ cursor: "wait" })
    .applyTo(dsl.select.element("aside")),
]);

const BODY = "utilities.components.base";
const UTILITY = "utilities.components";
const ELEMENT = "components.base";
const TAILWIND = on("cursor-default", "cursor");

type Target = { cls: string; selector: string; prop: string };

const BODIES: [string, Target][] = [
  ["static", on("fx-static", "cursor")],
  ["dynamic", on("fx-dynamic-a", "cursor")],
  ["themeable", on("fx-tone/primary", "cursor")],
  ["derived", on("fx-parent-child", "cursor")],
  ["alias", on("fx-group/primary", "cursor")],
];

// [kind, component utility, body it overrides (if any), Tailwind utility]
const UTILITIES: [string, Target, Target | null, Target][] = [
  [".utility()", on("fx-static-flush", "cursor"), BODIES[0]![1], TAILWIND],
  [
    ".controlled()",
    on("fx-dynamic-size-[2rem]", "--fx-dynamic-size"),
    null,
    on("[--fx-dynamic-size:3rem]", "--fx-dynamic-size"),
  ],
];

const ELEMENT_DEFAULT = on("", "cursor", "aside");

describe.each([
  [
    "Tailwind output",
    (classes: string[]) => buildNatcoreCss(classes, FIXTURES),
  ],
  [
    "minified output",
    async (classes: string[]) =>
      minify(await buildNatcoreCss(classes, FIXTURES)),
  ],
])("%s", (_, build) => {
  describe("component bodies", () => {
    it.each(BODIES)("%s body is in components.base", async (_, body) => {
      const root = await build([body.cls]);

      expect(decl(root, body).layer).toBe(BODY);
    });

    it.each(BODIES)(
      "%s body loses to a plain Tailwind utility",
      async (_, body) => {
        const root = await build([body.cls, TAILWIND.cls]);

        expect(winsByLayer(root, decl(root, TAILWIND), decl(root, body))).toBe(
          true,
        );
      },
    );
  });

  describe("component utilities", () => {
    it.each(UTILITIES)("%s utility is in components", async (_, utility) => {
      const root = await build([utility.cls]);

      expect(decl(root, utility).layer).toBe(UTILITY);
    });

    it.each(UTILITIES.filter(([, , body]) => body !== null))(
      "%s utility beats the component body",
      async (_, utility, body) => {
        const root = await build([utility.cls, body!.cls]);

        expect(winsByLayer(root, decl(root, utility), decl(root, body!))).toBe(
          true,
        );
      },
    );

    it.each(UTILITIES)(
      "%s utility loses to a plain Tailwind utility",
      async (_, utility, __, tailwind) => {
        const root = await build([utility.cls, tailwind.cls]);

        expect(
          winsByLayer(root, decl(root, tailwind), decl(root, utility)),
        ).toBe(true);
      },
    );
  });

  describe("element defaults", () => {
    it(".applyTo() default is in components.base", async () => {
      const root = await build([]);

      expect(decl(root, ELEMENT_DEFAULT).layer).toBe(ELEMENT);
    });

    it(".applyTo() default loses to a plain Tailwind utility", async () => {
      const root = await build([TAILWIND.cls]);

      expect(
        winsByLayer(root, decl(root, TAILWIND), decl(root, ELEMENT_DEFAULT)),
      ).toBe(true);
    });
  });

  describe("breakpoint variants", () => {
    it.each([
      ["body", on("md:fx-dynamic-a", "cursor"), BODY],
      ["utility", on("md:fx-static-flush", "cursor"), UTILITY],
    ])("a %s keeps its media query and layer", async (_, target, layer) => {
      const root = await build([target.cls]);
      const found = findDecls(root, {
        selector: target.selector,
        prop: target.prop,
        atRule: "48rem",
      });

      expect(found.map((d) => d.layer)).toEqual([layer]);
    });
  });
});

/** `.cls` (escaped like Tailwind), or `selector` when the rule targets more. */
function on(cls: string, prop: string, selector?: string): Target {
  return {
    cls,
    prop,
    selector:
      selector ?? `.${cls.replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`)}`,
  };
}

/** The target's declaration, ignoring preflight and `@supports` fallbacks. */
function decl(root: Root, target: Target) {
  const found = findDecls(root, {
    selector: target.selector,
    prop: target.prop,
    atRule: null,
  }).filter((d) => d.layer !== "base");

  expect(found, `${target.selector} { ${target.prop} }`).not.toEqual([]);
  return found[0]!;
}
