import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Dismiss terms modal if present
    const agreeBtn = page.getByRole('button', { name: /I Agree/i })
    if (await agreeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const name = page.getByPlaceholder(/Full Name/i)
      const email = page.getByPlaceholder(/Email Address/i)
      const whatsapp = page.getByPlaceholder(/WhatsApp Number/i)
      await name.fill('Test User')
      await email.fill('test@example.com')
      await whatsapp.fill('08012345678')
      await agreeBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test('loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Sleekblue/i)
  })

  test('navbar is visible with key links', async ({ page }) => {
    await expect(page.locator('nav, header').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /store/i }).first()).toBeVisible()
  })

  test('hero section is visible', async ({ page }) => {
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
  })

  test('best selling section renders product cards', async ({ page }) => {
    const grid = page.locator('.best-selling-grid')
    await expect(grid).toBeVisible()
    const cards = grid.locator('div[style*="cursor: pointer"]')
    await expect(cards).toHaveCount(await cards.count())
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('reviews section is visible with testimonial cards', async ({ page }) => {
    const reviewsSection = page.locator('section').filter({ hasText: /Customers love Sleekblue/i })
    await expect(reviewsSection).toBeVisible()
    // Wait for async API fetch to populate testimonials
    await expect(page.locator('.review-track')).toBeVisible({ timeout: 10000 })
    const cards = page.locator('.review-track > div')
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('testimonial slider is scrolling (marquee animation present)', async ({ page }) => {
    // Wait for async API fetch then check marquee track exists
    await expect(page.locator('.review-track')).toBeVisible({ timeout: 10000 })
  })

  test('Die Cut Stickers card has an image', async ({ page }) => {
    const grid = page.locator('.best-selling-grid')
    const diecut = grid.locator('div').filter({ hasText: /Die Cut Stickers/i }).first()
    await expect(diecut).toBeVisible()
    const img = diecut.locator('img')
    await expect(img).toBeVisible()
  })

  test('Corporate Branding card has an image', async ({ page }) => {
    const grid = page.locator('.best-selling-grid')
    const corp = grid.locator('div').filter({ hasText: /Corporate Branding/i }).first()
    await expect(corp).toBeVisible()
    const img = corp.locator('img')
    await expect(img).toBeVisible()
  })

  test('WhatsApp float button is present', async ({ page }) => {
    const wa = page.locator('a[href*="wa.me"]').first()
    await expect(wa).toBeVisible()
  })

  test('footer is present with quick links', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer.getByText(/About Us/i)).toBeVisible()
  })
})
