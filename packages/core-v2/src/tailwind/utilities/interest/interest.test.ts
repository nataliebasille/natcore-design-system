/**
 * Spec for the interest-delay utilities (interest.css.ts). They go on an
 * interest invoker (the element with `interestfor`) and set how long the
 * browser waits before showing interest (`interest-delay-start`) and before
 * losing it (`interest-delay-end`).
 *
 * The `interestfor` polyfill (github.com/mfreed7/interestfor) reads delays from
 * `--interest-delay-start` / `--interest-delay-end` in browsers without native
 * support, so every utility sets those. The shorthand takes a single value
 * (like `p-*`); `interest-delay-start-*` / `-end-*` set different values. Bare
 * integers are milliseconds; brackets take any value. natcore sets no default
 * delays.
 */
import { describe, expect, it } from "vitest";
import {
  buildNatcoreCss,
  declarations,
  findDecls,
  flatten,
} from "../../../../test/helpers/build-natcore-css.ts";

const PROPERTIES = [
  "interest-delay",
  "interest-delay-start",
  "interest-delay-end",
] as const;

describe("test helpers", () => {
  it("classSelector and the md query match Tailwind's built-in delay-*", async () => {
    const root = await buildNatcoreCss(["delay-[1.5s]", "md:delay-500"]);

    expect(
      declarations(root, {
        selector: classSelector("delay-[1.5s]"),
        atRule: null,
      })["transition-delay"],
    ).toBe("1.5s");
    expect(
      declarations(root, {
        selector: classSelector("md:delay-500"),
        atRule: "width >= 48rem",
      })["transition-delay"],
    ).toBe("500ms");
  });
});

describe.each(PROPERTIES)("%s-*", (property) => {
  it("bare integers set the property and its custom property in ms", async () => {
    const root = await buildNatcoreCss([`${property}-500`]);

    expect(
      declarations(root, { selector: `.${property}-500`, atRule: null }),
    ).toEqual(expectedDecls(property, "calc(500 * 1ms)"));
  });

  it("accepts 0", async () => {
    const root = await buildNatcoreCss([`${property}-0`]);

    expect(
      declarations(root, { selector: `.${property}-0`, atRule: null }),
    ).toEqual(expectedDecls(property, "calc(0 * 1ms)"));
  });

  it.each(["1.5s", "normal", "var(--my-delay)"])(
    "passes the arbitrary value [%s] through",
    async (value) => {
      const cls = `${property}-[${value}]`;
      const root = await buildNatcoreCss([cls]);

      expect(
        declarations(root, { selector: classSelector(cls), atRule: null }),
      ).toEqual(expectedDecls(property, value));
    },
  );

  it.each(["-100", "1.5", "fast"])(
    "generates nothing for the non-matching value %s",
    async (value) => {
      const root = await buildNatcoreCss([`${property}-${value}`]);

      expect(interestDecls(root)).toEqual([]);
    },
  );

  it("works behind variants", async () => {
    const root = await buildNatcoreCss([`md:${property}-500`]);

    expect(
      declarations(root, {
        selector: classSelector(`md:${property}-500`),
        atRule: "width >= 48rem",
      }),
    ).toEqual(expectedDecls(property, "calc(500 * 1ms)"));
  });

  it("lives in the utilities layer", async () => {
    const root = await buildNatcoreCss([`${property}-500`]);

    expect(
      findDecls(root, { selector: `.${property}-500`, prop: property }).map(
        (decl) => decl.layer,
      ),
    ).toEqual(["utilities"]);
  });
});

describe("interest-delay shorthand", () => {
  it.each([
    ["interest-delay-500", "calc(500 * 1ms)"],
    ["interest-delay-[1s]", "1s"],
    ["interest-delay-[calc(1s)]", "calc(1s)"],
  ])(
    "%s sets the start and end custom properties the polyfill reads, not --interest-delay",
    async (cls, value) => {
      // The polyfill registers `--interest-delay-start/-end` as <time>, so the
      // browser resolves calc() there. It can't parse calc() in `--interest-delay`,
      // and reads it whenever a longhand is `normal`, even an explicit `normal`.
      const root = await buildNatcoreCss([cls]);

      expect(
        declarations(root, { selector: classSelector(cls), atRule: null }),
      ).toEqual({
        "interest-delay": value,
        "--interest-delay-start": value,
        "--interest-delay-end": value,
      });
    },
  );

  it.each([
    ["interest-delay-500", "interest-delay-start-200"],
    ["interest-delay-500", "interest-delay-end-200"],
    ["interest-delay-500", "interest-delay-start-[normal]"],
    ["interest-delay-[2s]", "interest-delay-end-[normal]"],
  ])("%s is overridden by %s", async (shorthand, longhand) => {
    const root = await buildNatcoreCss([shorthand, longhand]);
    const order = flatten(root)
      .filter((decl) => decl.atRules.length === 0)
      .map((decl) => decl.selector);

    expect(order.lastIndexOf(classSelector(longhand))).toBeGreaterThan(
      order.lastIndexOf(classSelector(shorthand)),
    );
  });
});

describe("interest-delay utilities overall", () => {
  it("start and end utilities combine on one element", async () => {
    const root = await buildNatcoreCss([
      "interest-delay-start-500",
      "interest-delay-end-200",
    ]);

    expect(
      declarations(root, {
        selector: ".interest-delay-start-500",
        atRule: null,
      })["interest-delay-start"],
    ).toBe("calc(500 * 1ms)");
    expect(
      declarations(root, { selector: ".interest-delay-end-200", atRule: null })[
        "interest-delay-end"
      ],
    ).toBe("calc(200 * 1ms)");
  });

  it("sets no default delays", async () => {
    const root = await buildNatcoreCss([]);

    expect(
      flatten(root).filter((decl) => /interest-delay/.test(decl.prop)),
    ).toEqual([]);
  });

  it("never sets --interest-delay", async () => {
    const root = await buildNatcoreCss(
      PROPERTIES.flatMap((property) => [`${property}-500`, `${property}-[1s]`]),
    );

    expect(interestDecls(root).length).toBeGreaterThan(0);
    expect(
      interestDecls(root).filter((decl) => decl.prop === "--interest-delay"),
    ).toEqual([]);
  });

  it("does not reference anchor or data-slot", async () => {
    const root = await buildNatcoreCss(
      PROPERTIES.flatMap((property) => [
        `${property}-500`,
        `${property}-[1s]`,
        `md:${property}-500`,
      ]),
    );
    const output = JSON.stringify(interestDecls(root));

    expect(interestDecls(root).length).toBeGreaterThan(0);
    expect(output).not.toMatch(/anchor|data-slot/);
  });
});

/** Every declaration generated for an interest-delay utility class. */
function interestDecls(root: Awaited<ReturnType<typeof buildNatcoreCss>>) {
  return flatten(root).filter((decl) =>
    decl.selector.includes("interest-delay"),
  );
}

/** Declarations a utility generates for `property` with the given value. */
function expectedDecls(property: (typeof PROPERTIES)[number], value: string) {
  return property === "interest-delay" ?
      {
        "interest-delay": value,
        "--interest-delay-start": value,
        "--interest-delay-end": value,
      }
    : { [property]: value, [`--${property}`]: value };
}

/** Class selector for a Tailwind candidate, escaped like Tailwind's output. */
function classSelector(candidate: string) {
  return `.${candidate.replace(/[[\]:.()%,]/g, "\\$&")}`;
}
