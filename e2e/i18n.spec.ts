import { test, expect } from '@playwright/test'

test('redirects "/" to the detected locale and lets the user switch language', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/en\/?$/)
  await expect(page.getByRole('heading', { name: 'front-template-vue' })).toBeVisible()

  await page.getByRole('button', { name: 'PT' }).click()
  await expect(page).toHaveURL(/\/pt\/?$/)
  await expect(page.getByText('Frontend Vue 3 + Vite consumindo a API Laravel.')).toBeVisible()
})

test('keeps the current page when switching locale', async ({ page }) => {
  await page.goto('/en/login')
  await page.getByRole('button', { name: 'PT' }).click()
  await expect(page).toHaveURL(/\/pt\/login$/)
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
})
