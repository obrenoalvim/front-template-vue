import { test, expect } from '@playwright/test'

test('blocks access to /account when not authenticated', async ({ page }) => {
  await page.goto('/en/account')
  await expect(page).toHaveURL(/\/en\/login$/)
})

test('registers, is redirected to the account page, then logs out', async ({ page }) => {
  // Hits the real Laravel API (see back-template-laravel) — skipped in CI unless a
  // backend service is wired up and E2E_API_URL points to it.
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(!!process.env.CI && !process.env.E2E_API_URL, 'requires a live Laravel API')

  const email = `e2e-${Date.now()}@example.com`

  await page.goto('/en/register')
  await page.getByLabel('Name').fill('E2E User')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByLabel('Confirm password').fill('password123')
  await page.getByRole('button', { name: 'Sign up' }).click()

  await expect(page).toHaveURL(/\/en\/account$/)
  await expect(page.getByText(email)).toBeVisible()

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/en\/?$/)
})
