import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { PRODUCT_IMAGES, STICKER_SIZE_IMAGES } from '../data/productImages'
import { FaWhatsapp, FaTrashAlt, FaShoppingBag } from 'react-icons/fa'

const WHATSAPP = '2348065275264'

function getItemImage(item) {
  if (item.slug) {
    const imgs = PRODUCT_IMAGES[item.slug]
    if (imgs && imgs.length > 0) return imgs[0]
    if (item.slug === 'die-cut-stickers' || item.slug === 'product-labels') {
      const sizeKey = item.size?.replace(/[×x]/g, 'x')
      const stickerImgs = STICKER_SIZE_IMAGES?.[sizeKey] || STICKER_SIZE_IMAGES?.['3x3"']
      if (stickerImgs) return stickerImgs[0]
    }
  }
  return null
}

function buildWhatsAppMessage(cartItems, total) {
  const lines = cartItems.map(i => `• ${i.name} (${i.size || 'Standard'}) × ${i.quantity.toLocaleString()} pcs — ₦${(i.price * i.quantity).toLocaleString()}`)
  return encodeURIComponent(
    `Hello Sleekblue! I'd like to place an order:\n\n${lines.join('\n')}\n\nTotal: ₦${Math.round(total).toLocaleString()}\n\nPlease confirm availability and payment details. Thank you!`
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const { cartItems, updateQuantity, removeItem, subtotal, discount, discountAmount, total } = useCart()

  if (cartItems.length === 0) return (
    <section className="bg-[#FAF3E8] min-h-[70vh] flex flex-col items-center justify-center gap-6 px-6 py-12 text-center sm:px-8">
      <div className="text-6xl">🛒</div>
      <p className="text-2xl font-bold text-slate-900">Your cart is empty</p>
      <p className="max-w-md text-sm text-slate-500">Browse our products and add items to get started.</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/store')}
          className="rounded-full bg-[#7B2FBE] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#6b23ba]"
        >
          Browse Products
        </button>
        <a
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hello Sleekblue! I need help placing an order.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebf5a]"
        >
          <FaWhatsapp /> Order via WhatsApp
        </a>
      </div>
    </section>
  )

  const waMsg = buildWhatsAppMessage(cartItems, total)

  return (
    <section className="bg-[#FAF3E8] min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black text-slate-900">Your Cart</h1>
          <span className="rounded-full bg-[#7B2FBE] px-3 py-1 text-sm font-semibold text-white">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="rounded-[28px] bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold text-slate-900">Order Items</span>
              <button
                type="button"
                onClick={() => navigate('/store')}
                className="rounded-full border border-[#7B2FBE] px-4 py-2 text-sm font-semibold text-[#7B2FBE] transition hover:bg-[#f5f0ff]"
              >
                + Add more
              </button>
            </div>

            <div className="divide-y divide-slate-200">
              {cartItems.map((item, i) => {
                const img = getItemImage(item)
                return (
                  <div key={i} className={`flex flex-col gap-4 p-6 ${i < cartItems.length - 1 ? 'border-b border-slate-200' : ''} sm:flex-row`}>
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-[#f0e8ff] sm:h-24 sm:w-24">
                      {img
                        ? <img src={img} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
                        : <FaShoppingBag size={28} color="#7B2FBE" />
                      }
                    </div>

                    <div className="flex flex-1 flex-col gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        {item.size && <p className="mt-2 text-xs text-slate-500">Size: {item.size}</p>}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="grid h-9 w-9 place-items-center rounded-full border border-[#7B2FBE] bg-white text-[#7B2FBE] text-lg font-bold transition hover:bg-[#f5f0ff]"
                          >
                            −
                          </button>
                          <span className="min-w-[40px] text-center font-semibold">{item.quantity.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="grid h-9 w-9 place-items-center rounded-full bg-[#7B2FBE] text-white transition hover:bg-[#6b23ba]"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-slate-500">pcs</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 text-right sm:items-end">
                      <p className="text-base font-bold text-[#7B2FBE]">₦{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-slate-500">₦{item.price.toLocaleString()} each</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.size)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                      >
                        <FaTrashAlt size={12} /> Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>

              <div className="mt-6 space-y-4 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.reduce((a, i) => a + i.quantity, 0).toLocaleString()} pcs)</span>
                  <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span className="font-semibold">🎉 Bulk Discount ({Math.round(discount * 100)}%)</span>
                    <span className="font-semibold">−₦{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-[#7B2FBE]">₦{Math.round(total).toLocaleString()}</span>
                </div>
              </div>

              {discount === 0 && subtotal < 20000 && (
                <div className="mt-6 rounded-3xl bg-[#f5f0ff] px-4 py-3 text-sm text-[#7B2FBE]">
                  💡 Spend <strong>₦{(20000 - subtotal).toLocaleString()}</strong> more to unlock a 5% bulk discount!
                </div>
              )}

              {discount > 0 && (
                <div className="mt-6 rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  ✅ You saved ₦{discountAmount.toLocaleString()} with bulk pricing!
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="mt-6 w-full rounded-3xl bg-[#7B2FBE] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6b23ba]"
              >
                Proceed to Checkout →
              </button>

              <a
                href={`https://wa.me/${WHATSAPP}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebf5a]"
              >
                <FaWhatsapp size={16} /> Order via WhatsApp
              </a>

              <button
                type="button"
                onClick={() => navigate('/store')}
                className="mt-3 w-full rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ← Continue Shopping
              </button>
            </div>

            <div className="rounded-[28px] bg-white p-6 text-center shadow-sm">
              <p className="text-sm font-bold text-slate-900">Need help with your order?</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Chat us on WhatsApp — we respond fast!</p>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hello Sleekblue! I need help with my order.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebf5a]"
              >
                <FaWhatsapp size={14} /> Chat Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
