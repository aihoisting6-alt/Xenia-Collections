import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALL, BY_ID, asset, inr, waLink } from './lib.js'
import { WAIcon, Reveal, scrollToId, flyToCart } from './shared.jsx'

/* ───────────── Signature picks: 3D coverflow ───────────── */
const FEATURED = ['S14-3', 'SH-14', 'S22-2', 'XG-GS-676', 'S9-1', 'GS4-001', 'S16-3', 'SH-12', 'S23-1', 'XG-NB07', 'S19-3', 'XG-GS-678', 'S4-4', 'GS3-005', 'S15-1', 'SH-1']
export function Featured({ open, add }) {
  const items = useMemo(() => FEATURED.map((id) => BY_ID.get(id)).filter(Boolean), [])
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = items.length
  const secRef = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => { const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting)); io.observe(secRef.current); return () => io.disconnect() }, [])
  useEffect(() => { if (paused || !inView) return; const t = setInterval(() => setI((x) => (x + 1) % n), 3200); return () => clearInterval(t) }, [paused, n, inView])
  const go = (d) => setI((x) => (x + d + n) % n)
  const start = useRef(null)
  const cur = items[i]
  return (
    <section className="featured" ref={secRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="sec-head center"><p className="eyebrow"><i /> Signature picks</p><h2>Our most-loved <em>gifts</em></h2></div>
      <div className="cf" onPointerDown={(e) => (start.current = e.clientX)} onPointerUp={(e) => { if (start.current == null) return; const dx = e.clientX - start.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); start.current = null }} data-cursor="Drag">
        {items.map((p, k) => {
          let o = k - i; if (o > n / 2) o -= n; if (o < -n / 2) o += n
          const a = Math.abs(o)
          return (
            <motion.button key={p.id} className="cf-item" onClick={() => (o === 0 ? open(p) : setI(k))}
              style={{ visibility: a > 3 ? 'hidden' : 'visible' }}
              animate={{ x: `calc(-50% + ${o * 62}%)`, rotateY: o * -32, scale: 1 - Math.min(a, 3) * 0.13, zIndex: 20 - a, opacity: a > 3 ? 0 : 1 - a * 0.22 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }} aria-label={p.name}>
              <img src={asset(p.img)} alt={p.name} loading="lazy" decoding="async" draggable={false} />
              {a === 0 && <span className="cf-shine" />}
            </motion.button>
          )
        })}
      </div>
      <div className="cf-info">
        <button className="cf-arrow" onClick={() => go(-1)} aria-label="Previous">←</button>
        <AnimatePresence mode="wait">
          <motion.div key={cur.id} className="cf-txt" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35 }}>
            <small>{cur.cat}</small><b>{cur.name}</b>
            <span>{cur.price ? inr(cur.price) : 'Price on request'}</span>
          </motion.div>
        </AnimatePresence>
        <button className="cf-arrow" onClick={() => go(1)} aria-label="Next">→</button>
      </div>
      <div className="cf-cta">
        <button className="btn gold" onClick={(e) => { add(cur.id, 1); flyToCart(e.currentTarget.closest('.featured').querySelectorAll('.cf-item')[i]?.querySelector('img')) }}>+ Add to enquiry</button>
        <button className="btn ghost" onClick={() => open(cur)}>View details</button>
      </div>
      <div className="cf-dots">{items.map((p, k) => <button key={p.id} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Show ${p.name}`} />)}</div>
    </section>
  )
}

/* ───────────── Every product, in auto-gliding rails ───────────── */
const RAILS = [
  ['German Silver', 'German silver'], ['Diaries', 'Notebook diaries'], ['Bottles', 'Water bottles'], ['2-in-1 Sets', '2-in-1 gift sets'],
  ['3-in-1 Sets', '3-in-1 gift sets'], ['4-in-1 Sets', '4-in-1 gift sets'], ['Hip Flask Sets', 'Hip flask sets'], ['Painted Trays', 'Hand-painted trays & showroom'],
]
function Rail({ cat, title, open, add, cart, pick, rev }) {
  const ref = useRef(null)
  const items = useMemo(() => ALL.filter((p) => p.cat === cat || (cat === 'Painted Trays' && p.tag === 'Showroom')), [cat])
  const nudge = (d) => ref.current.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <div className="rail">
      <div className="rail-h">
        <h3>{title} <sup>{items.length}</sup></h3>
        <div><button onClick={() => nudge(-1)} aria-label="Scroll left">←</button><button onClick={() => nudge(1)} aria-label="Scroll right">→</button><button className="rail-all" onClick={() => pick(cat)}>See all →</button></div>
      </div>
      <div className="rail-track" ref={ref} data-lenis-prevent>
        {items.map((p) => (
          <div className="rc" key={p.id}>
            <button className="rc-img" onClick={() => open(p)} data-cursor="View"><img src={asset(p.img)} alt={p.name} loading="lazy" decoding="async" /></button>
            <div className="rc-b"><span>{p.name.replace(/ · .*/, '')}</span><small>{p.name.includes('·') ? p.name.split('· ')[1] : p.price ? inr(p.price) : ''}</small></div>
            <button className={`rc-add ${cart.get(p.id) ? 'in' : ''}`} onClick={(e) => { add(p.id, 1); flyToCart(e.currentTarget.parentElement.querySelector('img')) }} aria-label={`Add ${p.name}`}>{cart.get(p.id) ? cart.get(p.id) : '+'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
export function Rails(props) {
  return (
    <section className="rails" id="explore">
      <div className="sec-head"><p className="eyebrow"><i /> Explore everything</p><h2>All <em>{ALL.length}</em> designs, at a glance</h2>
        <p className="sub">Every product from our catalogues — swipe a row, tap to zoom, + to add it to your enquiry.</p></div>
      {RAILS.map(([c, t], k) => <Rail key={c} cat={c} title={t} rev={k % 2 === 1} {...props} />)}
    </section>
  )
}

/* ───────────── Gift finder (3 taps) ───────────── */
const OCC = [
  ['Corporate / office', ['4-in-1 Sets', '3-in-1 Sets', '2-in-1 Sets', 'Diaries', 'Bottles', 'Hip Flask Sets']],
  ['Return gifts', ['German Silver', 'Painted Trays']],
  ['Wedding / engagement', ['German Silver']],
  ['Pooja & festivals', ['German Silver']],
  ['Employee welcome kit', ['3-in-1 Sets', 'Bottles', 'Diaries']],
]
const BUD = [['Under ₹750', 0, 750], ['₹750 – ₹1,500', 750, 1500], ['₹1,500+', 1500, 1e9], ['Not sure yet', 0, 1e9]]
export function GiftFinder({ open, add, pick, cart }) {
  const [occ, setOcc] = useState(null)
  const [bud, setBud] = useState(null)
  const res = useMemo(() => {
    if (occ == null || bud == null) return []
    const [, cats] = OCC[occ], [, lo, hi] = BUD[bud]
    let l = ALL.filter((p) => cats.includes(p.cat))
    if (occ === 3) l = l.filter((p) => p.sub === 'Pooja & Decor')
    if (occ === 2) l = l.filter((p) => ['Pooja & Decor', 'Gift Sets', 'Trays & Platters'].includes(p.sub))
    const priced = l.filter((p) => p.price && p.price >= lo && p.price <= hi)
    const out = bud === 3 || !priced.length ? l : [...priced, ...l.filter((p) => !p.price)]
    const step = Math.max(1, Math.floor(out.length / 8))
    return out.filter((_, k) => k % step === 0).slice(0, 8)
  }, [occ, bud])
  return (
    <section className="finder" id="finder">
      <div className="finder-in">
        <div className="sec-head center"><p className="eyebrow"><i /> Not sure what to pick?</p><h2>Find the right gift in <em>two taps</em></h2></div>
        <div className="fd-q"><b>1 · What’s the occasion?</b><div>{OCC.map(([l], k) => <button key={l} className={occ === k ? 'on' : ''} onClick={() => setOcc(k)}>{l}</button>)}</div></div>
        <AnimatePresence>{occ != null && (
          <motion.div className="fd-q" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <b>2 · Budget per gift?</b><div>{BUD.map(([l], k) => <button key={l} className={bud === k ? 'on' : ''} onClick={() => setBud(k)}>{l}</button>)}</div>
          </motion.div>
        )}</AnimatePresence>
        <AnimatePresence mode="wait">{res.length > 0 && (
          <motion.div key={`${occ}-${bud}`} className="fd-res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="fd-grid">
              {res.map((p, k) => (
                <motion.div key={p.id} className="fd-card" initial={{ opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: k * 0.06, type: 'spring', stiffness: 160, damping: 18 }}>
                  <button onClick={() => open(p)} data-cursor="View"><img src={asset(p.img)} alt={p.name} loading="lazy" /></button>
                  <span>{p.name}</span><small>{p.price ? inr(p.price) : 'Price on request'}</small>
                  <button className="rc-add in-card" onClick={(e) => { add(p.id, 1); flyToCart(e.currentTarget.parentElement.querySelector('img')) }}>{cart.get(p.id) ? `In list (${cart.get(p.id)})` : '+ Enquire'}</button>
                </motion.div>
              ))}
            </div>
            <div className="fd-more"><button className="btn ghost" onClick={() => pick(OCC[occ][1][0])}>See more like this →</button>
              <a className="btn wa" href={waLink(`Hi Xenia Collections! I'm looking for *${OCC[occ][0]}* gifts, budget *${BUD[bud][0]}*. Please suggest options.`)} target="_blank" rel="noreferrer"><WAIcon size={18} /> Ask us to suggest</a></div>
          </motion.div>
        )}</AnimatePresence>
      </div>
    </section>
  )
}

