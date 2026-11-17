import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap, ScrollTrigger, lenis } from './gsap-lenis-setup.js'
import ICONS from './icons.json'
import { asset } from './lib.js'

/* Brand icons (official glyphs, real colours) */
export const PHONE_PATH = 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'
export const WAIcon = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden><path d={ICONS.siWhatsapp} /></svg>
export const PhoneIcon = ({ size = 22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden><path d={PHONE_PATH} /></svg>
export const IGIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <defs><radialGradient id="igg" cx="30%" cy="107%" r="150%"><stop offset="0" stopColor="#fdf497" /><stop offset=".05" stopColor="#fdf497" /><stop offset=".45" stopColor="#fd5949" /><stop offset=".6" stopColor="#d6249f" /><stop offset=".9" stopColor="#285AEB" /></radialGradient></defs>
    <path fill="url(#igg)" d={ICONS.siInstagram} />
  </svg>
)
export const FBIcon = ({ size = 22 }) => <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path fill="#1877F2" d={ICONS.siFacebook} /></svg>

export const lenisRef = lenis
export const scrollToId = (id) => {
  const el = document.querySelector(id)
  if (!el) return
  lenisRef ? lenisRef.scrollTo(el, { offset: -70, duration: 1.4 }) : el.scrollIntoView({ behavior: 'smooth' })
}

export const BRAND = ['#3a86d4', '#cf1f78', '#f7b520', '#b9d531']
export function Logo({ className = '' }) {
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
export function ScrollBar() {
  const ref = useRef(null)
  useEffect(() => {
    const f = () => { const h = document.documentElement.scrollHeight - innerHeight; ref.current && (ref.current.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`) }
    addEventListener('scroll', f, { passive: true }); f(); return () => removeEventListener('scroll', f)
  }, [])
  return <div className="scroll-bar" ref={ref} />
}

/* ───────────── Small helpers ───────────── */
export function Split({ text, className = '' }) {
  return (
    <span className={`split ${className}`} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span className="w" key={i} aria-hidden><span className="wi">{w}&nbsp;</span></span>
      ))}
    </span>
  )
}
export function Reveal({ children, delay = 0, y = 40, className = '', as: Tag = 'div' }) {
  const M = motion[Tag] || motion.div
  return (
    <M className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </M>
  )
}
export function Magnetic({ children, className = '', ...rest }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: 'power3.out' })
  }
  const onLeave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' })
  return <a ref={ref} className={className} onMouseMove={onMove} onMouseLeave={onLeave} {...rest}>{children}</a>
}
export function Counter({ to, prefix = '', suffix = '' }) {
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
export function Video({ src, poster, className = '', ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([e]) => { e.isIntersecting ? el.play().catch(() => {}) : el.pause() }, { threshold: 0.25 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return <video ref={ref} className={className} src={asset(src)} poster={asset(poster)} muted loop playsInline preload="metadata" {...rest} />
}

/* ───── Toasts (tiny event bus) ───── */
export const toast = (msg, action) => window.dispatchEvent(new CustomEvent('xenia-toast', { detail: { msg, action, id: Math.random() } }))

/* ───── Fly-to-cart: clone the product image and fly it into the Enquiry button ───── */
export function flyToCart(img) {
  const target = document.querySelector('.cart-btn') || document.querySelector('.mb-enq')
  if (!img || !target) return
  const a = img.getBoundingClientRect(), b = target.getBoundingClientRect()
  if (!a.width) return
  const c = img.cloneNode()
  Object.assign(c.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', objectFit: 'cover', borderRadius: '16px', zIndex: 400, pointerEvents: 'none', boxShadow: '0 20px 50px rgba(0,0,0,.5)' })
  document.body.appendChild(c)
  gsap.to(c, {
    left: b.left + b.width / 2 - 18, top: b.top + b.height / 2 - 18, width: 36, height: 36, borderRadius: '50%', opacity: 0.6,
    duration: 0.9, ease: 'power3.inOut', onComplete: () => { c.remove(); gsap.fromTo(target, { scale: 1.25 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,0.4)' }) },
  })
}

/* ───── Uploaded files ───── */
export const ACCEPT = 'image/*,.pdf,.ai,.eps,.cdr,.svg,.psd,.xlsx,.xls,.csv,.doc,.docx,.ppt,.pptx,.zip,.txt'
export const MAX_FILES = 10
export const MAX_MB = 25
export function toEntries(fileList, existing) {
  const out = [], skipped = []
  for (const f of fileList) {
    if (existing.length + out.length >= MAX_FILES) { skipped.push(f.name + ' (max ' + MAX_FILES + ' files)'); continue }
    if (f.size > MAX_MB * 1024 * 1024) { skipped.push(f.name + ' (over ' + MAX_MB + ' MB)'); continue }
    if (existing.some((e) => e.file.name === f.name && e.file.size === f.size)) continue
    out.push({ id: Math.random().toString(36).slice(2), file: f, url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null })
  }
  return { out, skipped }
}
export const fileKind = (f) => {
  const n = f.name.toLowerCase()
  if (f.type.startsWith('image/')) return 'Image'
  if (n.endsWith('.pdf')) return 'PDF'
  if (/\.(ai|eps|cdr|svg|psd)$/.test(n)) return 'Design'
  if (/\.(xlsx|xls|csv)$/.test(n)) return 'Sheet'
  if (/\.(doc|docx|txt)$/.test(n)) return 'Doc'
  if (n.endsWith('.zip')) return 'ZIP'
  return 'File'
}
export const fmtSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB')
export const canShareFiles = (files) => {
  try { return !!(files.length && navigator.canShare && navigator.canShare({ files: files.map((f) => f.file) })) } catch { return false }
}
export async function shareFiles(files, text) {
  try { await navigator.share({ files: files.map((f) => f.file), text, title: 'Xenia Collections enquiry' }); return true } catch { return false }
}
