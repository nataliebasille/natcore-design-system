/**
 * End-to-end spec for the dialog docs page (/components/dialog).
 *
 * Example contract the page must provide (ids are part of the docs markup):
 * - #dialog-basic          centered `card-soft` dialog with card sections;
 *                          show-modal + close invokers; closedby="any" (the
 *                          docs' default for examples)
 * - #dialog-invokers      buttons with command="close" value="done" and
 *                          command="request-close"
 * - #dialog-esc-only       closedby="closerequest"
 * - #dialog-no-dismiss     closedby="none" with a close invoker
 * - #dialog-alert          role="alertdialog" without closedby="any";
 *                          <form method="dialog"> with Cancel first and a
 *                          value="delete" button
 * - #dialog-top, #dialog-bottom, #dialog-responsive (dialog-bottom tablet:dialog-center;
 *   the showcase only defines the tablet and desktop breakpoints)
 * - #dialog-fullscreen     Tailwind full-screen recipe
 * - #dialog-backdrop-blur  backdrop:bg-black/60 backdrop:backdrop-blur-md
 * - #dialog-backdrop-none  dialog-backdrop-none
 * - #dialog-non-modal      opened with dialog.show() by button[aria-controls]
 * - #dialog-js             opened with dialog.showModal() by button[aria-controls]
 */
import { expect, test, type Locator, type Page } from '@playwright/test'

const DEFAULT_WIDTH_PX = 512 // 32rem

test.beforeEach(async ({ page }) => {
  const response = await page.goto('/components/dialog')
  expect(response?.status(), 'dialog docs page should exist').toBe(200)
})

test('renders the dialog docs page', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dialog')
})

