/**
 * End-to-end spec for the progress component, run against progress.e2e.html.
 * Checks what the browser actually draws: ring size and thickness, which
 * part of the circle is filled and in which colors (by sampling screenshot
 * pixels against Tailwind color swatches), that `--progress-value` is a
 * registered `<percentage>`, and that value changes animate except with
 * reduced motion.
 *
 * Fixture contract (ids the tests rely on):
 * - #stage                  <main> with an rgb(255, 0, 255) background behind every ring
 * - #quarter                progress-radial/primary progress-size-7xl, --progress-value: 25% (inline)
 * - #quarter-9xl            like #quarter, with progress-size-9xl
 * - #inherited              progress-radial progress-size-7xl, 25%, inside a palette-success parent
 * - #default                progress-radial with no size
 * - #size-<name>            progress-radial progress-size-<name> for every Tailwind text size (xs … 9xl)
 * - #custom-px, #custom-rem progress-radial progress-size-[40px] / progress-size-[7rem]
 * - #responsive             progress-radial min-[1px]:progress-size-5xl
 * - #thick-px, #thick-pct   72px primary rings at 25% with progress-thickness-[4px] / progress-thickness-[50%]
 * - #thick-bare             like #thick-pct, with progress-thickness-50
 * - #override               progress-radial w-12
 * - #value-utility          progress-radial progress-value-40
 * - #value-arbitrary        progress-radial progress-value-[37.5%]
 * - #value-invalid          progress-radial, --progress-value: 3rem (inline)
 * - #value-child            progress-radial inside a parent with --progress-value: 50%
 * - #animated               progress-radial, --progress-value: 0% (inline)
 * - #swatch-<palette>-<shade>  bg-<palette>-<shade> squares for primary/success 500/200
 */
import { type Page } from "@playwright/test";
import { expect, test } from "../../../../../test/helpers/browser-test.ts";
import { loadFixture } from "../../../../../test/helpers/fixture-page.ts";

type Rgb = [number, number, number];

const STAGE: Rgb = [255, 0, 255];

test.beforeEach(async ({ page }) => {
  await loadFixture(page, new URL("./progress.e2e.html", import.meta.url));
});

test.describe("size", () => {
  // Tailwind's default text scale, in px.
  for (const [id, size] of [
    ["default", 16],
    ["size-xs", 12],
    ["size-sm", 14],
    ["size-base", 16],
    ["size-lg", 18],
    ["size-xl", 20],
    ["size-2xl", 24],
    ["size-3xl", 30],
    ["size-4xl", 36],
    ["size-5xl", 48],
    ["size-6xl", 60],
    ["size-7xl", 72],
    ["size-8xl", 96],
    ["size-9xl", 128],
    ["custom-px", 40],
    ["custom-rem", 112],
    ["responsive", 48],
  ] as const) {
    test(`#${id} is a ${size}px circle`, async ({ page }) => {
      const box = await page.locator(`#${id}`).boundingBox();

      expect(box!.width).toBeCloseTo(size, 0);
      expect(box!.height).toBeCloseTo(size, 0);
    });
  }

  test("Tailwind w-12 overrides the size and keeps it a circle", async ({
    page,
  }) => {
    const box = await page.locator("#override").boundingBox();

    expect(box!.width).toBeCloseTo(48, 0);
    expect(box!.height).toBeCloseTo(48, 0);
  });
});

test.describe("ring", () => {
  for (const [id, size] of [
    ["quarter", 72],
    ["quarter-9xl", 128],
  ] as const) {
    test(`#${id} fills 25% in primary 500 over a primary 200 track`, async ({
      page,
    }) => {
      const [fill, track] = await swatches(page, "primary");
      const [filled, unfilled] = await ringPixels(page, id, [
        onRing(size, 45),
        onRing(size, 225),
      ]);

      expectColor(filled!, fill!);
      expectColor(unfilled!, track!);
    });

    test(`#${id} is a ring 1/8 of its size thick, with a see-through center`, async ({
      page,
    }) => {
      const thickness = size / 8;
      const [band, inside, center, corner] = await ringPixels(page, id, [
        onRing(size, 225),
        polar(size, 225, size / 2 - thickness - 2),
        [size / 2, size / 2],
        [1, 1],
      ]);

      expect(band).not.toEqual(STAGE);
      expectColor(inside!, STAGE);
      expectColor(center!, STAGE);
      expectColor(corner!, STAGE);
    });
  }

  test("without a modifier, uses the inherited palette", async ({ page }) => {
    const [fill, track] = await swatches(page, "success");
    const [filled, unfilled] = await ringPixels(page, "inherited", [
      onRing(72, 45),
      onRing(72, 225),
    ]);

    expectColor(filled!, fill!);
    expectColor(unfilled!, track!);
  });

  for (const [id, thickness] of [
    ["thick-px", 4],
    ["thick-pct", 18],
    ["thick-bare", 18],
  ] as const) {
    test(`#${id} is a ring ${thickness}px thick`, async ({ page }) => {
      const [band, inside] = await ringPixels(page, id, [
        polar(72, 225, 36 - thickness + 2),
        polar(72, 225, 36 - thickness - 2),
      ]);

      expect(band).not.toEqual(STAGE);
      expectColor(inside!, STAGE);
    });
  }
});

