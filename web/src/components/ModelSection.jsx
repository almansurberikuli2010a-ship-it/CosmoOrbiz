import { fmt, useI18n } from '../i18n/index.jsx'

// «Слайд» о модели: как устроена связка нейросеть + физика и честные цифры.
// Цифры приходят с сервера (/api/status) — их считает train.py на тестовых спутниках.
export default function ModelSection({ status }) {
  const { d, num } = useI18n()
  const m = d.model
  const s = status?.model || {}
  const pct = (x) => (x == null ? '—' : `${num(Math.round(x * 100))}%`)
  const objects = status?.catalog?.counts?.objects
  const metrics = [
    { big: s.auc_danger == null ? '—' : num(s.auc_danger, 2), text: m.m_auc },
    { big: pct(s.top30_catches), text: m.m_top30 },
    { big: s.dangerous_called_safe == null ? '—' : `${num(Math.round(s.dangerous_called_safe * 1000) / 10, 1)}%`, text: m.m_missed },
    { big: pct(s.danger_share), text: m.m_share },
  ]
  const samples = s.n_train && s.n_test ? num(s.n_train + s.n_test) : '—'
  return (
    <section id="model" className="model" aria-labelledby="model-title">
      <div className="model-inner">
        <p className="eyebrow">{m.eyebrow}</p>
        <h2 id="model-title">{m.title}</h2>
        <p className="model-lead">{m.lead}</p>

        <ol className="pipeline">
          {m.steps.map((st, i) => (
            <li key={i}>
              <span className="pipe-num">{i + 1}</span>
              <h3>{st.title}</h3>
              <p>{fmt(st.text, { objects: objects ? num(objects) : '≈19 500' })}</p>
            </li>
          ))}
        </ol>

        <h3 className="model-sub">{m.metrics_title}</h3>
        <div className="metric-grid">
          {metrics.map((x, i) => (
            <div key={i} className="metric">
              <b>{x.big}</b>
              <span>{x.text}</span>
            </div>
          ))}
        </div>
        <p className="model-note">{fmt(m.metrics_note, { n: samples })}</p>

        <div className="can-cannot">
          <div className="can">
            <h3>{m.can_title}</h3>
            <ul>{m.can.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
          <div className="cannot">
            <h3>{m.cannot_title}</h3>
            <ul>{m.cannot.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  )
}
