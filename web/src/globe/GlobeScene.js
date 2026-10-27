import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { gstime, propagate, twoline2satrec } from 'satellite.js'
import { createEarth } from './earth.js'
import { createStars } from './stars.js'
import { CHASE_DISTANCE_M, createSatelliteModel, modelKind } from './satelliteModels.js'
import { M, easeInOutCubic, slerpUnit, sunDirection, temeToScene } from './coords.js'

// 3D-сцена главного экрана: Земля, все объекты каталога, выбор спутника и
// перелёт камеры к нему. Режимы: globe → flying-in → chase → flying-out → globe.
//
// Точность: в виде со спутника камера в метрах от модели, а Земля — в тысячах
// километров. Поэтому мир сдвигается так, что камера всегда в нуле
// (floating origin), а модель рисуется вторым проходом со своими near/far.

const TYPE_COLOR = { P: '#9ad8ff', D: '#ff9f5e', R: '#c6b5ff', U: '#cfcfcf' }
export const LEVEL_COLOR = ['#3ecf8e', '#f5d547', '#ff9b3d', '#ff4d4f']
const FLY_IN_MS = 2800
const FLY_OUT_MS = 2300
const PICK_PX = 10
const GLOBE_UP = new THREE.Vector3(0, 1, 0)
const clamp01 = (x) => Math.min(1, Math.max(0, x))

