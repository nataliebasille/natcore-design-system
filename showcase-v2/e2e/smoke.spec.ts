import { expect, test } from '@playwright/test'

test('showcase home page renders', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBe(true)
  await expect(page).toHaveTitle(/natcore/i)
})
