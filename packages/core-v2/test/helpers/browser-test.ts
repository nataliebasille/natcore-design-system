import { test as base, type PlaywrightWorkerOptions } from "@playwright/test";

export { expect } from "@playwright/test";

export type BrowserName = PlaywrightWorkerOptions["browserName"];

const BROWSER_NAMES = [
  "chromium",
  "firefox",
  "webkit",
] as const satisfies readonly BrowserName[];

/**
 * Playwright's `test`. A test runs in every browser project unless its details
 * come from `browsers(...)`, in which case it is skipped in every other
 * browser:
 *
 * ```ts
 * test("title", async ({ page }) => { … }); // every browser
 * test("title", browsers("chromium"), async ({ page }) => { … });
 * test("title", browsers("chromium", "webkit"), async ({ page }) => { … });
 * ```
 */
export const test = base.extend<{ browserFilter: void }>({
  browserFilter: [
    async ({ browserName }, use, testInfo) => {
      const allowed = BROWSER_NAMES.filter((name) =>
        testInfo.tags.includes(`@${name}`),
      );
      testInfo.skip(
        allowed.length > 0 && !allowed.includes(browserName),
        `Runs only in ${allowed.join(", ")}`,
      );
      await use();
    },
    { auto: true },
  ],
});

/** Test details that limit a test to the given browsers. */
export function browsers(...names: [BrowserName, ...BrowserName[]]) {
  return { tag: names.map((name) => `@${name}` as const) };
}
