import { expect, test } from '@playwright/test'

test('status filter hides closed statuses by default and persists changes', async ({
  page,
  request,
}) => {
  const suffix = Date.now()
  const rejectedLink = `https://example.com/e2e-filter-rejected-${suffix}`
  const consideringLink = `https://example.com/e2e-filter-considering-${suffix}`

  // Seeded last, so both land on the first page (the table sorts newest first).
  for (const [link, status] of [
    [rejectedLink, 'REJECTED'],
    [consideringLink, 'CONSIDERING'],
  ]) {
    const res = await request.post('/api/assignments', {
      data: { link, status },
    })
    expect(res.ok()).toBeTruthy()
  }

  await page.goto('/')

  const rejectedCheckbox = page.getByRole('checkbox', { name: 'Rejected' })
  const rejectedRow = page.getByRole('cell', { name: rejectedLink })
  const consideringRow = page.getByRole('cell', { name: consideringLink })
  const hiddenCount = page.getByText(/^\d+ hidden$/)

  // Dropped, Rejected and Declined are hidden by default.
  for (const name of ['Considering', 'Applied', 'Accepted']) {
    await expect(page.getByRole('checkbox', { name })).toBeChecked()
  }
  for (const name of ['Dropped', 'Rejected', 'Declined']) {
    await expect(page.getByRole('checkbox', { name })).not.toBeChecked()
  }
  await expect(rejectedRow).toBeHidden()
  await expect(consideringRow).toBeVisible()
  await expect(hiddenCount).toBeVisible()

  await rejectedCheckbox.check()
  await expect(rejectedRow).toBeVisible()
  await expect(consideringRow).toBeVisible()

  await page.reload()
  await expect(rejectedCheckbox).toBeChecked()
  await expect(rejectedRow).toBeVisible()

  await rejectedCheckbox.uncheck()
  await expect(rejectedRow).toBeHidden()
  await expect(consideringRow).toBeVisible()
})
