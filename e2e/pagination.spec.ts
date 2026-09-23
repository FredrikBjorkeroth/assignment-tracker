import { expect, test } from '@playwright/test'

test('pagination controls work when there is more than one page', async ({
  page,
  request,
}) => {
  // Seed enough assignments (page size is 20) to guarantee at least 2 pages,
  // regardless of how many already exist from earlier tests in this run.
  for (let i = 0; i < 25; i++) {
    const res = await request.post('/api/assignments', {
      data: { link: `https://example.com/e2e-pagination-${Date.now()}-${i}` },
    })
    expect(res.ok()).toBeTruthy()
  }

  await page.goto('/')

  const prevButton = page.getByRole('button', { name: 'Prev' })
  const nextButton = page.getByRole('button', { name: 'Next' })
  const pageLabel = page.getByText(/^Page \d+ of \d+$/)

  await expect(prevButton).toBeDisabled()
  await expect(nextButton).toBeEnabled()

  const initialLabel = await pageLabel.textContent()
  const totalPages = Number(initialLabel?.match(/of (\d+)/)?.[1])
  expect(totalPages).toBeGreaterThanOrEqual(2)

  await nextButton.click()
  await expect(pageLabel).toHaveText(`Page 2 of ${totalPages}`)
  await expect(prevButton).toBeEnabled()

  for (let p = 3; p <= totalPages; p++) {
    await nextButton.click()
    await expect(pageLabel).toHaveText(`Page ${p} of ${totalPages}`)
  }

  await expect(nextButton).toBeDisabled()
})
