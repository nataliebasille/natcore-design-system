/**
 * Spec for the `tabs` component (tabs.css.ts). Each direct child of `.tabs` is
 * one item: a tab and the panel it shows. In a `<details name>` the
 * `<summary>` is the tab and the rest (`::details-content`) is the panel; any
 * other item marks them with `data-slot="tab"` and `data-slot="panel"`. There
 * are three ways to select one: an open `<details>`, a checked radio inside
 * the tab's `<label>`, or `aria-selected="true"` on the tab (set by a script).
 *
 * Layout: `tabs` puts the tabs in a row above the panel, `tabs-v` in a column
 * beside it, and both take a palette modifier. Every panel shares one grid
 * cell and closed panels are only hidden, so switching tabs never resizes the
 * tabs.
 *
 * Look: `tabs-style-underline` (what bare `tabs` looks like),
 * `tabs-style-pill`, and `tabs-style-boxed` on the same element. They take no
 * palette; their colors come from the tabs element's palette. Everything sits
 * in `utilities.components.base`, so Tailwind utilities override it.
 */
import { describe, expect, it } from "vitest";
import {
  buildNatcoreCss,
  declarations,
  findDecls,
  resolveVars,
  winsByLayer,
  type FlatDecl,
} from "../../../../test/helpers/build-natcore-css.ts";

type Root = Awaited<ReturnType<typeof buildNatcoreCss>>;

const TAB_SLOT = '[data-slot="tab"]';
const PANEL_SLOT = '[data-slot="panel"]';
const TAB = `:is(${TAB_SLOT}, summary)`;
const STYLES = ["underline", "pill", "boxed"] as const;

describe("tabs layout", () => {
  it("lays the tabs out in a grid: one max-content track per tab, then 1fr", async () => {
    const root = await buildNatcoreCss(["tabs"]);

    expect(styles(root, ".tabs")).toMatchObject({
      display: "grid",
      "grid-template-columns": "repeat(50, max-content) 1fr",
      "column-gap": "0",
    });
  });

  it("makes each item's tab and panel direct grid items", async () => {
    const root = await buildNatcoreCss(["tabs"]);

    expect(styles(root, ".tabs > *")).toMatchObject({ display: "contents" });
  });

  it("infers a <details> item's tab and panel: <summary> and ::details-content", async () => {
    const root = await buildNatcoreCss(["tabs"]);

    expect(styles(root, `.tabs > * > ${TAB}`)["grid-row"]).toBe("1");
    expect(styles(root, ".tabs > details::details-content")).toMatchObject({
      display: "block",
      "grid-row": "3",
    });
    // A data-slot="panel" inside a <details> isn't a second panel box.
    expect(findDecls(root, { selector: `.tabs > * > ${PANEL_SLOT}` })).toEqual(
      [],
    );
  });

  it("puts the tabs in the first row, the divider in the second, and every panel in one cell below", async () => {
    const root = await buildNatcoreCss(["tabs"]);

    expect(styles(root, `.tabs > * > ${TAB}`)["grid-row"]).toBe("1");
    expect(styles(root, ".tabs::before")).toMatchObject({
      "grid-row": "2",
      "grid-column": "1 / -1",
    });
    for (const panel of panels("tabs")) {
      expect(styles(root, panel)).toMatchObject({
        "grid-row": "3",
        "grid-column": "1 / -1",
      });
    }
  });

  it("hides closed panels without removing them from the layout, for each markup", async () => {
    const root = await buildNatcoreCss(["tabs", "tabs-v"]);

    for (const cls of ["tabs", "tabs-v"]) {
      for (const closed of closedPanels(cls)) {
        expect(styles(root, closed)).toEqual({
          visibility: "hidden",
          "content-visibility": "visible",
        });
      }
    }
    expect(
      findDecls(root, { selector: /^\.tabs/ }).filter(
        (decl) =>
          /data-slot="panel"\]$|::details-content$/.test(decl.selector) &&
          ((decl.prop === "display" && decl.value === "none") ||
            decl.prop === "block-size"),
      ),
    ).toEqual([]);
  });

  it("styles the selected tab for each markup", async () => {
    const root = await buildNatcoreCss(["tabs"]);
    const selected = within(root, "tabs")
      .filter((decl) => decl.prop === "background-color")
      .map((decl) => decl.selector);

    expect(selected).toEqual(
      expect.arrayContaining([
        `.tabs > details[open] > ${TAB}`,
        `.tabs > * > ${TAB}:is([aria-selected="true"], :has(:checked))`,
      ]),
    );
  });

  it("stops a click from closing the open <details> tab", async () => {
    const root = await buildNatcoreCss(["tabs"]);

    expect(styles(root, `.tabs > details[open] > ${TAB}`)).toMatchObject({
      "pointer-events": "none",
    });
  });

  it("hides the <summary> disclosure marker", async () => {
    const root = await buildNatcoreCss(["tabs"]);

    expect(styles(root, `.tabs > * > ${TAB}`)["list-style"]).toBe("none");
  });

  it("hides a tab's radio visually but keeps it focusable", async () => {
    const root = await buildNatcoreCss(["tabs"]);

    expect(
      styles(root, `.tabs > * > ${TAB_SLOT} input[type="radio"]`),
    ).toMatchObject({
      position: "absolute",
      width: "1px",
      height: "1px",
      overflow: "hidden",
    });
  });

  it("rings a tab whose radio has keyboard focus", async () => {
    const root = await buildNatcoreCss(["tabs"]);
    const ringed = within(root, "tabs").filter(
      (decl) =>
        decl.prop === "outline-style" &&
        decl.selector.includes(TAB) &&
        decl.selector.includes(":has(:focus-visible)"),
    );

    expect(ringed).not.toEqual([]);
  });

  it("finds tabs and panels by element or data-slot, not by position or .active", async () => {
    const root = await buildNatcoreCss(["tabs"]);
    const selectors = within(root, "tabs").map((decl) => decl.selector);

    expect(selectors).not.toEqual([]);
    expect(
      selectors.filter((selector) =>
        /:first-child|:last-child|\.active|^\.tabs input/.test(selector),
      ),
    ).toEqual([]);
  });

  it("drops the old tabs-<n>, tabs-<look>, and tabs-vertical classes", async () => {
    const old = [
      "tabs-2",
      "tabs-underline",
      "tabs-pill",
      "tabs-boxed",
      "tabs-vertical",
    ];
    const root = await buildNatcoreCss(old);

    expect(
      findDecls(root, {
        selector: new RegExp(`^\\.(${old.join("|")})(?![\\w-])`),
      }),
    ).toEqual([]);
  });
});

