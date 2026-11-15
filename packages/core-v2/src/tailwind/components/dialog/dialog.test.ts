/**
 * Spec for the `dialog` component (dialog.css.ts). The dialog styles a native
 * <dialog>: placement, size, backdrop, open/close animation, and page scroll
 * lock. Its surface (background, border, sections) comes from other classes
 * such as `card-soft`.
 */
import { describe, expect, it } from "vitest";
import {
  buildNatcoreCss,
  declarations,
  findDecls,
  flatten,
  resolveVars,
} from "../../../../test/helpers/build-natcore-css.ts";

const SURFACE_PROPS = /^(background(-color|-image)?|color|border(-.*)?)$/;

describe("dialog placement", () => {
  it("`dialog` on its own renders the centered placement", async () => {
    const root = await buildNatcoreCss(["dialog", "dialog-center"]);

    const bare = classRules(root, "dialog");
    expect(bare.length).toBeGreaterThan(0);
    expect(bare).toEqual(classRules(root, "dialog-center"));
  });

  it("centers the dialog with auto margins", async () => {
    const root = await buildNatcoreCss(["dialog"]);

    expect(
      declarations(root, { selector: ".dialog", atRule: null }).margin,
    ).toBe("auto");
  });

  it("dialog-top and dialog-bottom change the placement margins", async () => {
    const root = await buildNatcoreCss([
      "dialog",
      "dialog-top",
      "dialog-bottom",
    ]);
    const margin = (cls: string) =>
      resolveVars(
        root,
        declarations(root, { selector: `.${cls}`, atRule: null }).margin ?? "",
      );

    expect(margin("dialog-top")).not.toBe("");
    expect(margin("dialog-bottom")).not.toBe("");
    expect(margin("dialog-top")).not.toBe(margin("dialog"));
    expect(margin("dialog-bottom")).not.toBe(margin("dialog"));
    expect(margin("dialog-top")).not.toBe(margin("dialog-bottom"));
  });

  it("dialog-bottom is a sheet that slides up from the bottom edge", async () => {
    const root = await buildNatcoreCss(["dialog", "dialog-bottom"]);
    const sheet = declarations(root, {
      selector: ".dialog-bottom",
      atRule: null,
    });
    const centered = declarations(root, { selector: ".dialog", atRule: null });

    expect(resolveVars(root, sheet.transform ?? "", sheet)).toContain(
      "translateY(100%)",
    );
    expect(resolveVars(root, centered.transform ?? "", centered)).toContain(
      "scale(",
    );
  });

  it("placements combine with breakpoints (sheet on mobile, centered from sm)", async () => {
    const root = await buildNatcoreCss(["dialog-bottom", "sm:dialog-center"]);

    expect(
      declarations(root, {
        selector: ".sm\\:dialog-center",
        atRule: "width >= 40rem",
      }).margin,
    ).toBe("auto");
    expect(
      declarations(root, { selector: ".sm\\:dialog-center", atRule: null }),
    ).toEqual({});
  });
});

describe("dialog surface", () => {
  it.each(["dialog", "dialog-top", "dialog-bottom"])(
    "%s leaves background, color, and border to surface classes like card",
    async (cls) => {
      const root = await buildNatcoreCss([cls]);
      const props = Object.keys(
        declarations(root, { selector: `.${cls}`, atRule: null }),
      );

      expect(props.length).toBeGreaterThan(0);
      expect(props.filter((prop) => SURFACE_PROPS.test(prop))).toEqual([]);
    },
  );

  it("resets the native dialog padding", async () => {
    const root = await buildNatcoreCss(["dialog"]);

    expect(
      declarations(root, { selector: ".dialog", atRule: null }).padding,
    ).toBe("0");
  });
});

describe("dialog width", () => {
  it("defaults to 32rem wide", async () => {
    const root = await buildNatcoreCss(["dialog"]);
    const decls = declarations(root, { selector: ".dialog", atRule: null });

    expect(resolveVars(root, decls.width ?? "", decls)).toContain("32rem");
  });

  it("is capped to the screen so it never overflows", async () => {
    const root = await buildNatcoreCss(["dialog"]);
    const decls = declarations(root, { selector: ".dialog", atRule: null });

    expect(resolveVars(root, decls["max-width"] ?? "", decls)).toContain(
      "100%",
    );
    expect(resolveVars(root, decls["max-height"] ?? "", decls)).toContain(
      "100%",
    );
  });

  it("Tailwind width classes override the default width", async () => {
    const root = await buildNatcoreCss(["dialog", "w-3xl"]);
    const layerOf = (selector: string) =>
      findDecls(root, { selector, prop: "width", atRule: null })[0]?.layer;

    expect(layerOf(".dialog")).toBe("utilities.components.base");
    expect(layerOf(".w-3xl")).toBe("utilities");
  });

  it.each([
    ["size-full", "width"],
    ["max-w-none", "max-width"],
    ["max-h-none", "max-height"],
    ["m-0", "margin"],
  ])(
    "full screen via Tailwind: %s overrides the dialog's %s",
    async (cls, prop) => {
      const root = await buildNatcoreCss(["dialog", cls]);
      const layerOf = (selector: string) =>
        findDecls(root, { selector, prop, atRule: null })[0]?.layer;

      expect(layerOf(".dialog")).toBe("utilities.components.base");
      expect(layerOf(`.${cls}`)).toBe("utilities");
    },
  );
});

