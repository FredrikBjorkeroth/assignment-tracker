import { expect, test } from '@playwright/test'

test('adding a link by URL shows it in the table', async ({ page }) => {
  const link = `https://example.com/e2e-test-job-${Date.now()}`

  await page.goto('/')

  const input = page.getByPlaceholder('Paste a link...')
  const addButton = page.getByRole('button', { name: /^Add/ })

  await input.fill(link)
  await addButton.click()

  await expect(input).toHaveValue('')
  await expect(page.getByRole('cell', { name: link })).toBeVisible()
})

test('the Add button stays disabled for blank input', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Add' })).toBeDisabled()
})
