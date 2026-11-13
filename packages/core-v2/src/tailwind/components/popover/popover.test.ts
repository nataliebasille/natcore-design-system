/**
 * Spec for the `popover` component (popover.css.ts). `popover` goes on the
 * floating element and positions it next to its anchor with CSS anchor
 * positioning; it adds no surface of its own (pair it with `card-*`).
 *
 * - Natively opened (popovertarget / commandfor / interestfor), it anchors to
 *   the button that opened it.
 * - Inside a `popover-anchor` wrapper, the popover is a direct child marked
 *   `data-slot="popover"`. It anchors to the wrapper, and CSS shows it while a
 *   trigger is active: `popover-trigger-hover`, `popover-trigger-focus`,
 *   `popover-trigger-checked` on the trigger, or an open
 *   `<details class="popover-anchor">`. Wrapper and trigger utilities find the
 *   popover by its slot, never by its class, so every class works with
 *   variants like `md:`.
 * - `popover-{top,bottom,left,right}[-start|-end]` are complete popovers placed
 *   on that side (used instead of `popover`, which is below). They stay on that
 *   side even near the edge of the screen. The gap is a margin on the side
 *   facing the anchor, so Tailwind margin utilities change it.
 * - `popover-flip` on the popover opts in to flipping: to the opposite side, or
 *   the opposite alignment, when it doesn't fit.
 * - `popover-trigger-delay-*` (both delays), `popover-trigger-delay-open-*`, and
 *   `popover-trigger-delay-close-*` go on the trigger. They set the native
 *   `interest-delay*` properties there (so `interestfor` waits), the
 *   `--interest-delay-start/-end` custom properties the `interestfor` polyfill
 *   reads, and the delays on the anchor's popover, so CSS-driven hover and
 *   keyboard focus wait the same way. Bare integers are milliseconds; brackets
 *   take any value. They replace the old `interest-delay-*` utilities.
 */
import { describe, expect, it } from "vitest";
import {
  buildNatcoreCss,
  declarations,
  findDecls,
  flatten,
  resolveVars,
  winsByLayer,
} from "../../../../test/helpers/build-natcore-css.ts";

type Root = Awaited<ReturnType<typeof buildNatcoreCss>>;
type Side = "top" | "right" | "bottom" | "left";

const SURFACE_PROPS = /^(background(-color|-image)?|color|border(-.*)?)$/;
const SIDES: Side[] = ["top", "right", "bottom", "left"];
const FACING: Record<Side, Side> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};
const PLACEMENTS = (["top", "bottom", "left", "right"] as const).flatMap(
  (side) =>
    [side, `${side}-start`, `${side}-end`].map((name) => ({ name, side })),
);
const TRIGGERS = [
  "popover-trigger-hover",
  "popover-trigger-focus",
  "popover-trigger-checked",
] as const;
const DELAY_UTILITIES = [
  "popover-trigger-delay",
  "popover-trigger-delay-open",
  "popover-trigger-delay-close",
] as const;
const MD = "width >= 48rem";
const SLOT = '[data-slot="popover"]';

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
        atRule: MD,
      })["transition-delay"],
    ).toBe("500ms");
  });

  it("margins reads a Tailwind margin utility as a gap on that side", async () => {
    const root = await buildNatcoreCss(["mt-2"]);

    expect(margins(root, ["mt-2"])).toEqual(gapOn("top"));
  });

  it("margins expands the margin shorthand", async () => {
    const root = await buildNatcoreCss(["m-2", "mt-0"]);

    expect(margins(root, ["m-2", "mt-0"])).toEqual({
      top: "0",
      right: "gap",
      bottom: "gap",
      left: "gap",
    });
  });
});

