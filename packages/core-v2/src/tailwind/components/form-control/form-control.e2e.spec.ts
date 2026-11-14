/**
 * End-to-end spec for the form-control component, run against
 * form-control.e2e.html. Controls transition their colors, so `styles` waits
 * for transitions to finish before reading computed values.
 *
 * Fixture contract (ids the tests rely on), each control w-80:
 * - #btn-soft, #btn-solid  `btn-soft` / `btn-solid` buttons, the reference
 *                      colors for the soft and solid variants
 * - #fc-full           form-control with <label>, prefix, #fc-full-input,
 *                      suffix, and hint slots
 * - #fc-custom         form-control with [data-slot="label"] and
 *                      [data-slot="input"] custom elements
 * - #fc-no-input       form-control with a <label> but no field inside
 * - #fc-<variant>      form-control-<variant> with <label>, #fc-<variant>-input,
 *                      and a hint, for outline/soft/solid/underline
 * - #fc-danger         form-control/danger, #fc-danger-input, and a hint
 * - #fc-soft-danger    form-control-soft/danger, #fc-soft-danger-input
 * - #fc-soft-aria      form-control-soft/primary + has-aria-invalid:form-control-soft/danger,
 *                      #fc-soft-aria-input has aria-invalid="true"
 * - #fc-aria           form-control + has-aria-invalid:form-control/danger,
 *                      #fc-aria-input has aria-invalid="true"
 * - #fc-plain-invalid  form-control with no opt-in class,
 *                      #fc-plain-invalid-input has aria-invalid="true"
 * - #fc-user-invalid   form-control + has-user-invalid:form-control/danger,
 *                      #fc-user-invalid-input (peer, type="email"), and a hint
 *                      with peer-user-invalid:text-danger-700
 * - #fc-custom-invalid form-control/primary + has-aria-invalid:form-control/danger,
 *                      #fc-custom-invalid-input is a data-slot="input" div (peer,
 *                      aria-invalid="true"), and a hint with
 *                      peer-aria-invalid:text-danger-700
 * - #danger-text       `text-danger-700`, the invalid hint color
 * - #elsewhere         a button to move focus to
 */
import { type Locator, type Page } from "@playwright/test";
import { expect, test } from "../../../../test/helpers/browser-test.ts";
import { loadFixture } from "../../../../test/helpers/fixture-page.ts";

const SIDES = ["Top", "Right", "Bottom", "Left"] as const;

test.beforeEach(async ({ page }) => {
  await loadFixture(page, new URL("./form-control.e2e.html", import.meta.url));
});

test.describe("layout", () => {
  test("the label sits on top of the prefix / input / suffix row, with the hint below", async ({
    page,
  }) => {
    const control = page.locator("#fc-full");
    const label = await box(control.locator("label"));
    const prefix = await box(control.locator('[data-slot="prefix"]'));
    const input = await box(control.locator("input"));
    const suffix = await box(control.locator('[data-slot="suffix"]'));
    const hint = await box(control.locator('[data-slot="hint"]'));

    expect(label.bottom).toBeCloseTo(input.top, 0);
    for (const part of [prefix, suffix]) {
      expect(part.top).toBeCloseTo(input.top, 0);
      expect(part.bottom).toBeCloseTo(input.bottom, 0);
    }
    expect(hint.top).toBeGreaterThanOrEqual(input.bottom - 1);
  });

  test("the hint sits 6px below the field row", async ({ page }) => {
    const control = page.locator("#fc-full");
    const input = await box(control.locator("input"));
    const hint = await box(control.locator('[data-slot="hint"]'));

    expect(hint.top - input.bottom).toBeCloseTo(6, 0);
  });

  test("the hint uses the label's font", async ({ page }) => {
    const control = page.locator("#fc-full");
    const props = [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "letterSpacing",
    ] as const;

    expect(await styles(control.locator('[data-slot="hint"]'), props)).toEqual(
      await styles(control.locator("label"), props),
    );
  });

  test("prefix, input, and suffix join into one box", async ({ page }) => {
    const control = page.locator("#fc-full");
    const prefix = await box(control.locator('[data-slot="prefix"]'));
    const input = await box(control.locator("input"));
    const suffix = await box(control.locator('[data-slot="suffix"]'));

    expect(prefix.right).toBeCloseTo(input.left, 0);
    expect(input.right).toBeCloseTo(suffix.left, 0);
    expect(input.width).toBeGreaterThan(prefix.width + suffix.width);
  });

  test("custom elements with data-slot take the label and input places", async ({
    page,
  }) => {
    const control = page.locator("#fc-custom");
    const wrapper = await box(control);
    const label = await box(control.locator('[data-slot="label"]'));
    const input = await box(control.locator('[data-slot="input"]'));

    expect(label.bottom).toBeCloseTo(input.top, 0);
    expect(input.left).toBeCloseTo(wrapper.left, 0);
    expect(input.width).toBeCloseTo(wrapper.width, 0);
  });

  test("a custom input is styled like a native one", async ({ page }) => {
    const props = [
      "backgroundColor",
      "borderBottomColor",
      "borderBottomWidth",
    ] as const;

    expect(
      await styles(page.locator('#fc-custom [data-slot="input"]'), props),
    ).toEqual(await styles(page.locator("#fc-outline-input"), props));
  });

  test("a control with no input inside is drawn as a bordered box", async ({
    page,
  }) => {
    const s = await styles(page.locator("#fc-no-input"), [
      ...SIDES.map((side) => `border${side}Width` as const),
      "paddingLeft",
    ]);

    for (const side of SIDES) {
      expect(parseFloat(s[`border${side}Width`])).toBeGreaterThan(0);
    }
    expect(parseFloat(s.paddingLeft)).toBeGreaterThan(0);
  });

  test("a label in a control with no input is plain text, not a box", async ({
    page,
  }) => {
    expect(await borderWidths(page.locator("#fc-no-input label"))).toEqual([
      0, 0, 0, 0,
    ]);
  });
});

