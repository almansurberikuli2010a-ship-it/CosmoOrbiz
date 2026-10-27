import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n/index.jsx'

export default function Facts() {
  const { d } = useI18n()
  const f = d.facts
  const grid = useRef(null)

  // карточки мягко появляются, когда до них доходит прокрутка
  useEffect(() => {
    const cards = grid.current?.querySelectorAll('.fact') || []
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      }
    }, { threshold: 0.15 })
    cards.forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [f])

  return (
    <section id="facts" className="facts" aria-labelledby="facts-title">
      <div className="facts-inner">
        <p className="eyebrow">{f.eyebrow}</p>
        <h2 id="facts-title">{f.title}</h2>
        <p className="facts-lead">{f.lead}</p>
        <div className="facts-grid" ref={grid}>
          {f.items.map((it, i) => (
            <article key={i} className={`fact ${it.image ? 'has-image' : ''} ${it.ours ? 'ours' : ''}`}>
              {it.image && (
                <figure>
                  <img src={it.image.src} alt={it.image.alt} loading="lazy" />
                  <figcaption>{it.image.credit}</figcaption>
                </figure>
              )}
              <div className="fact-body">
                {it.ours && <span className="fact-tag">{f.ours_label}</span>}
                <div className="fact-big">{it.big.replace(/ /g, ' ')}</div>
                <p>{it.text}</p>
                {it.source && (
                  <a className="fact-source" href={it.source.url} target="_blank" rel="noreferrer">
                    {f.source_label}: {it.source.label}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
