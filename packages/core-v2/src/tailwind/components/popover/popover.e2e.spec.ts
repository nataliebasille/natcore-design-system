/**
 * End-to-end spec for the popover component, run against popover.e2e.html.
 * Covers what the CSS unit tests can't: opening and closing, where the popover
 * lands, flipping, delays, clipping, scrolling, and animation. Wrapper tests run
 * in Chromium and Firefox with no JavaScript (Firefox has no native
 * `interestfor`, so it proves the CSS-only path); native `interestfor` tests
 * run in Chromium only.
 *
 * Fixture contract (ids the tests rely on):
 * - Native, no wrapper:
 *   #native-click (+ #native-click-trigger, popovertarget),
 *   #native-command (+ #native-command-trigger, commandfor/toggle-popover),
 *   #native-interest (+ #native-interest-trigger, interestfor, popover-trigger-delay-0)
 * - Wrapper (`popover-anchor` > trigger + a `data-slot="popover"` popover), ids <name>-anchor,
 *   <name>-trigger, <name>-popover:
 *   hover (popover-trigger-hover, popover-trigger-delay-0),
 *   hover-default (no delay class), hover-slow (popover-trigger-delay-1000),
 *   deep (trigger wrapped in an extra span),
 *   outer / inner (inner anchor inside the outer popover-right content),
 *   mixed (hover trigger with interestfor on a popover="hint"),
 *   focus (popover-trigger-focus, popover-trigger-delay-0; #focus-link inside the
 *   popover; #before-focus / #after-focus around it),
 *   focus-slow (popover-trigger-delay-1000; #before-focus-slow before it),
 *   checked (label.popover-trigger-checked around #checked-input; a plain
 *   #checked-inner checkbox inside the popover),
 *   checkbox (input.popover-trigger-checked itself),
 *   content-checkbox (no trigger; #content-checkbox inside the popover),
 *   details (<details class="popover-anchor"> with #details-trigger summary),
 *   responsive (popover `popover-bottom md:popover-right`, trigger
 *   `popover-trigger-hover md:popover-trigger-focus`)
 * - #clip-box (overflow hidden) holding #clip-popover, opened by #clip-trigger
 *   (a label around #clip-input)
 * - #stack-hover-* / #stack-checked-* (-anchor, -trigger, -popover): wrappers
 *   each followed by a `position: relative` block where their popover opens
 * - #scroll-box (overflow auto) holding #scroll-popover, opened by
 *   #scroll-trigger (a label around #scroll-input)
 * - #place-trigger (fixed, right half) and popovers #place-<placement> for
 *   default and the 12 placements, #place-gap (popover-top mb-1),
 *   #place-responsive (popover-bottom md:popover-right); every one h-12 w-40
 * - #native-wrapped-anchor (a fixed popover-anchor around
 *   #native-wrapped-trigger, a popovertarget button, and its
 *   #native-wrapped-popover)
 * - #rtl-trigger with #rtl-top-start / #rtl-top-end inside dir="rtl"
 * - #flip-block-trigger at the bottom edge, for #flip-block (popover-flip) and
 *   #stay-block (no popover-flip)
 * - #flip-wrapped-anchor at the bottom edge (-trigger, a checked label around
 *   #flip-wrapped-input; -popover has popover-flip, so it flips above)
 * - #flip-inline-trigger at the right edge, for #flip-inline (popover-right
 *   popover-flip) and #stay-inline (popover-right)
 * - #edge-trigger at the left edge with a wide #edge
 * - (5, 5) is empty page, for moving the pointer or clicking away
 */
import type { Locator, Page } from "@playwright/test";
import {
  browsers,
  expect,
  test,
} from "../../../../test/helpers/browser-test.ts";
import { loadFixture } from "../../../../test/helpers/fixture-page.ts";

type Box = { x: number; y: number; width: number; height: number };

const GAP = 8;
const PLACEMENTS = ["top", "bottom", "left", "right"].flatMap((side) => [
  side,
  `${side}-start`,
  `${side}-end`,
]);

test.beforeEach(async ({ page }) => {
  await loadFixture(page, new URL("./popover.e2e.html", import.meta.url));
});

