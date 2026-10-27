import { useEffect, useRef, useState } from 'react'
import { fetchCatalog, fetchObject, fetchRisks } from '../api.js'
import { fmt, useI18n } from '../i18n/index.jsx'
import KazakhstanPanel from '../components/KazakhstanPanel.jsx'
import ReplayHud from '../components/ReplayHud.jsx'
import SatellitePanel from '../components/SatellitePanel.jsx'
import { GlobeScene } from './GlobeScene.js'

const TYPE_KEY = { P: 'PAYLOAD', D: 'DEBRIS', R: 'ROCKET BODY' }
const SPEEDS = [1, 10, 100]
const COLOR_MODES = ['type', 'model', 'physics']

function aiStatus(status, d, num, locale) {
  if (!status) return { text: d.globe.ai.connecting, busy: true }
  if (status.state === 'offline') return { text: d.globe.ai.offline, error: true }
  if (status.state === 'error') return { text: d.globe.ai.error, error: true }
  if (status.batch?.state === 'running') {
    return { text: fmt(d.globe.ai.computing, { p: Math.round((status.batch.progress || 0) * 100) }), busy: true }
  }
  if (status.risk?.rated) {
    const time = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
      .format(new Date(status.risk.t0_utc))
    return { text: fmt(d.globe.ai.ready, { n: num(status.risk.rated), time: `${time} UTC` }) }
  }
  return { text: d.globe.ai.waiting, busy: true }
}

