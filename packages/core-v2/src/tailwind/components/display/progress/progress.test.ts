/**
 * Spec for the `progress` component (progress.css.ts): `progress-radial` is a
 * plain ring (no content styling) whose filled arc is `--progress-value` of
 * the circle. The fill is the palette's 500 shade and the track its 200
 * shade; `progress-radial/<palette>` picks the palette. `progress-size-*` sets
 * the diameter (the ring is 1/8 of it thick), `progress-value-*` the value.
 * `--progress-value` is a registered `<percentage>` so it animates, except
 * with reduced motion. Bodies sit in `utilities.components.base` and the
 * utilities in `utilities.components`, so Tailwind utilities override both.
 */
import { describe, expect, it } from "vitest";
import {
  buildNatcoreCss,
  declarations,
  findDecls,
  resolveVars,
  winsByLayer,
} from "../../../../../test/helpers/build-natcore-css.ts";

type Root = Awaited<ReturnType<typeof buildNatcoreCss>>;

const RING = ".progress-radial";
const PRIMARY = ".progress-radial\\/primary";

describe("progress-radial", () => {
  it("is 1rem by default", async () => {
    const root = await buildNatcoreCss(["progress-radial"]);
    const decls = styles(root, RING);

    expect(
      declarations(root, { selector: /(^|,\s*):root\b/ })["--progress-size"],
    ).toBe("1rem");
    expect(resolveVars(root, decls.width!)).toBe("1rem");
    expect(decls["aspect-ratio"]).toBe("1 / 1");
    expect(decls["border-radius"]).toBe("calc(infinity * 1px)");
  });

  it("fills --progress-value of the circle with shade 500 over a shade 200 track", async () => {
    const root = await buildNatcoreCss(["progress-radial"]);

    expect(styles(root, RING).background).toMatch(
      /^conic-gradient\(var\(--bg-tone-500\) var\(--progress-value\), var\(--bg-tone-200\) 0%?\)$/,
    );
  });

  it("cuts the ring out of the circle, --progress-thickness thick", async () => {
    const root = await buildNatcoreCss(["progress-radial"]);
    const mask = styles(root, RING)["mask-image"];

    expect(mask).toMatch(/^radial-gradient\(farthest-side,/);
    expect(mask).toContain("calc(100% - var(--progress-thickness))");
  });

  it("is 25% of the radius (1/8 of the size) thick by default", async () => {
    const root = await buildNatcoreCss(["progress-radial"]);

    expect(
      declarations(root, { selector: /(^|,\s*):root\b/ })[
        "--progress-thickness"
      ],
    ).toBe("25%");
  });

  it("without a modifier, uses the inherited palette", async () => {
    const root = await buildNatcoreCss(["progress-radial"]);

    expect(declarations(root, { selector: RING })["--bg-tone-500"]).toBe(
      undefined,
    );
  });

  it("a palette modifier sets the fill and track shades", async () => {
    const root = await buildNatcoreCss([
      "progress-radial",
      "progress-radial/primary",
    ]);
    const decls = declarations(root, { selector: PRIMARY, atRule: null });

    expect(decls["--bg-tone-500"]).toMatch(/primary-500\)$/);
    expect(decls["--bg-tone-200"]).toMatch(/primary-200\)$/);
    expect(decls.background).toBe(styles(root, RING).background);
  });

  it("is a plain ring that doesn't style its content", async () => {
    const root = await buildNatcoreCss(["progress-radial"]);

    expect(styles(root, RING)).not.toHaveProperty("place-items");
    expect(styles(root, RING)).not.toHaveProperty("font-size");
    expect(styles(root, RING)).not.toHaveProperty("align-self");
    expect(styles(root, RING).display).not.toBe("grid");
  });

  it("animates --progress-value over 500ms", async () => {
    const root = await buildNatcoreCss(["progress-radial"]);
    const decls = styles(root, RING);

    expect(decls["transition-property"]).toBe("--progress-value");
    expect(decls["transition-duration"]).toBe("500ms");
    expect(decls["transition-timing-function"]).toBe("linear");
  });

  it("doesn't animate with reduced motion", async () => {
    const root = await buildNatcoreCss(["progress-radial"]);
    const reduced = declarations(root, {
      selector: RING,
      atRule: "prefers-reduced-motion: reduce",
    });

    expect(reduced["transition-duration"]).toBe("0s");
  });

  it("drops the old radial-progress and progress-sm/lg classes", async () => {
    const root = await buildNatcoreCss([
      "radial-progress",
      "progress-sm",
      "progress-lg",
    ]);

    expect(
      findDecls(root, { selector: /^\.(radial-progress|progress-(sm|lg))$/ }),
    ).toEqual([]);
  });
});

describe("--progress-value", () => {
  it("is a registered, non-inherited <percentage> starting at 0%", async () => {
    const root = await buildNatcoreCss(["progress-radial"]);

    expect(registeredProperty(root, "--progress-value")).toEqual({
      syntax: '"<percentage>"',
      inherits: "false",
      "initial-value": "0%",
    });
  });

  it.each([
    ["progress-value-40", "calc(40 * 1%)"],
    ["progress-value-0", "calc(0 * 1%)"],
    ["progress-value-[37.5%]", "37.5%"],
  ])("%s sets it to %s", async (cls, value) => {
    const root = await buildNatcoreCss([cls]);

    expect(
      declarations(root, { selector: classSelector(cls), atRule: null }),
    ).toEqual({ "--progress-value": value });
  });

  it("progress-value-[3rem] isn't generated", async () => {
    const root = await buildNatcoreCss(["progress-value-[3rem]"]);

    expect(findDecls(root, { selector: /progress-value/ })).toEqual([]);
  });
});