test.describe("native popovers", () => {
  test("popovertarget opens it below its invoker, 8px away, centered", async ({
    page,
  }) => {
    const popover = page.locator("#native-click");
    await expect(popover).toBeHidden();

    await page.locator("#native-click-trigger").click();
    await settle(popover);

    expectPlaced(
      await box(page.locator("#native-click-trigger")),
      await box(popover),
      "bottom",
    );
  });

  test("clicking outside or pressing Esc closes it", async ({ page }) => {
    const popover = page.locator("#native-click");

    await page.locator("#native-click-trigger").click();
    await expect(popover).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(popover).toBeHidden();

    await page.locator("#native-click-trigger").click();
    await expect(popover).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(popover).toBeHidden();
  });

  test("commandfor / toggle-popover opens it next to its invoker", async ({
    page,
  }) => {
    const popover = page.locator("#native-command");

    await page.locator("#native-command-trigger").click();
    await settle(popover);

    expectPlaced(
      await box(page.locator("#native-command-trigger")),
      await box(popover),
      "bottom",
    );
  });

  test(
    "interestfor opens it on hover, next to its invoker",
    browsers("chromium"),
    async ({ page }) => {
      const popover = page.locator("#native-interest");

      await page.locator("#native-interest-trigger").hover();
      await settle(popover);

      expectPlaced(
        await box(page.locator("#native-interest-trigger")),
        await box(popover),
        "bottom",
      );
    },
  );
});

test.describe("placement", () => {
  test("defaults to below the trigger", async ({ page }) => {
    const popover = await openPlaced(page, "place-default");

    expectPlaced(
      await box(page.locator("#place-trigger")),
      await box(popover),
      "bottom",
    );
  });

  for (const placement of PLACEMENTS) {
    test(`popover-${placement}`, async ({ page }) => {
      const popover = await openPlaced(page, `place-${placement}`);

      expectPlaced(
        await box(page.locator("#place-trigger")),
        await box(popover),
        placement,
      );
    });
  }

  // Firefox mis-places every anchored popover inside dir="rtl" (even a plain
  // centered one lands off-screen), so this runs in Chromium only.
  test(
    "start and end follow the writing direction",
    browsers("chromium"),
    async ({ page }) => {
      const trigger = await box(page.locator("#rtl-trigger"));

      const start = await openPlaced(page, "rtl-top-start", "rtl-trigger");
      expectPlaced(trigger, await box(start), "top-start", "rtl");
      await page.keyboard.press("Escape");

      const end = await openPlaced(page, "rtl-top-end", "rtl-trigger");
      expectPlaced(trigger, await box(end), "top-end", "rtl");
    },
  );

  test("a Tailwind margin on the facing side changes the gap", async ({
    page,
  }) => {
    const popover = await openPlaced(page, "place-gap");
    const trigger = await box(page.locator("#place-trigger"));

    expectNear(bottom(await box(popover)), trigger.y - 4);
  });

  test("placements change at breakpoints", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    let popover = await openPlaced(page, "place-responsive");
    let trigger = await box(page.locator("#place-trigger"));
    expectNear((await box(popover)).y, bottom(trigger) + GAP);
    await page.keyboard.press("Escape");

    await page.setViewportSize({ width: 1280, height: 720 });
    popover = await openPlaced(page, "place-responsive");
    trigger = await box(page.locator("#place-trigger"));
    expectNear((await box(popover)).x, right(trigger) + GAP);
  });

  test("stays below near the bottom edge, without popover-flip", async ({
    page,
  }) => {
    const popover = await openPlaced(page, "stay-block", "flip-block-trigger");
    const trigger = await box(page.locator("#flip-block-trigger"));

    expectNear((await box(popover)).y, bottom(trigger) + GAP);
  });

  test("stays on the right near the right edge, without popover-flip", async ({
    page,
  }) => {
    const popover = await openPlaced(
      page,
      "stay-inline",
      "flip-inline-trigger",
    );
    const trigger = await box(page.locator("#flip-inline-trigger"));

    expectNear((await box(popover)).x, right(trigger) + GAP);
  });

  test("popover-flip flips it above when there is no room below, keeping the gap", async ({
    page,
  }) => {
    const popover = await openPlaced(page, "flip-block", "flip-block-trigger");
    const trigger = await box(page.locator("#flip-block-trigger"));

    expectNear(bottom(await box(popover)), trigger.y - GAP);
  });

  test("a CSS-opened popover that flips still fades in", async ({ page }) => {
    const popover = page.locator("#flip-wrapped-popover");
    await page.locator("#flip-wrapped-trigger").click();
    await settle(popover);
    const trigger = await box(page.locator("#flip-wrapped-trigger"));

    // Firefox drops the fade on a flipped popover, leaving it invisible.
    await expect(popover).toHaveCSS("opacity", "1");
    await expect(popover).toBeVisible();
    expectNear(bottom(await box(popover)), trigger.y - GAP);
  });

  test("popover-flip flips it left when there is no room on the right, keeping the gap", async ({
    page,
  }) => {
    const popover = await openPlaced(
      page,
      "flip-inline",
      "flip-inline-trigger",
    );
    const trigger = await box(page.locator("#flip-inline-trigger"));

    expectNear(right(await box(popover)), trigger.x - GAP);
  });

  test("a centered popover shifts to stay on screen", async ({ page }) => {
    const popover = await openPlaced(page, "edge", "edge-trigger");
    const trigger = await box(page.locator("#edge-trigger"));
    const placed = await box(popover);

    expect(placed.x).toBeGreaterThanOrEqual(0);
    expectNear(placed.y, bottom(trigger) + GAP);
  });
});

