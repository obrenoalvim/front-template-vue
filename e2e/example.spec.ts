import { test, expect } from '@playwright/test'

test('example form validates and submits', async ({ page }) => {
  await page.goto('/en')

  await page.getByRole('button', { name: 'Subscribe' }).click()
  await expect(page.getByText('This field is required.')).toBeVisible()

  await page.getByPlaceholder('you@example.com').fill('not-an-email')
  await page.getByRole('button', { name: 'Subscribe' }).click()
  await expect(page.getByText('Enter a valid email address.')).toBeVisible()

  await page.getByPlaceholder('you@example.com').fill('user@example.com')
  await page.getByRole('button', { name: 'Subscribe' }).click()
  await expect(page.getByText('Thanks, check your inbox.')).toBeVisible()
})
