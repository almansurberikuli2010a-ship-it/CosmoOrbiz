import { fmt, useI18n } from '../i18n/index.jsx'

// Подсказка во время повтора сближения: расстояние, время до/после, минимум.
export default function ReplayHud({ info, onAgain, onClose }) {
  const { d, num } = useI18n()
  const r = d.replay
  const fmtDist = (km) => (km < 1 ? `${num(Math.round(km * 1000))} ${d.panel.threats.m}` : `${num(km, km < 10 ? 2 : 0)} ${d.units.km}`)
  const t = Math.abs(info.dt)
  return (
    <div className="replay-hud" role="status">
      <div className="replay-title">{fmt(r.title, { name: info.name })}</div>
      <div className="replay-dist">
        <b>{fmtDist(info.distKm)}</b>
        <span>{r.distance}</span>
      </div>
      <div className="replay-time">
        {info.dt < 0 ? fmt(r.before, { t: num(t, 1) }) : fmt(r.after, { t: num(t, 1) })}
        {info.speed != null && info.speed < 0.66 && !info.done && <span> · {fmt(r.slow, { k: num(Math.round(1 / Math.max(info.speed, 0.01))) })}</span>}
      </div>
      {info.done && <div className="replay-min">{fmt(r.min, { d: fmtDist(info.minDistKm), v: num(info.relKms, 1) })}</div>}
      <p className="replay-note">{r.note}</p>
      <div className="replay-btns">
        <button onClick={onAgain}>{r.again}</button>
        <button onClick={onClose}>{r.close}</button>
      </div>
    </div>
  )
}