describe("tabs-v", () => {
  it("is tabs on its own, with the tabs in a column beside the panel", async () => {
    const root = await buildNatcoreCss(["tabs-v"]);

    expect(styles(root, ".tabs-v")).toMatchObject({
      display: "grid",
      "grid-template-columns": "max-content auto 1fr",
      "grid-template-rows": "repeat(50, min-content) 1fr",
    });
    expect(styles(root, ".tabs-v > *")).toMatchObject({ display: "contents" });
    expect(styles(root, `.tabs-v > * > ${TAB}`)).toMatchObject({
      "grid-column": "1",
      "grid-row": "auto",
    });
    expect(styles(root, ".tabs-v::before")).toMatchObject({
      "grid-column": "2",
      "grid-row": "1 / -1",
    });
    for (const panel of panels("tabs-v")) {
      expect(styles(root, panel)).toMatchObject({
        "grid-column": "3",
        "grid-row": "1 / -1",
      });
    }
  });

  it("moves the tab's edge to the side facing the panel", async () => {
    const root = await buildNatcoreCss(["tabs", "tabs-v"]);

    expect(styles(root, `.tabs > * > ${TAB}`)).toMatchObject({
      "border-block-width": "var(--tabs-tab-sides) var(--tabs-tab-edge)",
      "border-inline-width": "var(--tabs-tab-sides)",
    });
    expect(styles(root, `.tabs-v > * > ${TAB}`)).toMatchObject({
      "border-block-width": "var(--tabs-tab-sides)",
      "border-inline-width": "var(--tabs-tab-sides) var(--tabs-tab-edge)",
    });
  });

  it("works under a breakpoint", async () => {
    const root = await buildNatcoreCss(["tabs", "md:tabs-v"]);

    expect(
      findDecls(root, {
        selector: ".md\\:tabs-v",
        prop: "grid-template-columns",
        atRule: "@media",
      }).map((decl) => decl.value),
    ).toEqual(["max-content auto 1fr"]);
  });
});

describe("tabs-style", () => {
  it("bare tabs has the underline look, at zero specificity", async () => {
    const root = await buildNatcoreCss(["tabs", "tabs-style-underline"]);
    const defaults = lookVars(root, ":where(.tabs)");

    expect(Object.keys(defaults)).not.toEqual([]);
    expect(defaults).toEqual(lookVars(root, ".tabs-style-underline"));
  });

  it.each(STYLES)(
    "tabs-style-%s only sets the look, not the layout",
    async (look) => {
      const root = await buildNatcoreCss([`tabs-style-${look}`]);
      const props = Object.keys(styles(root, `.tabs-style-${look}`, true));

      expect(props).not.toEqual([]);
      expect(props.filter((prop) => !prop.startsWith("--tabs-"))).toEqual([]);
    },
  );

  it.each(STYLES)(
    "tabs-style-%s styles the selected tab apart from the others",
    async (look) => {
      const root = await buildNatcoreCss(["tabs", `tabs-style-${look}`]);
      const lookValues = lookVars(root, `.tabs-style-${look}`);
      const tab = styles(root, `.tabs > * > ${TAB}`);
      const selected = styles(root, `.tabs > details[open] > ${TAB}`);

      const changed = ["color", "background-color", "border-color"].filter(
        (prop) =>
          resolveVars(root, selected[prop]!, lookValues) !==
          resolveVars(root, tab[prop]!, lookValues),
      );
      expect(changed).not.toEqual([]);
    },
  );

  it("the looks differ from each other", async () => {
    const root = await buildNatcoreCss(STYLES.map((s) => `tabs-style-${s}`));
    const looks = STYLES.map((s) =>
      JSON.stringify(lookVars(root, `.tabs-style-${s}`)),
    );

    expect(new Set(looks).size).toBe(STYLES.length);
  });

  it.each(["tabs", "tabs-v"])(
    "%s/primary switches to the primary palette",
    async (cls) => {
      const root = await buildNatcoreCss([`${cls}/primary`]);

      expect(
        findDecls(root, {
          selector: `.${cls}\\/primary`,
          prop: "--bg-tone-600",
        }).map((decl) => resolveVars(root, decl.value)),
      ).toEqual([expect.stringContaining("primary")]);
    },
  );

  it.each(STYLES)(
    "tabs-style-%s takes no palette; its colors come from the tabs element's",
    async (look) => {
      const root = await buildNatcoreCss([
        `tabs-style-${look}/primary`,
        `tabs-style-${look}`,
      ]);

      expect(
        findDecls(root, { selector: /^\.tabs-style-[\w-]+\\\/primary/ }),
      ).toEqual([]);
      expect(
        Object.values(lookVars(root, `.tabs-style-${look}`)).filter((value) =>
          /primary|secondary|accent|surface/.test(value),
        ),
      ).toEqual([]);
    },
  );
});

