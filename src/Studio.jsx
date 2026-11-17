import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollTrigger } from './gsap-lenis-setup.js'
import { asset, waLink, PHONE_DISPLAY } from './lib.js'
import { WAIcon, Reveal, toast, ACCEPT, MAX_FILES, MAX_MB, toEntries, fileKind, fmtSize, canShareFiles, shareFiles, emailEnquiry } from './shared.jsx'

/* Categories for the studio: preview bases + what to upload */
export const STUDIO = [
  { k: 'Corporate gifts', bases: ['img/gs4/c1.webp', 'img/gs3/b5.webp', 'img/shop/p0.webp'], hint: 'Company logo (PNG, SVG, AI or PDF), employee name list (Excel / CSV), brand colours or guidelines.' },
  { k: 'Return gifts', bases: ['img/silver/s8_1.webp', 'img/silver/s1_3.webp', 'img/shop/peacock.webp'], hint: 'Child’s or host’s name, party theme, a photo or your invitation design.' },
  { k: 'Wedding', bases: ['img/silver/s9_1.webp', 'img/silver/s14_3.webp', 'img/silver/s15_2.webp'], hint: 'Couple names and date, monogram or wedding logo, invitation card design.' },
  { k: 'Engagement', bases: ['img/silver/s20_1.webp', 'img/silver/s16_3.webp', 'img/silver/s23_2.webp'], hint: 'Couple names, ceremony date and your colour theme.' },
  { k: 'Festival gifting', bases: ['img/silver/s5_3.webp', 'img/silver/s13_3.webp', 'img/silver/s21_4.webp'], hint: 'Festival greeting text, company logo (for corporate gifting) and the recipient list.' },
  { k: 'Diaries', bases: ['img/shop/p0.webp', 'img/shop/p1.webp', 'img/diary/d1.webp'], hint: 'Logo for debossing or printing on the cover, names list for personalised diaries.' },
  { k: 'Bottles', bases: ['img/bottle/b1.webp', 'img/bottle/b5.webp', 'img/shop/p8.webp'], hint: 'Logo for laser engraving or printing, plus a names list if each bottle is personalised.' },
  { k: 'German silver', bases: ['img/silver/s14_3.webp', 'img/silver/s4_4.webp', 'img/silver/s17_3.webp'], hint: 'Name or message for the tag / box, logo for the box sticker.' },
  { k: 'Gift sets', bases: ['img/gs3/b5.webp', 'img/gs2/a1.webp', 'img/gs4/c5.webp'], hint: 'Logo for the diary, keychain and gift box, plus a names list.' },
  { k: 'Hip flask sets', bases: ['img/flask/f1.webp', 'img/flask/f4.webp', 'img/flask/f6.webp'], hint: 'Logo or name for engraving on the flask.' },
]
const PERS = ['Logo print', 'Name print', 'Laser engraving', 'Embossing / debossing', 'Custom tag / card', 'Custom packaging', 'Ribbon & colour theme']
const STYLES = [['Print', 'print'], ['Gold foil', 'gold'], ['Engraved', 'engrave'], ['Emboss', 'emboss']]