test.describe("native popover in a wrapper", () => {
  test("opens below the wrapper right away, without a delay", async ({
    page,
  }) => {
    const popover = page.locator("#native-wrapped-popover");
    await expect(popover).toBeHidden();

    // Timed in the page: Playwright's click() alone takes a few hundred ms.
    const openedAfterMs = await popover.evaluate(
      (el) =>
        new Promise<number>((resolve) => {
          document.getElementById("native-wrapped-trigger")!.click();
          const t0 = performance.now();
          const poll = () =>
            getComputedStyle(el).visibility === "visible" ?
              resolve(performance.now() - t0)
            : requestAnimationFrame(poll);
          poll();
        }),
    );

    expect(openedAfterMs).toBeLessThan(100);
    await settle(popover);
    expectPlaced(
      await box(page.locator("#native-wrapped-anchor")),
      await box(popover),
      "bottom",
    );
  });
});

test.describe("hover trigger", () => {
  test("shows the popover below its anchor while hovered", async ({ page }) => {
    const popover = page.locator("#hover-popover");
    await expect(popover).toBeHidden();

    await page.locator("#hover-trigger").hover();
    await settle(popover);
    expectPlaced(
      await box(page.locator("#hover-anchor")),
      await box(popover),
      "bottom",
    );

    await page.mouse.move(5, 5);
    await expect(popover).toBeHidden();
  });

  test("stays open while the pointer crosses the gap onto it", async ({
    page,
  }) => {
    const popover = page.locator("#hover-popover");
    await expect(popover).toBeHidden();

    await page.locator("#hover-trigger").hover();
    await settle(popover);
    const target = await box(popover);
    await page.mouse.move(cx(target), cy(target), { steps: 12 });
    await page.waitForTimeout(300);

    await expect(popover).toBeVisible();
  });

  test("a trigger can sit deeper inside the anchor", async ({ page }) => {
    const popover = page.locator("#deep-popover");
    await expect(popover).toBeHidden();

    await page.locator("#deep-trigger").hover();

    await expect(popover).toBeVisible();
  });

  test("a nested anchor's popover only opens from its own trigger", async ({
    page,
  }) => {
    const outer = page.locator("#outer-popover");
    const inner = page.locator("#inner-popover");

    await page.locator("#outer-trigger").hover();
    await settle(outer);
    await expect(inner).toBeHidden();

    const innerTrigger = await box(page.locator("#inner-trigger"));
    await page.mouse.move(cx(innerTrigger), cy(innerTrigger), { steps: 12 });
    await expect(inner).toBeVisible();
    await expect(outer).toBeVisible();
  });

  test("waits 0.5s to open and 0.25s to close by default, like interestfor", async ({
    page,
  }) => {
    const popover = page.locator("#hover-default-popover");

    const opening = await timeUntil(
      () => page.locator("#hover-default-trigger").hover(),
      () => expect(popover).toBeVisible({ timeout: 3000 }),
      () => popover.isVisible(),
      250,
    );
    expect(opening.visibleEarly).toBe(false);
    expect(opening.ms).toBeGreaterThanOrEqual(450);

    const closing = await timeUntil(
      () => page.mouse.move(5, 5),
      () => expect(popover).toBeHidden({ timeout: 3000 }),
      () => popover.isVisible(),
      100,
    );
    expect(closing.visibleEarly).toBe(true);
    expect(closing.ms).toBeGreaterThanOrEqual(200);
  });

  test("popover-trigger-delay-* on the trigger sets the delay", async ({
    page,
  }) => {
    const popover = page.locator("#hover-slow-popover");

    const opening = await timeUntil(
      () => page.locator("#hover-slow-trigger").hover(),
      () => expect(popover).toBeVisible({ timeout: 4000 }),
      () => popover.isVisible(),
      700,
    );

    expect(opening.visibleEarly).toBe(false);
    expect(opening.ms).toBeGreaterThanOrEqual(950);
  });

  test("works with a native hint popover in the wrapper", async ({ page }) => {
    const popover = page.locator("#mixed-popover");

    await page.locator("#mixed-trigger").hover();
    await settle(popover);

    expectPlaced(
      await box(page.locator("#mixed-anchor")),
      await box(popover),
      "bottom",
    );
  });

  test(
    "native interestfor still opens the wrapped hint popover",
    browsers("chromium"),
    async ({ page }) => {
      const popover = page.locator("#mixed-popover");

      await page.locator("#mixed-trigger").hover();

      await expect
        .poll(() => popover.evaluate((el) => el.matches(":popover-open")))
        .toBe(true);
    },
  );
});

