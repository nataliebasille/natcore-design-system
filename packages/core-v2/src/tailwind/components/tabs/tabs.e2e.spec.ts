/**
 * End-to-end spec for the tabs component, run against tabs.e2e.html. Checks
 * real browser behavior: switching tabs with each markup (`<details name>`,
 * radios in labels, `aria-selected`), keyboard focus, the look of each
 * style, the palette modifier, and the horizontal and vertical layouts.
 *
 * Fixture contract (ids the tests rely on). <details> items have no data-slot
 * attributes: the <summary> is the tab and the rest is the panel.
 * - #details                       `tabs`; <details name> items, the first open
 * - #d-tab-1..3, #d-panel-1..3     its <summary> tabs and the content of each panel
 * - #d-panel-2b                    a second element in the second panel
 * - #before-radio                  focusable button right before #radio
 * - #radio                         `tabs tabs-style-pill` <ul>; radios in label tabs, the first checked
 * - #r-tab-1..3, #r-input-1..3, #r-panel-1..3   its labels, radios, and panels
 * - #r-panel-radio                 a radio inside #r-panel-1 (not a tab)
 * - #aria                          `tabs tabs-style-boxed`; an empty role="tablist" item that
 *                                  aria-owns the tabs, then button tabs with aria-selected,
 *                                  #a-tab-1 selected
 * - #a-tab-1..2, #a-panel-1..2     its tabs and panels
 * - #palette                       `tabs/primary tabs-style-pill`; #p-tab-1 selected
 * - #vertical                      `tabs-v`; <details> items, the first open
 * - #v-tab-1..3, #v-panel-1..3     its tabs and panel content; #v-panel-1 is 200px tall
 * - #responsive                    `tabs min-[1px]:tabs-v`
 * - #wrap                          150px-wide `tabs` with four tabs (wider than it), #w-tab-1 selected
 * - #w-tab-1, #w-tab-4, #w-panel-1 its first and last tab and the first panel
 * - #centered                      `tabs` centered in a flex row, so it sizes to its content;
 *                                  <details> items with panels of different widths, the first open;
 *                                  the second panel's content is 120px tall
 * - #c-tab-1..3                    its tabs
 * - #centered-vertical             `tabs-v tabs-style-boxed` <ul>, centered like #centered;
 *                                  radio tabs with panels of different widths, the first checked;
 *                                  the second panel is 120px tall, taller than the tabs
 * - #cv-tab-1..3                   its label tabs
 */
import { type Page } from "@playwright/test";
import { expect, test } from "../../../../test/helpers/browser-test.ts";
import { loadFixture } from "../../../../test/helpers/fixture-page.ts";

test.beforeEach(async ({ page }) => {
  // Colors are read right after a state change; no transitions in between.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loadFixture(page, new URL("./tabs.e2e.html", import.meta.url));
});

test.describe("horizontal layout", () => {
  test("tabs sit in one row above the panel, which fills the width", async ({
    page,
  }) => {
    const tabs = await boxes(page, "d-tab-1", "d-tab-2", "d-tab-3");
    const panel = await box(page, "d-panel-1");
    const container = await box(page, "details");

    for (const tab of tabs) expect(tab.y).toBeCloseTo(tabs[0]!.y, 0);
    expect(tabs[1]!.x).toBeGreaterThan(tabs[0]!.x);
    expect(tabs[2]!.x).toBeGreaterThan(tabs[1]!.x);
    expect(panel.y).toBeGreaterThanOrEqual(tabs[0]!.y + tabs[0]!.height - 1);
    expect(panel.width).toBeCloseTo(container.width, 0);
  });

  test("tabs that don't fit stay in one row, with the panel below", async ({
    page,
  }) => {
    const [first, last] = await boxes(page, "w-tab-1", "w-tab-4");
    const panel = await box(page, "w-panel-1");

    expect(last!.y).toBeCloseTo(first!.y, 0);
    expect(last!.x).toBeGreaterThan(first!.x);
    expect(panel.y).toBeGreaterThanOrEqual(first!.y + first!.height - 1);
  });
});

