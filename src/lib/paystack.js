import crypto from 'crypto'

export function computePaystackSignature(rawBody, secret) {
  return crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
}

export function verifyPaystackSignature(rawBody, signature, secret) {
  if (!signature || !secret || !rawBody) return false
  const expected = computePaystackSignature(rawBody, secret)
  const sigBuf = Buffer.from(signature, 'hex')
  const expBuf = Buffer.from(expected, 'hex')
  if (sigBuf.length !== expBuf.length) return false
  return crypto.timingSafeEqual(sigBuf, expBuf)
}

export function processPaystackWebhookEvent(orders, event) {
  if (!event || event.event !== 'charge.success' || event.data?.status !== 'success') {
    return { orders, action: 'ignored' }
  }

  const ref = event.data?.reference
  if (!ref) return { orders, action: 'ignored' }

  const orderIndex = orders.findIndex(o => o.ref === ref)
  if (orderIndex < 0 || orders[orderIndex].status === 'paid') {
    return { orders, action: 'ignored' }
  }

  const chargedKobo = event.data?.amount
  const updatedOrders = [...orders]
  const order = { ...updatedOrders[orderIndex] }

  if (chargedKobo !== order.amountKobo) {
    updatedOrders[orderIndex] = {
      ...order,
      status: 'amount_mismatch',
      paystackData: event.data,
    }
    return { orders: updatedOrders, action: 'amount_mismatch' }
  }

  updatedOrders[orderIndex] = {
    ...order,
    status: 'paid',
    paidAt: event.data?.paid_at,
    paystackData: {
      id: event.data?.id,
      channel: event.data?.channel,
      currency: event.data?.currency,
      paidAt: event.data?.paid_at,
    },
  }

  return { orders: updatedOrders, action: 'paid' }
}