describe("popover element", () => {
  it("is fixed, so overflow ancestors don't clip it", async () => {
    const root = await buildNatcoreCss(["popover"]);

    expect(popoverDecls(root).position).toBe("fixed");
  });

  it("anchors to the button that opened it natively", async () => {
    const root = await buildNatcoreCss(["popover"]);

    expect(popoverDecls(root)["position-anchor"]).toBe("auto");
  });

  it("resets the native popover's inset and padding", async () => {
    const root = await buildNatcoreCss(["popover"]);
    const decls = placementDecls(root, ["popover"]);

    // Below the anchor; the bottom inset stretches its space past the screen.
    expect(decls.inset).toBe("auto auto -100vh auto");
    expect(decls.padding).toBe("0");
  });

  it("leaves background, color, and border to surface classes like card", async () => {
    const root = await buildNatcoreCss(["popover"]);
    const props = Object.keys(popoverDecls(root));

    expect(props.length).toBeGreaterThan(0);
    expect(props.filter((prop) => SURFACE_PROPS.test(prop))).toEqual([]);
  });

  it("its body sits in components.base, so Tailwind utilities override it", async () => {
    const root = await buildNatcoreCss(["popover"]);
    const layers = new Set(
      findDecls(root, { selector: ".popover" }).map((decl) => decl.layer),
    );

    expect([...layers]).toEqual(["utilities.components.base"]);
  });

  it("is raised with z-index 50, which a Tailwind z-* utility overrides", async () => {
    const root = await buildNatcoreCss(["popover", "z-10"]);
    const [raised] = findDecls(root, {
      selector: ".popover",
      prop: "z-index",
      atRule: null,
    });
    const [tailwind] = findDecls(root, { selector: ".z-10", prop: "z-index" });

    expect(raised!.value).toBe("50");
    expect(winsByLayer(root, tailwind!, raised!)).toBe(true);
  });

  it("drops its animation for reduced motion but keeps the delays", async () => {
    const root = await buildNatcoreCss(["popover"]);
    const reduced = declarations(root, {
      selector: ".popover",
      atRule: "prefers-reduced-motion: reduce",
    });

    expect(reduced["transition-duration"]).toBe("0s");
    expect(reduced.transition).toBeUndefined();
    expect(reduced["transition-delay"]).toBeUndefined();
  });
});

