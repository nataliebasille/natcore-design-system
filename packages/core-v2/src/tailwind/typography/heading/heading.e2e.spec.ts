/**
 * End-to-end spec for the heading typography module, run against
 * heading.e2e.html. Checks computed styles in real browsers: default heading
 * sizes, and that Tailwind utilities override them without `!`.
 *
 * Fixture contract (ids the tests rely on):
 * - #h1 … #h6             bare <h1>–<h6>, no classes
 * - #p-heading-2          <p class="heading-2">
 * - #h1-text-sm           <h1 class="text-sm">
 * - #h2-leading-loose     <h2 class="leading-loose">
 * - #h3-tracking-normal   <h3 class="tracking-normal">
 * - #h4-m-4               <h4 class="m-4">
 */
import { type Page } from "@playwright/test";
import { expect, test } from "../../../../test/helpers/browser-test.ts";
import { loadFixture } from "../../../../test/helpers/fixture-page.ts";

// Tailwind's text-5xl … text-sm at a 16px root.
const FONT_SIZES = [48, 30, 20, 18, 16, 14];

test.beforeEach(async ({ page }) => {
  await loadFixture(page, new URL("./heading.e2e.html", import.meta.url));
});

test.describe("defaults", () => {
  FONT_SIZES.forEach((size, i) => {
    test(`bare <h${i + 1}> is ${size}px with tight leading`, async ({
      page,
    }) => {
      const style = await computed(page, `h${i + 1}`);

      expect(px(style.fontSize)).toBe(size);
      expect(px(style.lineHeight)).toBeCloseTo(size * 1.25, 1);
      expect(px(style.letterSpacing)).toBeGreaterThan(0);
    });
  });

  test("heading-2 on a paragraph sizes it like an h2", async ({ page }) => {
    const p = await computed(page, "p-heading-2");
    const h2 = await computed(page, "h2");

    expect(p.fontSize).toBe(h2.fontSize);
    expect(p.lineHeight).toBe(h2.lineHeight);
    expect(p.letterSpacing).toBe(h2.letterSpacing);
  });
});

test.describe("Tailwind overrides", () => {
  test("text-sm shrinks an h1", async ({ page }) => {
    expect(px((await computed(page, "h1-text-sm")).fontSize)).toBe(14);
  });

  test("leading-loose loosens an h2", async ({ page }) => {
    const style = await computed(page, "h2-leading-loose");

    expect(px(style.lineHeight)).toBeCloseTo(px(style.fontSize) * 2, 1);
  });

  test("tracking-normal resets an h3's letter spacing", async ({ page }) => {
    const spacing = (await computed(page, "h3-tracking-normal")).letterSpacing;

    expect(spacing === "normal" ? 0 : px(spacing)).toBe(0);
  });

  test("m-4 sets an h4's margin", async ({ page }) => {
    expect((await computed(page, "h4-m-4")).marginTop).toBe("16px");
  });
});

async function computed(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      marginTop: style.marginTop,
    };
  });
}

function px(value: string) {
  return Number.parseFloat(value);
}
