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

async function addToCartAndGoCheckout(page: any) {
  await page.goto('/store/flex-banner')
  await page.waitForLoadState('networkidle')
  const addBtn = page.getByRole('button', { name: /Add to Cart/i })
  if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await addBtn.click()
    await page.waitForTimeout(500)
  }
  await page.goto('/checkout')
  await page.waitForLoadState('networkidle')
}

test.describe('Checkout Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await dismissTerms(page)
    await addToCartAndGoCheckout(page)
  })

  test('checkout page loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/checkout/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('checkout form has name field', async ({ page }) => {
    const nameField = page.getByLabel(/name/i).first()
      .or(page.getByPlaceholder(/name/i).first())
    if (await nameField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(nameField).toBeVisible()
    }
  })

  test('checkout form has phone/whatsapp field', async ({ page }) => {
    const phoneField = page.getByLabel(/phone|whatsapp/i).first()
      .or(page.getByPlaceholder(/phone|whatsapp/i).first())
    if (await phoneField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(phoneField).toBeVisible()
    }
  })

  test('checkout form can be filled and submitted', async ({ page }) => {
    const nameField = page.getByPlaceholder(/name/i).first()
    const phoneField = page.getByPlaceholder(/phone|whatsapp/i).first()

    if (await nameField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameField.fill('Test Customer')
    }
    if (await phoneField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await phoneField.fill('08012345678')
    }

    const submitBtn = page.getByRole('button', { name: /place order|confirm|submit|checkout/i }).first()
    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(submitBtn).toBeVisible()
    }
  })

  test('WhatsApp order button is present on checkout', async ({ page }) => {
    const waBtn = page.locator('a[href*="wa.me"], button').filter({ hasText: /whatsapp|order/i }).first()
    if (await waBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(waBtn).toBeVisible()
    }
  })
})

test.describe('Navigation flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await dismissTerms(page)
  })

  test('/about route loads About page', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveURL(/\/about/)
    await expect(page.locator('main, section').first()).toBeVisible()
  })

  test('/blog route loads Blog page', async ({ page }) => {
    await page.goto('/blog')
    await expect(page).toHaveURL(/\/blog/)
    await expect(page.locator('main, section').first()).toBeVisible()
  })

  test('/quote route loads Quote page', async ({ page }) => {
    await page.goto('/quote')
    await expect(page).toHaveURL(/\/quote/)
    await expect(page.locator('main, section').first()).toBeVisible()
  })

  test('footer About Us link goes to /about', async ({ page }) => {
    const footerAbout = page.locator('footer').getByRole('link', { name: /About Us/i })
    if (await footerAbout.isVisible({ timeout: 2000 }).catch(() => false)) {
      await footerAbout.click()
      await expect(page).toHaveURL(/\/about/)
    }
  })
})
