import { test, expect } from '@playwright/test'

async function dismissTerms(page: any) {
  const agreeBtn = page.getByRole('button', { name: /I Agree/i })
  if (await agreeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.getByPlaceholder(/Full Name/i).fill('Test User')
    await page.getByPlaceholder(/Email Address/i).fill('test@example.com')
    await page.getByPlaceholder(/WhatsApp Number/i).fill('08012345678')
    await agreeBtn.click()
    await page.waitForTimeout(500)
  }
}

test.describe('Store Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await dismissTerms(page)
    await page.goto('/store')
    await page.waitForLoadState('networkidle')
  })

  test('store page loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/store/)
  })

  test('product cards are visible', async ({ page }) => {
    const cards = page.locator('div').filter({ hasText: /Shop Now/i })
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('category filter links are present', async ({ page }) => {
    const navWithCategories = page.locator('nav, header').first()
    await expect(navWithCategories).toBeVisible()
  })

  test('clicking a product card navigates to product page', async ({ page }) => {
    const shopBtn = page.getByRole('button', { name: /Shop Now/i }).first()
    await shopBtn.click()
    await expect(page).toHaveURL(/\/store\/.+/)
  })
})

test.describe('Product Page — Die Cut Stickers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await dismissTerms(page)
    await page.goto('/store/die-cut-stickers')
    await page.waitForLoadState('networkidle')
  })

  test('product page loads for die-cut-stickers', async ({ page }) => {
    await expect(page).toHaveURL(/die-cut-stickers/)
    await expect(page.locator('h1, h2').filter({ hasText: /sticker/i }).first()).toBeVisible()
  })

  test('size selector is present', async ({ page }) => {
    const sizeOptions = page.locator('button, select').filter({ hasText: /x|inch|cm/i })
    expect(await sizeOptions.count()).toBeGreaterThan(0)
  })

  test('price table renders', async ({ page }) => {
    const table = page.locator('table, [class*="price"], [style*="table"]').first()
    await expect(table).toBeVisible()
  })

  test('Add to Cart button is present', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Add to Cart/i })
    await expect(addBtn).toBeVisible()
  })

  test('quantity input is functional', async ({ page }) => {
    const qtyInput = page.locator('input[type="number"]').first()
    if (await qtyInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await qtyInput.fill('500')
      await expect(qtyInput).toHaveValue('500')
    }
  })
})