test.describe("focus trigger", () => {
  test("opens on keyboard focus and stays open while focus is inside", async ({
    page,
  }) => {
    const popover = page.locator("#focus-popover");

    await page.locator("#before-focus").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#focus-trigger")).toBeFocused();
    await expect(popover).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(page.locator("#focus-link")).toBeFocused();
    await expect(popover).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(page.locator("#after-focus")).toBeFocused();
    await expect(popover).toBeHidden();
  });

  test("clicking the trigger opens it; clicking elsewhere closes it", async ({
    page,
  }) => {
    const popover = page.locator("#focus-popover");

    await page.locator("#focus-trigger").click();
    await settle(popover);
    expectPlaced(
      await box(page.locator("#focus-anchor")),
      await box(popover),
      "bottom",
    );

    await page.mouse.click(5, 5);
    await expect(popover).toBeHidden();
  });

  test("keyboard focus waits for popover-trigger-delay-*, like native interestfor", async ({
    page,
  }) => {
    const popover = page.locator("#focus-slow-popover");
    await page.locator("#before-focus-slow").focus();

    const opening = await timeUntil(
      () => page.keyboard.press("Tab"),
      () => expect(popover).toBeVisible({ timeout: 4000 }),
      () => popover.isVisible(),
      700,
    );

    await expect(page.locator("#focus-slow-trigger")).toBeFocused();
    expect(opening.visibleEarly).toBe(false);
    expect(opening.ms).toBeGreaterThanOrEqual(950);
  });

  test("a mouse click opens it right away, ignoring the delay", async ({
    page,
  }) => {
    const popover = page.locator("#focus-slow-popover");
    await expect(popover).toBeHidden();

    await page.locator("#focus-slow-trigger").click();

    // The trigger has a 1s delay; a click must not wait for it.
    await expect(popover).toBeVisible({ timeout: 400 });
  });
});

test.describe("checked trigger", () => {
  test("a label around a checkbox toggles it, without the hover delay", async ({
    page,
  }) => {
    const popover = page.locator("#checked-popover");
    await expect(popover).toBeHidden();
    // In view, so it's measured on screen.
    await centerInView(page.locator("#checked-anchor"));

    // Timed in the page: Playwright's click() alone takes a few hundred ms.
    const openedAfterMs = await popover.evaluate(
      (el) =>
        new Promise<number>((resolve) => {
          document.getElementById("checked-trigger")!.click();
          const t0 = performance.now();
          const poll = () =>
            el.checkVisibility({ visibilityProperty: true }) ?
              resolve(performance.now() - t0)
            : requestAnimationFrame(poll);
          poll();
        }),
    );
    expect(openedAfterMs).toBeLessThan(100);
    await settle(popover);
    expectPlaced(
      await box(page.locator("#checked-anchor")),
      await box(popover),
      "bottom",
    );

    await page.locator("#checked-trigger").click();
    await expect(popover).toBeHidden();
  });

  test("a checkbox inside the popover doesn't keep it open", async ({
    page,
  }) => {
    const popover = page.locator("#checked-popover");

    await page.locator("#checked-trigger").click();
    await page.locator("#checked-inner").check();
    await page.locator("#checked-trigger").click();

    await expect(popover).toBeHidden();
  });

  test("the checkbox itself can be the trigger", async ({ page }) => {
    const popover = page.locator("#checkbox-popover");

    await page.locator("#checkbox-trigger").check();
    await expect(popover).toBeVisible();
    await page.locator("#checkbox-trigger").uncheck();
    await expect(popover).toBeHidden();
  });

  test("a checked checkbox in the content doesn't open it", async ({
    page,
  }) => {
    await page
      .locator("#content-checkbox")
      .evaluate((el: HTMLInputElement) => (el.checked = true));
    await page.waitForTimeout(300);

    await expect(page.locator("#content-checkbox-popover")).toBeHidden();
  });
});

