/**
 * Spec for the `heading` typography module (heading.css.ts): `heading-1` …
 * `heading-6` size text like h1–h6, and bare `<h1>`–`<h6>` get the matching
 * class automatically. Everything sits in the components layer so Tailwind
 * utilities (e.g. `text-sm`, `leading-loose`) override it without `!`.
 */
import { describe, expect, it } from "vitest";
import {
  buildNatcoreCss,
  findDecls,
} from "../../../../test/helpers/build-natcore-css.ts";

const LEVELS = [
  [1, "5xl"],
  [2, "3xl"],
  [3, "xl"],
  [4, "lg"],
  [5, "base"],
  [6, "sm"],
] as const;

describe("heading levels", () => {
  it.each(LEVELS)(
    "heading-%i is text-%s with wide tracking and tight leading",
    async (level, size) => {
      const root = await buildNatcoreCss([`heading-${level}`]);

      expect(typography(root, `.heading-${level}`)).toEqual({
        "font-size": `var(--text-${size})`,
        "letter-spacing": "var(--tracking-wide)",
        "line-height": "var(--leading-tight)",
      });
    },
  );

  it.each(LEVELS)("bare <h%i> is styled like heading-%i", async (level) => {
    const root = await buildNatcoreCss([`heading-${level}`]);

    expect(typography(root, `h${level}`)).toEqual(
      typography(root, `.heading-${level}`),
    );
  });
});

describe("heading cascade layer", () => {
  it.each(LEVELS)("heading-%i is in the components layer", async (level) => {
    const root = await buildNatcoreCss([`heading-${level}`]);

    expect(layers(root, `.heading-${level}`)).toEqual(["utilities.components"]);
  });

  it.each(LEVELS)("bare <h%i> is in the components layer", async (level) => {
    const root = await buildNatcoreCss([]);

    expect(layers(root, `h${level}`)).toEqual(["components"]);
  });

  it("never uses !important", async () => {
    const root = await buildNatcoreCss(LEVELS.map(([l]) => `heading-${l}`));
    const important = findDecls(root, {
      selector: /^(h[1-6]|\.heading-[1-6])$/,
    }).filter((decl) => decl.important);

    expect(important).toEqual([]);
  });
});

describe("heading overrides", () => {
  it.each([
    ["text-sm", "font-size"],
    ["leading-loose", "line-height"],
    ["tracking-normal", "letter-spacing"],
  ])("Tailwind %s overrides the heading's %s", async (cls, prop) => {
    const root = await buildNatcoreCss(["heading-1", cls]);
    const layerOf = (selector: string) =>
      findDecls(root, { selector, prop, atRule: null })
        .filter((decl) => decl.layer !== "base")
        .map((decl) => decl.layer);

    expect(new Set(layerOf(".heading-1"))).toEqual(
      new Set(["utilities.components"]),
    );
    expect(new Set(layerOf("h1"))).toEqual(new Set(["components"]));
    expect(layerOf(`.${cls}`)).toContain("utilities");
  });
});

/** Last value per typography property, ignoring preflight and `--tw-*`. */
function typography(
  root: Awaited<ReturnType<typeof buildNatcoreCss>>,
  selector: string,
) {
  const decls: Record<string, string> = {};
  for (const decl of findDecls(root, { selector, atRule: null })) {
    if (decl.layer === "base" || decl.prop.startsWith("--")) continue;
    decls[decl.prop] = decl.value;
  }
  return decls;
}

/** Distinct cascade layers of every non-preflight declaration for a selector. */
function layers(
  root: Awaited<ReturnType<typeof buildNatcoreCss>>,
  selector: string,
) {
  return [
    ...new Set(
      findDecls(root, { selector })
        .filter((decl) => decl.layer !== "base")
        .map((decl) => decl.layer),
    ),
  ];
}
