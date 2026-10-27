import { useEffect, useState } from 'react'
import { fetchStats } from '../api.js'
import { fmt, useI18n } from '../i18n/index.jsx'

const LEVEL_COLOR = ['var(--r0)', 'var(--r1)', 'var(--r2)', 'var(--r3)']
const GROUP_NAMES = { STARLINK: 'Starlink', ONEWEB: 'OneWeb', KUIPER: 'Kuiper', QIANFAN: 'Qianfan', HULIANWANG: 'Hulianwang (Guowang)', YAOGAN: 'Yaogan', FLOCK: 'Flock (Planet)', IRIDIUM: 'Iridium', LEMUR: 'Lemur (Spire)', JILIN: 'Jilin' }

function Stacked({ counts }) {
  const total = counts.reduce((a, b) => a + b, 0) || 1
  return (
    <div className="stacked">
      {counts.map((c, i) => c > 0 && (
        <i key={i} style={{ width: `${(100 * c) / total}%`, background: LEVEL_COLOR[i] }} />
      ))}
    </div>
  )
}

// Живая статистика: группировки в зоне риска и проверка нейросети точным расчётом на сегодняшних данных.
export default function LiveSection({ status }) {
  const { d, num, locale } = useI18n()
  const l = d.live
  const [stats, setStats] = useState(null)
  const key = `${status?.risk?.t0_utc}-${status?.threats?.state}`
  useEffect(() => {
    if (!status?.risk?.t0_utc) return
    let alive = true
    fetchStats().then((s) => alive && setStats(s)).catch(() => {})
    return () => { alive = false }
  }, [key])

  const pct = (x, digits = 0) => (x == null ? '—' : `${num(Math.round(x * 100 * 10 ** digits) / 10 ** digits, digits)}%`)
  const time = stats?.t0_utc
    ? new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      .format(new Date(stats.t0_utc)) + ' UTC'
    : '—'

  return (
    <section id="live" className="live" aria-labelledby="live-title">
      <div className="live-inner">
        <p className="eyebrow"><i className="live-dot" />{l.eyebrow}</p>
        <h2 id="live-title">{l.title}</h2>
        {!stats?.available ? (
          <p className="live-lead"><i className="spinner" />{l.computing}</p>
        ) : (
          <>
            <p className="live-lead">{fmt(l.lead, { n: num(stats.n), time })}</p>
            <div className="live-grid">
              <div className="live-card">
                <h3>{l.groups_title}</h3>
                <p className="live-note">{l.groups_note}</p>
                <ul className="groups">
                  {stats.groups.map((g) => {
                    const share = (arr) => (arr[2] + arr[3]) / Math.max(1, g.count)
                    return (
                      <li key={g.name}>
                        <div className="group-head">
                          <b>{g.name === 'OTHER' ? l.other : GROUP_NAMES[g.name] || g.name}</b>
                          <span>{num(g.count)} {l.sats}</span>
                        </div>
                        <div className="group-bars">
                          <span className="bar-label">{l.physics}</span>
                          <Stacked counts={g.physics} />
                          <b className="bar-val">{pct(share(g.physics))}</b>
                          <span className="bar-label">{l.model}</span>
                          <Stacked counts={g.model} />
                          <b className="bar-val">{pct(share(g.model))}</b>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="legend-row small">
                  {d.panel.levels.map((x, i) => <span key={x}><i className={`type-dot lv-${i}`} />{x}</span>)}
                </div>
              </div>

              <div className="live-card">
                <h3>{l.check_title}</h3>
                <p className="live-note">{l.check_lead}</p>
                <div className="matrix" role="table">
                  <div className="m-corner"><span>{l.rows}</span><span>{l.cols}</span></div>
                  {d.panel.levels.map((x, j) => <div key={x} className="m-col" style={{ color: LEVEL_COLOR[j] }}>{x}</div>)}
                  {stats.confusion.map((row, i) => {
                    const rowSum = row.reduce((a, b) => a + b, 0) || 1
                    return [
                      <div key={`h${i}`} className="m-row" style={{ color: LEVEL_COLOR[i] }}>{d.panel.levels[i]}</div>,
                      ...row.map((c, j) => (
                        <div key={`${i}-${j}`} className={`m-cell ${i === j ? 'diag' : ''}`}
                          style={{ background: `rgba(143, 208, 255, ${(0.06 + 0.5 * c / rowSum).toFixed(3)})` }}>
                          <b>{num(c)}</b>
                          <span>{pct(c / rowSum)}</span>
                        </div>
                      )),
                    ]
                  })}
                </div>
                <div className="kpis">
                  <div><b>{pct(stats.agreement)}</b><span>{l.agreement}</span></div>
                  <div><b>{pct(stats.within_one)}</b><span>{l.within}</span></div>
                  <div><b>{stats.auc_danger == null ? '—' : num(stats.auc_danger, 2)}</b><span>{l.auc}</span></div>
                  <div><b>{pct(stats.top30_catches)}</b><span>{l.top30}</span></div>
                  <div><b>{pct(stats.dangerous_called_safe, 1)}</b><span>{l.missed}</span></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