test("focusing the input highlights its border", async ({ page }) => {
  const input = page.locator("#fc-full-input");
  const before = await styles(input, ["borderBottomColor"]);

  await input.focus();

  expect(await styles(input, ["borderBottomColor"])).not.toEqual(before);
});

test.describe("variants", () => {
  test("outline borders the label and input as one box", async ({ page }) => {
    const [labelTop, labelRight, labelBottom, labelLeft] = await borderWidths(
      page.locator("#fc-outline label"),
    );
    const [inputTop, inputRight, inputBottom, inputLeft] = await borderWidths(
      page.locator("#fc-outline-input"),
    );

    for (const width of [labelTop, labelRight, labelLeft]) {
      expect(width).toBeGreaterThan(0);
    }
    for (const width of [inputRight, inputBottom, inputLeft]) {
      expect(width).toBeGreaterThan(0);
    }
    expect({ labelBottom, inputTop }).toEqual({ labelBottom: 0, inputTop: 0 });
  });

  test("underline borders only the bottom of the input", async ({ page }) => {
    const [top, right, bottom, left] = await borderWidths(
      page.locator("#fc-underline-input"),
    );

    expect({ top, right, left }).toEqual({ top: 0, right: 0, left: 0 });
    expect(bottom).toBeGreaterThan(0);
  });

  test("soft and solid fill the input with different colors", async ({
    page,
  }) => {
    const soft = await styles(page.locator("#fc-soft-input"), [
      "backgroundColor",
    ]);
    const solid = await styles(page.locator("#fc-solid-input"), [
      "backgroundColor",
    ]);

    expect(isTransparent(soft.backgroundColor)).toBe(false);
    expect(isTransparent(solid.backgroundColor)).toBe(false);
    expect(soft.backgroundColor).not.toBe(solid.backgroundColor);
  });

  for (const variant of ["outline", "soft", "solid"] as const) {
    test(`${variant} sets its hint 0.25rem in from the box's left edge`, async ({
      page,
    }) => {
      const control = page.locator(`#fc-${variant}`);

      expect(
        (await textLeft(control.locator('[data-slot="hint"]'))) -
          (await box(control)).left,
      ).toBeCloseTo(4, 0);
    });
  }

  test("underline lines the label, input, and hint up with the underline's left edge", async ({
    page,
  }) => {
    const control = page.locator("#fc-underline");
    const edge = (await box(control.locator("input"))).left;

    for (const part of ["label", "input", '[data-slot="hint"]']) {
      expect(await textLeft(control.locator(part))).toBeCloseTo(edge, 0);
    }
  });

  for (const variant of ["soft", "solid"] as const) {
    test(`${variant} uses btn-${variant}'s border, fill, and text colors`, async ({
      page,
    }) => {
      const props = ["borderBottomColor", "backgroundColor", "color"] as const;

      expect(await styles(page.locator(`#fc-${variant}-input`), props)).toEqual(
        await styles(page.locator(`#btn-${variant}`), props),
      );
    });
  }
});

