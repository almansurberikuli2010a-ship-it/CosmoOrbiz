import { useState } from 'react'
import { fmt, useI18n } from '../i18n/index.jsx'
import RiskIndicator from './RiskIndicator.jsx'

const TYPE_KEY = { P: 'PAYLOAD', D: 'DEBRIS', R: 'ROCKET BODY' }

function formatUtc(iso, locale) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso)) + ' UTC'
}

const LEVEL_DOT = ['var(--r0)', 'var(--r1)', 'var(--r2)', 'var(--r3)']

function relTime(iso, t) {
  const min = Math.round((new Date(iso).getTime() - Date.now()) / 60000)
  const a = Math.abs(min)
  const text = a >= 60 ? `${Math.floor(a / 60)} ${t.hours} ${a % 60} ${t.minutes}` : `${a} ${t.minutes}`
  return fmt(min >= 0 ? t.in : t.ago, { t: text })
}

function Threats({ threats, modelLevel, onPick, onReplay }) {
  const { d, num } = useI18n()
  const t = d.panel.threats
  const [all, setAll] = useState(false)
  if (!threats) return null
  if (!threats.available) {
    if (threats.reason === 'not_payload') return null
    return (
      <div className="panel-block threats">
        <div className="block-title">{fmt(t.title, { h: 48 })}</div>
        <p className="panel-msg">
          {threats.reason === 'computing' && <i className="spinner" />}
          {threats.reason === 'disabled' ? t.disabled : t.computing}
        </p>
      </div>
    )
  }
  const items = all ? threats.items : threats.items.slice(0, 4)
  const lv = threats.level
  const cmp = modelLevel == null ? null : modelLevel === lv ? t.agree : modelLevel > lv ? t.model_higher : t.model_lower
  return (
    <div className="panel-block threats">
      <div className="block-title">{fmt(t.title, { h: threats.hours })}</div>
      <div className="verdict">
        <span>{t.verdict}:</span>
        <b style={{ color: LEVEL_DOT[lv] }}>{d.panel.levels[lv]}</b>
        {cmp && <em>{cmp}</em>}
      </div>
      {threats.items.length === 0 ? (
        <p className="panel-msg">{fmt(t.none, { h: threats.hours })}</p>
      ) : (
        <ul className="threat-list">
          {items.map((it) => (
            <li key={it.norad}>
              <button onClick={() => onPick?.(it.norad)} title={t.fly}>
                <i className="lvl-dot" style={{ background: LEVEL_DOT[it.level] }} />
                <span className="threat-main">
                  <b>{it.name}</b>
                  <span>
                    {relTime(it.tca_utc, t)} · {t.miss}{' '}
                    {it.miss_km < 1 ? `${num(Math.round(it.miss_km * 1000))} ${t.m}` : `${num(it.miss_km, 2)} ${d.units.km}`}
                    {' '}· {num(it.rel_speed_kms, 1)} {t.speed}
                  </span>
                </span>
                <span className="threat-pc">{it.pc.toExponential(1)}</span>
              </button>
              {onReplay && new Date(it.tca_utc).getTime() > Date.now() - 48 * 3600e3 && (
                <button className="threat-replay" onClick={() => onReplay(it)} title={d.replay.button} aria-label={d.replay.button}>▶</button>
              )}
            </li>
          ))}
        </ul>
      )}
      {threats.items.length > 4 && (
        <button className="btn-link" onClick={() => setAll(!all)}>{all ? t.less : fmt(t.more, { n: threats.items.length })}</button>
      )}
      {threats.n_intra > 0 && <p className="panel-source">{fmt(t.intra, { n: num(threats.n_intra) })}</p>}
    </div>
  )
}

export default function SatellitePanel({ selected, risk, onBack, onPickThreat, onReplayThreat }) {
  const { d, num, locale } = useI18n()
  const data = risk.state === 'done' ? risk.data : null
  const model = data?.model
  const typeLabel = d.panel.types[data?.type || TYPE_KEY[selected.type] || 'UNKNOWN'] || d.panel.types.UNKNOWN
  const orbit = data?.orbit

  let body
  if (risk.state === 'loading' || risk.state === 'idle') {
    body = <RiskIndicator loading />
  } else if (risk.state === 'error') {
    body = <p className="panel-msg">{d.panel.error}</p>
  } else if (model?.available) {
    body = (
      <>
        <RiskIndicator level={model.level} probabilities={model.probabilities} />
        <p className="panel-source">
          {model.source === 'batch'
            ? fmt(d.panel.source_batch, { time: formatUtc(model.t0_utc, locale) })
            : d.panel.source_live}
        </p>
      </>
    )
  } else {
    body = <p className="panel-msg">{model?.reason === 'not_payload' ? d.panel.not_payload : d.panel.failed}</p>
  }

  return (
    <aside className="sat-panel" aria-live="polite">
      <button className="btn-back" onClick={onBack}>{d.panel.back}</button>
      <div className="sat-head">
        <div className="sat-type">
          <span className={`type-dot t-${selected.type}`} />
          {typeLabel}
          {data?.constellation && <span className="sat-group"> · {data.constellation}</span>}
        </div>
        <h2 className="sat-name">{selected.name}</h2>
        <div className="sat-id">NORAD {selected.norad}</div>
      </div>

      <div className="panel-block">
        <div className="block-title">{d.panel.model_title}</div>
        {body}
      </div>

      <Threats threats={data?.threats} modelLevel={model?.available ? model.level : null} onPick={onPickThreat}
        onReplay={onReplayThreat} />

      {orbit && (
        <dl className="orbit-grid">
          <div><dt>{d.panel.orbit.perigee}</dt><dd>{num(Math.round(orbit.perigee_km))} {d.units.km}</dd></div>
          <div><dt>{d.panel.orbit.apogee}</dt><dd>{num(Math.round(orbit.apogee_km))} {d.units.km}</dd></div>
          <div><dt>{d.panel.orbit.inclination}</dt><dd>{num(orbit.inclination_deg, 1)}°</dd></div>
          <div><dt>{d.panel.orbit.period}</dt><dd>{num(orbit.period_min, 1)} {d.units.min}</dd></div>
          <div className="wide"><dt>{d.panel.orbit.epoch}</dt><dd>{formatUtc(orbit.epoch_utc, locale)}</dd></div>
        </dl>
      )}

      <p className="panel-note">{d.panel.note}</p>
      <p className="panel-hint">{d.panel.controls}</p>
    </aside>
  )
}