test.describe('opening and closing', () => {
  test('a show-modal invoker opens the dialog as a modal', async ({ page }) => {
    const dialog = await open(page, 'dialog-basic')

    expect(await isModal(dialog)).toBe(true)
  })

  test('focus moves into the dialog and returns to the trigger on close', async ({ page }) => {
    const dialog = await open(page, 'dialog-basic')

    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true)

    await dialog.locator('[command="close"]').click()
    await expect(dialog).toBeHidden()
    await expect(trigger(page, 'dialog-basic')).toBeFocused()
  })

  test('Esc closes the dialog', async ({ page }) => {
    const dialog = await open(page, 'dialog-basic')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('examples default to closedby="any": a backdrop click closes them', async ({ page }) => {
    const dialog = await open(page, 'dialog-basic')

    await expect(dialog).toHaveAttribute('closedby', 'any')
    await page.mouse.click(5, 5)
    await expect(dialog).toBeHidden()
  })

  test('closedby="closerequest" closes on Esc but not on backdrop click', async ({ page }) => {
    const dialog = await open(page, 'dialog-esc-only')

    await page.mouse.click(5, 5)
    await expect(dialog).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('the alert dialog does not close on backdrop click', async ({ page }) => {
    const dialog = await open(page, 'dialog-alert')

    await page.mouse.click(5, 5)
    await expect(dialog).toBeVisible()
  })

  test('closedby="none" ignores Esc but closes from its button', async ({ page }) => {
    const dialog = await open(page, 'dialog-no-dismiss')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()

    await dialog.locator('[command="close"]').click()
    await expect(dialog).toBeHidden()
  })

  test('alert dialog focuses Cancel and reports the chosen action', async ({ page }) => {
    const dialog = await open(page, 'dialog-alert')

    await expect(dialog).toHaveAttribute('role', 'alertdialog')
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()

    await dialog.locator('button[value="delete"]').click()
    await expect(dialog).toBeHidden()
    expect(await dialog.evaluate((el) => (el as HTMLDialogElement).returnValue)).toBe('delete')
  })

  test('the invoker example closes with close (setting returnValue) and request-close', async ({
    page,
  }) => {
    let dialog = await open(page, 'dialog-invokers')

    await dialog.locator('button[command="close"][value="done"]').click()
    await expect(dialog).toBeHidden()
    expect(await dialog.evaluate((el) => (el as HTMLDialogElement).returnValue)).toBe('done')

    dialog = await open(page, 'dialog-invokers')
    await dialog.locator('button[command="request-close"]').click()
    await expect(dialog).toBeHidden()
  })

  test('the JS fallback opens a modal with showModal()', async ({ page }) => {
    await page.locator('button[aria-controls="dialog-js"]').click()
    const dialog = page.locator('#dialog-js')

    await expect(dialog).toBeVisible()
    expect(await isModal(dialog)).toBe(true)
  })
})

test.describe('appearance', () => {
  test('the surface comes from the card classes', async ({ page }) => {
    const dialog = await open(page, 'dialog-basic')

    const styles = await dialog.evaluate((el) => {
      const reference = document.createElement('div')
      reference.className = 'card-soft'
      el.parentElement!.appendChild(reference)

      const pick = (node: Element) => {
        const s = getComputedStyle(node)
        return {
          background: s.backgroundColor,
          border: s.borderTopColor,
          radius: s.borderTopLeftRadius,
        }
      }
      const result = { dialog: pick(el), card: pick(reference) }
      reference.remove()
      return result
    })

    expect(styles.dialog).toEqual(styles.card)
  })

  test('has no padding of its own', async ({ page }) => {
    const dialog = await open(page, 'dialog-basic')

    expect(await dialog.evaluate((el) => getComputedStyle(el).padding)).toBe('0px')
  })

  test('dims the backdrop by default', async ({ page }) => {
    const dialog = await open(page, 'dialog-basic')

    expect(alpha(await backdropStyle(dialog, 'backgroundColor'))).toBeGreaterThan(0)
  })

  test('backdrop: utilities customize the backdrop', async ({ page }) => {
    const dialog = await open(page, 'dialog-backdrop-blur')

    expect(await backdropStyle(dialog, 'backdropFilter')).toContain('blur(')
    expect(alpha(await backdropStyle(dialog, 'backgroundColor'))).toBeCloseTo(0.6, 2)
  })

  test('dialog-backdrop-none removes the dim', async ({ page }) => {
    const dialog = await open(page, 'dialog-backdrop-none')

    expect(alpha(await backdropStyle(dialog, 'backgroundColor'))).toBe(0)
  })
})

test.describe('placement and width', () => {
  test('is centered and 32rem wide by default', async ({ page }) => {
    const dialog = await open(page, 'dialog-basic')
    const box = (await dialog.boundingBox())!
    const viewport = page.viewportSize()!

    expect(box.width).toBeCloseTo(DEFAULT_WIDTH_PX, 0)
    expect(box.x + box.width / 2).toBeCloseTo(viewport.width / 2, 0)
    expect(box.y + box.height / 2).toBeCloseTo(viewport.height / 2, 0)
  })

  test('dialog-top sits near the top edge, centered horizontally', async ({ page }) => {
    const dialog = await open(page, 'dialog-top')
    const box = (await dialog.boundingBox())!
    const viewport = page.viewportSize()!

    expect(box.y).toBeGreaterThan(0)
    expect(box.y).toBeLessThanOrEqual(64)
    expect(box.x + box.width / 2).toBeCloseTo(viewport.width / 2, 0)
  })

  test('dialog-bottom sits flush with the bottom edge', async ({ page }) => {
    const dialog = await open(page, 'dialog-bottom')
    const box = (await dialog.boundingBox())!
    const viewport = page.viewportSize()!

    expect(box.y + box.height).toBeCloseTo(viewport.height, 0)
    expect(box.x + box.width / 2).toBeCloseTo(viewport.width / 2, 0)
  })

  test('dialog-bottom tablet:dialog-center is a sheet on phones, centered from tablet', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    let dialog = await open(page, 'dialog-responsive')
    let box = (await dialog.boundingBox())!
    expect(box.y + box.height).toBeCloseTo(667, 0)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    await page.setViewportSize({ width: 1280, height: 720 })
    dialog = await open(page, 'dialog-responsive')
    box = (await dialog.boundingBox())!
    expect(box.y + box.height / 2).toBeCloseTo(360, 0)
  })

  test('never overflows a narrow screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const dialog = await open(page, 'dialog-basic')
    const box = (await dialog.boundingBox())!

    expect(box.x).toBeGreaterThan(0)
    expect(box.x + box.width).toBeLessThan(375)
  })

  test('the Tailwind full-screen recipe fills the viewport', async ({ page }) => {
    const dialog = await open(page, 'dialog-fullscreen')
    const box = (await dialog.boundingBox())!
    const viewport = page.viewportSize()!

    expect(box).toEqual({
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    })
  })
})

test.describe('scroll lock', () => {
  test('locks page scrolling while a modal is open, and restores it', async ({ page }) => {
    const before = await rootOverflow(page)
    const dialog = await open(page, 'dialog-basic')

    expect(await rootOverflow(page)).toBe('hidden')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    expect(await rootOverflow(page)).toBe(before)
  })

  test('non-modal dialogs leave the page scrollable', async ({ page }) => {
    const before = await rootOverflow(page)
    await page.locator('button[aria-controls="dialog-non-modal"]').click()
    const dialog = page.locator('#dialog-non-modal')

    await expect(dialog).toBeVisible()
    expect(await isModal(dialog)).toBe(false)
    expect(await rootOverflow(page)).toBe(before)
  })
})

test.describe('animation', () => {
  test('transitions in on open and stays rendered while closing', async ({ page }) => {
    await page.locator('#dialog-basic').waitFor({ state: 'attached' })

    const result = await page.evaluate(() => {
      const el = document.getElementById('dialog-basic') as HTMLDialogElement
      el.showModal()
      const opening = el.getAnimations().length
      el.getAnimations().forEach((animation) => animation.finish())
      el.close()
      return {
        opening,
        closing: el.getAnimations().length,
        displayWhileClosing: getComputedStyle(el).display,
      }
    })

    expect(result.opening).toBeGreaterThan(0)
    expect(result.closing).toBeGreaterThan(0)
    expect(result.displayWhileClosing).not.toBe('none')
  })

  test('does not animate when reduced motion is preferred', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.locator('#dialog-basic').waitFor({ state: 'attached' })

    const animations = await page.evaluate(() => {
      const el = document.getElementById('dialog-basic') as HTMLDialogElement
      el.showModal()
      return el.getAnimations().length
    })

    expect(animations).toBe(0)
  })
})

