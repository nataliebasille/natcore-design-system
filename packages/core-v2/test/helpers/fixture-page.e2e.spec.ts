import { expect, test } from "./browser-test.ts";
import { mountHtml } from "./fixture-page.ts";

test("fixture pages are styled by natcore", async ({ page }) => {
  await mountHtml(page, '<div id="card" class="card-soft">Card</div>');

  const background = await page
    .locator("#card")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(background).not.toBe("rgba(0, 0, 0, 0)");
});
