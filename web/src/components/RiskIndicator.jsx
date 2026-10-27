import { useI18n } from '../i18n/index.jsx'

// Шкала из 4 полос: заполняется до уровня риска, который выдала нейросеть.
// Для «Среднего» и «Высокого» сверху появляется треугольник с восклицательным знаком.
export default function RiskIndicator({ level = null, probabilities = null, loading = false }) {
  const { d, num } = useI18n()
  const labels = d.panel.levels
  const warn = level != null && level >= 2
  return (
    <div className={`risk ${loading ? 'is-loading' : ''} ${level != null ? `lvl-${level}` : ''}`}>
      <div className={`risk-warning ${warn ? 'on' : ''}`} role={warn ? 'alert' : undefined} aria-hidden={!warn}>
        <svg viewBox="0 0 48 42" className="risk-triangle" aria-hidden="true">
          <path d="M24 3 L45 39 H3 Z" />
          <rect x="21.6" y="14" width="4.8" height="13.5" rx="2.2" />
          <circle cx="24" cy="32.6" r="2.7" />
        </svg>
        <span>{warn ? (level === 3 ? d.panel.warning_high : d.panel.warning_medium) : ''}</span>
      </div>

      <div className="risk-bars" role="meter" aria-valuemin={0} aria-valuemax={3}
        aria-valuenow={level ?? undefined} aria-valuetext={level != null ? labels[level] : d.panel.loading}>
        {labels.map((label, i) => (
          <div key={label} className={`risk-col ${level != null && i <= level ? 'filled' : ''} ${i === level ? 'current' : ''}`}>
            <div className="risk-bar-track">
              <div className={`risk-bar b${i}`} style={{ height: `${34 + i * 22}%`, transitionDelay: `${i * 90}ms` }} />
            </div>
            <span className="risk-label">{label}</span>
            {probabilities && <span className="risk-prob">{num(Math.round(probabilities[i] * 100))}%</span>}
          </div>
        ))}
      </div>

      <div className="risk-summary">
        {loading ? (
          <span className="risk-loading"><i className="spinner" />{d.panel.loading}</span>
        ) : level != null ? (
          <>
            <span className="risk-level-name">{labels[level]}</span>
            {probabilities && (
              <span className="risk-confidence">
                {d.panel.confidence}: {num(Math.round(probabilities[level] * 100))}%
              </span>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
