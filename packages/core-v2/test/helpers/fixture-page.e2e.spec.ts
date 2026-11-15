import { expect, test } from "./browser-test.ts";
import { mountHtml } from "./fixture-page.ts";

test("fixture pages are styled by natcore", async ({ page }) => {
  await mountHtml(page, '<div id="card" class="card-soft">Card</div>');

  const background = await page
    .locator("#card")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(background).not.toBe("rgba(0, 0, 0, 0)");
});

test("picks up utilities from every valid class attribute form", async ({
  page,
}) => {
  // Each form uses a different utility, so one form can't generate CSS that
  // another form needs.
  await mountHtml(
    page,
    `<div id="double" class="w-1"></div>
     <div id="single" class='w-2'></div>
     <div id="spaced" class = "w-3"></div>
     <div id="unquoted" class=w-4></div>
     <div id="multiline" class="
       h-4
       w-5
     "></div>`,
  );

  const expected = {
    double: "4px",
    single: "8px",
    spaced: "12px",
    unquoted: "16px",
    multiline: "20px",
  };
  for (const [id, width] of Object.entries(expected)) {
    const actual = await page
      .locator(`#${id}`)
      .evaluate((el) => getComputedStyle(el).width);
    expect(actual, `#${id}`).toBe(width);
  }
});
