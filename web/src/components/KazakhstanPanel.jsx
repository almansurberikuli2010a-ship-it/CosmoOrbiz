import { useEffect, useState } from 'react'
import { fetchKazakhstan } from '../api.js'
import { fmt, useI18n } from '../i18n/index.jsx'

const LEVEL_COLOR = ['var(--r0)', 'var(--r1)', 'var(--r2)', 'var(--r3)']

function Chip({ label, level, levels }) {
  if (level == null) return <span className="kz-chip dim">{label}: —</span>
  return (
    <span className="kz-chip" style={{ color: LEVEL_COLOR[level], borderColor: LEVEL_COLOR[level] }}>
      {label}: {levels[level]}
    </span>
  )
}

// Подборка спутников Казахстана: оценка нейросети, вердикт точного расчёта, ближайшая угроза.
export default function KazakhstanPanel({ refreshKey, onPick, onClose }) {
  const { d, num } = useI18n()
  const k = d.kz
  const [items, setItems] = useState(null)
  useEffect(() => {
    let alive = true
    fetchKazakhstan().then((x) => alive && setItems(x)).catch(() => alive && setItems([]))
    return () => { alive = false }
  }, [refreshKey])

  return (
    <aside className="kz-panel" aria-label={k.title}>
      <div className="kz-head">
        <h2>{k.title}</h2>
        <button className="kz-close" onClick={onClose} aria-label={k.close}>×</button>
      </div>
      {!items ? (
        <p className="panel-msg"><i className="spinner" /></p>
      ) : (
        <ul className="kz-list">
          {items.map((s) => {
            const miss = s.nearest
              ? s.nearest.miss_km < 1 ? `${num(Math.round(s.nearest.miss_km * 1000))} ${d.panel.threats.m}` : `${num(s.nearest.miss_km, 1)} ${d.units.km}`
              : null
            return (
              <li key={s.norad}>
                <button onClick={() => onPick(s.norad)} title={k.fly}>
                  <b>{s.name}</b>
                  <span className="kz-kind">{k.kinds[s.kind]} · {num(Math.round(s.orbit.perigee_km))} {d.units.km}</span>
                  <span className="kz-chips">
                    <Chip label={k.model} level={s.model?.available ? s.model.level : null} levels={d.panel.levels} />
                    <Chip label={k.physics} level={s.physics_level} levels={d.panel.levels} />
                  </span>
                  <span className="kz-nearest">{s.nearest ? fmt(k.nearest, { name: s.nearest.name, miss }) : k.none}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <p className="kz-history">{k.history} <a href="https://celestrak.org/satcat/search.php" target="_blank" rel="noreferrer">{k.source}</a></p>
    </aside>
  )
}
