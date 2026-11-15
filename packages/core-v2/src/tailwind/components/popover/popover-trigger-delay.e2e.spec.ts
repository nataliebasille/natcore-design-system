/**
 * End-to-end spec for the popover trigger delay utilities
 * (`popover-trigger-delay-*`, `-open-*`, `-close-*`), run against
 * popover-trigger-delay.e2e.html. Each test times how long a popover takes to
 * open after the user shows interest in its trigger (hover / keyboard focus)
 * and to close after they lose it.
 *
 * Every case runs twice:
 * - on a native interest invoker (`interestfor`). Chromium runs the native
 *   feature. Firefox has no native `interestfor`, so the page also loads the
 *   `interestfor` polyfill, which reads the `--interest-delay-start/-end`
 *   custom properties the utilities set. (The polyfill turns itself off where
 *   `interestfor` is native.)
 * - on a CSS wrapper trigger (`popover-anchor` with `popover-trigger-hover
 *   popover-trigger-focus`), where natcore's CSS does the waiting, with no
 *   JavaScript. Its defaults (no utilities) are natcore's own.
 *
 * Fixture contract (ids the tests rely on), for "default" and each case id in
 * CASES, with the wrapper versions prefixed `w-`:
 * - #<id>         trigger with the case's classes (#default has none);
 *                 native ones have interestfor="<id>-tip"
 * - #<id>-before  focusable button directly before the trigger
 * - #<id>-tip     the popover: popover="hint" parked away from the triggers
 *                 (native), or the trigger's `popover-anchor` popover
 *                 (`data-slot="popover"`, wrapper)
 * - #after        focusable button after the last trigger
 * - (1100, 20) is empty page, for moving the pointer away
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

/** The default delay, measured on #default (or #w-default). */
const DEFAULT = "default";

const CASES: {
  id: string;
  open: number | typeof DEFAULT;
  close: number | typeof DEFAULT;
}[] = [
  { id: "longhand-bare", open: 1000, close: 700 },
  { id: "longhand-arbitrary", open: 1000, close: 700 },
  { id: "shorthand-bare", open: 1000, close: 1000 },
  { id: "shorthand-arbitrary", open: 1000, close: 1000 },
  { id: "shorthand-calc", open: 1000, close: 1000 },
  { id: "zero", open: 0, close: 0 },
  { id: "shorthand-open-override", open: 200, close: 1000 },
  { id: "shorthand-close-override", open: 1000, close: 200 },
  { id: "shorthand-variant-override", open: 1000, close: 1000 },
  { id: "bare-open-normal", open: DEFAULT, close: 2000 },
  { id: "bare-close-normal", open: 2000, close: DEFAULT },
  { id: "arbitrary-open-normal", open: DEFAULT, close: 2000 },
  { id: "arbitrary-close-normal", open: 2000, close: DEFAULT },
];

const KINDS = [
  { kind: "native", prefix: "" },
  { kind: "wrapper", prefix: "w-" },
] as const;

// Timers never fire early, but event timestamps can be a few ms apart.
const EARLY_TOLERANCE_MS = 50;
// Upper bound: test-driver and rendering overhead on slow CI machines, plus
// the wrapper popover's fade-out before it counts as closed.
const LATE_TOLERANCE_MS = 600;

type DelayWindow = Window & {
  __delay: {
    log: { key: string; t: number }[];
    waitFor(key: string, timeoutMs: number): Promise<number>;
  };
};

type Interaction = "hover" | "focus";