test.describe("error state", () => {
  const COLORS = ["borderBottomColor", "backgroundColor", "color"] as const;

  for (const [how, id, reference] of [
    ['aria-invalid="true"', "fc-aria-input", "fc-danger-input"],
    [
      'aria-invalid="true" over soft/primary',
      "fc-soft-aria-input",
      "fc-soft-danger-input",
    ],
  ] as const) {
    test(`${how} looks the same as the /danger palette`, async ({ page }) => {
      expect(await styles(page.locator(`#${id}`), COLORS)).toEqual(
        await styles(page.locator(`#${reference}`), COLORS),
      );
    });
  }

  test("an invalid field without an opt-in class leaves the control unchanged", async ({
    page,
  }) => {
    expect(
      await styles(page.locator("#fc-plain-invalid-input"), COLORS),
    ).toEqual(await styles(page.locator("#fc-outline-input"), COLORS));
  });

  test("has-user-invalid: turns the control and peer-user-invalid: hint red only after the user leaves the field", async ({
    page,
  }) => {
    const input = page.locator("#fc-user-invalid-input");
    const hint = page.locator('#fc-user-invalid [data-slot="hint"]');
    const danger = await borderColor(page, "#fc-danger-input");
    const dangerText = (await styles(page.locator("#danger-text"), ["color"]))
      .color;

    await input.fill("not-an-email");
    expect(await borderColor(page, "#fc-user-invalid-input")).not.toBe(danger);
    expect((await styles(hint, ["color"])).color).not.toBe(dangerText);

    await page.locator("#elsewhere").click();
    expect(await borderColor(page, "#fc-user-invalid-input")).toBe(danger);
    expect((await styles(hint, ["color"])).color).toBe(dangerText);
  });

  test("a custom input with aria-invalid turns the control and its peer hint red", async ({
    page,
  }) => {
    expect(await borderColor(page, "#fc-custom-invalid-input")).toBe(
      await borderColor(page, "#fc-danger-input"),
    );
    expect(
      await styles(page.locator('#fc-custom-invalid [data-slot="hint"]'), [
        "color",
      ]),
    ).toEqual(await styles(page.locator("#danger-text"), ["color"]));
  });

  test("the hint stays neutral text in the danger palette", async ({
    page,
  }) => {
    expect(
      await styles(page.locator('#fc-danger [data-slot="hint"]'), ["color"]),
    ).toEqual(
      await styles(page.locator('#fc-full [data-slot="hint"]'), ["color"]),
    );
  });
});

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error("element is not rendered");
  return {
    ...b,
    right: b.x + b.width,
    bottom: b.y + b.height,
    left: b.x,
    top: b.y,
  };
}

/** Computed styles, read once the element's transitions have finished. */
function styles<const P extends keyof CSSStyleDeclaration & string>(
  locator: Locator,
  props: readonly P[],
) {
  return locator.evaluate(async (el, props) => {
    await Promise.all(
      el.getAnimations().map((animation) => animation.finished),
    );
    const computed = getComputedStyle(el);
    return Object.fromEntries(
      props.map((prop) => [prop, String(computed[prop])]),
    ) as Record<P, string>;
  }, props);
}

async function borderWidths(locator: Locator) {
  const s = await styles(
    locator,
    SIDES.map((side) => `border${side}Width` as const),
  );
  return SIDES.map((side) => parseFloat(s[`border${side}Width`]));
}

/** Where the element's content (its text) starts, past border and padding. */
async function textLeft(locator: Locator) {
  const s = await styles(locator, ["borderLeftWidth", "paddingLeft"]);
  return (
    (await box(locator)).left +
    parseFloat(s.borderLeftWidth) +
    parseFloat(s.paddingLeft)
  );
}

async function borderColor(page: Page, selector: string) {
  return (await styles(page.locator(selector), ["borderBottomColor"]))
    .borderBottomColor;
}

function isTransparent(color: string) {
  return (
    color === "transparent" ||
    /rgba\(0, 0, 0, 0\)$/.test(color) ||
    /\/ 0\)$/.test(color)
  );
}
