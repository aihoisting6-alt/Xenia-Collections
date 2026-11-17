import products from './data/products.json'

export const PHONE = '919989862878'
export const PHONE_DISPLAY = '99898 62878'
export const INSTAGRAM = 'https://www.instagram.com/xeniacollections2023/'
export const FACEBOOK = 'https://www.facebook.com/Return.Gifts.Hyderabad'
export const ADDRESS = 'Hyderabad, Telangana, India'
export const MAPS = 'https://www.google.com/maps/search/?api=1&query=Xenia+Collections+Return+Gifts+%26+Corporate+Gifting+Hyderabad'
export const MAP_EMBED = 'https://www.google.com/maps?q=Hyderabad,+Telangana&z=11&output=embed'

export const asset = (p) => import.meta.env.BASE_URL + p
export const inr = (n) => '₹' + n.toLocaleString('en-IN')

export const ALL = products
export const BY_ID = new Map(ALL.map((p) => [p.id, p]))

/* ---- Inverted index (Map<token, Set<id>>) for instant prefix search ---- */
const tok = (s) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
const INDEX = new Map()
for (const p of ALL) {
  for (const t of tok(`${p.name} ${p.cat} ${p.sub || ''} ${p.tag || ''} ${p.id}`)) {
    for (let i = 1; i <= t.length; i++) {
      const k = t.slice(0, i)
      if (!INDEX.has(k)) INDEX.set(k, new Set())
      INDEX.get(k).add(p.id)
    }
  }
}
export function search(q) {
  const terms = tok(q)
  if (!terms.length) return null
  let acc = null
  for (const t of terms) {
    const s = INDEX.get(t) || new Set()
    acc = acc ? new Set([...acc].filter((x) => s.has(x))) : new Set(s)
  }
  return acc
}

/* ---- Enquiry cart (Map<id, qty>) persisted to localStorage ---- */
export function loadCart() {
  try { return new Map(JSON.parse(localStorage.getItem('xenia-cart') || '[]')) } catch { return new Map() }
}
export function saveCart(m) {
  try { localStorage.setItem('xenia-cart', JSON.stringify([...m])) } catch {}
}
export function cartMessage(cart, who) {
  const lines = ['*New enquiry – Xenia Collections website*', '']
  let total = 0, priced = true
  let n = 1
  for (const [id, q] of cart) {
    const p = BY_ID.get(id); if (!p) continue
    lines.push(`${n++}. ${p.name} (${p.id}) × ${q}` + (p.price ? ` — ${inr(p.price)} each` : ' — quote needed'))
    if (p.price) total += p.price * q; else priced = false
  }
  lines.push('')
  if (total) lines.push(`Indicative total${priced ? '' : ' (priced items only)'}: ${inr(total)}`)
  if (who.name) lines.push(`Name: ${who.name}`)
  if (who.event) lines.push(`Occasion / Company: ${who.event}`)
  if (who.date) lines.push(`Needed by: ${who.date}`)
  if (who.logo) lines.push('Logo / personalisation: Yes, please')
  if (who.note) lines.push(`Note: ${who.note}`)
  return lines.join('\n')
}
export const waLink = (text) => `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`