test.describe("breakpoint variants in a wrapper", () => {
  test("a wrapped popover's breakpoint placement applies", async ({ page }) => {
    const popover = page.locator("#responsive-popover");

    await page.setViewportSize({ width: 375, height: 700 });
    await page.locator("#responsive-trigger").hover();
    await settle(popover);
    expectPlaced(
      await box(page.locator("#responsive-anchor")),
      await box(popover),
      "bottom",
    );
    await page.mouse.move(1, 1);
    await expect(popover).toBeHidden();

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator("#responsive-trigger").hover();
    await settle(popover);
    expectPlaced(
      await box(page.locator("#responsive-anchor")),
      await box(popover),
      "right",
    );
  });

  test("a breakpoint trigger class only triggers at that breakpoint", async ({
    page,
  }) => {
    const popover = page.locator("#responsive-popover");

    await page.setViewportSize({ width: 375, height: 700 });
    await page.locator("#responsive-trigger").focus();
    await page.waitForTimeout(300);
    await expect(popover).toBeHidden();
    await page.locator("#responsive-trigger").blur();

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator("#before-focus").focus();
    await page.locator("#responsive-trigger").focus();
    await expect(popover).toBeVisible();
  });
});

test.describe("details", () => {
  test('an open <details class="popover-anchor"> shows its popover below the summary', async ({
    page,
  }) => {
    const popover = page.locator("#details-popover");

    await page.locator("#details-trigger").click();
    await settle(popover);
    expectPlaced(
      await box(page.locator("#details-trigger")),
      await box(popover),
      "bottom",
    );

    await page.locator("#details-trigger").click();
    await expect(popover).toBeHidden();
  });
});

test.describe("overflow and scrolling", () => {
  for (const kind of ["hover", "checked"] as const) {
    test(`a CSS-opened popover (${kind}) stacks above later positioned content`, async ({
      page,
    }) => {
      const popover = page.locator(`#stack-${kind}-popover`);
      await expect(popover).toBeHidden();
      await centerInView(page.locator(`#stack-${kind}-anchor`));

      const trigger = page.locator(`#stack-${kind}-trigger`);
      if (kind === "hover") await trigger.hover();
      else await trigger.click();
      await settle(popover);
      const placed = await box(popover);

      expect(
        await hitsElement(page, popover, cx(placed), bottom(placed) - 6),
      ).toBe(true);
    });
  }

  test("an overflow: hidden ancestor doesn't clip it", async ({ page }) => {
    const popover = page.locator("#clip-popover");
    await expect(popover).toBeHidden();
    // Room below, so the popover hangs out of the bottom of the clip box.
    await centerInView(page.locator("#clip-box"));

    await page.locator("#clip-trigger").click();
    await settle(popover);
    const placed = await box(popover);
    const clip = await box(page.locator("#clip-box"));

    expect(bottom(placed)).toBeGreaterThan(bottom(clip));
    expect(
      await hitsElement(page, popover, cx(placed), bottom(placed) - 4),
    ).toBe(true);
  });

  test("follows its trigger when a scroll container scrolls", async ({
    page,
  }) => {
    const popover = page.locator("#scroll-popover");
    const trigger = page.locator("#scroll-trigger");
    await expect(popover).toBeHidden();

    await trigger.click();
    await settle(popover);
    const before = (await box(popover)).y - bottom(await box(trigger));

    const scrollBox = await box(page.locator("#scroll-box"));
    await page.mouse.move(cx(scrollBox), cy(scrollBox));
    await page.mouse.wheel(0, 30);
    await expect
      .poll(() => page.locator("#scroll-box").evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0);
    await nextFrames(page);

    expectNear((await box(popover)).y - bottom(await box(trigger)), before);
  });
});