test.describe("--progress-value", () => {
  for (const [id, value] of [
    ["value-utility", "40%"],
    ["value-arbitrary", "37.5%"],
    ["value-invalid", "0%"],
    ["value-child", "0%"],
  ] as const) {
    test(`#${id} computes to ${value}`, async ({ page }) => {
      expect(await progressValue(page, id)).toBe(value);
    });
  }

  test("a value change animates over 500ms", async ({ page }) => {
    expect(await changeValue(page, "animated", "100%")).toEqual([
      { property: "--progress-value", duration: 500 },
    ]);
  });

  test("a value change doesn't animate with reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    expect(await changeValue(page, "animated", "100%")).toEqual([]);
  });
});

/** A point on the middle of the ring band, `angle` degrees clockwise from the top. */
function onRing(size: number, angle: number) {
  return polar(size, angle, size / 2 - size / 16);
}

function polar(size: number, angle: number, radius: number): [number, number] {
  const radians = (angle * Math.PI) / 180;
  return [
    size / 2 + radius * Math.sin(radians),
    size / 2 - radius * Math.cos(radians),
  ];
}

/** Screenshot colors at points relative to the element's top-left corner. */
async function ringPixels(page: Page, id: string, points: [number, number][]) {
  const box = await page.locator(`#${id}`).boundingBox();
  return pagePixels(
    page,
    points.map(([x, y]) => [box!.x + x, box!.y + y]),
  );
}

async function swatches(page: Page, palette: string) {
  const points = await Promise.all(
    [500, 200].map(async (shade) => {
      const box = await page
        .locator(`#swatch-${palette}-${shade}`)
        .boundingBox();
      return [box!.x + box!.width / 2, box!.y + box!.height / 2] as [
        number,
        number,
      ];
    }),
  );
  return pagePixels(page, points);
}

async function pagePixels(page: Page, points: [number, number][]) {
  const png = await page.screenshot({ fullPage: true, scale: "css" });
  return page.evaluate(
    async ({ base64, points }) => {
      const blob = await (
        await fetch(`data:image/png;base64,${base64}`)
      ).blob();
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(bitmap, 0, 0);
      return points.map(([x, y]) => {
        const [r, g, b] = context.getImageData(
          Math.round(x),
          Math.round(y),
          1,
          1,
        ).data;
        return [r, g, b] as [number, number, number];
      });
    },
    { base64: png.toString("base64"), points },
  );
}

function expectColor(actual: Rgb, expected: Rgb) {
  const distance = Math.max(
    ...actual.map((channel, i) => Math.abs(channel - expected[i]!)),
  );
  expect(
    distance,
    `rgb(${actual.join(", ")}) vs rgb(${expected.join(", ")})`,
  ).toBeLessThanOrEqual(3);
}

async function progressValue(page: Page, id: string) {
  return page
    .locator(`#${id}`)
    .evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--progress-value").trim(),
    );
}

/** Sets --progress-value inline and returns the transitions it starts. */
async function changeValue(page: Page, id: string, value: string) {
  return page.locator(`#${id}`).evaluate((el, value) => {
    getComputedStyle(el).getPropertyValue("--progress-value");
    (el as HTMLElement).style.setProperty("--progress-value", value);
    return el.getAnimations().map((animation) => ({
      property: (animation as CSSTransition).transitionProperty,
      duration: animation.effect?.getTiming().duration,
    }));
  }, value);
}
