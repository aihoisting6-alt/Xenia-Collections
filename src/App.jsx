import React from 'react'
import { useEffect, useMemo, useRef, useState, useCallback, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap, ScrollTrigger, lenis } from './gsap-lenis-setup.js'
import {
  ALL, BY_ID, asset, inr, search, loadCart, saveCart, cartMessage, waLink,
  PHONE, PHONE_DISPLAY, INSTAGRAM, FACEBOOK, MAPS, MAP_EMBED, ADDRESS,
} from './lib.js'

let lenisRef = lenis
const scrollToId = (id) => {
  const el = document.querySelector(id)
  if (!el) return
  lenisRef ? lenisRef.scrollTo(el, { offset: -70, duration: 1.4 }) : el.scrollIntoView({ behavior: 'smooth' })
}

const BRAND = ['#3a86d4', '#cf1f78', '#f7b520', '#b9d531']
function Logo({ className = '' }) {
  return (
    <svg className={`logo-mark ${className}`} viewBox="0 0 64 64" aria-hidden>
      <path fill={BRAND[3]} d="M10 17C16 6 26 6 31 15 22 19 15 20 10 17Z" />
      <path fill={BRAND[1]} d="M54 17C48 6 38 6 33 15 42 19 49 20 54 17Z" />
      <path fill={BRAND[0]} d="M5 20C20 14 31 24 29 40 14 37 5 31 5 20Z" />
      <path fill={BRAND[1]} d="M59 20C44 14 33 24 35 40 50 37 59 31 59 20Z" />
      <path fill={BRAND[2]} d="M11 41C22 38 29 46 31 61 17 59 9 51 11 41Z" />
      <path fill={BRAND[3]} d="M53 41C42 38 35 46 33 61 47 59 55 51 53 41Z" />
    </svg>
  )
}
function ScrollBar() {
  const ref = useRef(null)
  useEffect(() => {
    const f = () => { const h = document.documentElement.scrollHeight - innerHeight; ref.current && (ref.current.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`) }
    addEventListener('scroll', f, { passive: true }); f(); return () => removeEventListener('scroll', f)
  }, [])
  return <div className="scroll-bar" ref={ref} />
}

/* ───────────── Preloader ───────────── */
function Preloader({ done }) {
  const ref = useRef(null)
  const num = useRef(null)
  useEffect(() => {
    const o = { v: 0 }
    const tl = gsap.timeline({ onComplete: done })
    tl.fromTo('.pl-mark', { opacity: 0, y: 30, letterSpacing: '0.6em' }, { opacity: 1, y: 0, letterSpacing: '0.28em', duration: 1.1, ease: 'power3.out' })
      .to(o, { v: 100, duration: 1.2, ease: 'power2.inOut', onUpdate: () => num.current && (num.current.textContent = String(Math.round(o.v)).padStart(2, '0')) }, 0.2)
      .to('.pl-line', { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 0.2)
      .to(ref.current, { yPercent: -100, duration: 0.9, ease: 'power4.inOut', delay: 0.2 })
    return () => tl.kill()
  }, [])
  return (
    <div className="preloader" ref={ref}>
      <div className="pl-inner">
        <div className="pl-mark"><Logo />ENIA</div>
        <div className="pl-sub">C O L L E C T I O N S</div>
        <div className="pl-bar"><i className="pl-line" /></div>
        <div className="pl-num" ref={num}>00</div>
      </div>
    </div>
  )
}

/* ───────────── Gold dust particle field (canvas) ───────────── */
function Particles() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d')
    let w, h, raf, dots = []
    const mouse = { x: -999, y: -999 }
    const resize = () => {
      const r = c.parentElement.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2)
      w = r.width; h = r.height; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dots = Array.from({ length: Math.round(Math.min(90, w / 14)) }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.15, vy: -Math.random() * 0.3 - 0.05, a: Math.random() * 0.6 + 0.3, p: Math.random() * 6.28, c: BRAND[Math.floor(Math.random() * 4)],
      }))
    }
    const move = (e) => { const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top }
    const tick = (t) => {
      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy)
        if (dist < 120) { d.x += (dx / dist) * 1.2; d.y += (dy / dist) * 1.2 }
        d.x += d.vx; d.y += d.vy
        if (d.y < -5) { d.y = h + 5; d.x = Math.random() * w }
        if (d.x < -5) d.x = w + 5; if (d.x > w + 5) d.x = -5
        const tw = 0.5 + 0.5 * Math.sin(t / 700 + d.p)
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.28)
        ctx.fillStyle = d.c + Math.round(d.a * tw * 255).toString(16).padStart(2, '0'); ctx.shadowColor = d.c; ctx.shadowBlur = 8; ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    resize(); raf = requestAnimationFrame(tick)
    addEventListener('resize', resize); addEventListener('pointermove', move)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('pointermove', move) }
  }, [])
  return <canvas ref={ref} className="particles" aria-hidden />
}

/* ───────────── Small helpers ───────────── */
function Split({ text, className = '' }) {
  return (
    <span className={`split ${className}`} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span className="w" key={i} aria-hidden><span className="wi">{w}&nbsp;</span></span>
      ))}
    </span>
  )
}
function Reveal({ children, delay = 0, y = 40, className = '', as: Tag = 'div' }) {
  const M = motion[Tag] || motion.div
  return (
    <M className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </M>
  )
}
function Magnetic({ children, className = '', ...rest }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: 'power3.out' })
  }
  const onLeave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' })
  return <a ref={ref} className={className} onMouseMove={onMove} onMouseLeave={onLeave} {...rest}>{children}</a>
}
function Counter({ to, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const o = { v: 0 }
    const st = ScrollTrigger.create({
      trigger: ref.current, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: to, duration: 2, ease: 'power2.out', onUpdate: () => ref.current && (ref.current.textContent = prefix + Math.round(o.v).toLocaleString('en-IN') + suffix) }),
    })
    return () => st.kill()
  }, [to])
  return <span ref={ref}>{prefix}0{suffix}</span>
}
function Video({ src, poster, className = '', ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([e]) => { e.isIntersecting ? el.play().catch(() => {}) : el.pause() }, { threshold: 0.25 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return <video ref={ref} className={className} src={asset(src)} poster={asset(poster)} muted loop playsInline preload="metadata" {...rest} />
}

/* ───────────── Navigation ───────────── */
function Nav({ count, openCart }) {
  const [solid, setSolid] = useState(false)
  const [menu, setMenu] = useState(false)
  useEffect(() => { const f = () => setSolid(scrollY > 60); f(); addEventListener('scroll', f); return () => removeEventListener('scroll', f) }, [])
  const links = [['#shop', 'Collections'], ['#reels', 'Showroom'], ['#custom', 'Corporate'], ['#occasions', 'Occasions'], ['#visit', 'Visit']]
  const go = (h) => { setMenu(false); scrollToId(h) }
  return (
    <header className={`nav ${solid ? 'solid' : ''}`}>
      <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); lenisRef?.scrollTo(0) }}>
        <Logo /><span className="brand-t">ENIA<small>COLLECTIONS</small></span>
      </a>
      <nav className={menu ? 'open' : ''}>
        {links.map(([h, l]) => <a key={h} href={h} onClick={(e) => { e.preventDefault(); go(h) }}>{l}</a>)}
      </nav>
      <div className="nav-r">
        <a className="nav-call" href={`tel:+${PHONE}`}>{PHONE_DISPLAY}</a>
        <button className="cart-btn" onClick={openCart} aria-label="Open enquiry list">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
          <span>Enquiry</span>
          <AnimatePresence>{count > 0 && <motion.b key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>{count}</motion.b>}</AnimatePresence>
        </button>
        <button className={`burger ${menu ? 'x' : ''}`} onClick={() => setMenu(!menu)} aria-label="Menu"><i /><i /></button>
      </div>
    </header>
  )
}

/* ───────────── Hero ───────────── */
function Hero() {
  const root = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.hero .wi', { yPercent: 110 })
      gsap.set('.hero-fade', { opacity: 0, y: 30 })
      gsap.set('.wall-item', { opacity: 0, y: 80, scale: 0.92 })
      const tl = gsap.timeline({ delay: 2.9, defaults: { ease: 'power4.out' } })
      tl.to('.hero .wi', { yPercent: 0, duration: 1.3, stagger: 0.07 })
        .to('.hero-fade', { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 0.5)
        .to('.wall-item', { opacity: 1, y: 0, scale: 1, duration: 1.4, stagger: 0.1 }, 0.3)
      gsap.to('.wall-col.c1', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 } })
      gsap.to('.wall-col.c2', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 } })
      gsap.to('.wall-col.c3', { yPercent: -22, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 } })
      gsap.to('.hero-copy', { yPercent: 18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 } })
    }, root)
    return () => ctx.revert()
  }, [])
  const V = (n) => ({ src: `vid/v${n}.mp4`, poster: `vid/v${n}.jpg` })
  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero-bg" />
      <Particles />
      <div className="hero-wall" aria-hidden>
        <div className="wall-col c1">
          <div className="wall-item tall"><Video {...V(1)} autoPlay /></div>
          <div className="wall-item"><img src={asset('img/shop/p0.jpg')} alt="" /></div>
          <div className="wall-item tall"><Video {...V(4)} autoPlay /></div>
        </div>
        <div className="wall-col c2">
          <div className="wall-item"><img src={asset('img/shop/peacock.jpg')} alt="" /></div>
          <div className="wall-item tall"><Video {...V(2)} autoPlay /></div>
          <div className="wall-item"><img src={asset('img/silver/s9_1.jpg')} alt="" /></div>
        </div>
        <div className="wall-col c3">
          <div className="wall-item tall"><Video {...V(3)} autoPlay /></div>
          <div className="wall-item"><img src={asset('img/shop/p12.jpg')} alt="" /></div>
          <div className="wall-item tall"><Video {...V(5)} autoPlay /></div>
        </div>
      </div>
      <div className="hero-copy">
        <p className="eyebrow hero-fade"><i /> Return Gifts · Corporate Gifting · Hyderabad</p>
        <h1>
          <Split text="Gifts that" /><br />
          <Split text="feel like" /><br />
          <em><Split text="a celebration." /></em>
        </h1>
        <p className="lede hero-fade">Rich-looking, budget-friendly return gifts and personalised corporate gifting — German silver, leather diaries, painted trays, gift sets and more. <b>Beautifully packed, made personal.</b></p>
        <div className="cta-row hero-fade">
          <Magnetic className="btn gold" href="#shop" onClick={(e) => { e.preventDefault(); scrollToId('#shop') }}>Explore collections <span>→</span></Magnetic>
          <Magnetic className="btn ghost" href={waLink('Hi Xenia Collections! I would like to know more about your gifts.')} target="_blank" rel="noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Z" /><path fill="#fff" className="wa-ph" d="M8.6 7.4c-.3.3-.6.8-.6 1.500 0 2.800 3.700 6.600 7 7.100.7.1 1.300-.3 1.600-.8.200-.4.200-.700 0-.800l-1.600-.9c-.2-.1-.5 0-.6.100l-.6.700c-.1.100-.3.100-.5 0-.9-.4-1.800-1.100-2.400-2-.1-.2-.1-.3 0-.5l.5-.6c.1-.2.1-.4 0-.6l-.8-1.700c-.1-.2-.4-.3-.7-.2-.3.100-.5.300-.7.500Z" /></svg>
            Chat on WhatsApp</Magnetic>
        </div>
        <div className="hero-meta hero-fade"><span className="dot" /> Open 24 hours · <a href={`tel:+${PHONE}`}>{PHONE_DISPLAY}</a></div>
      </div>
      <div className="scroll-cue"><i /></div>
    </section>
  )
}

function Marquee({ items, rev = false }) {
  const row = [...items, ...items]
  return (
    <div className={`marquee ${rev ? 'rev' : ''}`}>
      <div className="mq-track">{[0, 1].map((k) => (
        <div className="mq-row" key={k}>{row.map((t, i) => <span key={i}>{t}<i>✦</i></span>)}</div>
      ))}</div>
    </div>
  )
}

/* ───────────── About + stats ───────────── */
function About() {
  const ref = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.about .parallax').forEach((el) => gsap.to(el, { yPercent: gsap.utils.random(-12, -22), ease: 'none', scrollTrigger: { trigger: el, scrub: 1 } }))
      gsap.fromTo('.about-big .wi', { yPercent: 110 }, { yPercent: 0, stagger: 0.04, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '.about-big', start: 'top 80%' } })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section className="about" id="about" ref={ref}>
      <div className="about-grid">
        <div className="about-imgs">
          <img className="parallax a1" src={asset('img/shop/peacock.jpg')} alt="Hand-painted peacock tray" />
          <img className="parallax a2" src={asset('img/silver/s14_3.jpg')} alt="German silver samai pair" />
        </div>
        <div>
          <p className="eyebrow"><i /> One-stop gifting shop</p>
          <h2 className="about-big"><Split text="Small budgets. Big, beautiful first impressions." /></h2>
          <Reveal delay={0.1}><p className="body">Xenia Collections is your one-stop shop for budget-friendly yet rich-looking return gifts, personalised gifts, designer potli bags, customised jute bags, corporate gifts and thambulam combos — for every occasion, small to big. We also love designer scented pure soy-wax candles, decorative dolls and home décor.</p></Reveal>
        </div>
      </div>
      <div className="stats">
        {[[26, '', '', 'Five-star Google reviews'], [ALL.length, '', '+', 'Designs in the catalogue'], [24, '', ' hrs', 'Open every day'], [100, '', '%', 'Personalisation friendly']].map(([n, p, s, l], i) => (
          <Reveal key={i} delay={i * 0.08} className="stat"><b><Counter to={n} prefix={p} suffix={s} /></b><span>{l}</span></Reveal>
        ))}
      </div>
    </section>
  )
}

/* ───────────── Category tiles ───────────── */
const TILES = [
  { cat: 'German Silver', t: 'German Silver', d: 'Diyas, samais, frames & trays', img: 'img/silver/s14_3.jpg', big: true },
  { cat: 'Painted Trays', t: 'Hand-painted Trays', d: 'Glass & gold-leaf art', img: 'img/shop/peacock.jpg' },
  { cat: 'Diaries', t: 'Executive Diaries', d: 'Leather, cork & fabric', img: 'img/shop/p0.jpg' },
  { cat: 'Bottles', t: 'Bottles & Tumblers', d: 'Steel, copper & eco', img: 'img/bottle/b1.jpg' },
  { cat: '4-in-1 Sets', t: 'Corporate Gift Sets', d: '2, 3 & 4-in-1 boxes', img: 'img/gs4/c2_1.jpg', big: true },
  { cat: 'Hip Flask Sets', t: 'Hip Flask Sets', d: 'Premium & gift-boxed', img: 'img/flask/f2.jpg' },
]
function Tile({ t, pick }) {
  const ref = useRef(null)
  const move = (e) => {
    const r = ref.current.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
    gsap.to(ref.current, { rotateY: x * 8, rotateX: -y * 8, duration: 0.5, ease: 'power3.out' })
    gsap.to(ref.current.querySelector('img'), { x: -x * 18, y: -y * 18, duration: 0.6 })
  }
  const leave = () => { gsap.to(ref.current, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' }); gsap.to(ref.current.querySelector('img'), { x: 0, y: 0, duration: 0.8 }) }
  return (
    <Reveal className={`tile-wrap ${t.big ? 'big' : ''}`}>
      <button className="tile" ref={ref} onMouseMove={move} onMouseLeave={leave} onClick={() => pick(t.cat)}>
        <img src={asset(t.img)} alt={t.t} loading="lazy" />
        <span className="tile-sh" />
        <span className="tile-txt"><small>{t.d}</small><b>{t.t}</b><i>View collection →</i></span>
      </button>
    </Reveal>
  )
}
function Tiles({ pick }) {
  return (
    <section className="tiles">
      <div className="sec-head"><p className="eyebrow"><i /> Shop by collection</p><h2>Find the <em>perfect</em> gift</h2></div>
      <div className="tile-grid">{TILES.map((t) => <Tile key={t.cat} t={t} pick={pick} />)}</div>
    </section>
  )
}

/* ───────────── Catalogue / shop ───────────── */
const CATS = ['All', 'German Silver', 'Painted Trays', 'Diaries', 'Bottles', 'Hip Flask Sets', '2-in-1 Sets', '3-in-1 Sets', '4-in-1 Sets']
const SUBS = ['All types', 'Pooja & Decor', 'Frames & Mirrors', 'Trays & Platters', 'Gift Sets', 'Clutch Bags']
const BUDGETS = [['Any budget', Infinity], ['Under ₹750', 750], ['Under ₹1,000', 1000], ['Under ₹1,500', 1500]]

const Card = forwardRef(function Card({ p, qty, add, open, i }, ref) {
  return (
    <motion.article ref={ref} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.04 }} className="card">
      <button className="card-img" onClick={() => open(p)} aria-label={`View ${p.name}`}>
        <img src={asset(p.img)} alt={p.name} loading="lazy" decoding="async" />
        <span className="badge">{p.tag}</span>
        <span className="quick">Quick view</span>
      </button>
      <div className="card-b">
        <h3>{p.name}</h3>
        <div className="card-row">
          <span className="price">{p.price ? <>{p.priceFrom ? 'from ' : ''}<b>{inr(p.price)}</b></> : <em>Ask for price</em>}</span>
          {qty ? (
            <div className="step"><button onClick={() => add(p.id, -1)}>−</button><b>{qty}</b><button onClick={() => add(p.id, 1)}>+</button></div>
          ) : (
            <button className="add" onClick={() => add(p.id, 1)}>+ Enquire</button>
          )}
        </div>
      </div>
    </motion.article>
  )
})

function Shop({ cart, add, open, catReq }) {
  const [cat, setCat] = useState('All')
  const [sub, setSub] = useState('All types')
  const [q, setQ] = useState('')
  const [budget, setBudget] = useState(0)
  const [sort, setSort] = useState('featured')
  const [limit, setLimit] = useState(24)
  useEffect(() => { if (catReq.cat) { setCat(catReq.cat); setSub('All types'); setQ('') } }, [catReq])
  useEffect(() => setLimit(24), [cat, sub, q, budget, sort])
  const list = useMemo(() => {
    const hits = search(q)
    let l = ALL.filter((p) => (cat === 'All' || p.cat === cat) && (!hits || hits.has(p.id)))
    if (cat === 'German Silver' && sub !== 'All types') l = l.filter((p) => p.sub === sub)
    const cap = BUDGETS[budget][1]
    if (cap !== Infinity) l = l.filter((p) => p.price && p.price <= cap)
    if (sort === 'low') l = [...l].sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9))
    if (sort === 'high') l = [...l].sort((a, b) => (b.price ?? -1) - (a.price ?? -1))
    if (sort === 'az') l = [...l].sort((a, b) => a.name.localeCompare(b.name))
    return l
  }, [cat, sub, q, budget, sort])
  const counts = useMemo(() => { const m = { All: ALL.length }; ALL.forEach((p) => (m[p.cat] = (m[p.cat] || 0) + 1)); return m }, [])
  return (
    <section className="shop" id="shop">
      <div className="sec-head"><p className="eyebrow"><i /> The catalogue</p><h2>Every gift. <em>One place.</em></h2>
        <p className="sub">No more heavy PDFs — browse, tap <b>+ Enquire</b> on what you like, and send your whole list to us on WhatsApp in one go.</p></div>
      <div className="tools">
        <div className="search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search diya, diary, bottle, frame, XG-NB05…" />
          {q && <button onClick={() => setQ('')} aria-label="Clear">×</button>}</div>
        <select value={budget} onChange={(e) => setBudget(+e.target.value)} aria-label="Budget">{BUDGETS.map(([l], i) => <option key={l} value={i}>{l}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="az">Name: A to Z</option></select>
      </div>
      <div className="chips">{CATS.map((c) => (
        <button key={c} className={cat === c ? 'on' : ''} onClick={() => { setCat(c); setSub('All types') }}>{c}<sup>{counts[c] || 0}</sup></button>
      ))}</div>
      {cat === 'German Silver' && <div className="chips small">{SUBS.map((s) => <button key={s} className={sub === s ? 'on' : ''} onClick={() => setSub(s)}>{s}</button>)}</div>}
      <p className="result-count">{list.length} designs</p>
      <motion.div layout className="grid">
        <AnimatePresence mode="popLayout">
          {list.slice(0, limit).map((p, i) => <Card key={p.id} p={p} i={i} qty={cart.get(p.id)} add={add} open={open} />)}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <div className="empty">Nothing matched — <button onClick={() => { setQ(''); setCat('All'); setBudget(0) }}>reset filters</button> or <a href={waLink(`Hi! I'm looking for: ${q}`)} target="_blank" rel="noreferrer">ask us on WhatsApp</a>.</div>}
      {limit < list.length && <div className="more"><button className="btn ghost dark" onClick={() => setLimit(limit + 24)}>Show more ({list.length - limit} left)</button></div>}
    </section>
  )
}

/* ───────────── Quick view modal ───────────── */
function QuickView({ p, close, add, qty }) {
  useEffect(() => {
    if (!p) return
    const k = (e) => e.key === 'Escape' && close()
    addEventListener('keydown', k); lenisRef?.stop()
    return () => { removeEventListener('keydown', k); lenisRef?.start() }
  }, [p])
  const related = useMemo(() => p ? ALL.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4) : [], [p])
  return (
    <AnimatePresence>
      {p && (
        <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div className="modal" onClick={(e) => e.stopPropagation()} initial={{ y: 60, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', damping: 26, stiffness: 240 }}>
            <button className="x" onClick={close} aria-label="Close">×</button>
            <div className="m-img"><img src={asset(p.img)} alt={p.name} /></div>
            <div className="m-info">
              <span className="badge static">{p.cat}</span>
              <h3>{p.name}</h3>
              <p className="m-price">{p.price ? <>{inr(p.price)} <small>per piece · bulk rates available</small></> : <em>Price on request — depends on quantity &amp; branding</em>}</p>
              <p className="m-d">{p.sub}. Ideal for return gifts, weddings, festivals and corporate gifting. Personalisation with your name or logo can be arranged — just ask.</p>
              <ul className="m-ul"><li>Gift-ready packaging</li><li>Logo / name customisation</li><li>Bulk &amp; custom budgets welcome</li></ul>
              <div className="m-cta">
                <button className="btn gold" onClick={() => add(p.id, 1)}>{qty ? `In your list (${qty}) — add one more` : '+ Add to enquiry list'}</button>
                <a className="btn ghost dark" target="_blank" rel="noreferrer" href={waLink(`Hi Xenia Collections! I'm interested in *${p.name}* (${p.id}). Could you share price & availability?`)}>Ask on WhatsApp</a>
                <a className="btn ghost dark" target="_blank" rel="noreferrer" href={waLink(`Hi! I'd like *${p.name}* (${p.id}) customised with my logo/name. Quantity: ___ . Please share a quote.`)}>Customise with my logo</a>
              </div>
              {related.length > 0 && <div className="m-rel"><small>You may also like</small><div>{related.map((r) => <img key={r.id} src={asset(r.img)} alt={r.name} title={r.name} />)}</div></div>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ───────────── Cart drawer ───────────── */
function CartDrawer({ open, close, cart, add, clear }) {
  const [who, setWho] = useState({ name: '', event: '', date: '', logo: false, note: '' })
  const items = [...cart].map(([id, q]) => [BY_ID.get(id), q]).filter(([p]) => p)
  const total = items.reduce((s, [p, q]) => s + (p.price || 0) * q, 0)
  const unpriced = items.some(([p]) => !p.price)
  useEffect(() => { open ? lenisRef?.stop() : lenisRef?.start() }, [open])
  const set = (k) => (e) => setWho({ ...who, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="drawer-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.aside className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }}>
            <header><h3>Your enquiry list</h3><button onClick={close} aria-label="Close">×</button></header>
            {items.length === 0 ? (
              <div className="d-empty"><div>✦</div><p>Your list is empty.<br />Tap <b>+ Enquire</b> on any gift to start building your quote.</p><button className="btn gold" onClick={() => { close(); scrollToId('#shop') }}>Browse collections</button></div>
            ) : (
              <>
                <ul className="d-list">
                  {items.map(([p, q]) => (
                    <li key={p.id}><img src={asset(p.img)} alt="" /><div><b>{p.name}</b><small>{p.price ? `${inr(p.price)} each` : 'Price on request'}</small>
                      <div className="step"><button onClick={() => add(p.id, -1)}>−</button><b>{q}</b><button onClick={() => add(p.id, 1)}>+</button><button className="rm" onClick={() => add(p.id, -q)}>Remove</button></div></div></li>
                  ))}
                </ul>
                <div className="d-form">
                  <input placeholder="Your name" value={who.name} onChange={set('name')} />
                  <input placeholder="Occasion or company (e.g. Marriage, TCS)" value={who.event} onChange={set('event')} />
                  <label>Needed by<input type="date" value={who.date} onChange={set('date')} /></label>
                  <label className="chk"><input type="checkbox" checked={who.logo} onChange={set('logo')} /> I want my logo / name on these</label>
                  <textarea rows="2" placeholder="Anything else? Budget, colours, quantity…" value={who.note} onChange={set('note')} />
                </div>
                <footer>
                  {total > 0 && <div className="d-total"><span>Indicative total (priced items)</span><b>{inr(total)}</b></div>}
                  <small className="d-note">{unpriced ? 'Items marked “price on request” will be quoted by us on WhatsApp, with bulk rates and a design preview.' : 'We’ll confirm final price and availability on WhatsApp.'}</small>
                  <a className="btn gold wide" target="_blank" rel="noreferrer" href={waLink(cartMessage(cart, who))}>Send enquiry on WhatsApp →</a>
                  <button className="link" onClick={clear}>Clear list</button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

/* ───────────── Reels ───────────── */
const REELS = [[1, 'Inlay platters'], [2, 'Silver baskets'], [3, 'Floral platters'], [4, 'Logo on leather'], [5, 'Metal-plate branding'], [6, 'Wooden organisers'], [8, 'Painted trays'], [7, 'Glass-art tray']]
function Reels() {
  return (
    <section className="reels" id="reels">
      <div className="sec-head"><p className="eyebrow"><i /> Inside the showroom</p><h2>See it <em>before</em> you buy it</h2>
        <p className="sub">Real pieces, real finish — straight from our shelves.</p></div>
      <div className="reel-track" data-lenis-prevent>
        {REELS.map(([n, t]) => (
          <div className="reel" key={n}><Video src={`vid/v${n}.mp4`} poster={`vid/v${n}.jpg`} /><span>{t}</span></div>
        ))}
      </div>
    </section>
  )
}

/* ───────────── Reviews ───────────── */
const REVIEWS = [
  ['Monika J.', 'Need a quick gift? Xenia Collections is a lifesaver! They have unique stuff and made finding return gifts a breeze. Super friendly service.'],
  ['Nikitha Saraswathi', 'Amazing gift collection with great customisation options. Very friendly service and reasonable prices. Highly satisfied.'],
  ['Ashok Kumar · Local Guide', 'Unique and very budget-friendly gifts for every occasion. Customisation is very good. Customer-friendly service.'],
]
function Reviews() {
  return (
    <section className="reviews" id="reviews">
      <div className="sec-head center"><p className="eyebrow"><i /> Loved by customers</p><h2>Rated <em>5.0</em> on Google</h2>
        <p className="sub">26 reviews · return gifts, corporate gifting &amp; customisation</p></div>
      <div className="rev-grid">
        {REVIEWS.map(([n, t], i) => (
          <Reveal key={n} delay={i * 0.1} className="rev"><div className="stars">★★★★★</div><p>“{t}”</p><b>{n}</b></Reveal>
        ))}
      </div>
    </section>
  )
}

/* ───────────── Corporate / process (pinned horizontal) ───────────── */
const STEPS = [
  ['01', 'Choose', 'Browse the catalogue and tap + Enquire on everything you like — diaries, bottles, gift sets, silver.', 'img/gs3/b2_1.jpg'],
  ['02', 'Personalise', 'Add your logo, name or message. We emboss, print, engrave or tag — whatever suits the product.', 'img/shop/p1.jpg'],
  ['03', 'Get your quote', 'Send the list on WhatsApp. You get bulk pricing and a design preview, usually the same day.', 'img/gs4/c4_2.jpg'],
  ['04', 'Delivered gift-ready', 'Packed beautifully and delivered for your wedding, event, office or festival.', 'img/silver/s7_1.jpg'],
]
function Custom() {
  const root = useRef(null)
  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const track = root.current.querySelector('.steps')
      const dist = () => track.scrollWidth - innerWidth + 120
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: root.current.querySelector('.pin'), start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } })
    })
    return () => mm.revert()
  }, [])
  return (
    <section className="custom" id="custom" ref={root}>
      <div className="pin">
        <div className="steps">
          <div className="custom-head">
          <p className="eyebrow"><i /> Corporate &amp; bulk orders</p>
          <h2>From idea to <em>gift box</em> in four steps</h2>
          <a className="btn gold" href="#bulk" onClick={(e) => { e.preventDefault(); scrollToId('#bulk') }}>Request a bulk quote →</a>
        </div>
          {STEPS.map(([n, t, d, img]) => (
            <article className="step-card" key={n}>
              <img src={asset(img)} alt="" loading="lazy" />
              <div><span>{n}</span><h3>{t}</h3><p>{d}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────── Occasions ───────────── */
const OCC = ['Kids birthday', 'Vratham', 'Gruhapravesham', 'Engagement', 'Marriage', 'Shashtipoorthi', 'Kitty party', 'Corporate events', 'Festivals', 'Baby showers']
function Occasions() {
  return (
    <section className="occasions" id="occasions">
      <div className="sec-head center"><p className="eyebrow"><i /> Gifting for every moment</p><h2>Small to big. <em>We’ve got it.</em></h2></div>
      <Marquee items={OCC} />
      <Marquee items={['Multipurpose storage bags', 'Party favours', 'Clutches', 'Sling bags', 'Designer potlis', 'Handmade theme candles', 'Soap hampers', 'Kumkum boxes', 'Dry fruit boxes', 'Light-weight stone items']} rev />
    </section>
  )
}

/* ───────────── Bulk enquiry form ───────────── */
function Bulk() {
  const vref = useRef(null)
  useEffect(() => {
    let effect, dead = false
    const st = ScrollTrigger.create({
      trigger: vref.current, start: 'top 95%', once: true,
      onEnter: async () => {
        const { initVanta } = await import('./vanta-setup.js')
        if (!dead) effect = initVanta(vref.current, { color: 0x4a0d34, shininess: 38, waveHeight: 18, waveSpeed: 0.7, zoom: 0.85 })
      },
    })
    return () => { dead = true; st.kill(); effect && effect.destroy() }
  }, [])
  const [f, setF] = useState({ name: '', company: '', qty: '', budget: '', date: '', type: 'Corporate gifts', logo: true, msg: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const msg = `*Bulk enquiry – Xenia Collections website*\nName: ${f.name}\nCompany / Occasion: ${f.company}\nGift type: ${f.type}\nQuantity: ${f.qty}\nBudget per gift: ₹${f.budget}\nNeeded by: ${f.date}\nLogo / personalisation: ${f.logo ? 'Yes' : 'No'}\n${f.msg ? 'Note: ' + f.msg : ''}`
  return (
    <section className="bulk" id="bulk">
      <div className="vanta-bg" ref={vref} aria-hidden />
      <div className="bulk-in">
        <div className="bulk-l">
          <p className="eyebrow"><i /> Tell us what you need</p>
          <h2>Planning an event or <em>company gifting?</em></h2>
          <p className="body">Share a few details and we’ll come back with options that match your budget — return gifts, and premium corporate sets with your branding.</p>
          <ul className="ticks"><li>Budget-friendly, rich-looking options</li><li>Logo, name &amp; message personalisation</li><li>Quick quotes on WhatsApp</li><li>Open 24 hours — call anytime</li></ul>
          <a className="phone-big" href={`tel:+${PHONE}`}>{PHONE_DISPLAY}</a>
        </div>
        <form className="bulk-f" onSubmit={(e) => { e.preventDefault(); window.open(waLink(msg), '_blank') }}>
          <div className="two"><input required placeholder="Your name" value={f.name} onChange={set('name')} /><input placeholder="Company / occasion" value={f.company} onChange={set('company')} /></div>
          <select value={f.type} onChange={set('type')}>{['Corporate gifts', 'Return gifts', 'Wedding / engagement', 'Festival gifting', 'Diaries & bottles', 'German silver', 'Something else'].map((o) => <option key={o}>{o}</option>)}</select>
          <div className="two"><input required type="number" min="1" placeholder="Quantity" value={f.qty} onChange={set('qty')} /><input type="number" min="0" placeholder="Budget per gift (₹)" value={f.budget} onChange={set('budget')} /></div>
          <label>Needed by<input type="date" value={f.date} onChange={set('date')} /></label>
          <label className="chk"><input type="checkbox" checked={f.logo} onChange={set('logo')} /> I want logo / name printing</label>
          <textarea rows="3" placeholder="Anything else we should know?" value={f.msg} onChange={set('msg')} />
          <button className="btn gold wide" type="submit">Send on WhatsApp →</button>
        </form>
      </div>
    </section>
  )
}

/* ───────────── Visit ───────────── */
function Visit() {
  return (
    <section className="visit" id="visit">
      <div className="visit-in">
        <div className="visit-l">
          <p className="eyebrow"><i /> Visit or call</p>
          <h2>Come see it <em>in person.</em></h2>
          <div className="open"><span className="dot" /> <b>Open now</b> · Open 24 hours, every day</div>
          <dl>
            <dt>Call / WhatsApp</dt><dd><a href={`tel:+${PHONE}`}>{PHONE_DISPLAY}</a></dd>
            <dt>Owner</dt><dd>Sushma Mada</dd>
            <dt>Address</dt><dd>{ADDRESS}</dd>
            <dt>Find us</dt><dd><a href={MAPS} target="_blank" rel="noreferrer">Open in Google Maps ↗</a></dd>
            <dt>Follow</dt><dd><a href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram</a> · <a href={FACEBOOK} target="_blank" rel="noreferrer">Facebook</a></dd>
          </dl>
          <div className="cta-row"><a className="btn gold" href={`tel:+${PHONE}`}>Call now</a><a className="btn ghost" href={MAPS} target="_blank" rel="noreferrer">Get directions</a></div>
        </div>
        <div className="map"><iframe title="Hyderabad on Google Maps" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="foot-big">XENIA</div>
      <div className="foot-row">
        <span>© {new Date().getFullYear()} Xenia Collections — Return Gifts &amp; Corporate Gifting</span>
        <span><a href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram</a> · <a href={FACEBOOK} target="_blank" rel="noreferrer">Facebook</a> · <a href={`tel:+${PHONE}`}>{PHONE_DISPLAY}</a></span>
      </div>
    </footer>
  )
}

function FloatWA({ count, openCart }) {
  return (
    <div className="floaters">
      {count > 0 && <button className="fl-cart" onClick={openCart}>View list ({count})</button>}
      <a className="fl-wa" href={waLink('Hi Xenia Collections! I have an enquiry.')} target="_blank" rel="noreferrer" aria-label="WhatsApp us">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Z" /><path fill="#fff" className="wa-ph" d="M8.6 7.4c-.3.3-.6.8-.6 1.500 0 2.800 3.700 6.600 7 7.100.7.1 1.300-.3 1.600-.8.200-.4.200-.700 0-.800l-1.600-.9c-.2-.1-.5 0-.6.100l-.6.700c-.1.100-.3.100-.5 0-.9-.4-1.800-1.100-2.400-2-.1-.2-.1-.3 0-.5l.5-.6c.1-.2.1-.4 0-.6l-.8-1.700c-.1-.2-.4-.3-.7-.2-.3.100-.5.300-.7.500Z" /></svg>
      </a>
      <a className="fl-call" href={`tel:+${PHONE}`} aria-label="Call us"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg></a>
    </div>
  )
}

/* ───────────── App ───────────── */
export default function App() {
  const [ready, setReady] = useState(false)
  const [cart, setCart] = useState(loadCart)
  const [cartOpen, setCartOpen] = useState(false)
  const [view, setView] = useState(null)
  const [catReq, setCatReq] = useState({ cat: null, n: 0 })

  useEffect(() => { if (ready) setTimeout(() => ScrollTrigger.refresh(), 300) }, [ready])
  useEffect(() => saveCart(cart), [cart])

  const add = useCallback((id, d) => setCart((c) => {
    const m = new Map(c), n = (m.get(id) || 0) + d
    n <= 0 ? m.delete(id) : m.set(id, n)
    return m
  }), [])
  const count = [...cart.values()].reduce((a, b) => a + b, 0)
  const pick = (cat) => { setCatReq({ cat, n: Date.now() }); scrollToId('#shop') }

  return (
    <>
      {!ready && <Preloader done={() => setReady(true)} />}
      <div className="grain" />
      <ScrollBar />
      <Nav count={count} openCart={() => setCartOpen(true)} />
      <main>
        <Hero />
        <Marquee items={['Return gifts & corporate gifting', 'Thamboolam combos', 'Festive hampers', 'Wedding hampers', 'Engagement packing', 'Employee appreciation gifts', 'Eco-friendly gifts', 'Promotional gifts', 'Personalised umbrellas', 'Jute bags', 'German silver items']} />
        <About />
        <Tiles pick={pick} />
        <Shop cart={cart} add={add} open={setView} catReq={catReq} />
        <Reels />
        <Reviews />
        <Custom />
        <Occasions />
        <Bulk />
        <Visit />
      </main>
      <Footer />
      <FloatWA count={count} openCart={() => setCartOpen(true)} />
      <QuickView p={view} close={() => setView(null)} add={add} qty={view ? cart.get(view.id) : 0} />
      <CartDrawer open={cartOpen} close={() => setCartOpen(false)} cart={cart} add={add} clear={() => setCart(new Map())} />
    </>
  )
}