test.describe("animation", () => {
  test("transitions in when opened natively", async ({ page }) => {
    const running = await page
      .locator("#native-click")
      .evaluate((el: HTMLElement) => {
        el.showPopover();
        return el.getAnimations().length;
      });

    expect(running).toBeGreaterThan(0);
  });

  test("transitions in when a CSS trigger opens it", async ({ page }) => {
    const running = await page
      .locator("#checked-popover")
      .evaluate((el: HTMLElement) => {
        const input = document.getElementById(
          "checked-input",
        ) as HTMLInputElement;
        input.checked = true;
        return el.getAnimations().length;
      });

    expect(running).toBeGreaterThan(0);
  });

  test("doesn't animate under reduced motion", async ({ page }) => {
    const openAndCount = () =>
      page.locator("#native-click").evaluate((el: HTMLElement) => {
        el.showPopover();
        const checked = document.getElementById(
          "checked-input",
        ) as HTMLInputElement;
        checked.checked = true;
        const wrapped = document.getElementById("checked-popover")!;
        return el.getAnimations().length + wrapped.getAnimations().length;
      });
    expect(await openAndCount()).toBeGreaterThan(0);

    await loadFixture(page, new URL("./popover.e2e.html", import.meta.url));
    await page.emulateMedia({ reducedMotion: "reduce" });

    expect(await openAndCount()).toBe(0);
  });
});

/** Points `trigger`'s popovertarget at `id`, clicks it, and waits for the transition. */
async function openPlaced(page: Page, id: string, trigger = "place-trigger") {
  await page
    .locator(`#${trigger}`)
    .evaluate((el, target) => el.setAttribute("popovertarget", target), id);
  await page.locator(`#${trigger}`).click();
  const popover = page.locator(`#${id}`);
  await settle(popover);
  return popover;
}

/** Scrolls `locator` to the middle of the viewport. */
async function centerInView(locator: Locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: "center" }));
}

/** Waits until the popover is visible and its open transition has finished. */
async function settle(popover: Locator) {
  await expect(popover).toBeVisible();
  await popover.evaluate((el) =>
    Promise.all(el.getAnimations().map((a) => a.finished.catch(() => {}))),
  );
}

/**
 * Asserts where `popover` sits relative to `trigger` for a placement like
 * "top", "left-start", or "bottom-end": GAP away on the side, and centered or
 * edge-aligned along it. start/end follow `dir` on the top and bottom sides.
 */
function expectPlaced(
  trigger: Box,
  popover: Box,
  placement: string,
  dir: "ltr" | "rtl" = "ltr",
) {
  const [side, align = "center"] = placement.split("-");

  if (side === "top") expectNear(bottom(popover), trigger.y - GAP);
  if (side === "bottom") expectNear(popover.y, bottom(trigger) + GAP);
  if (side === "left") expectNear(right(popover), trigger.x - GAP);
  if (side === "right") expectNear(popover.x, right(trigger) + GAP);

  if (side === "top" || side === "bottom") {
    const startEdge = dir === "ltr" ? "left" : "right";
    const edge =
      align === "center" ? "center"
      : align === "start" ? startEdge
      : startEdge === "left" ? "right"
      : "left";
    if (edge === "center") expectNear(cx(popover), cx(trigger));
    if (edge === "left") expectNear(popover.x, trigger.x);
    if (edge === "right") expectNear(right(popover), right(trigger));
  } else {
    if (align === "center") expectNear(cy(popover), cy(trigger));
    if (align === "start") expectNear(popover.y, trigger.y);
    if (align === "end") expectNear(bottom(popover), bottom(trigger));
  }
}

function expectNear(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
}

/**
 * Runs `start`, checks `isVisible` after `earlyMs`, then waits with `until`.
 * Returns whether it was visible at `earlyMs` and the total time taken.
 */
async function timeUntil(
  start: () => Promise<unknown>,
  until: () => Promise<unknown>,
  isVisible: () => Promise<boolean>,
  earlyMs: number,
) {
  const t0 = Date.now();
  await start();
  let visibleEarly: boolean | undefined;
  if (earlyMs > 0) {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(0, earlyMs - (Date.now() - t0))),
    );
    visibleEarly = await isVisible();
  }
  await until();
  return { visibleEarly, ms: Date.now() - t0 };
}

/** Whether the element at (x, y) is `target` or inside it. */
function hitsElement(page: Page, target: Locator, x: number, y: number) {
  return target.evaluate(
    (el, [px, py]) => {
      const hit = document.elementFromPoint(px!, py!);
      return !!hit && el.contains(hit);
    },
    [x, y],
  );
}

async function nextFrames(page: Page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

async function box(locator: Locator): Promise<Box> {
  const result = await locator.boundingBox();
  expect(result).not.toBeNull();
  return result!;
}

function right(b: Box) {
  return b.x + b.width;
}

function bottom(b: Box) {
  return b.y + b.height;
}

function cx(b: Box) {
  return b.x + b.width / 2;
}

function cy(b: Box) {
  return b.y + b.height / 2;
}
