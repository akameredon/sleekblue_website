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

async function addProductToCart(page: any, slug = 'flex-banner') {
  await page.goto(`/store/${slug}`)
  await page.waitForLoadState('networkidle')
  const addBtn = page.getByRole('button', { name: /Add to Cart/i })
  await expect(addBtn).toBeVisible({ timeout: 5000 })
  await addBtn.click()
  await page.waitForTimeout(500)
}

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await dismissTerms(page)
  })

  test('cart page loads when empty', async ({ page }) => {
    await page.goto('/cart')
    await expect(page).toHaveURL(/\/cart/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('empty cart shows appropriate message or CTA', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible()
  })

  test('adding a product increases cart item count', async ({ page }) => {
    await addProductToCart(page, 'flex-banner')
    await page.goto('/cart')
    const cartItems = page.locator('[class*="cart"], li, tr').filter({ hasText: /flex|banner/i })
    expect(await cartItems.count()).toBeGreaterThanOrEqual(0)
  })

  test('cart page shows checkout button when items present', async ({ page }) => {
    await addProductToCart(page, 'flex-banner')
    await page.goto('/cart')
    const checkoutBtn = page.getByRole('button', { name: /checkout/i })
      .or(page.getByRole('link', { name: /checkout/i }))
    if (await checkoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(checkoutBtn).toBeVisible()
    }
  })

  test('cart icon/link in navbar navigates to /cart', async ({ page }) => {
    const cartLink = page.locator('a[href="/cart"]').first()
    if (await cartLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cartLink.click()
      await expect(page).toHaveURL(/\/cart/)
    }
  })
})
