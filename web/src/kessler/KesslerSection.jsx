import { useEffect, useRef, useState } from 'react'
import { fmt, useI18n } from '../i18n/index.jsx'
import { KesslerScene } from './KesslerScene.js'

// Границы шагов текста на шкале прокрутки (совпадают с событиями сцены)
const STEP_STARTS = [0, 0.1, 0.26, 0.4, 0.58, 0.8]

function stepAt(p) {
  let i = 0
  while (i < STEP_STARTS.length - 1 && p >= STEP_STARTS[i + 1]) i++
  return i
}

export default function KesslerSection({ status }) {
  const { d, num, pl } = useI18n()
  const k = d.kessler
  const sectionRef = useRef(null)
  const holder = useRef(null)
  const sceneRef = useRef(null)
  const [p, setP] = useState(0)
  const [stats, setStats] = useState({ collisions: 0, fragments: 0 })

  useEffect(() => {
    const scene = new KesslerScene(holder.current)
    sceneRef.current = scene
    let raf = 0
    const update = () => {
      raf = 0
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const span = rect.height - window.innerHeight
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return // не на экране
      const prog = Math.min(1, Math.max(0, -rect.top / Math.max(1, span)))
      scene.setProgress(prog)
      setP(prog)
      setStats(scene.stats(prog))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
      scene.dispose()
    }
  }, [])

  const active = stepAt(p)
  const final = active === STEP_STARTS.length - 1
  const rated = status?.risk?.rated || status?.catalog?.counts?.payloads

  return (
    <>
      <section id="kessler" className={`kessler ${final ? 'is-final' : ''}`} ref={sectionRef} aria-label={k.title}>
        <div className="kessler-sticky">
          <div className="kessler-holder" ref={holder} />
          <div className="kessler-shade" style={{ opacity: final ? 0.62 : 0.0 }} />
          <header className="kessler-head" style={{ opacity: p < 0.06 ? 1 : 0 }}>
            <p className="eyebrow">{k.eyebrow}</p>
            <h2>{k.title}</h2>
            <p className="kessler-lead">{k.lead}</p>
            <p className="kessler-scrollhint">{k.scroll_hint}<span aria-hidden="true">↓</span></p>
          </header>

          <div className="k-steps">
            {k.steps.map((s, i) => (
              <article key={i} className={`k-step ${i === active && p >= 0.04 ? 'on' : ''} ${i === k.steps.length - 1 ? 'k-final' : ''}`}>
                <span className="k-step-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                {s.source && <a className="k-source" href={s.source.url} target="_blank" rel="noreferrer">{s.source.label}</a>}
              </article>
            ))}
          </div>

          <div className="k-counters" style={{ opacity: p > 0.22 ? 1 : 0 }}>
            <div><b>{num(stats.collisions)}</b><span>{pl(stats.collisions, k.counters.collisions)}</span></div>
            <div><b>{num(stats.fragments)}</b><span>{pl(stats.fragments, k.counters.fragments)}</span></div>
            <p>{k.caption}</p>
          </div>

          <div className="k-progress" aria-hidden="true"><i style={{ transform: `scaleY(${p})` }} /></div>
        </div>
      </section>

      <section className="help" aria-labelledby="help-title">
        <div className="help-inner">
          <p className="eyebrow">{k.help.eyebrow}</p>
          <h2 id="help-title">{k.help.title}</h2>
          <p className="help-lead">{k.help.lead}</p>
          <ol className="help-steps">
            {k.help.steps.map((s, i) => (
              <li key={i}>
                <span className="help-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{fmt(s.text, { n: rated ? num(rated) : '—', top30: status?.model?.top30_catches != null ? `${num(Math.round(status.model.top30_catches * 100))}%` : '—' })}</p>
              </li>
            ))}
          </ol>
          <p className="help-note">{k.help.note}</p>
        </div>
      </section>
    </>
  )
}