describe("progress-size-*", () => {
  // Tailwind's default text sizes, as the component's own values.
  it.each([
    ["xs", "0.75rem"],
    ["sm", "0.875rem"],
    ["base", "1rem"],
    ["lg", "1.125rem"],
    ["xl", "1.25rem"],
    ["2xl", "1.5rem"],
    ["3xl", "1.875rem"],
    ["4xl", "2.25rem"],
    ["5xl", "3rem"],
    ["6xl", "3.75rem"],
    ["7xl", "4.5rem"],
    ["8xl", "6rem"],
    ["9xl", "8rem"],
  ])(
    "progress-size-%s is %s, without Tailwind's --text-* vars",
    async (size, value) => {
      const cls = `progress-size-${size}`;
      const root = await buildNatcoreCss([cls]);
      const decls = declarations(root, {
        selector: classSelector(cls),
        atRule: null,
      });

      expect(decls).toEqual({ "--progress-size": value });
    },
  );

  it.each(["progress-size-[3rem]", "progress-size-[40px]"])(
    "%s sets any length",
    async (cls) => {
      const root = await buildNatcoreCss([cls]);

      expect(
        declarations(root, { selector: classSelector(cls), atRule: null }),
      ).toEqual({ "--progress-size": cls.slice("progress-size-[".length, -1) });
    },
  );

  it("progress-size-[50%] isn't generated", async () => {
    const root = await buildNatcoreCss(["progress-size-[50%]"]);

    expect(findDecls(root, { selector: /progress-size/ })).toEqual([]);
  });
});

describe("progress-thickness-*", () => {
  it.each([
    ["progress-thickness-40", "calc(40 * 1%)"],
    ["progress-thickness-0", "calc(0 * 1%)"],
    ["progress-thickness-[6px]", "6px"],
    ["progress-thickness-[0.5rem]", "0.5rem"],
    ["progress-thickness-[40%]", "40%"],
  ])("%s sets the thickness to %s", async (cls, value) => {
    const root = await buildNatcoreCss([cls]);

    expect(
      declarations(root, { selector: classSelector(cls), atRule: null }),
    ).toEqual({ "--progress-thickness": value });
  });

  it("progress-thickness-[red] isn't generated", async () => {
    const root = await buildNatcoreCss(["progress-thickness-[red]"]);

    expect(findDecls(root, { selector: /progress-thickness/ })).toEqual([]);
  });
});

describe("progress cascade layer", () => {
  it("progress-radial is in the components base layer", async () => {
    const root = await buildNatcoreCss([
      "progress-radial",
      "progress-radial/primary",
    ]);

    expect(layers(root, RING)).toEqual(["utilities.components.base"]);
    expect(layers(root, PRIMARY)).toEqual(["utilities.components.base"]);
  });

  it.each([
    "progress-size-lg",
    "progress-value-40",
    "progress-thickness-[6px]",
  ])("%s is in the components layer", async (cls) => {
    const root = await buildNatcoreCss([cls]);

    expect(layers(root, classSelector(cls))).toEqual(["utilities.components"]);
  });

  it("never uses !important", async () => {
    const root = await buildNatcoreCss([
      "progress-radial",
      "progress-radial/primary",
      "progress-size-lg",
      "progress-value-40",
    ]);

    expect(
      findDecls(root, { selector: /progress/ }).filter((d) => d.important),
    ).toEqual([]);
  });

  it.each([
    ["w-12", "width"],
    ["rounded-none", "border-radius"],
    ["transition-none", "transition-property"],
  ])("Tailwind %s overrides %s", async (cls, prop) => {
    const root = await buildNatcoreCss(["progress-radial", cls]);
    const [tailwind] = findDecls(root, { selector: `.${cls}`, prop });
    const [component] = findDecls(root, {
      selector: RING,
      prop,
      atRule: null,
    });

    expect(winsByLayer(root, tailwind!, component!)).toBe(true);
  });
});

/** Last value per non-custom property, ignoring preflight and at-rules. */
function styles(root: Root, selector: string) {
  const decls: Record<string, string> = {};
  for (const decl of findDecls(root, { selector, atRule: null })) {
    if (decl.layer === "base" || decl.prop.startsWith("--")) continue;
    decls[decl.prop] = decl.value;
  }
  return decls;
}

/** Distinct cascade layers of every non-preflight declaration for a selector. */
function layers(root: Root, selector: string) {
  return [
    ...new Set(
      findDecls(root, { selector })
        .filter((decl) => decl.layer !== "base")
        .map((decl) => decl.layer),
    ),
  ];
}

function registeredProperty(root: Root, name: string) {
  const decls: Record<string, string> = {};
  root.walkAtRules("property", (atRule) => {
    if (atRule.params !== name) return;
    atRule.walkDecls((decl) => {
      decls[decl.prop] = decl.value;
    });
  });
  return decls;
}

/** The CSS selector Tailwind emits for a class (escaping `[`, `]`, `.`, `%`, `/`). */
function classSelector(cls: string) {
  return `.${cls.replace(/[[\]./%]/g, (char) => `\\${char}`)}`;
}
