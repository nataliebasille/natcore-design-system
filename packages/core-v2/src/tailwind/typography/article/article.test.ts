/**
 * Spec for the `article` typography module (article.css.ts): long-form text
 * spacing for paragraphs, list items, and headings inside an article. Bare
 * `<article>` gets the class automatically. Everything sits in the components
 * layer, without `!important`, so Tailwind utilities on the article's children
 * (e.g. `m-0`, `leading-tight`) override it.
 */
import { describe, expect, it } from "vitest";
import {
  buildNatcoreCss,
  findDecls,
} from "../../../../test/helpers/build-natcore-css.ts";

const SECTION_MARGIN = "calc(var(--spacing) * 8) 0 calc(var(--spacing) * 4) 0";

const STYLES = [
  ["p", "line-height", "var(--leading-relaxed)"],
  [".list-item", "line-height", "var(--leading-relaxed)"],
  ["p", "margin", "calc(var(--spacing) * 4) 0"],
  ["> *:first-child", "margin-top", "calc(var(--spacing) * 0)"],
  ["h1", "margin", SECTION_MARGIN],
  ["h2", "margin", SECTION_MARGIN],
  ["h3", "margin", SECTION_MARGIN],
  ...(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map(
    (h) => [h, "color", "var(--tone-current-fg)"] as const,
  ),
] as const;

const ROOTS = [
  [".article", "utilities.components"],
  ["article", "components"],
] as const;

describe("article styles", () => {
  it.each(ROOTS.flatMap(([root]) => STYLES.map((s) => [root, ...s] as const)))(
    "%s %s has %s: %s",
    async (rootSelector, child, prop, value) => {
      const root = await buildNatcoreCss(["article"]);
      const values = findDecls(root, {
        selector: `${rootSelector} ${child}`,
        prop,
        atRule: null,
      }).map((decl) => decl.value);

      expect(values.at(-1)).toBe(value);
    },
  );

  it("doesn't add heading margins below h3", async () => {
    const root = await buildNatcoreCss(["article"]);

    expect(
      findDecls(root, { selector: /^\.?article (h4|h5|h6)$/, prop: "margin" }),
    ).toEqual([]);
  });
});

describe("article cascade layer", () => {
  it.each(ROOTS)("%s rules are in the %s layer", async (selector, layer) => {
    const root = await buildNatcoreCss(["article"]);
    const escaped = selector.replace(".", "\\.");
    const found = findDecls(root, { selector: new RegExp(`^${escaped} `) });

    expect(found.length).toBeGreaterThan(0);
    expect([...new Set(found.map((decl) => decl.layer))]).toEqual([layer]);
  });

  it("never uses !important", async () => {
    const root = await buildNatcoreCss(["article"]);
    const important = findDecls(root, { selector: /^\.?article\b/ }).filter(
      (decl) => decl.important,
    );

    expect(important).toEqual([]);
  });
});

describe("article overrides", () => {
  it.each([
    ["m-0", "p", "margin"],
    ["m-0", "h2", "margin"],
    ["mt-4", "> *:first-child", "margin-top"],
    ["leading-tight", "p", "line-height"],
    ["leading-tight", ".list-item", "line-height"],
    ["text-primary-500", "h2", "color"],
  ])(
    "Tailwind %s on a child overrides the article's %s %s",
    async (cls, child, prop) => {
      const root = await buildNatcoreCss(["article", cls]);
      const layerOf = (selector: string) => [
        ...new Set(
          findDecls(root, { selector, prop, atRule: null }).map(
            (decl) => decl.layer,
          ),
        ),
      ];

      expect(layerOf(`.article ${child}`)).toEqual(["utilities.components"]);
      expect(layerOf(`article ${child}`)).toEqual(["components"]);
      expect(layerOf(`.${cls}`)).toEqual(["utilities"]);
    },
  );
});