describe("tabs cascade layer", () => {
  it.each([
    "tabs",
    "tabs-v",
    "tabs/primary",
    "tabs-v/primary",
    ...STYLES.map((s) => `tabs-style-${s}`),
  ])("%s is in the components base layer", async (cls) => {
    const root = await buildNatcoreCss([cls]);

    expect(layers(root, cls)).toEqual(["utilities.components.base"]);
  });

  it("uses !important only to hide everything inside closed panels", async () => {
    const root = await buildNatcoreCss([
      "tabs",
      "tabs-v",
      ...STYLES.map((s) => `tabs-style-${s}`),
    ]);
    const decls = findDecls(root, { selector: /\.tabs/ });
    const important = decls.filter((d) => d.important);

    expect(decls).not.toEqual([]);
    expect(important).not.toEqual([]);
    expect(
      important.filter(
        (d) =>
          !(
            d.prop === "visibility" &&
            d.value === "hidden" &&
            /(\[data-slot="panel"\] \*|details:not\(\[open\]\) > :not\(summary\)( \*)?)$/.test(
              d.selector,
            )
          ),
      ),
    ).toEqual([]);
  });
});

describe("tabs overrides", () => {
  it.each([
    ["p-4", "tabs", "padding"],
    ["grid-cols-1", "tabs", "grid-template-columns"],
    ["grid-cols-1", "tabs-v", "grid-template-columns"],
  ])("Tailwind %s overrides %s's %s", async (tailwindCls, cls, prop) => {
    const root = await buildNatcoreCss([cls, tailwindCls]);
    const [tailwind] = findDecls(root, { selector: `.${tailwindCls}`, prop });
    const [component] = findDecls(root, {
      selector: `.${cls}`,
      prop,
      atRule: null,
    });

    expect(winsByLayer(root, tailwind!, component!)).toBe(true);
  });
});

/** Every non-preflight declaration on `.cls` or a selector inside it. */
function within(root: Root, cls: string): FlatDecl[] {
  const escaped = cls
    .replaceAll("/", "\\/")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const own = new RegExp(`^\\.${escaped}(?![\\w\\\\-])`);
  return findDecls(root, { selector: own }).filter(
    (decl) => decl.layer !== "base",
  );
}

/**
 * Last value per property for an exact selector, ignoring preflight and, unless
 * `withCustomProps`, custom properties.
 */
function styles(root: Root, selector: string, withCustomProps = false) {
  const decls: Record<string, string> = {};
  for (const decl of findDecls(root, { selector, atRule: null })) {
    if (decl.layer === "base") continue;
    if (!withCustomProps && decl.prop.startsWith("--")) continue;
    decls[decl.prop] = decl.value;
  }
  return decls;
}

/** The --tabs-* look vars a selector sets. */
function lookVars(root: Root, selector: string) {
  return Object.fromEntries(
    Object.entries(declarations(root, { selector, atRule: null })).filter(
      ([prop]) => prop.startsWith("--tabs-"),
    ),
  );
}

/** The panel selectors as compiled for `cls`: slotted panels and <details> content. */
function panels(cls: string) {
  return [
    `.${cls} > :not(details) > ${PANEL_SLOT}`,
    `.${cls} > details::details-content`,
  ];
}

/** The selectors for the panels of unselected items, as compiled for `cls`. */
function closedPanels(cls: string) {
  return [
    `.${cls} > :not(details, :has(> ${TAB_SLOT} :checked), :has(> ${TAB_SLOT}[aria-selected="true"])) > ${PANEL_SLOT}`,
    `.${cls} > details:not([open])::details-content`,
  ];
}

/** Distinct cascade layers of every non-preflight declaration for a class. */
function layers(root: Root, cls: string) {
  return [...new Set(within(root, cls).map((decl) => decl.layer))];
}