/* ───── Dropzone (shared by Studio and the enquiry drawer) ───── */
export function Dropzone({ files, setFiles, compact = false }) {
  const [over, setOver] = useState(false)
  const input = useRef(null)
  const addFiles = (list) => {
    const { out, skipped } = toEntries([...list], files)
    if (out.length) { setFiles([...files, ...out]); toast(`${out.length} file${out.length > 1 ? 's' : ''} added ✓`) }
    if (skipped.length) toast('Skipped: ' + skipped.join(', '))
  }
  useEffect(() => {
    if (compact) return
    const paste = (e) => { const f = [...(e.clipboardData?.files || [])]; if (f.length) addFiles(f) }
    addEventListener('paste', paste); return () => removeEventListener('paste', paste)
  })
  const remove = (id) => setFiles(files.filter((f) => f.id !== id))
  return (
    <div className={`dz-wrap ${compact ? 'compact' : ''}`}>
      <button type="button" className={`dz ${over ? 'over' : ''}`} onClick={() => input.current.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files) }}>
        <span className="dz-ic" aria-hidden>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>
        </span>
        <b>{compact ? 'Attach logo or files' : 'Drop your logo & files here'}</b>
        <small>{compact ? 'Logo, name list, design — optional' : `or tap to browse · paste works too · up to ${MAX_FILES} files, ${MAX_MB} MB each`}</small>
        {!compact && <span className="dz-types">PNG · JPG · SVG · AI · CDR · PDF · Excel · Word · ZIP</span>}
      </button>
      <input ref={input} type="file" multiple accept={ACCEPT} hidden onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
      <AnimatePresence initial={false}>
        {files.length > 0 && (
          <motion.ul className="dz-list" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <AnimatePresence initial={false}>
              {files.map((f) => (
                <motion.li key={f.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                  {f.url ? <img src={f.url} alt="" /> : <span className="dz-kind">{fileKind(f.file)}</span>}
                  <div><b title={f.file.name}>{f.file.name}</b><small>{fileKind(f.file)} · {fmtSize(f.file.size)}</small></div>
                  <button type="button" onClick={() => remove(f.id)} aria-label={`Remove ${f.file.name}`}>×</button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ───── Two-step send: details on WhatsApp, then the files ───── */
export function SendFlow({ text, files, onClose, email }) {
  const [step, setStep] = useState(0)
  const [mail, setMail] = useState(email ? 'sending' : null)
  const [skipped, setSkipped] = useState([])
  useEffect(() => {
    if (!email) return
    let live = true
    emailEnquiry({ ...email, text, files }).then((r) => {
      if (!live) return
      setMail(r.ok ? 'sent' : 'error'); setSkipped(r.skipped || [])
      if (r.ok) toast('Enquiry emailed to Xenia ✓')
    })
    return () => { live = false }
  }, [])
  const share = canShareFiles(files)
  const names = files.map((f) => f.file.name)
  const full = text + (files.length ? `\n\n📎 Sending ${files.length} file${files.length > 1 ? 's' : ''} next: ${names.join(', ')}` : '')
  const copy = async () => { try { await navigator.clipboard.writeText(full); toast('Message copied ✓') } catch { toast('Copy not allowed on this browser') } }
  return (
    <motion.div className="sendflow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
      <div className="sf-head"><b>{mail === 'sent' ? 'Sent! ✓' : 'Sending your enquiry'}</b>{onClose && <button type="button" onClick={onClose} aria-label="Close">×</button>}</div>
      {mail && (
        <div className={`sf-mail ${mail}`}>
          <span className="sf-mail-ic">{mail === 'sending' ? <i className="spin" /> : mail === 'sent' ? '✓' : '!'}</span>
          <div>
            {mail === 'sending' && <><b>Emailing your details{files.length ? ` + ${files.length} file${files.length > 1 ? 's' : ''}` : ''}…</b><small>Please keep this page open for a moment.</small></>}
            {mail === 'sent' && <><b>Emailed to Xenia Collections{files.length - skipped.length > 0 ? ` with ${files.length - skipped.length} file${files.length - skipped.length > 1 ? 's' : ''}` : ''}</b><small>We’ll get back to you soon. For a faster reply, also message us on WhatsApp below.</small></>}
            {mail === 'error' && <><b>Email couldn’t be sent right now</b><small>No problem — send it on WhatsApp below and we’ll reply there.</small></>}
            {skipped.length > 0 && <small className="sf-warn">Too large for email (10 MB total): {skipped.join(', ')} — please send these on WhatsApp.</small>}
          </div>
        </div>
      )}
      {mail === 'sent' && <p className="sf-or">Optional · faster reply on WhatsApp</p>}
      <ol className="sf-steps">
        <li className={step > 0 ? 'done' : 'now'}>
          <span>1</span>
          <div><b>Send your details</b><small>Opens our WhatsApp chat ({PHONE_DISPLAY}) with everything filled in — just press send.</small>
            <a className="btn wa" href={waLink(full)} target="_blank" rel="noreferrer" onClick={() => setTimeout(() => setStep(1), 400)}><WAIcon size={18} /> Open WhatsApp</a></div>
        </li>
        {files.length > 0 && (
          <li className={step > 1 ? 'done' : step === 1 ? 'now' : ''}>
            <span>2</span>
            <div><b>Send your {files.length} file{files.length > 1 ? 's' : ''}</b>
              {share ? (
                <><small>Tap below and choose <b>WhatsApp → Xenia Collections</b> (it’ll be at the top of your chats).</small>
                  <button type="button" className="btn wa" onClick={async () => { if (await shareFiles(files, 'Files for my Xenia Collections enquiry')) { setStep(2); toast('Files shared ✓ We’ll reply soon!') } }}>📎 Share files to WhatsApp</button></>
              ) : (
                <><small>In the WhatsApp chat, click <b>📎 Attach</b> (or drag & drop) and add these files from your computer:</small>
                  <ul className="sf-files">{files.map((f) => <li key={f.id}>{f.url ? <img src={f.url} alt="" /> : <i>{fileKind(f.file)}</i>}{f.file.name}</li>)}</ul>
                  <button type="button" className="btn ghost dark sm" onClick={() => setStep(2)}>I’ve attached them ✓</button></>
              )}
            </div>
          </li>
        )}
      </ol>
      <button type="button" className="link" onClick={copy}>Copy message instead</button>
    </motion.div>
  )
}

/* ───── Live logo preview on a product ───── */
function Mockup({ base, logo, text, style, size, pos, setPos }) {
  const box = useRef(null)
  const drag = (e) => {
    e.preventDefault()
    const r = box.current.getBoundingClientRect()
    const move = (ev) => setPos({ x: Math.min(92, Math.max(8, ((ev.clientX - r.left) / r.width) * 100)), y: Math.min(92, Math.max(8, ((ev.clientY - r.top) / r.height) * 100)) })
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up) }
    addEventListener('pointermove', move); addEventListener('pointerup', up)
  }
  return (
    <div className="mock" ref={box}>
      <AnimatePresence mode="wait"><motion.img key={base} src={asset(base)} alt="Product preview" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} /></AnimatePresence>
      <div className={`mock-logo st-${style}`} style={{ left: pos.x + '%', top: pos.y + '%', width: size + '%' }} onPointerDown={drag} data-cursor="Drag">
        {logo ? <img src={logo} alt="Your logo" draggable={false} /> : <span className="mock-ph">YOUR<br />LOGO</span>}
        {text && <span className="mock-text">{text}</span>}
      </div>
      <span className="mock-tag">Live preview · drag to move</span>
    </div>
  )
}

/* ───── Studio section ───── */
export default function Studio({ files, setFiles, req }) {
  const vref = useRef(null)
  const [cat, setCat] = useState(0)
  const [baseI, setBaseI] = useState(0)
  const [product, setProduct] = useState(null)
  const [style, setStyle] = useState('print')
  const [size, setSize] = useState(30)
  const [pos, setPos] = useState({ x: 50, y: 45 })
  const [pers, setPers] = useState(['Logo print'])
  const [f, setF] = useState({ name: '', phone: '', email: '', company: '', text: '', qty: '', budget: '', date: '', city: 'Hyderabad', note: '' })
  const [flow, setFlow] = useState(false)

  useEffect(() => { // Vanta waves background (user's vanta-setup), lazy
    if (matchMedia('(max-width: 1000px), (prefers-reduced-motion: reduce)').matches) return
    let effect, dead = false, busy = false
    const start = async () => {
      if (effect || busy) return
      busy = true
      const { initVanta } = await import('./vanta-setup.js')
      busy = false
      if (!dead && !effect) effect = initVanta(vref.current, { color: 0x3a0b2c, shininess: 30, waveHeight: 16, waveSpeed: 0.6, zoom: 0.85, scale: 1, scaleMobile: 1 })
    }
    const stop = () => { effect && effect.destroy(); effect = null }
    const st = ScrollTrigger.create({ trigger: vref.current, start: 'top bottom', end: 'bottom top', onEnter: start, onEnterBack: start, onLeave: stop, onLeaveBack: stop })
    return () => { dead = true; st.kill(); stop() }
  }, [])
  useEffect(() => { // preset from "Customise with my logo" on a product
    if (!req?.n) return
    const i = STUDIO.findIndex((s) => s.k === req.cat)
    if (i >= 0) setCat(i)
    setProduct(req.product || null); setBaseI(0)
  }, [req])

  const S = STUDIO[cat]
  const base = product ? product.img : S.bases[baseI]
  const logo = files.find((x) => x.url)?.url
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const togglePers = (p) => setPers(pers.includes(p) ? pers.filter((x) => x !== p) : [...pers, p])
  const text = useMemo(() => [
    '*Customisation enquiry – Xenia Collections website*',
    `Category: ${S.k}`,
    product && `Product: ${product.name} (${product.id})`,
    pers.length && `Personalisation: ${pers.join(', ')}`,
    f.text && `Name / text to print: ${f.text}`,
    `Preview style: ${STYLES.find((s) => s[1] === style)[0]}`,
    f.name && `Name: ${f.name}`,
    f.phone && `Phone / WhatsApp: ${f.phone}`,
    f.email && `Email: ${f.email}`,
    f.company && `Company / occasion: ${f.company}`,
    f.qty && `Quantity: ${f.qty}`,
    f.budget && `Budget per gift: ₹${f.budget}`,
    f.date && `Needed by: ${f.date}`,
    f.city && `Delivery city: ${f.city}`,
    f.note && `Note: ${f.note}`,
  ].filter(Boolean).join('\n'), [S, product, pers, f, style])

  const submit = (e) => { e.preventDefault(); setFlow(Date.now()) }

  return (
    <section className="studio" id="studio">
      <div className="vanta-bg" ref={vref} aria-hidden />
      <div className="studio-in">
        <div className="sec-head center">
          <p className="eyebrow"><i /> New · Customisation studio</p>
          <h2>Upload your logo. <em>See it on your gift.</em></h2>
          <p className="sub">Pick what you’re gifting, drop in your logo, name list or design files, preview it live — and send it all to us in one go.</p>
        </div>

        <div className="st-cats" role="tablist">
          {STUDIO.map((s, i) => (
            <button key={s.k} role="tab" aria-selected={cat === i} className={cat === i ? 'on' : ''} onClick={() => { setCat(i); setBaseI(0); setProduct(null) }}>
              <img src={asset(s.bases[0])} alt="" loading="lazy" /><span>{s.k}</span>
            </button>
          ))}
        </div>

        <div className="st-grid">
          <div className="st-col">
            <div className="st-step"><span>1</span> Upload your files</div>
            <p className="st-hint"><b>For {S.k.toLowerCase()}:</b> {S.hint}</p>
            <Dropzone files={files} setFiles={setFiles} />
            <div className="st-step"><span>2</span> How should we personalise it?</div>
            <div className="pers">{PERS.map((p) => <button type="button" key={p} className={pers.includes(p) ? 'on' : ''} onClick={() => togglePers(p)}>{pers.includes(p) ? '✓ ' : '+ '}{p}</button>)}</div>
            <input className="st-in" placeholder="Name or text to print (e.g. Rahul ♥ Priya, Ananya turns 5)" value={f.text} onChange={set('text')} maxLength={40} />
          </div>

          <div className="st-col st-prev">
            <div className="st-step"><span>3</span> Preview it</div>
            <Mockup base={base} logo={logo} text={f.text} style={style} size={size} pos={pos} setPos={setPos} />
            <div className="mock-ctl">
              <div className="seg">{STYLES.map(([l, v]) => <button type="button" key={v} className={style === v ? 'on' : ''} onClick={() => setStyle(v)}>{l}</button>)}</div>
              <label className="rng">Size<input type="range" min="12" max="70" value={size} onChange={(e) => setSize(+e.target.value)} /></label>
            </div>
            <div className="bases">
              {product && <button type="button" className="on" title={product.name}><img src={asset(product.img)} alt="" /></button>}
              {!product && S.bases.map((b, i) => <button type="button" key={b} className={baseI === i ? 'on' : ''} onClick={() => setBaseI(i)}><img src={asset(b)} alt="" /></button>)}
              {product && <button type="button" className="link" onClick={() => setProduct(null)}>Show other {S.k.toLowerCase()}</button>}
            </div>
            <small className="mock-note">Rough preview only — we’ll send you a proper design proof before production.</small>
          </div>

          <form className="st-col st-form" onSubmit={submit}>
            <div className="st-step"><span>4</span> Your details</div>
            <div className="two"><input required placeholder="Your name *" value={f.name} onChange={set('name')} /><input required type="tel" inputMode="tel" pattern="[0-9+ ()-]{8,}" title="Enter a valid phone number" placeholder="Phone / WhatsApp *" value={f.phone} onChange={set('phone')} /></div>
            <div className="two"><input type="email" placeholder="Email (optional)" value={f.email} onChange={set('email')} /><input placeholder="Company / occasion" value={f.company} onChange={set('company')} /></div>
            <div className="two"><input required type="number" min="1" placeholder="Quantity *" value={f.qty} onChange={set('qty')} /><input type="number" min="0" placeholder="Budget / gift (₹)" value={f.budget} onChange={set('budget')} /></div>
            <div className="two"><label>Needed by<input type="date" value={f.date} onChange={set('date')} /></label><label>Delivery city<input value={f.city} onChange={set('city')} /></label></div>
            <textarea rows="3" placeholder="Anything else? Colours, packaging, delivery address…" value={f.note} onChange={set('note')} />
            <div className="st-sum">
              <span>{S.k}</span><span>{files.length} file{files.length === 1 ? '' : 's'}</span><span>{pers.length} option{pers.length === 1 ? '' : 's'}</span>
            </div>
            <button className="btn gold wide" type="submit">Send customisation request →</button>
            <small className="st-privacy">Your details and files are emailed to Xenia Collections only.</small>
            <AnimatePresence>{flow && <SendFlow key={flow} text={text} files={files} onClose={() => setFlow(false)}
              email={{ subject: `New customisation enquiry – ${S.k} – ${f.name}`, fields: { Name: f.name, Phone: f.phone, email: f.email, Category: S.k, Quantity: f.qty, 'Needed by': f.date } }} />}</AnimatePresence>
          </form>
        </div>
      </div>
    </section>
  )
}