describe("popover placement", () => {
  it("defaults to below the anchor, a 0.5rem gap away", async () => {
    const root = await buildNatcoreCss(["popover"]);

    expect(margins(root, ["popover"])).toEqual(gapOn("top"));
  });

  it.each(PLACEMENTS)(
    "popover-$name puts the gap on the side facing the anchor",
    async ({ name, side }) => {
      const root = await buildNatcoreCss([`popover-${name}`]);

      expect(margins(root, [`popover-${name}`])).toEqual(gapOn(FACING[side]));
    },
  );

  it.each(PLACEMENTS)(
    "popover-$name is a complete popover on its own",
    async ({ name }) => {
      const root = await buildNatcoreCss(["popover", `popover-${name}`]);
      const bare = Object.keys(placementDecls(root, ["popover"]));
      const placed = Object.keys(placementDecls(root, [`popover-${name}`]));

      expect(bare.length).toBeGreaterThan(0);
      expect(placed.sort()).toEqual(bare.sort());
    },
  );

  it("popover-bottom matches the default", async () => {
    const root = await buildNatcoreCss(["popover", "popover-bottom"]);
    const bottom = placementDecls(root, ["popover-bottom"]);

    expect(Object.keys(bottom).length).toBeGreaterThan(0);
    expect(bottom).toEqual(placementDecls(root, ["popover"]));
  });

  it.each(PLACEMENTS)(
    "popover-$name differs from the other placements",
    async ({ name }) => {
      const others = PLACEMENTS.filter((p) => p.name !== name).map(
        (p) => `popover-${p.name}`,
      );
      const root = await buildNatcoreCss([`popover-${name}`, ...others]);
      const own = placementDecls(root, [`popover-${name}`]);

      for (const other of others) {
        expect(placementDecls(root, [other])).not.toEqual(own);
      }
    },
  );

  it.each(["popover-middle", "popover-[top]", "popover-top-center"])(
    "%s isn't a placement, so it generates nothing",
    async (cls) => {
      const root = await buildNatcoreCss([cls]);

      expect(
        flatten(root).filter((decl) => decl.selector === classSelector(cls)),
      ).toEqual([]);
    },
  );

  it("sets placement values directly, with no runtime custom properties", async () => {
    const root = await buildNatcoreCss([
      "popover",
      ...PLACEMENTS.map((p) => `popover-${p.name}`),
    ]);
    const placementProps = ["position-area", "margin", "transform-origin"];
    const values = flatten(root)
      .filter(
        (decl) =>
          /^\.popover(-|$)/.test(decl.selector) &&
          placementProps.includes(decl.prop),
      )
      .map((decl) => decl.value);
    const rootVars = flatten(root).filter(
      (decl) =>
        /:root/.test(decl.selector) && decl.prop.startsWith("--popover"),
    );

    expect(values.length).toBeGreaterThan(0);
    expect(values.filter((value) => value.includes("var(--popover"))).toEqual(
      [],
    );
    expect(rootVars).toEqual([]);
  });

  it("a breakpoint placement overrides the base placement", async () => {
    const root = await buildNatcoreCss(["popover-bottom", "md:popover-right"]);
    const order = flatten(root)
      .filter((decl) => decl.prop === "position-area")
      .map((decl) => decl.selector);

    expect(order.indexOf(".popover-bottom")).toBeGreaterThan(-1);
    expect(order.indexOf(classSelector("md:popover-right"))).toBeGreaterThan(
      order.indexOf(".popover-bottom"),
    );
  });

  it("placements combine with breakpoints", async () => {
    const root = await buildNatcoreCss(["popover", "md:popover-right"]);

    expect(
      Object.keys(
        declarations(root, {
          selector: classSelector("md:popover-right"),
          atRule: MD,
        }),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      declarations(root, {
        selector: classSelector("md:popover-right"),
        atRule: null,
      }),
    ).toEqual({});
  });

  it.each(["mb-1", "m-0"])(
    "a Tailwind margin utility (%s) beats the gap by cascade layer",
    async (cls) => {
      const root = await buildNatcoreCss(["popover", "popover-top", cls]);
      const [tailwind] = findDecls(root, {
        selector: `.${cls}`,
        prop: cls === "m-0" ? "margin" : "margin-bottom",
      });

      for (const selector of [".popover", ".popover-top"]) {
        const [gap] = findDecls(root, {
          selector,
          prop: "margin",
          atRule: null,
        });
        expect(winsByLayer(root, tailwind!, gap!)).toBe(true);
      }
    },
  );
});

describe("popover-flip", () => {
  it("is off by default: no placement flips on its own", async () => {
    const root = await buildNatcoreCss([
      "popover",
      ...PLACEMENTS.map((p) => `popover-${p.name}`),
    ]);

    expect(
      flatten(root).filter((decl) => decl.prop === "position-try-fallbacks"),
    ).toEqual([]);
  });

  it("flips to the other side, the other alignment, or both", async () => {
    const root = await buildNatcoreCss(["popover", "popover-flip"]);

    expect(
      declarations(root, { selector: ".popover-flip", atRule: null })[
        "position-try-fallbacks"
      ],
    ).toBe("flip-block, flip-inline, flip-block flip-inline");
  });

  it("is a component utility, so it applies over any placement", async () => {
    const root = await buildNatcoreCss(["popover-top", "popover-flip"]);
    const [flip] = findDecls(root, {
      selector: ".popover-flip",
      prop: "position-try-fallbacks",
    });

    expect(flip!.layer).toBe("utilities.components");
  });

  it("works behind variants", async () => {
    const root = await buildNatcoreCss(["popover", "md:popover-flip"]);

    expect(
      declarations(root, {
        selector: classSelector("md:popover-flip"),
        atRule: MD,
      })["position-try-fallbacks"],
    ).toBe("flip-block, flip-inline, flip-block flip-inline");
  });
});

describe("popover-anchor", () => {
  it("is the anchor its slotted popover is positioned against", async () => {
    const root = await buildNatcoreCss(["popover", "popover-anchor"]);
    const name = declarations(root, { selector: ".popover-anchor" })[
      "anchor-name"
    ];
    const anchored = flatten(root).filter(
      (decl) =>
        decl.prop === "position-anchor" &&
        decl.selector === `.popover-anchor > ${SLOT}`,
    );

    expect(name ?? "").toMatch(/^--/);
    expect(anchored.map((decl) => decl.value)).toContain(name);
  });

  it("scopes its anchor name, so each popover finds its own wrapper", async () => {
    const root = await buildNatcoreCss(["popover-anchor"]);
    const decls = declarations(root, { selector: ".popover-anchor" });

    expect(decls["anchor-name"] ?? "").toMatch(/^--/);
    expect(decls["anchor-scope"]).toBe(decls["anchor-name"]);
  });
});

describe.each(TRIGGERS)("%s", (trigger) => {
  it("shows the popover that is a direct child of its anchor", async () => {
    const root = await buildNatcoreCss([trigger]);

    expect(popoverRules(root, trigger).length).toBeGreaterThan(0);
  });

  it("works behind variants", async () => {
    const root = await buildNatcoreCss([`md:${trigger}`]);
    const rules = popoverRules(root, `md:${trigger}`);

    expect(rules.length).toBeGreaterThan(0);
    expect(
      rules.every((decl) => decl.atRules.some((a) => a.includes(MD))),
    ).toBe(true);
  });
});

describe.each(DELAY_UTILITIES)("%s-*", (utility) => {
  it("bare integers set the native delay and the polyfill's custom property in ms", async () => {
    const root = await buildNatcoreCss([`${utility}-500`]);

    expect(
      declarations(root, { selector: `.${utility}-500`, atRule: null }),
    ).toEqual(triggerDecls(utility, "calc(500 * 1ms)"));
  });

  it("accepts 0", async () => {
    const root = await buildNatcoreCss([`${utility}-0`]);

    expect(
      declarations(root, { selector: `.${utility}-0`, atRule: null }),
    ).toEqual(triggerDecls(utility, "calc(0 * 1ms)"));
  });

  it.each(["1.5s", "normal", "var(--my-delay)"])(
    "passes the arbitrary value [%s] through",
    async (value) => {
      const cls = `${utility}-[${value}]`;
      const root = await buildNatcoreCss([cls]);

      expect(
        declarations(root, { selector: classSelector(cls), atRule: null }),
      ).toEqual(triggerDecls(utility, value));
    },
  );

  it.each(["-100", "1.5", "fast"])(
    "generates nothing for the non-matching value %s",
    async (value) => {
      const root = await buildNatcoreCss([`${utility}-${value}`]);

      expect(delayClassDecls(root)).toEqual([]);
    },
  );

  it("works behind variants", async () => {
    const root = await buildNatcoreCss([`md:${utility}-500`]);

    expect(
      declarations(root, {
        selector: classSelector(`md:${utility}-500`),
        atRule: MD,
      }),
    ).toEqual(triggerDecls(utility, "calc(500 * 1ms)"));
  });

  it("is a component utility (utilities.components)", async () => {
    const root = await buildNatcoreCss([`${utility}-500`]);
    const layers = flatten(root)
      .filter((decl) => decl.selector.includes(`.${utility}-500`))
      .map((decl) => decl.layer);

    expect(layers.length).toBeGreaterThan(0);
    expect(new Set(layers)).toEqual(new Set(["utilities.components"]));
  });
});

describe("popover-trigger-delay shorthand", () => {
  it.each([
    ["popover-trigger-delay-500", "calc(500 * 1ms)"],
    ["popover-trigger-delay-[1s]", "1s"],
    ["popover-trigger-delay-[calc(1s)]", "calc(1s)"],
  ])(
    "%s sets the open and close custom properties the polyfill reads, not --interest-delay",
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
    ["popover-trigger-delay-500", "popover-trigger-delay-open-200"],
    ["popover-trigger-delay-500", "popover-trigger-delay-close-200"],
    ["popover-trigger-delay-500", "popover-trigger-delay-open-[normal]"],
    ["popover-trigger-delay-[2s]", "popover-trigger-delay-close-[normal]"],
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

describe("popover-trigger-delay utilities overall", () => {
  it("open and close utilities combine on one element", async () => {
    const root = await buildNatcoreCss([
      "popover-trigger-delay-open-500",
      "popover-trigger-delay-close-200",
    ]);

    expect(
      declarations(root, {
        selector: ".popover-trigger-delay-open-500",
        atRule: null,
      })["interest-delay-start"],
    ).toBe("calc(500 * 1ms)");
    expect(
      declarations(root, {
        selector: ".popover-trigger-delay-close-200",
        atRule: null,
      })["interest-delay-end"],
    ).toBe("calc(200 * 1ms)");
  });

  it("sets no interest delays by default", async () => {
    const root = await buildNatcoreCss([]);

    expect(
      flatten(root).filter((decl) => /interest-delay/.test(decl.prop)),
    ).toEqual([]);
  });

  it("never sets --interest-delay", async () => {
    const root = await buildNatcoreCss(
      DELAY_UTILITIES.flatMap((utility) => [
        `${utility}-500`,
        `${utility}-[1s]`,
      ]),
    );

    expect(delayClassDecls(root).length).toBeGreaterThan(0);
    expect(
      delayClassDecls(root).filter((decl) => decl.prop === "--interest-delay"),
    ).toEqual([]);
  });

  it.each([
    "interest-delay-500",
    "interest-delay-start-500",
    "interest-delay-end-500",
  ])("the old %s utility no longer exists", async (cls) => {
    const root = await buildNatcoreCss([cls]);

    expect(flatten(root).filter((decl) => decl.selector.includes(cls))).toEqual(
      [],
    );
  });
});

describe("popover-trigger-delay on a wrapper's popover", () => {
  it.each([
    ["popover-trigger-delay-500", "calc(500 * 1ms)", "calc(500 * 1ms)"],
    ["popover-trigger-delay-[1s]", "1s", "1s"],
    ["popover-trigger-delay-open-500", "calc(500 * 1ms)", undefined],
    ["popover-trigger-delay-close-500", undefined, "calc(500 * 1ms)"],
  ])(
    "%s also sets the delay on its anchor's popover",
    async (cls, open, close) => {
      const root = await buildNatcoreCss([cls]);

      expect(popoverDelays(root, cls)).toEqual({
        ...(open && { open }),
        ...(close && { close }),
      });
    },
  );

  it("works behind variants", async () => {
    const cls = "md:popover-trigger-delay-500";
    const root = await buildNatcoreCss([cls]);

    expect(popoverDelays(root, cls, MD)).toEqual({
      open: "calc(500 * 1ms)",
      close: "calc(500 * 1ms)",
    });
    expect(popoverDelays(root, cls, null)).toEqual({});
  });

  it.each([
    ["popover-trigger-delay-500", "popover-trigger-delay-open-200"],
    ["popover-trigger-delay-500", "popover-trigger-delay-close-200"],
  ])("on the popover, %s is overridden by %s", async (shorthand, longhand) => {
    const root = await buildNatcoreCss([shorthand, longhand]);
    const order = flatten(root)
      .filter((decl) => decl.atRules.length === 0)
      .map((decl) => decl.selector);
    const last = (cls: string) =>
      order.findLastIndex((selector) => isPopoverOf(selector, cls));

    expect(last(shorthand)).toBeGreaterThan(-1);
    expect(last(longhand)).toBeGreaterThan(last(shorthand));
  });

  it("is a component utility, and the hover trigger reads it for the close delay", async () => {
    const root = await buildNatcoreCss([
      "popover",
      "popover-anchor",
      "popover-trigger-hover",
      "popover-trigger-delay-500",
    ]);
    const [delay] = popoverRules(root, "popover-trigger-delay-500").filter(
      (decl) => decl.atRules.length === 0,
    );
    const closeDelays = popoverRules(root, "popover-trigger-hover").filter(
      (decl) => decl.prop === "transition-delay",
    );

    expect(delay!.layer).toBe("utilities.components");
    expect(closeDelays.map((decl) => decl.value)).toContain(
      "var(--popover-delay-close)",
    );
  });

  it("a wrapper without a hover or focus trigger has no close delay", async () => {
    const root = await buildNatcoreCss(["popover", "popover-anchor"]);

    expect(
      findDecls(root, { selector: /popover-anchor/, prop: "transition-delay" })
        .filter((decl) => decl.atRules.length === 0)
        .map((decl) => decl.value),
    ).not.toContain("var(--popover-delay-close)");
  });
});

describe("popover output overall", () => {
  it("uses no container queries or @scope (minifiers mangle them)", async () => {
    const root = await buildNatcoreCss([
      "popover",
      "popover-anchor",
      "popover-flip",
      ...PLACEMENTS.map((p) => `popover-${p.name}`),
      ...TRIGGERS,
      ...DELAY_UTILITIES.map((utility) => `${utility}-500`),
    ]);
    const popoverDeclList = flatten(root).filter((decl) =>
      /popover/.test(decl.selector),
    );

    expect(popoverDeclList.length).toBeGreaterThan(0);
    expect(
      popoverDeclList
        .flatMap((decl) => decl.atRules)
        .filter((a) => /^@(container|scope)/.test(a)),
    ).toEqual([]);
  });
});

/** Declarations on `.popover` itself, outside any at-rule. */
function popoverDecls(root: Root) {
  return declarations(root, { selector: ".popover", atRule: null });
}

/**
 * Declarations of the given classes on one element (later classes win), vars
 * resolved, like the browser would compute them.
 */
function placementDecls(root: Root, classes: string[]) {
  const merged: Record<string, string> = Object.assign(
    {},
    ...classes.map((cls) =>
      declarations(root, { selector: classSelector(cls), atRule: null }),
    ),
  );

  return Object.fromEntries(
    Object.entries(merged)
      .filter(([prop]) => !prop.startsWith("--"))
      .map(([prop, value]) => [prop, resolveVars(root, value, merged)]),
  );
}

/** The four margins of an element with `classes`, each "gap" (0.5rem) or its value. */
function margins(root: Root, classes: string[]) {
  const decls = placementDecls(root, classes);
  const sides = Object.fromEntries(SIDES.map((side) => [side, "0"])) as Record<
    Side,
    string
  >;

  if (decls.margin) {
    const [top, right = top, bottom = top, left = right] = splitTopLevel(
      decls.margin,
    ) as [string, string?, string?, string?];
    Object.assign(sides, { top, right, bottom, left });
  }
  for (const side of SIDES) {
    if (decls[`margin-${side}`]) sides[side] = decls[`margin-${side}`]!;
  }

  return Object.fromEntries(
    SIDES.map((side) => [side, normalizeLength(sides[side])]),
  );
}

function gapOn(side: Side) {
  return Object.fromEntries(SIDES.map((s) => [s, s === side ? "gap" : "0"]));
}

/** "gap" for 0.5rem and "0" for zero, however Tailwind writes them (`--spacing(n)` → calc). */
function normalizeLength(value: string) {
  const v = value.replace(/\s+/g, " ").trim();
  if (/^(0\.5rem|calc\(0\.25rem \* 2\))$/.test(v)) return "gap";
  if (/^(0|0px|0rem|calc\([^()]* \* 0\))$/.test(v)) return "0";
  return v;
}

/** Rules a trigger utility `cls` writes for its wrapper's slotted popover. */
function popoverRules(root: Root, cls: string) {
  return flatten(root).filter((decl) => isPopoverOf(decl.selector, cls));
}

function isPopoverOf(selector: string, cls: string) {
  return (
    selector.includes(classSelector(cls)) && selector.endsWith(`> ${SLOT}`)
  );
}

/** Delays set on the popover for `cls`: custom properties named for open / close. */
function popoverDelays(root: Root, cls: string, atRule: string | null = null) {
  const delays: { open?: string; close?: string } = {};
  for (const decl of popoverRules(root, cls)) {
    const inAtRule =
      atRule === null ?
        decl.atRules.length === 0
      : decl.atRules.some((a) => a.includes(atRule));
    if (!inAtRule || !decl.prop.startsWith("--")) continue;
    if (/open/.test(decl.prop)) delays.open = decl.value;
    if (/close/.test(decl.prop)) delays.close = decl.value;
  }
  return delays;
}

/** Declarations a trigger delay utility sets on the trigger for `value`. */
function triggerDecls(
  utility: (typeof DELAY_UTILITIES)[number],
  value: string,
) {
  return (
    utility === "popover-trigger-delay" ?
      {
        "interest-delay": value,
        "--interest-delay-start": value,
        "--interest-delay-end": value,
      }
    : utility === "popover-trigger-delay-open" ?
      { "interest-delay-start": value, "--interest-delay-start": value }
    : { "interest-delay-end": value, "--interest-delay-end": value }
  );
}

/** Every declaration generated for a trigger delay utility class. */
function delayClassDecls(root: Root) {
  return flatten(root).filter((decl) =>
    decl.selector.includes("popover-trigger-delay"),
  );
}

/** Splits a value on top-level whitespace (not inside parentheses). */
function splitTopLevel(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of value.trim()) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (/\s/.test(char) && depth === 0) {
      if (current) parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/** Class selector for a Tailwind candidate, escaped like Tailwind's output. */
function classSelector(candidate: string) {
  return `.${candidate.replace(/[[\]:.()%,]/g, "\\$&")}`;
}
