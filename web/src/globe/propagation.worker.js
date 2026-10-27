// Отдельный поток: считает положения всех объектов по SGP4 (satellite.js),
// чтобы интерфейс не тормозил. Положения — в единицах сцены (радиус Земли = 1).
import { propagate, twoline2satrec } from 'satellite.js'

const RE_KM = 6378.137
let recs = []

self.onmessage = (e) => {
  const m = e.data
  if (m.type === 'init') {
    recs = m.tles.map(([l1, l2]) => {
      try {
        return twoline2satrec(l1, l2)
      } catch {
        return null
      }
    })
    self.postMessage({ type: 'ready', count: recs.length })
  } else if (m.type === 'positions') {
    const date = new Date(m.time)
    const out = new Float32Array(recs.length * 3) // нули = объект не посчитался (спрятан внутри Земли)
    for (let i = 0; i < recs.length; i++) {
      const rec = recs[i]
      if (!rec) continue
      let pv = null
      try {
        pv = propagate(rec, date)
      } catch {
        pv = null
      }
      const p = pv && pv.position
      if (!p || typeof p !== 'object' || !Number.isFinite(p.x)) continue
      out[3 * i] = p.x / RE_KM
      out[3 * i + 1] = p.z / RE_KM
      out[3 * i + 2] = -p.y / RE_KM
    }
    self.postMessage({ type: 'positions', time: m.time, buffer: out.buffer }, [out.buffer])
  }
}
