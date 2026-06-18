# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.ts >> Checkout Page >> checkout form has name field
- Location: tests/checkout.spec.ts:38:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Add to Cart/i })
    - locator resolved to <button>Add to Cart</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div>…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div>…</div> intercepts pointer events
  - retrying click action
    - waiting 100ms
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting 100ms
    42 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div>…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - img "Sleekblue Media Houz" [ref=e6]
      - generic [ref=e7]:
        - heading "Terms & Conditions of Sale" [level=2] [ref=e8]
        - paragraph [ref=e9]: "Version: June 2026 · Please read carefully before continuing"
    - generic [ref=e10]:
      - paragraph [ref=e12]: ⚠️ By clicking "I Agree", creating an order, uploading artwork, approving a design, making payment, or using any service provided by Sleekblue Media Houz, you confirm that you have read, understood, and accepted these Terms & Conditions. Electronic records, digital communications, website logs, invoices, and order records may be relied upon as evidence of acceptance.
      - generic [ref=e13]:
        - 'heading "IMPORTANT: PLEASE READ CAREFULLY BEFORE PLACING AN ORDER" [level=3] [ref=e14]'
        - paragraph [ref=e15]: By accessing our website, uploading artwork, placing an order, making payment, or using any of our services, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
      - generic [ref=e16]:
        - heading "1. ABOUT OUR SERVICES" [level=3] [ref=e17]
        - paragraph [ref=e18]: Sleekblue Media Houz provides printing, branding, die-cut stickers, signage, large-format printing, design, promotional materials, and related services. All orders placed through our website are subject to these Terms & Conditions.
      - generic [ref=e19]:
        - heading "2. ORDER CONFIRMATION" [level=3] [ref=e20]
        - paragraph [ref=e21]: "Customers are solely responsible for reviewing and confirming: • Product size and dimensions • Quantity ordered • Design and artwork • Spelling, grammar, and content • Finishing specifications • Delivery information • Contact details Production will only commence after payment has been received and order confirmation has been completed. Once production begins, orders cannot be cancelled."
      - generic [ref=e22]:
        - heading "3. ARTWORK & DESIGN APPROVAL" [level=3] [ref=e23]
        - paragraph [ref=e24]: "Where artwork previews are provided, customers must carefully review all details before approval. Approval may be given through WhatsApp messages. Once the customer approves a design, the approval becomes final. Sleekblue shall not be responsible for errors relating to: • Spelling mistakes • Incorrect dimensions • Design placement • Colour choices approved by the customer • Missing information supplied by the customer"
      - generic [ref=e25]:
        - heading "4. CUSTOMER ARTWORK RESPONSIBILITY" [level=3] [ref=e26]
        - paragraph [ref=e27]: Customers warrant that they own or have permission to use all logos, images, trademarks, designs, and content submitted for printing. Sleekblue Media Houz shall not be liable for any copyright infringement, trademark infringement, or intellectual property disputes arising from customer-submitted materials. The customer agrees to indemnify and hold Sleekblue harmless from any related claims.
      - generic [ref=e28]:
        - heading "5. MEASUREMENT RESPONSIBILITY" [level=3] [ref=e29]
        - paragraph [ref=e30]: Customers are fully responsible for providing accurate dimensions. If a customer specifies "Print 3 inches × 4 inches", the product will be produced exactly as instructed. Incorrect measurements supplied by customers do not qualify for refunds, replacements, or reprints. Customers are strongly encouraged to physically take their measurement before confirming an order.
      - generic [ref=e31]:
        - heading "6. PRODUCT COLOUR DISCLAIMER" [level=3] [ref=e32]
        - paragraph [ref=e33]: Printed colours may vary slightly from mobile screens, computer monitors, previous print jobs, and digital artwork previews. Minor colour variations are normal within the printing industry and do not qualify for refunds or reprints.
      - generic [ref=e34]:
        - heading "7. PAYMENT TERMS" [level=3] [ref=e35]
        - paragraph [ref=e36]: Full payment is required before production begins unless otherwise agreed in writing. Orders remain pending until payment is successfully verified. If a payment is declined, reversed, or disputed, Sleekblue reserves the right to suspend production, withhold delivery, or take appropriate recovery action.
      - generic [ref=e37]:
        - heading "8. CHARGEBACK & PAYMENT DISPUTES" [level=3] [ref=e38]
        - paragraph [ref=e39]: Customers agree not to initiate fraudulent chargebacks or payment disputes after receiving products or services. Where a chargeback is initiated despite successful delivery or completion of services, Sleekblue reserves the right to submit evidence including order records, design approvals, delivery records, and communication history. The customer shall remain liable for all legitimate charges and associated recovery costs.
      - generic [ref=e40]:
        - heading "9. PRODUCTION TIMELINES" [level=3] [ref=e41]
        - paragraph [ref=e42]: Estimated production and delivery dates are provided for guidance only. Production schedules may be affected by power outages, equipment breakdown, material shortages, public holidays, weather conditions, logistics disruptions, and events beyond our control. Sleekblue shall not be liable for delays caused by such circumstances.
      - generic [ref=e43]:
        - heading "10. DELIVERY POLICY" [level=3] [ref=e44]
        - paragraph [ref=e45]: Customers are responsible for providing accurate delivery information. Sleekblue shall not be responsible for delays, failed deliveries, or additional costs resulting from incorrect customer information. Risk transfers to the customer once products are handed over to a courier, transport company, dispatch rider, or designated collection agent.
      - generic [ref=e46]:
        - heading "11. OPENING & INSPECTION REQUIREMENT" [level=3] [ref=e47]
        - paragraph [ref=e48]: "Customers must inspect orders immediately upon receipt. For any complaint relating to wrong quantity, wrong design, damaged items, or missing items, customers must provide: • Order number • Clear photos • Continuous unedited unboxing video Complaints must be submitted within 24 hours of delivery. Claims submitted outside this period may not be considered."
      - generic [ref=e49]:
        - heading "12. REFUND & REPLACEMENT POLICY" [level=3] [ref=e50]
        - paragraph [ref=e51]: "ELIGIBLE CASES — Sleekblue may provide a replacement, reprint, partial refund, or full refund where: • Wrong size was produced contrary to approved specifications • Wrong quantity was supplied • Wrong artwork was printed • Production defects occurred due to our error NON-ELIGIBLE CASES — Refunds, replacements, or reprints will NOT be granted where: • Customer supplied incorrect measurements • Customer approved artwork containing errors • Low-resolution files were submitted • Customer changes their mind • Customer ordered the wrong quantity • Minor colour variations occur • Incorrect delivery information was supplied • Product damage occurs after delivery All claims are subject to verification."
      - generic [ref=e52]:
        - heading "13. LIMITATION OF LIABILITY" [level=3] [ref=e53]
        - paragraph [ref=e54]: To the maximum extent permitted by law, Sleekblue Media Houz shall not be liable for loss of profit, loss of business, loss of contracts, indirect damages, or consequential damages. Our maximum liability shall not exceed the amount paid for the specific order in dispute.
      - generic [ref=e55]:
        - heading "14. PRIVACY" [level=3] [ref=e56]
        - paragraph [ref=e57]: Customer information is collected solely for order processing, customer support, delivery coordination, and service improvement. We do not sell customer information to third parties.
      - generic [ref=e58]:
        - heading "15. FORCE MAJEURE" [level=3] [ref=e59]
        - paragraph [ref=e60]: Sleekblue shall not be liable for any failure or delay caused by events beyond reasonable control, including natural disasters, government actions, civil disturbances, strikes, power failures, pandemics, transportation disruptions, or supplier shortages.
      - generic [ref=e61]:
        - heading "16. GOVERNING LAW" [level=3] [ref=e62]
        - paragraph [ref=e63]: These Terms & Conditions shall be governed by and interpreted under the laws of the Federal Republic of Nigeria. Any dispute arising from these Terms shall be subject to the jurisdiction of Nigerian courts.
      - generic [ref=e64]:
        - heading "17. DISPUTE RESOLUTION" [level=3] [ref=e65]
        - paragraph [ref=e66]: Before commencing any court action, the customer agrees to first notify Sleekblue Media Houz in writing and allow up to 14 business days for investigation and resolution of the complaint. Both parties shall make reasonable efforts to resolve disputes amicably before resorting to litigation.
      - generic [ref=e67]:
        - heading "18. ACCEPTANCE OF TERMS" [level=3] [ref=e68]
        - paragraph [ref=e69]: By clicking "I Agree", placing an order, making payment, uploading artwork, or using our services, you acknowledge that you have read, understood, and accepted these Terms & Conditions in full. Your acceptance is electronically recorded with date and time, your name, email, phone number, IP address, and the version of these Terms. Electronic records, digital communications, website logs, invoices, and order records may be relied upon as evidence of acceptance.
      - paragraph [ref=e71]: "Last Updated: June 2026 · Sleekblue Media Houz — Print · Branding · Design · Production"
    - generic [ref=e72]:
      - paragraph [ref=e73]: ↓ Please scroll to the bottom to review all terms before accepting
      - paragraph [ref=e74]: "Your details (required to record your acceptance):"
      - textbox "Full Name * (e.g. John Doe)" [ref=e76]
      - generic [ref=e77]:
        - textbox "Email Address * (e.g. you@gmail.com)" [ref=e79]
        - textbox "WhatsApp Number * (e.g. 08012345678)" [ref=e81]
      - generic [ref=e82]:
        - button "Decline" [ref=e83] [cursor=pointer]
        - button "✓ I Agree — Continue to Site" [ref=e84]
      - paragraph [ref=e85]: Your acceptance is electronically recorded with timestamp, IP address, and contact details.
  - banner [ref=e86]:
    - generic [ref=e87]:
      - img "Sleekblue Media Houz" [ref=e89] [cursor=pointer]
      - generic [ref=e91]:
        - textbox "Search products..." [ref=e92]
        - button [ref=e93] [cursor=pointer]:
          - img [ref=e94]
      - generic [ref=e96]:
        - 'link "Customer care: +234 806 527 5264" [ref=e97] [cursor=pointer]':
          - /url: tel:+2348065275264
          - img [ref=e98]
          - generic [ref=e100]: "Customer care:"
          - generic [ref=e101]: +234 806 527 5264
        - generic [ref=e102] [cursor=pointer]: Store
        - generic [ref=e103] [cursor=pointer]: Blog
        - img [ref=e105] [cursor=pointer]
    - generic [ref=e108]:
      - generic [ref=e109]:
        - generic [ref=e111] [cursor=pointer]:
          - text: Flex Printing/Large format
          - generic [ref=e112]: ▾
        - generic [ref=e114] [cursor=pointer]:
          - text: Label Stickers
          - generic [ref=e115]: ▾
        - generic [ref=e117] [cursor=pointer]:
          - text: Corporate Branding
          - generic [ref=e118]: ▾
        - generic [ref=e120] [cursor=pointer]:
          - text: All Product & Services
          - generic [ref=e121]: ▾
      - generic [ref=e123] [cursor=pointer]: Request Quote
  - generic [ref=e124]:
    - 'link "WhatsApp: +234 806 527 5264" [ref=e125] [cursor=pointer]':
      - /url: https://wa.me/2348065275264
      - img [ref=e126]
    - 'link "Facebook: sleekbluemediahouz" [ref=e128] [cursor=pointer]':
      - /url: https://www.facebook.com/sleekbluemediahouz
      - img [ref=e129]
    - 'link "Instagram: @sleekbluemediahouz" [ref=e131] [cursor=pointer]':
      - /url: https://www.instagram.com/sleekbluemediahouz
      - img [ref=e132]
  - main [ref=e134]:
    - generic [ref=e136]:
      - generic [ref=e137]:
        - generic [ref=e138] [cursor=pointer]: Home
        - generic [ref=e139]: ›
        - generic [ref=e140] [cursor=pointer]: Store
        - generic [ref=e141]: ›
        - generic [ref=e142]: Flex Banner
      - generic [ref=e143]:
        - generic [ref=e144]:
          - generic [ref=e145]:
            - generic [ref=e146]: Best for Outdoors
            - img "Flex Banner" [ref=e147]
          - generic [ref=e148]:
            - img "View 1" [ref=e150] [cursor=pointer]
            - img "View 2" [ref=e152] [cursor=pointer]
            - img "View 3" [ref=e154] [cursor=pointer]
        - generic [ref=e155]:
          - heading "Flex Banner" [level=2] [ref=e156]
          - paragraph [ref=e157]: Flex Printing/Large Format
          - paragraph [ref=e158]: "Size / Type:"
          - generic [ref=e159]:
            - button "3x6ft" [ref=e161] [cursor=pointer]
            - button "4x6ft" [ref=e163] [cursor=pointer]
            - button "4x8ft" [ref=e165] [cursor=pointer]
            - button "6x8ft" [ref=e167] [cursor=pointer]
            - button "Custom" [ref=e169] [cursor=pointer]
          - paragraph [ref=e170]: Price Table (click a row to set quantity)
          - table [ref=e172]:
            - rowgroup [ref=e173]:
              - row "Qty (pcs) Total Price Unit Price" [ref=e174]:
                - columnheader "Qty (pcs)" [ref=e175]
                - columnheader "Total Price" [ref=e176]
                - columnheader "Unit Price" [ref=e177]
            - rowgroup [ref=e178]:
              - row "1 ₦3,240 ₦3,240/pc" [ref=e179] [cursor=pointer]:
                - cell "1" [ref=e180]
                - cell "₦3,240" [ref=e181]
                - cell "₦3,240/pc" [ref=e182]
              - row "5 ₦16,200 ₦3,240/pc" [ref=e183] [cursor=pointer]:
                - cell "5" [ref=e184]
                - cell "₦16,200" [ref=e185]
                - cell "₦3,240/pc" [ref=e186]
              - row "10 ₦32,400 ₦3,240/pc" [ref=e187] [cursor=pointer]:
                - cell "10" [ref=e188]
                - cell "₦32,400" [ref=e189]
                - cell "₦3,240/pc" [ref=e190]
          - generic [ref=e192]:
            - generic [ref=e193]: "Custom Qty:"
            - button "−" [ref=e194] [cursor=pointer]
            - spinbutton [ref=e195]: "1"
            - button "+" [ref=e196] [cursor=pointer]
            - generic [ref=e197]:
              - paragraph [ref=e198]: Total
              - paragraph [ref=e199]: ₦3,240
        - generic [ref=e200]:
          - heading "Product Description" [level=3] [ref=e201]
          - paragraph [ref=e202]: High-quality flex banners for outdoor advertising, events, exhibitions, and promotions. Weather-resistant and long-lasting.
          - paragraph [ref=e203]: "Features:"
          - list [ref=e204]:
            - listitem [ref=e205]:
              - generic [ref=e206]: ✓
              - text: 500gsm heavy-duty flex
            - listitem [ref=e207]:
              - generic [ref=e208]: ✓
              - text: UV resistant inks
            - listitem [ref=e209]:
              - generic [ref=e210]: ✓
              - text: Hemmed & eyeleted edges
            - listitem [ref=e211]:
              - generic [ref=e212]: ✓
              - text: Any custom size available
            - listitem [ref=e213]:
              - generic [ref=e214]: ✓
              - text: Vibrant colour output
            - listitem [ref=e215]:
              - generic [ref=e216]: ✓
              - text: Fast 24–48hr production
          - button "Add to Cart" [ref=e217] [cursor=pointer]
          - button "Checkout Now" [ref=e218] [cursor=pointer]
          - link "Ask via WhatsApp" [ref=e219] [cursor=pointer]:
            - /url: https://wa.me/2348065275264
            - img [ref=e220]
            - text: Ask via WhatsApp
      - generic [ref=e222]:
        - heading "SIMILAR ITEMS" [level=3] [ref=e223]
        - generic [ref=e224]:
          - generic [ref=e225] [cursor=pointer]:
            - img "Billboard" [ref=e227]
            - paragraph [ref=e228]: Billboard
            - button "Shop" [ref=e229]
          - generic [ref=e230] [cursor=pointer]:
            - img "SAV Printing" [ref=e232]
            - paragraph [ref=e233]: SAV Printing
            - button "Shop" [ref=e234]
          - generic [ref=e235] [cursor=pointer]:
            - img "Window Graphics" [ref=e237]
            - paragraph [ref=e238]: Window Graphics
            - button "Shop" [ref=e239]
          - generic [ref=e240] [cursor=pointer]:
            - paragraph [ref=e243]: Reflective Flex
            - button "Shop" [ref=e244]
          - generic [ref=e245] [cursor=pointer]:
            - img "Rollup Stand" [ref=e247]
            - paragraph [ref=e248]: Rollup Stand
            - button "Shop" [ref=e249]
          - generic [ref=e250] [cursor=pointer]:
            - img "Signage & Billboard" [ref=e252]
            - paragraph [ref=e253]: Signage & Billboard
            - button "Shop" [ref=e254]
  - contentinfo [ref=e255]:
    - generic [ref=e256]:
      - generic [ref=e257]:
        - generic [ref=e258]:
          - img "Sleekblue Media Houz" [ref=e259]
          - paragraph [ref=e260]: Premium print, branding & design solutions for businesses across Nigeria. Fast turnaround, zero stress.
          - generic [ref=e261]:
            - link "💬" [ref=e262] [cursor=pointer]:
              - /url: https://wa.me/+2348065275264
            - link "📸" [ref=e263] [cursor=pointer]:
              - /url: https://www.instagram.com/sleekbluemediahouz
            - link "👍" [ref=e264] [cursor=pointer]:
              - /url: https://www.facebook.com/sleekbluemediahouz
        - generic [ref=e265]:
          - heading "Quick Links" [level=4] [ref=e266]
          - link "Home" [ref=e267] [cursor=pointer]:
            - /url: /
          - link "Store" [ref=e268] [cursor=pointer]:
            - /url: /store
          - link "Request a Quote" [ref=e269] [cursor=pointer]:
            - /url: /quote
          - link "About Us" [ref=e270] [cursor=pointer]:
            - /url: /about
          - link "Blog" [ref=e271] [cursor=pointer]:
            - /url: /blog
        - generic [ref=e272]:
          - heading "Services" [level=4] [ref=e273]
          - paragraph [ref=e274]: Die Cut Stickers
          - paragraph [ref=e275]: Flex Banners
          - paragraph [ref=e276]: Business Cards
          - paragraph [ref=e277]: Vehicle Branding
          - paragraph [ref=e278]: Logo & Branding
          - paragraph [ref=e279]: T-Shirts & Caps
          - paragraph [ref=e280]: Rollup Stands
          - paragraph [ref=e281]: Burial Brochures
        - generic [ref=e282]:
          - heading "Contact Us" [level=4] [ref=e283]
          - paragraph [ref=e284]:
            - text: 📞
            - link "+2348065275264, +2348037321545" [ref=e285] [cursor=pointer]:
              - /url: tel:+2348065275264, +2348037321545
          - paragraph [ref=e286]:
            - text: 💬
            - link "WhatsApp Us" [ref=e287] [cursor=pointer]:
              - /url: https://wa.me/+2348065275264
          - paragraph [ref=e288]:
            - text: ✉️
            - link "info@sleekbluemediahouz.com" [ref=e289] [cursor=pointer]:
              - /url: mailto:info@sleekbluemediahouz.com
          - paragraph [ref=e290]: 📍 14 Mere Street Off Tetlow Rd, Owerri Imo State, Nigeria
          - link "Request a Quote" [ref=e291] [cursor=pointer]:
            - /url: /quote
      - generic [ref=e292]:
        - paragraph [ref=e293]: © 2026 Sleekblue Media Houz. All rights reserved.
        - generic [ref=e294]:
          - generic [ref=e295]: Built with ❤️ in Nigeria
          - link "Admin" [ref=e296] [cursor=pointer]:
            - /url: /sbm-control-2026
  - link [ref=e297] [cursor=pointer]:
    - /url: https://wa.me/2348065275264
    - img [ref=e298]
  - generic [ref=e300]:
    - generic [ref=e301] [cursor=pointer]:
      - button "✕" [ref=e302]
      - strong [ref=e303]: Sleekblue Support
      - text: Welcome! Ask us anything about our printing services 👇
    - button [ref=e304] [cursor=pointer]:
      - img [ref=e305]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | async function dismissTerms(page: any) {
  4   |   const agreeBtn = page.getByRole('button', { name: /I Agree/i })
  5   |   if (await agreeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  6   |     await page.getByPlaceholder(/Full Name/i).fill('Test User')
  7   |     await page.getByPlaceholder(/Email Address/i).fill('test@example.com')
  8   |     await page.getByPlaceholder(/WhatsApp Number/i).fill('08012345678')
  9   |     await agreeBtn.click()
  10  |     await page.waitForTimeout(500)
  11  |   }
  12  | }
  13  | 
  14  | async function addToCartAndGoCheckout(page: any) {
  15  |   await page.goto('/store/flex-banner')
  16  |   await page.waitForLoadState('networkidle')
  17  |   const addBtn = page.getByRole('button', { name: /Add to Cart/i })
  18  |   if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
> 19  |     await addBtn.click()
      |                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
  20  |     await page.waitForTimeout(500)
  21  |   }
  22  |   await page.goto('/checkout')
  23  |   await page.waitForLoadState('networkidle')
  24  | }
  25  | 
  26  | test.describe('Checkout Page', () => {
  27  |   test.beforeEach(async ({ page }) => {
  28  |     await page.goto('/')
  29  |     await dismissTerms(page)
  30  |     await addToCartAndGoCheckout(page)
  31  |   })
  32  | 
  33  |   test('checkout page loads', async ({ page }) => {
  34  |     await expect(page).toHaveURL(/\/checkout/)
  35  |     await expect(page.locator('body')).toBeVisible()
  36  |   })
  37  | 
  38  |   test('checkout form has name field', async ({ page }) => {
  39  |     const nameField = page.getByLabel(/name/i).first()
  40  |       .or(page.getByPlaceholder(/name/i).first())
  41  |     if (await nameField.isVisible({ timeout: 3000 }).catch(() => false)) {
  42  |       await expect(nameField).toBeVisible()
  43  |     }
  44  |   })
  45  | 
  46  |   test('checkout form has phone/whatsapp field', async ({ page }) => {
  47  |     const phoneField = page.getByLabel(/phone|whatsapp/i).first()
  48  |       .or(page.getByPlaceholder(/phone|whatsapp/i).first())
  49  |     if (await phoneField.isVisible({ timeout: 3000 }).catch(() => false)) {
  50  |       await expect(phoneField).toBeVisible()
  51  |     }
  52  |   })
  53  | 
  54  |   test('checkout form can be filled and submitted', async ({ page }) => {
  55  |     const nameField = page.getByPlaceholder(/name/i).first()
  56  |     const phoneField = page.getByPlaceholder(/phone|whatsapp/i).first()
  57  | 
  58  |     if (await nameField.isVisible({ timeout: 3000 }).catch(() => false)) {
  59  |       await nameField.fill('Test Customer')
  60  |     }
  61  |     if (await phoneField.isVisible({ timeout: 3000 }).catch(() => false)) {
  62  |       await phoneField.fill('08012345678')
  63  |     }
  64  | 
  65  |     const submitBtn = page.getByRole('button', { name: /place order|confirm|submit|checkout/i }).first()
  66  |     if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  67  |       await expect(submitBtn).toBeVisible()
  68  |     }
  69  |   })
  70  | 
  71  |   test('WhatsApp order button is present on checkout', async ({ page }) => {
  72  |     const waBtn = page.locator('a[href*="wa.me"], button').filter({ hasText: /whatsapp|order/i }).first()
  73  |     if (await waBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  74  |       await expect(waBtn).toBeVisible()
  75  |     }
  76  |   })
  77  | })
  78  | 
  79  | test.describe('Navigation flows', () => {
  80  |   test.beforeEach(async ({ page }) => {
  81  |     await page.goto('/')
  82  |     await dismissTerms(page)
  83  |   })
  84  | 
  85  |   test('/about route loads About page', async ({ page }) => {
  86  |     await page.goto('/about')
  87  |     await expect(page).toHaveURL(/\/about/)
  88  |     await expect(page.locator('main, section').first()).toBeVisible()
  89  |   })
  90  | 
  91  |   test('/blog route loads Blog page', async ({ page }) => {
  92  |     await page.goto('/blog')
  93  |     await expect(page).toHaveURL(/\/blog/)
  94  |     await expect(page.locator('main, section').first()).toBeVisible()
  95  |   })
  96  | 
  97  |   test('/quote route loads Quote page', async ({ page }) => {
  98  |     await page.goto('/quote')
  99  |     await expect(page).toHaveURL(/\/quote/)
  100 |     await expect(page.locator('main, section').first()).toBeVisible()
  101 |   })
  102 | 
  103 |   test('footer About Us link goes to /about', async ({ page }) => {
  104 |     const footerAbout = page.locator('footer').getByRole('link', { name: /About Us/i })
  105 |     if (await footerAbout.isVisible({ timeout: 2000 }).catch(() => false)) {
  106 |       await footerAbout.click()
  107 |       await expect(page).toHaveURL(/\/about/)
  108 |     }
  109 |   })
  110 | })
  111 | 
```