function trigger(page: Page, id: string) {
  return page.locator(`[commandfor="${id}"][command="show-modal"]`).first()
}

/** Opens a dialog through its show-modal invoker and waits for it to settle. */
async function open(page: Page, id: string) {
  await trigger(page, id).click()
  const dialog = page.locator(`#${id}`)
  await expect(dialog).toBeVisible()
  await dialog.evaluate((el) =>
    Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished))
  )
  return dialog
}

function isModal(dialog: Locator) {
  return dialog.evaluate((el) => el.matches(':modal'))
}

function rootOverflow(page: Page) {
  return page.evaluate(() => getComputedStyle(document.documentElement).overflow)
}

function backdropStyle(dialog: Locator, prop: 'backgroundColor' | 'backdropFilter') {
  return dialog.evaluate((el, p) => getComputedStyle(el, '::backdrop')[p], prop)
}

function alpha(color: string) {
  if (color === 'transparent') return 0
  // Modern syntax: rgb(0 0 0 / 0.5), oklab(0 0 0 / 0.6), ...
  const slash = color.match(/\/\s*([\d.]+%?)\s*\)$/)
  if (slash?.[1]) {
    return slash[1].endsWith('%') ? Number.parseFloat(slash[1]) / 100 : Number(slash[1])
  }
  // Legacy syntax: rgba(0, 0, 0, 0.5)
  const parts = color.match(/rgba?\(([^)]+)\)/)?.[1]?.split(',') ?? []
  return parts.length === 4 ? Number(parts[3]) : 1
}
