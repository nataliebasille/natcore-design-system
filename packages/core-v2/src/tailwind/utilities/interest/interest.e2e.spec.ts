/**
 * End-to-end spec for the interest-delay utilities, run against
 * interest.e2e.html. Each test times how long a popover takes to open after
 * the user shows interest in its invoker (hover / keyboard focus) and to close
 * after they lose it.
 *
 * Chromium runs the native feature. Firefox has no native `interestfor`, so
 * the page also loads the `interestfor` polyfill, which reads the
 * `--interest-delay*` custom properties the utilities set. (The polyfill turns
 * itself off where `interestfor` is native.)
 *
 * Fixture contract (ids the tests rely on), for each case id in CASES:
 * - #<id>         <button interestfor="<id>-tip"> with the case's classes
 * - #<id>-before  focusable button directly before the invoker
 * - #<id>-tip     popover="hint", positioned away from the invokers
 * - #after        focusable button after the last invoker
 */
import { createRequire } from "node:module";
import type { Page } from "@playwright/test";
import {
  browsers,
  expect,
  test,
} from "../../../../test/helpers/browser-test.ts";
import { loadFixture } from "../../../../test/helpers/fixture-page.ts";

const POLYFILL = createRequire(import.meta.url).resolve("interestfor");

const CASES = [
  { id: "longhand-bare", start: 1000, end: 700 },
  { id: "longhand-arbitrary", start: 1000, end: 700 },
  { id: "shorthand-bare", start: 1000, end: 1000 },
  { id: "shorthand-arbitrary", start: 1000, end: 700 },
  { id: "zero", start: 0, end: 0 },
  { id: "shorthand-start-override", start: 200, end: 1000 },
  { id: "shorthand-end-override", start: 1000, end: 200 },
  { id: "shorthand-variant-override", start: 1000, end: 700 },
] as const;

// Timers never fire early, but event timestamps can be a few ms apart.
const EARLY_TOLERANCE_MS = 50;
// Upper bound: test-driver and rendering overhead on slow CI machines.
const LATE_TOLERANCE_MS = 600;

type InterestWindow = Window & {
  __interest: {
    log: { key: string; t: number }[];
    waitFor(key: string, timeoutMs: number): Promise<number>;
  };
};

test.beforeEach(async ({ page }) => {
  await loadFixture(page, new URL("./interest.e2e.html", import.meta.url));
  await page.addScriptTag({ path: POLYFILL });
  await recordInterestEvents(page);
});

// The polyfill adds `interestForElement`, but it can't make CSS support the property.
test("interest invokers are native", browsers("chromium"), async ({ page }) => {
  expect(
    await page.evaluate(() => CSS.supports("interest-delay-start: 0s")),
  ).toBe(true);
});

test(
  "interest invokers are not native, so the polyfill runs",
  browsers("firefox"),
  async ({ page }) => {
    expect(
      await page.evaluate(() => CSS.supports("interest-delay-start: 0s")),
    ).toBe(false);
  },
);

for (const { id, start, end } of CASES) {
  test.describe(`#${id}`, () => {
    test(`hover opens after ${start}ms and closes ${end}ms after leaving`, async ({
      page,
    }) => {
      await page.hover(`#${id}`);
      const opened = await waitFor(page, `${id}-tip:open`);
      expectDelay(opened - (await eventTime(page, `${id}:mouseover`)), start);

      await page.mouse.move(700, 20);
      const closed = await waitFor(page, `${id}-tip:closed`);
      expectDelay(closed - (await eventTime(page, `${id}:mouseout`)), end);
    });

    test(`keyboard focus opens after ${start}ms and closes ${end}ms after blur`, async ({
      page,
    }) => {
      await page.focus(`#${id}-before`);
      await page.keyboard.press("Tab");
      await expect(page.locator(`#${id}`)).toBeFocused();
      const opened = await waitFor(page, `${id}-tip:open`);
      expectDelay(opened - (await eventTime(page, `${id}:focusin`)), start);

      await page.keyboard.press("Tab");
      await expect(page.locator(`#${id}`)).not.toBeFocused();
      const closed = await waitFor(page, `${id}-tip:closed`);
      expectDelay(closed - (await eventTime(page, `${id}:focusout`)), end);
    });
  });
}

/**
 * Logs invoker interest events (`<id>:mouseover`, …) and popover toggles
 * (`<id>-tip:open` / `:closed`) with their timestamps, and lets tests wait for
 * one inside the page. (Polling with repeated `page.evaluate` calls stalls
 * intermittently in Firefox.)
 */
function recordInterestEvents(page: Page) {
  return page.evaluate(
    (ids) => {
      const log: { key: string; t: number }[] = [];
      const waiters: { key: string; resolve: (t: number) => void }[] = [];
      const record = (key: string) => {
        const t = performance.now();
        log.push({ key, t });
        for (const waiter of waiters.filter((w) => w.key === key)) {
          waiter.resolve(t);
        }
      };
      const waitFor = (key: string, timeoutMs: number) =>
        new Promise<number>((resolve, reject) => {
          const logged = log.find((entry) => entry.key === key);
          if (logged) return resolve(logged.t);
          waiters.push({ key, resolve });
          setTimeout(
            () =>
              reject(
                new Error(`no ${key} event; events: ${JSON.stringify(log)}`),
              ),
            timeoutMs,
          );
        });
      Object.assign(window, { __interest: { log, waitFor } });

      for (const id of ids) {
        const invoker = document.getElementById(id)!;
        for (const type of ["mouseover", "mouseout", "focusin", "focusout"]) {
          invoker.addEventListener(type, () => record(`${id}:${type}`));
        }
        document
          .getElementById(`${id}-tip`)!
          .addEventListener("toggle", (event) =>
            record(`${id}-tip:${(event as ToggleEvent).newState}`),
          );
      }
    },
    CASES.map(({ id }) => id),
  );
}

/** Waits in the page for the event `key` and returns when it happened. */
function waitFor(page: Page, key: string) {
  return page.evaluate(
    (key) =>
      (window as unknown as InterestWindow).__interest.waitFor(key, 5000),
    key,
  );
}

/** Timestamp of the first logged event `key`, or NaN. */
function eventTime(page: Page, key: string) {
  return page.evaluate(
    (key) =>
      (window as unknown as InterestWindow).__interest.log.find(
        (entry) => entry.key === key,
      )?.t ?? NaN,
    key,
  );
}

function expectDelay(actualMs: number, expectedMs: number) {
  expect(actualMs).toBeGreaterThanOrEqual(expectedMs - EARLY_TOLERANCE_MS);
  expect(actualMs).toBeLessThanOrEqual(expectedMs + LATE_TOLERANCE_MS);
}
