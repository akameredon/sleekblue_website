import { describe, it } from 'node:test'
import assert from 'node:assert'
import { computePaystackSignature, verifyPaystackSignature, processPaystackWebhookEvent } from '../src/lib/paystack.js'

describe('Paystack integration helpers', () => {
  it('computes and verifies Paystack webhook signatures', () => {
    const secret = 'test_secret'
    const body = JSON.stringify({ event: 'charge.success', data: { reference: 'ABC123', amount: 5000, status: 'success' } })
    const sig = computePaystackSignature(body, secret)

    assert.strictEqual(typeof sig, 'string')
    assert.strictEqual(sig.length, 128)
    assert.strictEqual(verifyPaystackSignature(body, sig, secret), true)
    assert.strictEqual(verifyPaystackSignature(body, sig.slice(0, -1) + '0', secret), false)
  })

  it('marks an order paid when amount matches', () => {
    const orders = [{ ref: 'ORD001', amountKobo: 5000, status: 'pending', paystackData: null }]
    const event = {
      event: 'charge.success',
      data: {
        reference: 'ORD001',
        amount: 5000,
        status: 'success',
        id: 'PAY123',
        channel: 'card',
        currency: 'NGN',
        paid_at: '2026-08-10T12:00:00Z',
      },
    }

    const { orders: updatedOrders, action } = processPaystackWebhookEvent(orders, event)
    assert.strictEqual(action, 'paid')
    assert.strictEqual(updatedOrders[0].status, 'paid')
    assert.strictEqual(updatedOrders[0].paystackData.id, 'PAY123')
    assert.strictEqual(updatedOrders[0].paidAt, '2026-08-10T12:00:00Z')
  })

  it('marks an order amount_mismatch when charged amount differs', () => {
    const orders = [{ ref: 'ORD002', amountKobo: 10000, status: 'pending', paystackData: null }]
    const event = {
      event: 'charge.success',
      data: {
        reference: 'ORD002',
        amount: 5000,
        status: 'success',
      },
    }

    const { orders: updatedOrders, action } = processPaystackWebhookEvent(orders, event)
    assert.strictEqual(action, 'amount_mismatch')
    assert.strictEqual(updatedOrders[0].status, 'amount_mismatch')
    assert.strictEqual(updatedOrders[0].paystackData.amount, 5000)
  })

  it('ignores non-success or duplicate webhook events', () => {
    const orders = [{ ref: 'ORD003', amountKobo: 3000, status: 'pending', paystackData: null }]
    const event = { event: 'charge.failed', data: { reference: 'ORD003', amount: 3000, status: 'failed' } }
    const { orders: updatedOrders, action } = processPaystackWebhookEvent(orders, event)

    assert.strictEqual(action, 'ignored')
    assert.deepStrictEqual(updatedOrders, orders)
  })
})
