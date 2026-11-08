/**
 * End-to-end spec for the interest-delay utilities, run against
 * interest.e2e.html. Each test times how long a popover takes to open after
 * the user shows interest in its invoker (hover / keyboard focus) and to close
 * after they lose it.
 *
 * Chromium runs the native feature. Firefox has no native `interestfor`, so
 * the page also loads the `interestfor` polyfill, which reads the
 * `--interest-delay-start/-end` custom properties the utilities set. (The
 * polyfill turns itself off where `interestfor` is native.)
 *
 * Fixture contract (ids the tests rely on), for "default" and each case id in
 * CASES:
 * - #<id>         <button interestfor="<id>-tip"> with the case's classes
 *                 (#default has none)
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

/** The browser's (or polyfill's) own delay, measured on #default. */
const DEFAULT = "default";

const CASES: {
  id: string;
  start: number | typeof DEFAULT;
  end: number | typeof DEFAULT;
}[] = [
  { id: "longhand-bare", start: 1000, end: 700 },
  { id: "longhand-arbitrary", start: 1000, end: 700 },
  { id: "shorthand-bare", start: 1000, end: 1000 },
  { id: "shorthand-arbitrary", start: 1000, end: 1000 },
  { id: "shorthand-calc", start: 1000, end: 1000 },
  { id: "zero", start: 0, end: 0 },
  { id: "shorthand-start-override", start: 200, end: 1000 },
  { id: "shorthand-end-override", start: 1000, end: 200 },
  { id: "shorthand-variant-override", start: 1000, end: 1000 },
  { id: "bare-start-normal", start: DEFAULT, end: 2000 },
  { id: "bare-end-normal", start: 2000, end: DEFAULT },
  { id: "arbitrary-start-normal", start: DEFAULT, end: 2000 },
  { id: "arbitrary-end-normal", start: 2000, end: DEFAULT },
];

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

type Interaction = "hover" | "focus";

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
  for (const interaction of ["hover", "focus"] as const) {
    test(`#${id}: ${interaction} opens after ${label(start)} and closes after ${label(end)}`, async ({
      page,
    }) => {
      const actual = await measure(page, id, interaction);
      const defaults =
        start === DEFAULT || end === DEFAULT ?
          await measure(page, "default", interaction)
        : undefined;

      expectDelay(actual.start, start, defaults?.start);
      expectDelay(actual.end, end, defaults?.end);
    });
  }
}

/**
 * Shows interest in `#id` by hovering or keyboard-focusing it, then loses it,
 * and returns how long the popover took to open and to close.
 */
async function measure(page: Page, id: string, interaction: Interaction) {
  const [gain, lose] =
    interaction === "hover" ?
      (["mouseover", "mouseout"] as const)
    : (["focusin", "focusout"] as const);

  if (interaction === "hover") {
    await page.hover(`#${id}`);
  } else {
    await page.focus(`#${id}-before`);
    await page.keyboard.press("Tab");
    await expect(page.locator(`#${id}`)).toBeFocused();
  }
  const opened = await waitFor(page, `${id}-tip:open`);
  const start = opened - (await eventTime(page, `${id}:${gain}`));

  if (interaction === "hover") {
    await page.mouse.move(700, 20);
  } else {
    await page.keyboard.press("Tab");
    await expect(page.locator(`#${id}`)).not.toBeFocused();
  }
  const closed = await waitFor(page, `${id}-tip:closed`);
  const end = closed - (await eventTime(page, `${id}:${lose}`));

  return { start, end };
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
    [DEFAULT, ...CASES.map(({ id }) => id)],
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

/**
 * Checks a measured delay against an expected one in ms, or against the
 * browser's default (`defaultMs`, measured on #default) when expected is DEFAULT.
 */
function expectDelay(
  actualMs: number,
  expected: number | typeof DEFAULT,
  defaultMs?: number,
) {
  if (expected === DEFAULT) {
    // Defaults are a few hundred ms, so this rules out both 0 and the 2000ms
    // shorthand while allowing for timing noise in the default measurement.
    expect(actualMs).toBeGreaterThanOrEqual(defaultMs! / 2);
    expect(actualMs).toBeLessThanOrEqual(defaultMs! + LATE_TOLERANCE_MS);
    return;
  }

  expect(actualMs).toBeGreaterThanOrEqual(expected - EARLY_TOLERANCE_MS);
  expect(actualMs).toBeLessThanOrEqual(expected + LATE_TOLERANCE_MS);
}

function label(delay: number | typeof DEFAULT) {
  return delay === DEFAULT ? "the default" : `${delay}ms`;
}