test.beforeEach(async ({ page }) => {
  await loadFixture(
    page,
    new URL("./popover-trigger-delay.e2e.html", import.meta.url),
  );
  await page.addScriptTag({ path: POLYFILL });
  await recordDelayEvents(page);
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

test("wrapper triggers default to 0.5s open and 0.25s close, like Chromium's interestfor", async ({
  page,
}) => {
  for (const interaction of ["hover", "focus"] as const) {
    const actual = await measure(page, "w-default", interaction);

    expectDelay(actual.open, 500);
    expectDelay(actual.close, 250);
  }
});

for (const { kind, prefix } of KINDS) {
  test.describe(`${kind} triggers`, () => {
    for (const { id, open, close } of CASES) {
      for (const interaction of ["hover", "focus"] as const) {
        test(`#${prefix}${id}: ${interaction} opens after ${label(open)} and closes after ${label(close)}`, async ({
          page,
        }) => {
          const actual = await measure(page, `${prefix}${id}`, interaction);
          // Zero and DEFAULT are both checked against the measured default:
          // the late tolerance alone can't tell 0ms from a ~500ms default.
          const defaults =
            [open, close].some((d) => d === DEFAULT || d === 0) ?
              await measure(page, `${prefix}default`, interaction)
            : undefined;

          expectDelay(actual.open, open, defaults?.open);
          expectDelay(actual.close, close, defaults?.close);
        });
      }
    }
  });
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

  await resetLog(page);
  if (interaction === "hover") {
    await page.hover(`#${id}`);
  } else {
    await page.focus(`#${id}-before`);
    await page.keyboard.press("Tab");
    await expect(page.locator(`#${id}`)).toBeFocused();
  }
  const opened = await waitFor(page, `${id}-tip:open`);
  const open = opened - (await eventTime(page, `${id}:${gain}`));

  if (interaction === "hover") {
    await page.mouse.move(1100, 20);
  } else {
    await page.keyboard.press("Tab");
    await expect(page.locator(`#${id}`)).not.toBeFocused();
  }
  const closed = await waitFor(page, `${id}-tip:closed`);
  const close = closed - (await eventTime(page, `${id}:${lose}`));

  return { open, close };
}

/**
 * Logs trigger interest events (`<id>:mouseover`, …) and popover open/close
 * (`<id>-tip:open` / `:closed`) with their timestamps, and lets tests wait for
 * one inside the page. Native popovers report through `toggle` events; wrapper
 * popovers are shown by CSS alone, so a frame loop watches their visibility.
 * (Polling with repeated `page.evaluate` calls stalls intermittently in
 * Firefox.)
 */
function recordDelayEvents(page: Page) {
  const ids = [DEFAULT, ...CASES.map(({ id }) => id)];
  return page.evaluate((ids) => {
    let log: { key: string; t: number }[] = [];
    let waiters: { key: string; resolve: (t: number) => void }[] = [];
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
    const reset = () => {
      log = [];
      waiters = [];
    };
    Object.assign(window, {
      __delay: {
        get log() {
          return log;
        },
        waitFor,
        reset,
      },
    });

    const watched: { id: string; el: HTMLElement; visible: boolean }[] = [];
    for (const id of ids.flatMap((id) => [id, `w-${id}`])) {
      const trigger = document.getElementById(id)!;
      for (const type of ["mouseover", "mouseout", "focusin", "focusout"]) {
        trigger.addEventListener(type, () => record(`${id}:${type}`));
      }
      const tip = document.getElementById(`${id}-tip`)!;
      if (tip.hasAttribute("popover")) {
        tip.addEventListener("toggle", (event) =>
          record(`${id}-tip:${(event as ToggleEvent).newState}`),
        );
      } else {
        watched.push({ id, el: tip, visible: isShown(tip) });
      }
    }

    const watch = () => {
      for (const entry of watched) {
        const visible = isShown(entry.el);
        if (visible !== entry.visible) {
          entry.visible = visible;
          record(`${entry.id}-tip:${visible ? "open" : "closed"}`);
        }
      }
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);

    function isShown(el: HTMLElement) {
      return el.checkVisibility({ visibilityProperty: true });
    }
  }, ids);
}

function resetLog(page: Page) {
  return page.evaluate(() =>
    (window as unknown as { __delay: { reset(): void } }).__delay.reset(),
  );
}

/** Waits in the page for the event `key` and returns when it happened. */
function waitFor(page: Page, key: string) {
  return page.evaluate(
    (key) => (window as unknown as DelayWindow).__delay.waitFor(key, 5000),
    key,
  );
}

/** Timestamp of the first logged event `key`, or NaN. */
function eventTime(page: Page, key: string) {
  return page.evaluate(
    (key) =>
      (window as unknown as DelayWindow).__delay.log.find(
        (entry) => entry.key === key,
      )?.t ?? NaN,
    key,
  );
}

/**
 * Checks a measured delay against an expected one in ms, or against the
 * default (`defaultMs`, measured on #default / #w-default) when expected is
 * DEFAULT. A zero delay must also be clearly faster than the default.
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
  if (expected === 0 && defaultMs !== undefined) {
    expect(actualMs).toBeLessThan(defaultMs - 100);
  }
}

function label(delay: number | typeof DEFAULT) {
  return delay === DEFAULT ? "the default" : `${delay}ms`;
}
