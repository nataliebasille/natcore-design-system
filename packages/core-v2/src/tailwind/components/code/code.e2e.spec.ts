/**
 * End-to-end spec for the code component, run against code.e2e.html. Checks
 * real browser layout: bare `<code>` is a full-width block that scrolls
 * sideways, `code-inline` sits in running text (also behind a responsive
 * modifier), and Tailwind utilities override both without `!`.
 *
 * Fixture contract (ids the tests rely on):
 * - #container           600px-wide <main> with p-6, parent of the blocks
 * - #block               bare <code>, short content
 * - #block-long          bare <code>, one line wider than #container
 * - #prose               <p> containing #inline
 * - #inline              <code class="code-inline">
 * - #responsive-inline   <code class="min-[1px]:code-inline">
 * - #block-overrides     <code class="rounded-none p-0">
 * - #inline-overrides    <code class="code-inline rounded-none p-0 text-base">
 */
import { type Page } from "@playwright/test";
import { expect, test } from "../../../../test/helpers/browser-test.ts";
import { loadFixture } from "../../../../test/helpers/fixture-page.ts";

test.beforeEach(async ({ page }) => {
  await loadFixture(page, new URL("./code.e2e.html", import.meta.url));
});

test.describe("block", () => {
  test("bare <code> is a monospace block filling its container", async ({
    page,
  }) => {
    const style = await computed(page, "block");
    const box = await page.locator("#block").boundingBox();
    const container = await contentWidth(page, "container");

    expect(style.display).toBe("block");
    expect(box!.width).toBeCloseTo(container, 0);
    expect(style.padding).toBe("16px");
    expect(style.borderRadius).toBe("6px");
    expect(style.whiteSpace).toBe("pre");
    expect(style.fontFamily).toContain("monospace");
    expect(style.fontSize).toBe("14px");
  });

  test("a long line scrolls inside the block, not the page", async ({
    page,
  }) => {
    const style = await computed(page, "block-long");
    const scroll = await page.locator("#block-long").evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    const box = await page.locator("#block-long").boundingBox();

    expect(style.overflowX).toBe("auto");
    expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
    expect(box!.width).toBeCloseTo(await contentWidth(page, "container"), 0);
  });
});

test.describe("code-inline", () => {
  test("is a small chip on the text baseline", async ({ page }) => {
    const style = await computed(page, "inline");
    const code = await page.locator("#inline").boundingBox();
    const prose = await page.locator("#prose").boundingBox();

    expect(style.display).toBe("inline");
    expect(style.verticalAlign).toBe("baseline");
    expect(style.fontSize).toBe("14px");
    expect(style.paddingTop).toBe("2px");
    expect(style.paddingLeft).toBe("6px");
    expect(style.paddingRight).toBe("6px");
    expect(style.borderRadius).toBe("4px");
    expect(code!.width).toBeLessThan(prose!.width / 2);
    expect(code!.y).toBeLessThan(prose!.y + code!.height);
  });

  test("works behind a responsive modifier", async ({ page }) => {
    const style = await computed(page, "responsive-inline");

    expect(style.display).toBe("inline");
    expect(style.paddingLeft).toBe("6px");
    expect(style.borderRadius).toBe("4px");
  });
});

test.describe("Tailwind overrides", () => {
  for (const id of ["block-overrides", "inline-overrides"]) {
    test(`p-0 and rounded-none override #${id}`, async ({ page }) => {
      const style = await computed(page, id);

      expect(style.padding).toBe("0px");
      expect(style.borderRadius).toBe("0px");
    });
  }

  test("text-base overrides code-inline's font size", async ({ page }) => {
    const style = await computed(page, "inline-overrides");

    expect(style.display).toBe("inline");
    expect(style.fontSize).toBe("16px");
  });
});

async function computed(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      display: style.display,
      padding: style.padding,
      paddingTop: style.paddingTop,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
      borderRadius: style.borderRadius,
      whiteSpace: style.whiteSpace,
      fontFamily: style.fontFamily,
      overflowX: style.overflowX,
      verticalAlign: style.verticalAlign,
      fontSize: style.fontSize,
    };
  });
}

async function contentWidth(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((el) => {
    const style = getComputedStyle(el);
    return (
      el.clientWidth -
      Number.parseFloat(style.paddingLeft) -
      Number.parseFloat(style.paddingRight)
    );
  });
}