/* ───────────── Custom cursor (desktop only) ───────────── */
export function Cursor() {
  const dot = useRef(null), ring = useRef(null)
  const [label, setLabel] = useState('')
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf
    let last = null, lastLab = ''
    const move = (e) => {
      x = e.clientX; y = e.clientY
      if (e.target === last) return
      last = e.target
      const t = e.target.closest?.('[data-cursor], a, button, input, select, textarea, label')
      const lab = t?.dataset?.cursor || ''
      if (lab !== lastLab) { lastLab = lab; setLabel(lab) }
      ring.current?.classList.toggle('hot', !!t)
    }
    const tick = () => {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`
      raf = requestAnimationFrame(tick)
    }
    addEventListener('pointermove', move, { passive: true }); raf = requestAnimationFrame(tick)
    return () => { removeEventListener('pointermove', move); cancelAnimationFrame(raf); document.documentElement.classList.remove('has-cursor') }
  }, [])
  return (<><div className="cur-dot" ref={dot} /><div className={`cur-ring ${label ? 'lab' : ''}`} ref={ring}><span>{label}</span></div></>)
}

/* ───────────── Toasts ───────────── */
export function Toaster() {
  const [list, setList] = useState([])
  useEffect(() => {
    const on = (e) => { const t = e.detail; setList((l) => [...l.slice(-2), t]); setTimeout(() => setList((l) => l.filter((x) => x.id !== t.id)), 3600) }
    addEventListener('xenia-toast', on); return () => removeEventListener('xenia-toast', on)
  }, [])
  return (
    <div className="toasts" aria-live="polite">
      <AnimatePresence>{list.map((t) => (
        <motion.div key={t.id} className="toast" layout initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 60 }}>
          <span>{t.msg}</span>{t.action && <button onClick={t.action.fn}>{t.action.label}</button>}
        </motion.div>
      ))}</AnimatePresence>
    </div>
  )
}

/* ───────────── Mobile bottom bar + desktop side tab ───────────── */
export function MobileBar({ count, openCart }) {
  return (
    <nav className="mbar" aria-label="Quick actions">
      <button onClick={() => scrollToId('#shop')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>Shop</button>
      <button className="mb-up" onClick={() => scrollToId('#studio')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>Upload logo</button>
      <button className="mb-enq" onClick={openCart}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>Enquiry{count > 0 && <b>{count}</b>}</button>
      <a className="mb-wa" href={waLink('Hi Xenia Collections! I have an enquiry.')} target="_blank" rel="noreferrer"><WAIcon size={20} />WhatsApp</a>
    </nav>
  )
}
export function SideTab() {
  return <button className="side-tab" onClick={() => scrollToId('#studio')}><span>✦ Upload your logo</span></button>
}
