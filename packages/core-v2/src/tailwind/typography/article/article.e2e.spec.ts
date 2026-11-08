/**
 * End-to-end spec for the article typography module, run against
 * article.e2e.html. Checks computed styles in real browsers: the default
 * article spacing, and that Tailwind utilities on an article's children
 * override it without `!`. Every test runs for both a bare <article>
 * ("bare") and an element with the `article` class ("class").
 *
 * Fixture contract (ids the tests rely on, `<kind>` is `bare` or `class`):
 * - #<kind>-first          <h1> that is the article's first child
 * - #<kind>-p              plain <p>
 * - #<kind>-h2             plain <h2> (not the first child)
 * - #<kind>-list-item      <li class="list-item">
 * - #<kind>-h4             plain <h4>
 * In a second article of each kind:
 * - #<kind>-first-mt-4             first-child <h1 class="mt-4">
 * - #<kind>-p-m-0                  <p class="m-0">
 * - #<kind>-h2-mt-2                <h2 class="mt-2">
 * - #<kind>-p-leading-tight        <p class="leading-tight">
 * - #<kind>-list-item-leading-tight <li class="list-item leading-tight">
 * - #<kind>-h3-text-primary        <h3 class="text-primary-500">
 */
import { type Page } from "@playwright/test";
import { expect, test } from "../../../../test/helpers/browser-test.ts";
import { loadFixture } from "../../../../test/helpers/fixture-page.ts";

const KINDS = ["bare", "class"] as const;

test.beforeEach(async ({ page }) => {
  await loadFixture(page, new URL("./article.e2e.html", import.meta.url));
});

for (const kind of KINDS) {
  test.describe(`${kind} article defaults`, () => {
    test("paragraphs get 1rem vertical margins and relaxed leading", async ({
      page,
    }) => {
      const p = await computed(page, `${kind}-p`);

      expect(p.marginTop).toBe("16px");
      expect(p.marginBottom).toBe("16px");
      expect(px(p.lineHeight)).toBeCloseTo(px(p.fontSize) * 1.625, 1);
    });

    test("h2 gets 2rem above and 1rem below", async ({ page }) => {
      const h2 = await computed(page, `${kind}-h2`);

      expect(h2.marginTop).toBe("32px");
      expect(h2.marginBottom).toBe("16px");
    });

    test("the first child has no top margin", async ({ page }) => {
      expect((await computed(page, `${kind}-first`)).marginTop).toBe("0px");
    });

    test("list items get relaxed leading", async ({ page }) => {
      const li = await computed(page, `${kind}-list-item`);

      expect(px(li.lineHeight)).toBeCloseTo(px(li.fontSize) * 1.625, 1);
    });

    test("headings below h3 get no section margin", async ({ page }) => {
      expect((await computed(page, `${kind}-h4`)).marginTop).toBe("0px");
    });
  });

  test.describe(`${kind} article Tailwind overrides`, () => {
    test("m-0 removes a paragraph's margins", async ({ page }) => {
      const p = await computed(page, `${kind}-p-m-0`);

      expect(p.marginTop).toBe("0px");
      expect(p.marginBottom).toBe("0px");
    });

    test("mt-2 replaces a heading's top margin", async ({ page }) => {
      const h2 = await computed(page, `${kind}-h2-mt-2`);

      expect(h2.marginTop).toBe("8px");
      expect(h2.marginBottom).toBe("16px");
    });

    test("mt-4 adds a top margin to the first child", async ({ page }) => {
      expect((await computed(page, `${kind}-first-mt-4`)).marginTop).toBe(
        "16px",
      );
    });

    test("leading-tight tightens a paragraph", async ({ page }) => {
      const p = await computed(page, `${kind}-p-leading-tight`);

      expect(px(p.lineHeight)).toBeCloseTo(px(p.fontSize) * 1.25, 1);
    });

    test("leading-tight tightens a list item", async ({ page }) => {
      const li = await computed(page, `${kind}-list-item-leading-tight`);

      expect(px(li.lineHeight)).toBeCloseTo(px(li.fontSize) * 1.25, 1);
    });

    test("text-primary-500 recolors a heading", async ({ page }) => {
      const colored = await computed(page, `${kind}-h3-text-primary`);
      const plain = await computed(page, `${kind}-h2`);

      expect(colored.color).not.toBe(plain.color);
    });
  });
}

async function computed(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      color: style.color,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      marginTop: style.marginTop,
      marginBottom: style.marginBottom,
    };
  });
}

function px(value: string) {
  return Number.parseFloat(value);
}