describe("dialog backdrop", () => {
  it("dims the backdrop by default", async () => {
    const root = await buildNatcoreCss(["dialog"]);
    const color = declarations(root, {
      selector: ".dialog::backdrop",
      atRule: null,
    })["background-color"];

    expect(color).toBeDefined();
    expect(color).not.toBe("transparent");
  });

  it("Tailwind backdrop: utilities override the default dim and add blur", async () => {
    const root = await buildNatcoreCss([
      "dialog",
      "backdrop:bg-black/60",
      "backdrop:backdrop-blur-md",
    ]);
    const layerOf = (selector: string, prop: string) =>
      findDecls(root, { selector, prop, atRule: null })[0]?.layer;

    expect(layerOf(".dialog::backdrop", "background-color")).toBe(
      "utilities.components.base",
    );
    expect(
      layerOf(".backdrop\\:bg-black\\/60::backdrop", "background-color"),
    ).toBe("utilities");
    expect(
      findDecls(root, {
        selector: ".backdrop\\:backdrop-blur-md::backdrop",
        prop: "backdrop-filter",
      }).length,
    ).toBeGreaterThan(0);
  });

  it("dialog-backdrop-none removes the dim", async () => {
    const root = await buildNatcoreCss(["dialog-backdrop-none"]);
    const decls = declarations(root, {
      selector: ".dialog-backdrop-none::backdrop",
    });

    expect(decls["background-color"] ?? decls.background).toBe("transparent");
    expect(
      findDecls(root, { selector: ".dialog-backdrop-none::backdrop" })[0]
        ?.layer,
    ).toBe("utilities.components");
  });
});

describe("dialog animation", () => {
  it("is transparent while closed and opaque while open", async () => {
    const root = await buildNatcoreCss(["dialog"]);

    expect(
      declarations(root, { selector: ".dialog", atRule: null }).opacity,
    ).toBe("0");
    expect(
      declarations(root, { selector: ".dialog[open]", atRule: null }).opacity,
    ).toBe("1");
  });

  it("animates in from a starting style", async () => {
    const root = await buildNatcoreCss(["dialog"]);

    expect(
      declarations(root, {
        selector: ".dialog[open]",
        atRule: "@starting-style",
      }).opacity,
    ).toBe("0");
    expect(
      declarations(root, {
        selector: ".dialog[open]::backdrop",
        atRule: "@starting-style",
      }).opacity,
    ).toBe("0");
  });

  it("stays rendered in the top layer while animating out", async () => {
    const root = await buildNatcoreCss(["dialog"]);
    const decls = declarations(root, { selector: ".dialog", atRule: null });
    const transition = `${decls.transition ?? ""} ${decls["transition-property"] ?? ""}`;
    const behavior = `${decls.transition ?? ""} ${decls["transition-behavior"] ?? ""}`;

    expect(transition).toContain("opacity");
    expect(transition).toContain("overlay");
    expect(transition).toContain("display");
    expect(behavior).toContain("allow-discrete");
  });

  it("respects prefers-reduced-motion", async () => {
    const root = await buildNatcoreCss(["dialog"]);
    const reduced = (selector: string) => {
      const decls = declarations(root, {
        selector,
        atRule: "prefers-reduced-motion: reduce",
      });
      return decls.transition ?? decls["transition-duration"] ?? "(not set)";
    };

    expect(reduced(".dialog")).toMatch(/^(none|0s?)$/);
    expect(reduced(".dialog::backdrop")).toMatch(/^(none|0s?)$/);
  });
});

describe("dialog scroll lock", () => {
  it("locks page scrolling while a modal dialog is open", async () => {
    const root = await buildNatcoreCss(["dialog"]);

    expect(
      declarations(root, { selector: ":root:has(.dialog:modal)" }).overflow,
    ).toBe("hidden");
  });

  it("does not lock scrolling for non-modal dialogs", async () => {
    const root = await buildNatcoreCss(["dialog"]);
    const lockSelectors = findDecls(root, { selector: /^:root:has\(/ }).map(
      (decl) => decl.selector,
    );

    expect(lockSelectors.length).toBeGreaterThan(0);
    expect(lockSelectors.every((selector) => selector.includes(":modal"))).toBe(
      true,
    );
  });
});

/** All declarations for a class (including nested/pseudo selectors), with the
 * class swapped for `&` so different classes can be compared. */
function classRules(
  root: Awaited<ReturnType<typeof buildNatcoreCss>>,
  cls: string,
) {
  const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\.${escaped}(?![\\w-])`);

  return flatten(root)
    .filter((decl) => pattern.test(decl.selector))
    .map((decl) => ({
      selector: decl.selector.replace(pattern, "&"),
      atRules: decl.atRules,
      prop: decl.prop,
      value: decl.value,
    }));
}