test.describe("<details name> tabs", () => {
  test("show only the open item's panel", async ({ page }) => {
    await expect(page.locator("#d-panel-1")).toBeVisible();
    await expect(page.locator("#d-panel-2")).toBeHidden();
    await expect(page.locator("#d-panel-3")).toBeHidden();
  });

  test("clicking a tab switches to its panel", async ({ page }) => {
    await page.locator("#d-tab-2").click();

    await expect(page.locator("#d-panel-2")).toBeVisible();
    await expect(page.locator("#d-panel-1")).toBeHidden();
  });

  test("need no data-slot: everything after the <summary> is one panel below the tabs", async ({
    page,
  }) => {
    await page.locator("#d-tab-2").click();
    const tab = await box(page, "d-tab-1");
    const [first, second] = await boxes(page, "d-panel-2", "d-panel-2b");

    await expect(page.locator("#d-panel-2b")).toBeVisible();
    expect(first!.y).toBeGreaterThanOrEqual(tab.y + tab.height - 1);
    expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height - 1);
    expect(second!.x).toBeCloseTo(first!.x, 0);
  });

  test("clicking the open tab doesn't close it", async ({ page }) => {
    const tab = await box(page, "d-tab-1");
    await page.mouse.click(tab.x + tab.width / 2, tab.y + tab.height / 2);

    await expect(page.locator("#d-tab-1").locator("..")).toHaveAttribute(
      "open",
    );
    await expect(page.locator("#d-panel-1")).toBeVisible();
  });

  test("hide the disclosure marker", async ({ page }) => {
    const marker = await page
      .locator("#d-tab-1")
      .evaluate((el) => getComputedStyle(el).listStyleType);

    expect(marker).toBe("none");
  });

  test("the open tab is underlined; the others aren't", async ({ page }) => {
    const open = await computed(page, "d-tab-1");
    const closed = await computed(page, "d-tab-2");

    expect(open.borderBottomWidth).toBe("2px");
    expect(alpha(open.borderBottomColor)).toBeGreaterThan(0);
    expect(alpha(closed.borderBottomColor)).toBe(0);
    expect(open.color).not.toBe(closed.color);
  });

  test("hovering a closed tab changes its color", async ({ page }) => {
    const before = await computed(page, "d-tab-2");
    await page.locator("#d-tab-2").hover();
    const after = await computed(page, "d-tab-2");

    expect(after.color).not.toBe(before.color);
  });
});

test.describe("radio tabs", () => {
  test("show only the checked item's panel", async ({ page }) => {
    await expect(page.locator("#r-panel-1")).toBeVisible();
    await expect(page.locator("#r-panel-2")).toBeHidden();
  });

  test("clicking a tab checks its radio and switches to its panel", async ({
    page,
  }) => {
    await page.locator("#r-tab-2").click();

    await expect(page.locator("#r-input-2")).toBeChecked();
    await expect(page.locator("#r-panel-2")).toBeVisible();
    await expect(page.locator("#r-panel-1")).toBeHidden();
  });

  test("the radio is hidden on screen but stays focusable", async ({
    page,
  }) => {
    const radio = await box(page, "r-input-1");

    expect(radio.width).toBeLessThanOrEqual(1);
    expect(radio.height).toBeLessThanOrEqual(1);
    await page.locator("#r-input-1").focus();
    await expect(page.locator("#r-input-1")).toBeFocused();
  });

  test("a radio inside a panel is left alone", async ({ page }) => {
    const radio = await box(page, "r-panel-radio");

    expect(radio.width).toBeGreaterThan(1);
  });

  test("the keyboard-focused tab gets a focus ring, and arrow keys switch tabs", async ({
    page,
  }) => {
    await page.locator("#before-radio").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#r-input-1")).toBeFocused();
    expect((await computed(page, "r-tab-1")).outlineStyle).not.toBe("none");
    expect((await computed(page, "r-tab-2")).outlineStyle).toBe("none");

    await page.keyboard.press("ArrowRight");

    await expect(page.locator("#r-input-2")).toBeChecked();
    await expect(page.locator("#r-panel-2")).toBeVisible();
    expect((await computed(page, "r-tab-2")).outlineStyle).not.toBe("none");
  });

  test("tabs-style-pill fills the selected tab only", async ({ page }) => {
    const selected = await computed(page, "r-tab-1");
    const other = await computed(page, "r-tab-2");

    expect(alpha(selected.backgroundColor)).toBeGreaterThan(0);
    expect(alpha(other.backgroundColor)).toBe(0);
    expect(Number.parseFloat(selected.borderTopLeftRadius)).toBeGreaterThan(0);
  });
});

