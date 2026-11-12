/**
 * End-to-end spec for the tray component, run against tray.e2e.html. The
 * stylesheet loads after the markup, so trays transition into their state;
 * `translation` waits for that to finish.
 *
 * Fixture contract (ids the tests rely on), each a 160px-wide `tray-left`:
 * - #tray-closed           no open state
 * - #tray-open-attribute   [open]
 * - #tray-open-utility     tray-open
 * - #tray-open-toggle      checked [data-slot="toggle"] checkbox inside
 * - #tray-user-transform   tray-open plus [transform:translateX(10px)]
 */
import { type Page } from "@playwright/test";
import { expect, test } from "../../../../test/helpers/browser-test.ts";
import { loadFixture } from "../../../../test/helpers/fixture-page.ts";

const TRAY_WIDTH_PX = 160;

test.beforeEach(async ({ page }) => {
  await loadFixture(page, new URL("./tray.e2e.html", import.meta.url));
});

test("a closed tray is translated off its edge", async ({ page }) => {
  expect(await translation(page, "tray-closed")).toEqual({
    x: -TRAY_WIDTH_PX,
    y: 0,
  });
});

for (const [how, id] of [
  ["the open attribute", "tray-open-attribute"],
  ["the tray-open utility", "tray-open-utility"],
  ["a checked toggle slot", "tray-open-toggle"],
] as const) {
  test(`${how} opens the tray`, async ({ page }) => {
    expect(await translation(page, id)).toEqual({ x: 0, y: 0 });
  });
}

test("a plain Tailwind transform utility overrides tray-open", async ({
  page,
}) => {
  expect(await translation(page, "tray-user-transform")).toEqual({
    x: 10,
    y: 0,
  });
});

/** The element's computed translation in px, once transitions finish. */
function translation(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate(async (el) => {
    await Promise.all(
      el.getAnimations().map((animation) => animation.finished),
    );
    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    return { x: Math.round(matrix.m41), y: Math.round(matrix.m42) };
  });
}