export default function GlobeView({ status }) {
  const { d, num, locale, pl } = useI18n()
  const holder = useRef(null)
  const sceneRef = useRef(null)
  const reqId = useRef(0)
  const lastReplay = useRef(null)
  const [phase, setPhase] = useState('loading') // loading | ready | error
  const [counts, setCounts] = useState(null)
  const [hover, setHover] = useState(null)
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState('globe')
  const [risk, setRisk] = useState({ state: 'idle' })
  const [simTime, setSimTime] = useState(() => Date.now())
  const [speed, setSpeed] = useState(1)
  const [colorMode, setColorMode] = useState('type')
  const [onlyDanger, setOnlyDanger] = useState(false)
  const [riskData, setRiskData] = useState(null)
  const [kzOpen, setKzOpen] = useState(false)
  const [replay, setReplay] = useState(null)
  // когда сервер досчитает угрозы, открытая панель перезапросит данные
  const threatsReady = status?.threats?.state === 'done'
  const riskT0 = status?.risk?.t0_utc

  useEffect(() => {
    const scene = new GlobeScene(holder.current, {
      onHover: (info, p) => setHover(info ? { ...info, x: p.x, y: p.y } : null),
      onSelect: (info) => {
        setSelected(info)
        if (info) {
          setKzOpen(false)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      },
      onMode: (m) => {
        setMode(m)
        if (m !== 'replay') setReplay(null)
      },
      onTime: setSimTime,
      onReady: () => setPhase('ready'),
      onReplay: setReplay,
    })
    sceneRef.current = scene
    let alive = true
    fetchCatalog()
      .then((cat) => {
        if (!alive) return
        scene.setCatalog(cat)
        setCounts(cat.counts)
      })
      .catch(() => alive && setPhase('error'))
    return () => {
      alive = false
      scene.dispose()
      sceneRef.current = null
    }
  }, [])

  // уровни риска всех спутников — для раскраски глобуса
  useEffect(() => {
    if (!riskT0) return
    let alive = true
    fetchRisks().then((r) => {
      if (!alive) return
      setRiskData(r)
      sceneRef.current?.setRiskData(r)
    }).catch(() => {})
    return () => { alive = false }
  }, [riskT0, threatsReady])

  useEffect(() => {
    sceneRef.current?.setColorMode(colorMode, onlyDanger)
  }, [colorMode, onlyDanger, phase])

  // оценка риска для выбранного объекта
  useEffect(() => {
    if (!selected) {
      setRisk({ state: 'idle' })
      return
    }
    const id = ++reqId.current
    setRisk({ state: 'loading' })
    fetchObject(selected.norad)
      .then((data) => {
        if (id !== reqId.current) return
        setRisk({ state: 'done', data })
        sceneRef.current?.setLevel(data.model?.available ? data.model.level : null)
        sceneRef.current?.setThreats(data.threats?.available ? data.threats.items : [])
      })
      .catch(() => id === reqId.current && setRisk({ state: 'error' }))
  }, [selected, threatsReady])

  // в виде со спутника колесо мыши приближает камеру, а не листает страницу
  useEffect(() => {
    document.documentElement.classList.toggle('scroll-locked', mode !== 'globe')
    return () => document.documentElement.classList.remove('scroll-locked')
  }, [mode])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (sceneRef.current?.replay) sceneRef.current.stopReplay()
      else sceneRef.current?.exit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const changeSpeed = (s) => {
    setSpeed(s)
    sceneRef.current?.setSpeed(s)
  }
  const startReplay = (threat) => {
    lastReplay.current = threat
    sceneRef.current?.replayThreat(threat)
  }
  const ai = aiStatus(status, d, num, locale)
  const timeText = new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date(simTime))
  const inSat = mode === 'flying-in' || mode === 'chase' || mode === 'replay'
  const physicsReady = !!riskData?.physics

  return (
    <section id="globe" className={`globe mode-${mode}`} aria-label={d.nav.globe}>
      <div className="globe-holder" ref={holder} />

      {phase !== 'ready' && (
        <div className="globe-loading">
          {phase === 'error' ? (
            <p className="error">{d.globe.load_error}</p>
          ) : (
            <p><i className="spinner" />{d.globe.loading}</p>
          )}
        </div>
      )}

      <div className="globe-intro">
        <p className="eyebrow">{d.globe.eyebrow}</p>
        <h1>Cosmo Orbiz</h1>
        <p className="tagline">{d.globe.tagline}</p>
        <p className="sub">{d.globe.sub}</p>
        {counts && (
          <ul className="stats">
            <li><b>{num(counts.objects)}</b>{pl(counts.objects, d.globe.stats.objects)}</li>
            <li><b>{num(counts.payloads)}</b>{pl(counts.payloads, d.globe.stats.payloads)}</li>
            <li><b>{num(counts.debris)}</b>{pl(counts.debris, d.globe.stats.debris)}</li>
          </ul>
        )}
        <button className="kz-open" onClick={() => setKzOpen(!kzOpen)}>
          <span className="kz-flag" aria-hidden="true" />{d.kz.button}
        </button>
      </div>

      <div className="globe-legend">
        <div className="color-ctl">
          <span className="color-title">{d.color.title}</span>
          <div className="seg" role="group" aria-label={d.color.title}>
            {COLOR_MODES.map((m) => (
              <button key={m} className={m === colorMode ? 'on' : ''} disabled={m === 'physics' && !physicsReady}
                onClick={() => setColorMode(m)}>{d.color[m]}</button>
            ))}
          </div>
        </div>
        {colorMode === 'type' ? (
          <div className="legend-row">
            <span><i className="type-dot t-P" />{d.globe.legend.payload}</span>
            <span><i className="type-dot t-D" />{d.globe.legend.debris}</span>
          </div>
        ) : (
          <>
            <div className="legend-row">
              {d.panel.levels.map((l, i) => (
                <span key={l} className={onlyDanger && i < 2 ? 'off' : ''}><i className={`type-dot lv-${i}`} />{l}</span>
              ))}
            </div>
            <label className="danger-only">
              <input type="checkbox" checked={onlyDanger} onChange={(e) => setOnlyDanger(e.target.checked)} />
              {d.color.only_danger}
            </label>
            {!riskData && <p className="hint">{d.color.loading}</p>}
          </>
        )}
        <p className="hint">{d.globe.hint}</p>
      </div>

      <div className="globe-hud">
        <div className={`ai-status ${ai.busy ? 'busy' : ''} ${ai.error ? 'error' : ''}`}>
          <i className="ai-dot" />
          <span>{ai.text}</span>
        </div>
        <div className="time-ctl">
          <span className="sim-time">{timeText} UTC</span>
          <div className="speed" role="group" aria-label={d.globe.time.speed}>
            {SPEEDS.map((s) => (
              <button key={s} className={s === speed && mode !== 'replay' ? 'on' : ''} onClick={() => changeSpeed(s)}>×{s}</button>
            ))}
            <button onClick={() => sceneRef.current?.resetTime()}>{d.globe.time.now}</button>
          </div>
        </div>
      </div>

      <a className="scroll-cue" href="#facts">{d.globe.scroll}<span aria-hidden="true">↓</span></a>

      {hover && (
        <div className="tooltip" style={{ left: hover.x + 14, top: hover.y + 14 }}>
          <b>{hover.name}</b>
          <span>{d.panel.types[TYPE_KEY[hover.type] || 'UNKNOWN']} · NORAD {hover.norad}</span>
        </div>
      )}

      {kzOpen && mode === 'globe' && (
        <KazakhstanPanel refreshKey={`${riskT0}-${threatsReady}`} onClose={() => setKzOpen(false)}
          onPick={(norad) => sceneRef.current?.selectNorad(norad)} />
      )}

      {selected && inSat && (
        <SatellitePanel selected={selected} risk={risk} onBack={() => sceneRef.current?.exit()}
          onPickThreat={(norad) => sceneRef.current?.selectNorad(norad)} onReplayThreat={startReplay} />
      )}

      {mode === 'replay' && replay && (
        <ReplayHud info={replay} onAgain={() => lastReplay.current && startReplay(lastReplay.current)}
          onClose={() => sceneRef.current?.stopReplay()} />
      )}
    </section>
  )
}