test.describe("aria-selected tabs", () => {
  test("an empty tablist item takes up no space", async ({ page }) => {
    const container = await box(page, "aria");
    const [first, second] = await boxes(page, "a-tab-1", "a-tab-2");

    expect(first!.x).toBeCloseTo(container.x, 0);
    expect(first!.y).toBeCloseTo(container.y, 0);
    expect(second!.y).toBeCloseTo(first!.y, 0);
  });

  test("show only the selected tab's panel", async ({ page }) => {
    await expect(page.locator("#a-panel-1")).toBeVisible();
    await expect(page.locator("#a-panel-2")).toBeHidden();
  });

  test("moving aria-selected switches the panel", async ({ page }) => {
    await page.evaluate(() => {
      document
        .getElementById("a-tab-1")!
        .setAttribute("aria-selected", "false");
      document.getElementById("a-tab-2")!.setAttribute("aria-selected", "true");
    });

    await expect(page.locator("#a-panel-2")).toBeVisible();
    await expect(page.locator("#a-panel-1")).toBeHidden();
  });

  test("tabs-style-boxed borders the selected tab and joins it to the bordered panel", async ({
    page,
  }) => {
    const selected = await computed(page, "a-tab-1");
    const other = await computed(page, "a-tab-2");
    const panel = await computed(page, "a-panel-1");
    const tab = await box(page, "a-tab-1");
    const panelBox = await box(page, "a-panel-1");

    expect(alpha(selected.borderTopColor)).toBeGreaterThan(0);
    expect(alpha(other.borderTopColor)).toBe(0);
    expect(selected.borderBottomWidth).toBe("0px");
    expect(panel.borderBottomWidth).not.toBe("0px");
    expect(alpha(panel.borderBottomColor)).toBeGreaterThan(0);
    expect(selected.backgroundColor).toBe(panel.backgroundColor);
    // The tab covers the divider, so it reaches the panel.
    expect(tab.y + tab.height).toBeGreaterThanOrEqual(panelBox.y - 0.5);
  });
});

test.describe("palette", () => {
  test("tabs/primary fills the selected tab with another color", async ({
    page,
  }) => {
    const primary = await computed(page, "p-tab-1");
    const current = await computed(page, "r-tab-1");

    expect(alpha(primary.backgroundColor)).toBeGreaterThan(0);
    expect(primary.backgroundColor).not.toBe(current.backgroundColor);
  });
});

test.describe("tabs-v", () => {
  test("stacks the tabs in a column with the panel beside them", async ({
    page,
  }) => {
    const tabs = await boxes(page, "v-tab-1", "v-tab-2", "v-tab-3");
    const panel = await box(page, "v-panel-1");

    for (const tab of tabs) expect(tab.x).toBeCloseTo(tabs[0]!.x, 0);
    expect(tabs[1]!.y).toBeGreaterThanOrEqual(tabs[0]!.y + tabs[0]!.height - 1);
    expect(tabs[2]!.y).toBeGreaterThanOrEqual(tabs[1]!.y + tabs[1]!.height - 1);
    expect(panel.x).toBeGreaterThanOrEqual(tabs[0]!.x + tabs[0]!.width);
    expect(panel.y).toBeCloseTo(tabs[0]!.y, 0);
  });

  test("tabs stay packed at the top next to a tall panel", async ({ page }) => {
    const [first, second] = await boxes(page, "v-tab-1", "v-tab-2");
    const container = await box(page, "vertical");

    expect(second!.y - (first!.y + first!.height)).toBeLessThan(8);
    expect(container.height).toBeCloseTo(200, 0);
  });

  test("a later tab's panel still starts at the top", async ({ page }) => {
    await page.locator("#v-tab-3").click();
    const tab = await box(page, "v-tab-1");
    const panel = await box(page, "v-panel-3");

    await expect(page.locator("#v-panel-1")).toBeHidden();
    expect(panel.y).toBeCloseTo(tab.y, 0);
  });

  test("the underline moves to the side facing the panel", async ({ page }) => {
    const open = await computed(page, "v-tab-1");

    expect(open.borderRightWidth).toBe("2px");
    expect(open.borderBottomWidth).toBe("0px");
  });

  test("works behind a responsive modifier", async ({ page }) => {
    const display = await page
      .locator("#responsive")
      .evaluate((el) => getComputedStyle(el).display);

    expect(display).toBe("grid");
  });
});