function pointsMaterial(size) {
  return new THREE.ShaderMaterial({
    uniforms: { uSize: { value: size } },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      uniform float uSize;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uSize;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(vColor, smoothstep(0.5, 0.12, d));
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

function ringTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  g.strokeStyle = '#ffffff'
  g.lineWidth = 7
  g.beginPath()
  g.arc(64, 64, 50, 0, Math.PI * 2)
  g.stroke()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export class GlobeScene {
  constructor(container, callbacks = {}) {
    this.container = container
    this.cb = callbacks
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }))
    r.setPixelRatio(this.pixelRatio)
    r.outputColorSpace = THREE.SRGBColorSpace
    r.autoClear = false
    r.setClearColor(0x020308, 1)
    this.canvas = r.domElement
    this.canvas.className = 'globe-canvas'
    container.appendChild(this.canvas)

    this.scene = new THREE.Scene()
    this.world = new THREE.Group() // всё, что привязано к Земле; сдвигается на -origin
    this.scene.add(this.world)
    this.nearScene = new THREE.Scene() // модель выбранного объекта

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.01, 400)
    this.camera.position.set(1.9, 1.5, 3.1)
    this.origin = new THREE.Vector3()
    this.camAbs = new THREE.Vector3().copy(this.camera.position)

    this.controls = new OrbitControls(this.camera, this.canvas)
    Object.assign(this.controls, {
      enableDamping: true, dampingFactor: 0.08, enablePan: false,
      minDistance: 1.2, maxDistance: 12, rotateSpeed: 0.55, zoomSpeed: 0.9,
    })
    this.controls.addEventListener('start', () => { this.userMoved = true })

    this.earth = createEarth(r)
    this.world.add(this.earth.group)
    this.stars = createStars()
    this.scene.add(this.stars)

    // выбранный объект: кольцо, орбита; наведённый — кольцо поменьше
    const ring = ringTexture()
    this.marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: ring, color: 0xffffff, sizeAttenuation: false, depthTest: false, transparent: true }))
    this.hoverMarker = new THREE.Sprite(new THREE.SpriteMaterial({ map: ring, color: 0xffffff, sizeAttenuation: false, depthTest: false, transparent: true, opacity: 0.7 }))
    this.marker.visible = this.hoverMarker.visible = false
    this.marker.renderOrder = this.hoverMarker.renderOrder = 10
    this.world.add(this.marker, this.hoverMarker)
    // метки объектов, которые угрожают выбранному спутнику (по точному расчёту)
    this.threats = []
    this.replayMarker = new THREE.Sprite(new THREE.SpriteMaterial({ map: ring, sizeAttenuation: false, depthTest: false, transparent: true }))
    this.replayMarker.visible = false
    this.replayMarker.renderOrder = 11
    this.world.add(this.replayMarker)
    this.threatMarkers = Array.from({ length: 8 }, () => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: ring, sizeAttenuation: false, depthTest: false, transparent: true, opacity: 0.9 }))
      s.visible = false
      s.renderOrder = 9
      this.world.add(s)
      return s
    })
    const orbitGeo = new THREE.BufferGeometry()
    orbitGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(361 * 3), 3))
    this.orbitLine = new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({ color: 0x9ad8ff, transparent: true, opacity: 0.7, depthWrite: false }))
    this.orbitLine.frustumCulled = false
    this.orbitLine.visible = false
    this.world.add(this.orbitLine)

    // свет для модели (на Землю свет не влияет: у неё свой шейдер)
    this.sunDir = new THREE.Vector3(1, 0, 0)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 3.0)
    this.nearScene.add(this.sunLight, this.sunLight.target)
    this.nearScene.add(new THREE.HemisphereLight(0x9cc4ff, 0x16304d, 0.55))
    this.nearScene.add(new THREE.AmbientLight(0xffffff, 0.06))
    // мягкий «фонарь» от камеры: на ночной стороне Земли модель иначе была бы чёрной
    this.headlight = new THREE.PointLight(0xdfe8ff, 0.9, 0, 0)
    this.nearScene.add(this.headlight)
    // линия «спутник — угроза» в повторе сближения (координаты относительно камеры)
    const lg = new THREE.BufferGeometry()
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    this.replayLine = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0xff9b3d, transparent: true, opacity: 0.85 }))
    this.replayLine.frustumCulled = false
    this.replayLine.visible = false
    this.nearScene.add(this.replayLine)

    // время симуляции
    this.simTime = Date.now()
    this.speed = 1
    this.lastFrame = performance.now()
    this.lastTimeEmit = 0

    // каталог и положения
    this.n = 0
    this.rows = []
    this.frames = []
    this.pending = false
    this.workerReady = false
    this.firstFrame = false

    // выбор и камера
    this.mode = 'globe'
    this.sel = null
    this.selPos = new THREE.Vector3()
    this.selVel = new THREE.Vector3()
    this.selDist = Infinity
    this.hovered = -1
    this.chaseAz = 0.55
    this.chaseEl = 0.26
    this.chaseDistM = 25
    this.viewShift = 0 // сдвиг картинки по горизонтали (доля ширины), плавно меняется
    this.level = null

    this._tmp = { a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), d: new THREE.Vector3(), look: new THREE.Vector3(), up: new THREE.Vector3(), R: new THREE.Vector3(), V: new THREE.Vector3(), N: new THREE.Vector3() }
    this._pv = new THREE.Matrix4()

    this._bindEvents()
    this._resize()
    this.ro = new ResizeObserver(() => this._resize())
    this.ro.observe(container)
    this.visible = true
    this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting }, { threshold: 0 })
    this.io.observe(container)
    this._loop = this._loop.bind(this)
    this.raf = requestAnimationFrame(this._loop)
  }

  // ------------------------------------------------------------------ каталог
  setCatalog(catalog) {
    const rows = catalog.objects
    this.rows = rows
    this.n = rows.length
    this.indexOf = new Map(rows.map((row, i) => [row[0], i]))
    this.positions = new Float32Array(this.n * 3)
    const colors = new Float32Array(this.n * 3)
    const c = new THREE.Color()
    rows.forEach((row, i) => {
      c.set(TYPE_COLOR[row[2]] || TYPE_COLOR.U)
      colors[3 * i] = c.r
      colors[3 * i + 1] = c.g
      colors[3 * i + 2] = c.b
    })
    this.baseColors = colors.slice()
    this.hidden = new Uint8Array(this.n)
    const geo = new THREE.BufferGeometry()
    const pa = new THREE.BufferAttribute(this.positions, 3)
    pa.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('position', pa)
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50)
    this.points = new THREE.Points(geo, pointsMaterial(2.3 * this.pixelRatio))
    this.points.frustumCulled = false
    this.world.add(this.points)

    this._applyColors()
    this.worker = new Worker(new URL('./propagation.worker.js', import.meta.url), { type: 'module' })
    this.worker.onmessage = (e) => this._onWorker(e.data)
    this.worker.postMessage({ type: 'init', tles: rows.map((row) => [row[3], row[4]]) })
  }

  _onWorker(m) {
    if (m.type === 'ready') {
      this.workerReady = true
      return
    }
    if (m.type !== 'positions') return
    this.pending = false
    this.frames.push({ time: m.time, pos: new Float32Array(m.buffer) })
    this.frames.sort((a, b) => a.time - b.time)
    if (!this.firstFrame) {
      this.firstFrame = true
      this.positions.set(this.frames[0].pos)
      this.points.geometry.attributes.position.needsUpdate = true
      this.cb.onReady?.()
    }
  }

  _request(time) {
    this.pending = true
    this.worker.postMessage({ type: 'positions', time })
  }

  _updatePositions() {
    if (!this.workerReady) return
    const t = this.simTime
    const step = Math.max(1500, Math.min(600000, this.speed * 1500)) // шаг между расчётами, мс времени симуляции
    let fr = this.frames
    if (fr.length && fr[0].time > t + 3 * step) fr = this.frames = [] // время прыгнуло назад
    while (fr.length > 2 && fr[1].time <= t) fr.shift()
    if (fr.length >= 2 && fr[0].time <= t && t <= fr[1].time) {
      this._lerp(fr[0].pos, fr[1].pos, (t - fr[0].time) / (fr[1].time - fr[0].time || 1))
    } else if (fr.length) {
      this.positions.set(t > fr[fr.length - 1].time ? fr[fr.length - 1].pos : fr[0].pos)
    }
    if (fr.length) this.points.geometry.attributes.position.needsUpdate = true
    const last = fr[fr.length - 1]
    if (!this.pending) {
      if (!last || last.time < t - step) this._request(t + Math.max(400, this.speed * 400))
      else if (last.time < t + step) this._request(last.time + step)
    }
  }

  _lerp(a, b, k) {
    const out = this.positions
    for (let i = 0; i < a.length; i += 3) {
      const ax = a[i], ay = a[i + 1], az = a[i + 2]
      const bx = b[i], by = b[i + 1], bz = b[i + 2]
      if (ax === 0 && ay === 0 && az === 0) { out[i] = bx; out[i + 1] = by; out[i + 2] = bz; continue }
      if (bx === 0 && by === 0 && bz === 0) { out[i] = ax; out[i + 1] = ay; out[i + 2] = az; continue }
      out[i] = ax + (bx - ax) * k
      out[i + 1] = ay + (by - ay) * k
      out[i + 2] = az + (bz - az) * k
    }
  }

  // ------------------------------------------------------------------ выбор
  select(index) {
    if (index < 0 || index >= this.n) return
    if (this.replay) this.stopReplay()
    const row = this.rows[index]
    let satrec = null
    try { satrec = twoline2satrec(row[3], row[4]) } catch { return }
    const kind = modelKind(row[1], row[2])
    this.sel = { index, row, satrec, kind }
    this.level = null
    this.setThreats([])
    this.orbitLine.material.color.set(TYPE_COLOR[row[2]] || TYPE_COLOR.U)
    this.marker.material.color.set(0xffffff)
    if (this.model) {
      this.nearScene.remove(this.model)
      this.model.traverse((o) => o.geometry?.dispose())
    }
    this.model = createSatelliteModel(kind)
    this.model.scale.setScalar(M)
    this.model.visible = false
    this.nearScene.add(this.model)
    this.chaseDistM = CHASE_DISTANCE_M[kind]
    this.chaseAz = 0.55
    this.chaseEl = 0.26
    if (!this._updateSelection(new Date(this.simTime))) {
      this.sel = null
      return
    }
    this._buildOrbit()
    this.cb.onSelect?.({ norad: row[0], name: row[1], type: row[2], kind })
    this._startFlyIn()
  }

  // ------------------------------------------------------------------ раскраска по риску
  /** data — ответ /api/risks: { norad[], model[], physics[] | null } */
  setRiskData(data) {
    this.riskData = data
    this._applyColors()
  }

  /** mode: 'type' | 'model' | 'physics'; onlyDanger — показывать только «Средний» и «Высокий». */
  setColorMode(mode, onlyDanger) {
    this.colorMode = mode
    this.onlyDanger = onlyDanger && mode !== 'type'
    this._applyColors()
  }

  _applyColors() {
    if (!this.points) return
    const attr = this.points.geometry.attributes.aColor
    const col = attr.array
    const mode = this.colorMode || 'type'
    this.hidden.fill(0)
    if (mode === 'type') {
      col.set(this.baseColors)
      attr.needsUpdate = true
      return
    }
    const lv = new Int8Array(this.n).fill(-1)
    const arr = this.riskData && (mode === 'physics' ? this.riskData.physics : this.riskData.model)
    if (arr) this.riskData.norad.forEach((n, k) => {
      const i = this.indexOf.get(n)
      if (i != null && arr[k] != null) lv[i] = arr[k]
    })
    const rgb = LEVEL_COLOR.map((h) => new THREE.Color(h))
    for (let i = 0; i < this.n; i++) {
      const l = lv[i]
      if (this.onlyDanger && l < 2) {
        this.hidden[i] = 1
        col[3 * i] = col[3 * i + 1] = col[3 * i + 2] = 0 // при сложении цветов чёрная точка не видна
      } else if (l < 0) {
        col[3 * i] = col[3 * i + 1] = col[3 * i + 2] = 0.16 // обломки и неоценённые — тусклые
      } else {
        col[3 * i] = rgb[l].r
        col[3 * i + 1] = rgb[l].g
        col[3 * i + 2] = rgb[l].b
      }
    }
    attr.needsUpdate = true
  }

  // ------------------------------------------------------------------ повтор сближения
  /** Показать сближение выбранного спутника с угрозой: время перематывается к моменту
   *  наибольшего сближения (TCA) и проигрывается с замедлением возле него. */
  replayThreat(threat) {
    if (!this.sel) return
    const i = this.indexOf?.get(threat.norad)
    if (i == null) return
    let satrec = null
    try { satrec = twoline2satrec(this.rows[i][3], this.rows[i][4]) } catch { return }
    if (this.replay?.model) this.nearScene.remove(this.replay.model)
    const model = createSatelliteModel(modelKind(this.rows[i][1], this.rows[i][2]))
    model.scale.setScalar(M)
    this.nearScene.add(model)
    const tca = Date.parse(threat.tca_utc)
    this.replay = {
      i, satrec, model, tca, level: threat.level, name: this.rows[i][1], missKm: threat.miss_km,
      pos: new THREE.Vector3(), minDist: Infinity, frozen: false,
    }
    this.replayLine.visible = true
    this.replayLine.material.color.set(LEVEL_COLOR[threat.level ?? 2])
    this.replayMarker.material.color.set(LEVEL_COLOR[threat.level ?? 2])
    this.simTime = tca - 9000
    this.frames = []
    this._setMode('replay')
  }

  stopReplay() {
    if (!this.replay) return
    this.nearScene.remove(this.replay.model)
    this.replay = null
    this.replayLine.visible = false
    this.speed = this.userSpeed ?? 1
    this.resetTime()
    if (this.mode === 'replay') this._setMode('chase')
  }

  _updateReplay(date) {
    const rp = this.replay
    let pv = null
    try { pv = propagate(rp.satrec, date) } catch { pv = null }
    if (!pv || !pv.position || !Number.isFinite(pv.position.x)) return
    temeToScene(pv.position, rp.pos)
    const v = temeToScene(pv.velocity, this._tmp.b)
    const distKm = rp.pos.distanceTo(this.selPos) * 6378.137
    const relKms = v.sub(this.selVel).length() * 6378.137
    const dt = (this.simTime - rp.tca) / 1000
    rp.minDist = Math.min(rp.minDist, distKm)
    // далеко — время идёт как есть, вблизи — замедляется (до 30 раз); через 9 с после сближения — пауза
    if (!rp.frozen) this.speed = Math.min(1, Math.max(0.02, distKm / 60))
    if (dt > 9 && !rp.frozen) {
      rp.frozen = true
      this.speed = 0
    }
    if (performance.now() - (rp.lastEmit || 0) > 100 || rp.frozen) {
      rp.lastEmit = performance.now()
      this.cb.onReplay?.({ name: rp.name, distKm, relKms, dt, minDistKm: rp.minDist, done: rp.frozen, speed: this.speed })
    }
    if (!rp.axis) {
      // камера сбоку от плоскости встречи: оба объекта видны, угроза проходит поперёк кадра
      const d = this._tmp.c.copy(rp.pos).sub(this.selPos)
      const n = new THREE.Vector3().crossVectors(d, this._tmp.b.copy(v)).normalize()
      if (n.lengthSq() < 0.5) n.copy(this.selPos).normalize()
      rp.axis = n
    }
  }

  /** Перелететь к объекту по номеру NORAD. */
  selectNorad(norad) {
    const i = this.indexOf?.get(norad)
    if (i != null && i !== this.sel?.index) this.select(i)
  }

  /** Отметить объекты-угрозы: items = [{ norad, level }]. */
  setThreats(items) {
    this.threats = (items || [])
      .map((it) => ({ i: this.indexOf?.get(it.norad), level: it.level }))
      .filter((t) => t.i != null)
      .slice(0, this.threatMarkers.length)
    this.threatMarkers.forEach((m, k) => {
      m.visible = false
      if (this.threats[k]) m.material.color.set(LEVEL_COLOR[this.threats[k].level])
    })
  }

  /** Цвет орбиты и метки по уровню риска (0..3) или null. */
  setLevel(level) {
    this.level = level
    const col = level == null ? (TYPE_COLOR[this.sel?.row[2]] || TYPE_COLOR.U) : LEVEL_COLOR[level]
    this.orbitLine.material.color.set(col)
    this.marker.material.color.set(level == null ? 0xffffff : col)
  }

  exit() {
    if (!this.sel || this.mode === 'globe' || this.mode === 'flying-out') return
    if (this.replay) this.stopReplay()
    const t = this._tmp
    this.fly = {
      t0: performance.now(), dur: FLY_OUT_MS,
      from: this.camAbs.clone(),
      to: t.a.copy(this.selPos).normalize().multiplyScalar(3.6).clone(),
      upFrom: this.camera.up.clone(),
    }
    this._setMode('flying-out')
  }

  _startFlyIn() {
    const look = this.mode === 'globe' ? new THREE.Vector3() : this._lookAbs?.clone() ?? new THREE.Vector3()
    if (this.mode === 'globe') this.camAbs.copy(this.camera.position)
    this.fly = { t0: performance.now(), dur: FLY_IN_MS, from: this.camAbs.clone(), lookFrom: look, upFrom: this.camera.up.clone() }
    this.controls.enabled = false
    this._setMode('flying-in')
  }

  _setMode(mode) {
    this.mode = mode
    this.cb.onMode?.(mode)
  }

  /** Точное положение выбранного объекта на дату. false — объект не посчитался. */
  _updateSelection(date) {
    if (!this.sel) return false
    let pv = null
    try { pv = propagate(this.sel.satrec, date) } catch { pv = null }
    const p = pv && pv.position
    if (!p || typeof p !== 'object' || !Number.isFinite(p.x)) return false
    temeToScene(p, this.selPos)
    temeToScene(pv.velocity, this.selVel)
    return true
  }

  _buildOrbit() {
    const rec = this.sel.satrec
    const periodMs = (2 * Math.PI / rec.no) * 60000 // rec.no — рад/мин
    const arr = this.orbitLine.geometry.attributes.position.array
    const p = new THREE.Vector3()
    let last = null
    for (let k = 0; k <= 360; k++) {
      let pv = null
      try { pv = propagate(rec, new Date(this.simTime + (k / 360) * periodMs)) } catch { pv = null }
      if (pv && pv.position && Number.isFinite(pv.position.x)) {
        temeToScene(pv.position, p)
        last = [p.x, p.y, p.z]
      }
      if (last) arr.set(last, 3 * k)
    }
    this.orbitLine.geometry.attributes.position.needsUpdate = true
    this.orbitLine.visible = true
    this.orbitBuiltAt = performance.now()
  }

  _lvlh() {
    const { R, V, N } = this._tmp
    R.copy(this.selPos).normalize()
    V.copy(this.selVel).addScaledVector(R, -this.selVel.dot(R)).normalize()
    N.crossVectors(R, V)
    return this._tmp
  }

  _chaseOffset(out) {
    const { R, V, N } = this._lvlh()
    const ce = Math.cos(this.chaseEl)
    out.set(0, 0, 0)
      .addScaledVector(V, -ce * Math.cos(this.chaseAz))
      .addScaledVector(N, ce * Math.sin(this.chaseAz))
      .addScaledVector(R, Math.sin(this.chaseEl))
    return out.multiplyScalar(this.chaseDistM * M)
  }

  // ------------------------------------------------------------------ время
  setSpeed(s) {
    this.userSpeed = s
    if (!this.replay) this.speed = s
  }

  resetTime() {
    if (this.replay) return this.stopReplay()
    this.simTime = Date.now()
    this.frames = []
  }

  // ------------------------------------------------------------------ события
  _bindEvents() {
    const c = this.canvas
    this._onWheel = (e) => {
      if (this.mode === 'globe') {
        // колесо листает страницу; приближение — Ctrl/⌘ + колесо или щипок на тачпаде
        if (!(e.ctrlKey || e.metaKey)) e.stopImmediatePropagation()
        return
      }
      e.preventDefault()
      e.stopImmediatePropagation()
      if (this.mode === 'chase') {
        const maxD = this.sel?.kind === 'station' ? 4000 : 2500
        this.chaseDistM = Math.min(maxD, Math.max(4, this.chaseDistM * Math.exp(e.deltaY * 0.0012)))
      }
    }
    this._onDown = (e) => {
      this.down = { x: e.clientX, y: e.clientY, t: performance.now() }
      if (this.mode === 'chase') {
        this.dragging = true
        c.setPointerCapture?.(e.pointerId)
      }
    }
    this._onMove = (e) => {
      this.pointer = { x: e.clientX, y: e.clientY }
      if (this.dragging) {
        this.chaseAz -= e.movementX * 0.006
        this.chaseEl = Math.min(1.4, Math.max(-1.4, this.chaseEl + e.movementY * 0.006))
      }
      this.hoverDirty = true
    }
    this._onUp = (e) => {
      if (this.dragging) {
        this.dragging = false
        try { c.releasePointerCapture?.(e.pointerId) } catch { /* уже отпущен */ }
      }
      if (!this.down) return
      const moved = Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y)
      const quick = performance.now() - this.down.t < 600
      this.down = null
      if (moved < 6 && quick && (this.mode === 'globe' || this.mode === 'chase')) {
        const i = this._pick(e.clientX, e.clientY)
        if (i >= 0 && i !== this.sel?.index) this.select(i)
      }
    }
    this._onLeave = () => {
      this.pointer = null
      this.hoverDirty = true
    }
    c.addEventListener('wheel', this._onWheel, { capture: true, passive: false })
    c.addEventListener('pointerdown', this._onDown)
    c.addEventListener('pointermove', this._onMove)
    c.addEventListener('pointerup', this._onUp)
    c.addEventListener('pointerleave', this._onLeave)
  }

  _occluded(x, y, z) {
    const C = this.camAbs
    const dx = x - C.x, dy = y - C.y, dz = z - C.z
    const a = dx * dx + dy * dy + dz * dz
    const b = 2 * (C.x * dx + C.y * dy + C.z * dz)
    const cc = C.x * C.x + C.y * C.y + C.z * C.z - 1
    const disc = b * b - 4 * a * cc
    if (disc <= 0) return false
    const t1 = (-b - Math.sqrt(disc)) / (2 * a)
    return t1 > 1e-9 && t1 < 1
  }

  _pick(clientX, clientY) {
    if (!this.firstFrame) return -1
    const rect = this.canvas.getBoundingClientRect()
    const px = clientX - rect.left
    const py = clientY - rect.top
    const W = rect.width
    const H = rect.height
    const m = this._pv.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse).elements
    const o = this.origin
    const pos = this.positions
    let best = -1
    let bestD = PICK_PX * PICK_PX
    for (let i = 0; i < this.n; i++) {
      if (this.hidden?.[i]) continue // скрыт фильтром
      const ax = pos[3 * i], ay = pos[3 * i + 1], az = pos[3 * i + 2]
      if (ax === 0 && ay === 0 && az === 0) continue
      const x = ax - o.x, y = ay - o.y, z = az - o.z
      const w = m[3] * x + m[7] * y + m[11] * z + m[15]
      if (w <= 0) continue
      const sx = ((m[0] * x + m[4] * y + m[8] * z + m[12]) / w * 0.5 + 0.5) * W
      const sy = (0.5 - (m[1] * x + m[5] * y + m[9] * z + m[13]) / w * 0.5) * H
      const d = (sx - px) * (sx - px) + (sy - py) * (sy - py)
      if (d < bestD && !this._occluded(ax, ay, az)) {
        best = i
        bestD = d
      }
    }
    return best
  }

  _updateHover() {
    if (!this.hoverDirty) return
    this.hoverDirty = false
    const busy = this.dragging || this.mode === 'flying-in' || this.mode === 'flying-out'
    const i = this.pointer && !busy ? this._pick(this.pointer.x, this.pointer.y) : -1
    this.hovered = i
    this.canvas.style.cursor = i >= 0 ? 'pointer' : this.mode === 'chase' ? 'grab' : ''
    if (i >= 0) {
      const row = this.rows[i]
      this.cb.onHover?.({ norad: row[0], name: row[1], type: row[2] }, this.pointer)
    } else {
      this.cb.onHover?.(null)
    }
  }

  // ------------------------------------------------------------------ кадр
  _resize() {
    const w = this.container.clientWidth || 1
    const h = this.container.clientHeight || 1
    this.size = { w, h }
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.hoverDirty = true
    // пока пользователь не крутил Землю, отодвигаем камеру так, чтобы Земля
    // с поясом спутников помещалась и по высоте, и по ширине (важно на телефоне)
    if (this.mode === 'globe' && !this.userMoved) {
      const vHalf = THREE.MathUtils.degToRad(this.camera.fov / 2)
      const hHalf = Math.atan(Math.tan(vHalf) * this.camera.aspect)
      this.camera.position.setLength(Math.max(3.9, 1.32 / Math.sin(Math.min(vHalf, hHalf))))
    }
  }

  _markerScale(px) {
    // спрайт без перспективы: размер в долях высоты экрана
    const p11 = 1 / Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    return (px / this.size.h) * 2 / p11
  }

  _loop(now) {
    this.raf = requestAnimationFrame(this._loop)
    const dt = Math.min(0.1, (now - this.lastFrame) / 1000)
    this.lastFrame = now
    this.simTime += dt * 1000 * this.speed
    if (now - this.lastTimeEmit > 250) {
      this.lastTimeEmit = now
      this.cb.onTime?.(this.simTime)
    }
    if (!this.visible && this.mode === 'globe') return

    const date = new Date(this.simTime)
    sunDirection(date, this.sunDir)
    this.earth.setSun(this.sunDir)
    this.earth.setRotation(gstime(date))
    this.sunLight.position.copy(this.sunDir)
    if (this.n) this._updatePositions()

    if (this.sel) {
      if (!this._updateSelection(date)) {
        if (this.mode === 'chase' || this.mode === 'flying-in') this.exit()
      } else if (performance.now() - (this.orbitBuiltAt || 0) > 4000) {
        this._buildOrbit()
      }
      if (this.replay) this._updateReplay(date)
    }
    this._updateCamera(now)
    this._updateHover()
    this._render()
  }

  _updateCamera(now) {
    const t = this._tmp
    const wide = this.size.w > 900
    let shiftTarget = 0
    if (this.mode === 'globe') {
      shiftTarget = wide ? -0.13 : 0
      this.controls.update()
      this.origin.set(0, 0, 0)
      this.camAbs.copy(this.camera.position)
      this._lookAbs = this._lookAbs || new THREE.Vector3()
      this._lookAbs.set(0, 0, 0)
    } else {
      shiftTarget = wide ? 0.11 : 0
      const S = this.selPos
      const look = t.look
      const up = t.up
      const chaseEnd = t.c.copy(S).add(this._chaseOffset(t.d))
      if (this.mode === 'chase' || (this.mode === 'replay' && !this.replay?.axis)) {
        this.camAbs.copy(chaseEnd)
        look.copy(S)
        up.copy(t.R)
      } else if (this.mode === 'replay') {
        // сбоку от плоскости встречи, на расстоянии ~2.4 промаха: видно оба объекта
        const rp = this.replay
        const D = Math.max(0.12, rp.missKm * 2.4) / 6378.137
        this.camAbs.copy(S).addScaledVector(rp.axis, D).addScaledVector(t.V, -0.35 * D)
        const rel = t.a.copy(rp.pos).sub(S)
        const lim = (rp.missKm * 1.1) / 6378.137
        if (rel.length() > lim) rel.setLength(lim)
        look.copy(S).addScaledVector(rel, 0.5)
        up.copy(t.R)
      } else if (this.mode === 'flying-in') {
        const u = clamp01((now - this.fly.t0) / this.fly.dur)
        const e = easeInOutCubic(u)
        const d0 = t.a.copy(this.fly.from).sub(S)
        const D0 = d0.length()
        const dc = t.b.copy(chaseEnd).sub(S)
        const Dc = dc.length()
        const D = Math.exp(Math.log(D0) + (Math.log(Dc) - Math.log(D0)) * e)
        slerpUnit(d0.divideScalar(D0), dc.divideScalar(Dc), e, t.a)
        this.camAbs.copy(S).addScaledVector(t.a, D)
        if (this.camAbs.length() < 1.012) this.camAbs.setLength(1.012) // не залетать под землю
        look.copy(this.fly.lookFrom).lerp(S, easeInOutCubic(clamp01(u / 0.4)))
        up.copy(this.fly.upFrom).lerp(t.R, e).normalize()
        if (u >= 1) this._setMode('chase')
      } else if (this.mode === 'flying-out') {
        const u = clamp01((now - this.fly.t0) / this.fly.dur)
        const e = easeInOutCubic(u)
        const r0 = this.fly.from.length()
        const r1 = this.fly.to.length()
        const r = Math.exp(Math.log(r0) + (Math.log(r1) - Math.log(r0)) * e)
        slerpUnit(t.a.copy(this.fly.from).normalize(), t.b.copy(this.fly.to).normalize(), e, t.a)
        this.camAbs.copy(t.a).multiplyScalar(r)
        look.copy(S).lerp(t.b.set(0, 0, 0), easeInOutCubic(clamp01((u - 0.1) / 0.6)))
        up.copy(this.fly.upFrom).lerp(GLOBE_UP, e).normalize()
        if (u >= 1) {
          this.origin.set(0, 0, 0)
          this.camera.position.copy(this.fly.to)
          this.camera.up.copy(GLOBE_UP)
          this.camAbs.copy(this.fly.to)
          this.controls.target.set(0, 0, 0)
          this.controls.enabled = true
          this.controls.update()
          this.sel = null
          this.model && (this.model.visible = false)
          this.orbitLine.visible = false
          this.marker.visible = false
          this._setMode('globe')
          this.cb.onSelect?.(null)
          this.viewShift += (shiftTarget - this.viewShift) * 0.08
          return
        }
      }
      this._lookAbs = (this._lookAbs || new THREE.Vector3()).copy(look)
      this.origin.copy(this.camAbs)
      this.camera.position.set(0, 0, 0)
      this.camera.up.copy(up)
      this.camera.lookAt(look.x - this.camAbs.x, look.y - this.camAbs.y, look.z - this.camAbs.z)
    }
    // плавный сдвиг картинки: Земля правее текста, спутник левее панели
    this.viewShift += (shiftTarget - this.viewShift) * 0.08
    const { w, h } = this.size
    // смещение окна просмотра: отрицательное — картинка уезжает вправо
    if (Math.abs(this.viewShift) > 1e-4) this.camera.setViewOffset(w, h, this.viewShift * w, 0, w, h)
    else this.camera.clearViewOffset()
  }

  _render() {
    const r = this.renderer
    this.world.position.copy(this.origin).negate()
    this.selDist = this.sel ? this.camAbs.distanceTo(this.selPos) : Infinity

    // вблизи спутника линия орбиты превращается в две полосы через весь экран — прячем
    if (this.sel) this.orbitLine.visible = this.selDist > 0.03

    // метки
    // в повторе сближения кольца на обоих объектах: сами аппараты за километры не видны
    const showMarker = !!this.sel && (this.selDist > 0.02 || this.mode === 'replay')
    this.marker.visible = showMarker
    if (showMarker) {
      this.marker.position.copy(this.selPos)
      this.marker.scale.setScalar(this._markerScale(26))
    }
    if (this.replayMarker) {
      const rp = this.mode === 'replay' ? this.replay : null
      this.replayMarker.visible = !!rp
      if (rp) {
        this.replayMarker.position.copy(rp.pos)
        this.replayMarker.scale.setScalar(this._markerScale(24))
      }
    }
    this.threatMarkers.forEach((m, k) => {
      const t = this.sel && this.mode !== 'replay' && this.threats[k]
      if (!t) {
        m.visible = false
        return
      }
      const p = this.positions
      const x = p[3 * t.i], y = p[3 * t.i + 1], z = p[3 * t.i + 2]
      m.visible = !(x === 0 && y === 0 && z === 0) && !this._occluded(x, y, z)
      if (m.visible) {
        m.position.set(x, y, z)
        m.scale.setScalar(this._markerScale(18))
      }
    })
    const hv = this.hovered >= 0 && this.hovered !== this.sel?.index
    this.hoverMarker.visible = hv
    if (hv) {
      const p = this.positions
      this.hoverMarker.position.set(p[3 * this.hovered], p[3 * this.hovered + 1], p[3 * this.hovered + 2])
      this.hoverMarker.scale.setScalar(this._markerScale(20))
    }
    if (this.points) this.points.material.uniforms.uSize.value = (this.mode === 'globe' ? 2.3 : 2.8) * this.pixelRatio

    // проход 1: Земля, объекты, звёзды
    r.clear()
    const cam = this.camera
    cam.near = this.mode === 'globe' ? 0.01 : Math.max(2e-5, Math.min(0.01, this.selDist * 0.25))
    cam.far = 400
    cam.updateProjectionMatrix()
    r.render(this.scene, cam)

    // проход 2: модель выбранного объекта (камера в метрах от неё)
    const showModel = this.model && this.sel && this.mode !== 'globe' && this.selDist < 0.004
    if (this.model) this.model.visible = !!showModel
    if (showModel) {
      this.model.position.copy(this.selPos).sub(this.camAbs)
      const m = new THREE.Matrix4().makeBasis(this._tmp.V, this._tmp.R, this._tmp.a.crossVectors(this._tmp.V, this._tmp.R))
      this.model.quaternion.setFromRotationMatrix(m)
      let far = this.selDist * 60
      const rp = this.mode === 'replay' ? this.replay : null
      if (rp) {
        // вторая модель — угроза — и линия между ними
        rp.model.visible = true
        rp.model.position.copy(rp.pos).sub(this.camAbs)
        rp.model.quaternion.copy(this.model.quaternion)
        const arr = this.replayLine.geometry.attributes.position.array
        arr.set([this.model.position.x, this.model.position.y, this.model.position.z,
          rp.model.position.x, rp.model.position.y, rp.model.position.z])
        this.replayLine.geometry.attributes.position.needsUpdate = true
        far = Math.max(far, rp.model.position.length() * 3)
      }
      r.clearDepth()
      cam.near = this.selDist / 300
      cam.far = far
      cam.updateProjectionMatrix()
      r.render(this.nearScene, cam)
    }
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.worker?.terminate()
    this.ro.disconnect()
    this.io.disconnect()
    this.controls.dispose()
    const c = this.canvas
    c.removeEventListener('wheel', this._onWheel, { capture: true })
    c.removeEventListener('pointerdown', this._onDown)
    c.removeEventListener('pointermove', this._onMove)
    c.removeEventListener('pointerup', this._onUp)
    c.removeEventListener('pointerleave', this._onLeave)
    this.earth.dispose()
    this.points?.geometry.dispose()
    this.points?.material.dispose()
    this.renderer.dispose()
    c.remove()
  }
}
