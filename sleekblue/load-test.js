import http from 'k6/http'
import { check, sleep } from 'k6'

/**
 * k6 Load Test — QA Gate Stage 4
 * Targets POST /api/cart on the local Express server.
 * Ramps gradually to 100 VUs over ~3 minutes total.
 */

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up to 50 VUs
    { duration: '60s', target: 100 },   // Ramp up to 100 VUs
    { duration: '60s', target: 100 },   // Hold at 100 VUs
    { duration: '30s', target: 0 },     // Ramp down to 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],            // < 1% error rate
    http_req_duration: ['p(95)<800'],           // p95 latency < 800ms
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001'

// Product slugs to simulate realistic cart additions
const PRODUCTS = [
  { productId: 'flex-banner', size: '3x6ft', quantity: 1 },
  { productId: 'die-cut-stickers', size: '3x3"', quantity: 10 },
  { productId: 'product-labels', size: '2x2"', quantity: 50 },
  { productId: 'rollup-banner', size: '3x6ft', quantity: 1 },
  { productId: 'a-frame-banner', size: '2x3ft', quantity: 2 },
]

export default function () {
  // Pick a random product for each iteration
  const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]

  // POST: Add item to cart
  const addRes = http.post(
    `${BASE_URL}/api/cart`,
    JSON.stringify({
      productId: product.productId,
      quantity: product.quantity,
      size: product.size,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Cart-Token': `k6-vu-${__VU}-${__ITER}`,
      },
    }
  )

  check(addRes, {
    'POST /api/cart returns 200': (r) => r.status === 200,
    'POST /api/cart has cart items': (r) => {
      try {
        const body = JSON.parse(r.body)
        return body.items && body.items.length > 0
      } catch {
        return false
      }
    },
  })

  sleep(0.3) // Brief pause between requests

  // GET: Retrieve cart
  const getRes = http.get(`${BASE_URL}/api/cart`, {
    headers: {
      'X-Cart-Token': `k6-vu-${__VU}-${__ITER}`,
    },
  })

  check(getRes, {
    'GET /api/cart returns 200': (r) => r.status === 200,
    'GET /api/cart returns JSON': (r) => {
      try {
        JSON.parse(r.body)
        return true
      } catch {
        return false
      }
    },
  })

  sleep(0.5) // Simulate user think time
}
