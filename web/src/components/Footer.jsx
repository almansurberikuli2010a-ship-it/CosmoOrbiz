import { fmt, useI18n } from '../i18n/index.jsx'

export default function Footer({ status }) {
  const { d, num } = useI18n()
  const f1 = status?.model?.macro_f1
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-logo">Cosmo Orbiz</div>
          <p>{d.footer.about}</p>
          {f1 != null && <p className="dim">{fmt(d.footer.model, { f1: num(f1, 2) })}</p>}
        </div>
        <div>
          <h3>{d.footer.sources_title}</h3>
          <ul>
            {d.footer.sources.map((s) => (
              <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>{s.note ? ` — ${s.note}` : ''}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="footer-disclaimer">{d.footer.disclaimer}</p>
    </footer>
  )
}