test.describe("switching tabs in a container that sizes to its content", () => {
  for (const [id, tabIds] of [
    ["centered", ["c-tab-2", "c-tab-3", "c-tab-1"]],
    ["centered-vertical", ["cv-tab-2", "cv-tab-3", "cv-tab-1"]],
  ] as const) {
    test(`#${id} keeps its width and position`, async ({ page }) => {
      const before = await box(page, id);
      const firstTab = await box(page, tabIds[2]);

      for (const tabId of tabIds) {
        await page.locator(`#${tabId}`).click();
        const after = await box(page, id);
        const tab = await box(page, tabIds[2]);

        expect(after.x, `after clicking #${tabId}`).toBeCloseTo(before.x, 0);
        expect(after.width, `after clicking #${tabId}`).toBeCloseTo(
          before.width,
          0,
        );
        expect(tab.x, `after clicking #${tabId}`).toBeCloseTo(firstTab.x, 0);
      }
    });
  }

  for (const [id, tabIds] of [
    ["centered", ["c-tab-2", "c-tab-3", "c-tab-1"]],
    ["centered-vertical", ["cv-tab-2", "cv-tab-3", "cv-tab-1"]],
  ] as const) {
    test(`#${id}'s panels share one cell sized to the largest panel`, async ({
      page,
    }) => {
      const panels = page.locator(
        `#${id} > details > :not(summary), #${id} [data-slot='panel']`,
      );
      const open = (await panels.nth(0).boundingBox())!;
      const before = await box(page, id);

      for (const i of [1, 2]) {
        await expect(panels.nth(i)).toBeHidden();
        const closed = (await panels.nth(i).boundingBox())!;
        expect(closed.x).toBeCloseTo(open.x, 0);
        expect(closed.y).toBeCloseTo(open.y, 0);
      }
      expect(before.height).toBeGreaterThanOrEqual(120);

      for (const tabId of tabIds) {
        await page.locator(`#${tabId}`).click();
        expect(
          (await box(page, id)).height,
          `after clicking #${tabId}`,
        ).toBeCloseTo(before.height, 0);
      }
    });
  }
});

test.describe("motion", () => {
  test("colors transition, except with reduced motion", async ({ page }) => {
    expect((await computed(page, "d-tab-2")).transitionDuration).toMatch(
      /^0s(, 0s)*$/,
    );

    await page.emulateMedia({ reducedMotion: "no-preference" });

    expect((await computed(page, "d-tab-2")).transitionDuration).not.toMatch(
      /^0s(, 0s)*$/,
    );
  });
});

async function box(page: Page, id: string) {
  const result = await page.locator(`#${id}`).boundingBox();
  expect(result, `#${id} has a box`).not.toBeNull();
  return result!;
}

function boxes(page: Page, ...ids: string[]) {
  return Promise.all(ids.map((id) => box(page, id)));
}

async function computed(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderTopColor: style.borderTopColor,
      borderBottomColor: style.borderBottomColor,
      borderBottomWidth: style.borderBottomWidth,
      borderRightWidth: style.borderRightWidth,
      borderTopLeftRadius: style.borderTopLeftRadius,
      outlineStyle: style.outlineStyle,
      transitionDuration: style.transitionDuration,
    };
  });
}

/** Alpha of a computed color (`rgb()`, `rgba()`, `color()`, `oklab()`, …). */
function alpha(color: string) {
  const slash = /\/\s*([\d.]+)(%?)\s*\)$/.exec(color);
  if (slash) return Number(slash[1]) / (slash[2] ? 100 : 1);

  const rgba = /^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/.exec(color);
  return rgba ? Number(rgba[1]) : 1;
}
