import * as THREE from 'three'
import { createEarth } from '../globe/earth.js'
import { createStars } from '../globe/stars.js'

// Сцена «синдром Кесслера». Всё — функция прогресса прокрутки p ∈ [0, 1]:
// прокрутка вперёд двигает время сцены вперёд, назад — назад.
// Высоты, размеры и число обломков условны (иллюстрация, а не расчёт).

const TWO_PI = Math.PI * 2
const T_HIT = TWO_PI * 1.15 // момент первого столкновения во времени сцены (радианы пути по орбите)
const T_END = T_HIT + TWO_PI * 8
// прокрутка -> время: возле удара время идёт медленно, чтобы разглядеть столкновение
const TIME_KEYS = [[0, 0], [0.22, T_HIT - 1.2], [0.38, T_HIT + 1.6], [1, T_END]]
const R_BASE = 1.15
const N_SAT = 170

function rng(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}
function gauss(rnd) {
  return Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(TWO_PI * rnd())
}
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** p (прокрутка) -> T (время сцены), кусочно-линейно по TIME_KEYS. */
export function progressToTime(p) {
  let i = 0
  while (i < TIME_KEYS.length - 2 && p > TIME_KEYS[i + 1][0]) i++
  const [p0, t0] = TIME_KEYS[i]
  const [p1, t1] = TIME_KEYS[i + 1]
  return t0 + ((Math.min(Math.max(p, p0), p1) - p0) / (p1 - p0)) * (t1 - t0)
}

function planeNormal(incDeg, raanDeg) {
  const i = THREE.MathUtils.degToRad(incDeg)
  const O = THREE.MathUtils.degToRad(raanDeg)
  // ось Y — ось Земли
  return new THREE.Vector3(Math.sin(i) * Math.sin(O), Math.cos(i), Math.sin(i) * Math.cos(O)).normalize()
}

function basisFrom(normal, e1) {
  const a = e1.clone().normalize()
  const b = new THREE.Vector3().crossVectors(normal, a).normalize()
  return [a, b]
}

const satVertex = /* glsl */ `
  attribute vec3 aE1;
  attribute vec3 aE2;
  attribute vec4 aOrbit;   // радиус, угловая скорость, начальная фаза, момент гибели
  attribute float aHero;
  uniform float uT;
  uniform float uScale;
  varying float vHero;
  void main() {
    vHero = aHero;
    if (uT >= aOrbit.w) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; return; }
    float th = aOrbit.y * uT + aOrbit.z;
    vec3 p = aOrbit.x * (cos(th) * aE1 + sin(th) * aE2);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uScale * (aHero > 0.5 ? 8.0 : 4.6);
  }
`
const satFragment = /* glsl */ `
  varying float vHero;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 col = vHero > 0.5 ? vec3(1.0, 1.0, 1.0) : vec3(0.62, 0.84, 1.0);
    gl_FragColor = vec4(col, smoothstep(0.5, 0.1, d));
    #include <colorspace_fragment>
  }
`

const fragVertex = /* glsl */ `
  attribute vec3 aE1;
  attribute vec3 aE2;
  attribute vec4 aOrbit;   // радиус, угловая скорость, момент рождения, случайное
  attribute vec3 aKick;
  uniform float uT;
  uniform float uScale;
  varying float vAge;
  varying float vSeed;
  void main() {
    float age = uT - aOrbit.z;
    vSeed = aOrbit.w;
    vAge = age;
    if (age < 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; return; }
    float th = aOrbit.y * age;
    vec3 p = aOrbit.x * (cos(th) * aE1 + sin(th) * aE2);
    p += aKick * (1.0 - exp(-age / 0.1)) * exp(-age / 0.9);   // вспышка разлёта, потом — орбита
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uScale * (1.6 + 0.9 * aOrbit.w + 2.5 * exp(-age / 0.35));
  }
`
const fragFragment = /* glsl */ `
  varying float vAge;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 hot = vec3(1.0, 0.86, 0.62);
    vec3 cold = mix(vec3(0.70, 0.60, 0.55), vec3(0.85, 0.42, 0.32), vSeed * 0.6);
    vec3 col = mix(cold, hot, exp(-vAge / 0.6));
    gl_FragColor = vec4(col, smoothstep(0.5, 0.1, d) * 0.9);
    #include <colorspace_fragment>
  }
`

function flashTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.18, 'rgba(255,214,160,0.9)')
  grd.addColorStop(0.45, 'rgba(255,110,60,0.35)')
  grd.addColorStop(1, 'rgba(255,60,30,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export class KesslerScene {
  constructor(container) {
    this.container = container
    this.scale = Math.min(window.devicePixelRatio || 1, 2)
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true }))
    r.setPixelRatio(this.scale)
    r.outputColorSpace = THREE.SRGBColorSpace
    r.setClearColor(0x020308, 1)
    container.appendChild(r.domElement)
    r.domElement.className = 'kessler-canvas'

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.01, 400)
    this.earth = createEarth(r, { segments: 96, nightBoost: 1.1 })
    this.earth.setSun(new THREE.Vector3(0.9, 0.25, 0.55).normalize())
    this.scene.add(this.earth.group, createStars(2500, 150, 11))

    this._buildSatellites()
    this._buildEvents()
    this._buildFragments()
    this._buildFlashes()
    this._buildHeroOrbits()

    this.p = 0
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)
    this.resize()
  }

  _buildSatellites() {
    const rnd = rng(42)
    this.sats = []
    // две «главные» орбиты, которые пересекутся в момент T_HIT
    const nA = planeNormal(53, 20)
    const nB = planeNormal(97, 115)
    const node = new THREE.Vector3().crossVectors(nA, nB).normalize()
    if (node.y < 0) node.negate()
    this.hitPoint = node.clone().multiplyScalar(R_BASE)
    for (const n of [nA, nB]) {
      const [e1, e2] = basisFrom(n, node)
      this.sats.push({ e1, e2, r: R_BASE, w: 1, phi: -T_HIT, death: T_HIT, hero: 1, n })
    }
    const incs = [53, 53, 70, 97.6, 43, 87.9, 65, 98]
    for (let i = 0; i < N_SAT; i++) {
      const inc = incs[i % incs.length] + gauss(rnd) * 2
      const n = planeNormal(inc, rnd() * 360)
      const ref = new THREE.Vector3(1, 0, 0).cross(n).lengthSq() > 1e-3 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1)
      const e1 = ref.clone().addScaledVector(n, -ref.dot(n)).normalize()
      const [a, b] = basisFrom(n, e1)
      const r = R_BASE + (rnd() - 0.5) * 0.09
      this.sats.push({ e1: a, e2: b, r, w: Math.pow(R_BASE / r, 1.5), phi: rnd() * TWO_PI, death: Infinity, hero: 0, n })
    }
  }

  satPos(s, T, out = new THREE.Vector3()) {
    const th = s.w * T + s.phi
    return out.copy(s.e1).multiplyScalar(Math.cos(th) * s.r).addScaledVector(s.e2, Math.sin(th) * s.r)
  }

  _buildEvents() {
    // первое столкновение и каскад: интервалы между ударами сокращаются
    const rnd = rng(7)
    this.events = [{ T: T_HIT, pos: this.hitPoint.clone(), parent: this.sats[0], n: 2600, partner: this.sats[1] }]
    const gaps = [6.5, 5.0, 4.0, 3.2, 2.6, 2.1, 1.7, 1.4, 1.15, 0.95, 0.8, 0.68, 0.58, 0.5, 0.44, 0.39, 0.35, 0.32, 0.3, 0.28]
    let T = T_HIT
    const alive = this.sats.slice(2)
    for (let k = 0; k < gaps.length && T + gaps[k] < T_END - 0.6; k++) {
      T += gaps[k]
      const s = alive.splice(Math.floor(rnd() * alive.length), 1)[0]
      s.death = T
      this.events.push({ T, pos: this.satPos(s, T), parent: s, n: 900 + Math.floor(rnd() * 900) })
    }
  }

  _buildFragments() {
    const rnd = rng(99)
    const total = this.events.reduce((a, e) => a + e.n, 0)
    const e1 = new Float32Array(total * 3)
    const e2 = new Float32Array(total * 3)
    const orbit = new Float32Array(total * 4)
    const kick = new Float32Array(total * 3)
    const v = new THREE.Vector3()
    let k = 0
    for (const ev of this.events) {
      const sources = ev.partner ? [ev.parent, ev.partner] : [ev.parent]
      for (let j = 0; j < ev.n; j++) {
        const src = sources[j % sources.length]
        const a = ev.pos.clone().normalize()
        // направление движения родителя в точке удара, слегка повёрнутое вокруг радиуса
        const vel = new THREE.Vector3().crossVectors(src.n, a).normalize()
        vel.applyAxisAngle(a, gauss(rnd) * 0.11)
        const r = ev.pos.length() * (1 + gauss(rnd) * 0.009)
        const w = Math.pow(R_BASE / r, 1.5) * src.w * (1 + gauss(rnd) * 0.035)
        e1.set([a.x, a.y, a.z], 3 * k)
        e2.set([vel.x, vel.y, vel.z], 3 * k)
        orbit.set([r, w, ev.T, rnd()], 4 * k)
        v.set(gauss(rnd), gauss(rnd), gauss(rnd)).multiplyScalar(0.035)
        kick.set([v.x, v.y, v.z], 3 * k)
        k++
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(total * 3), 3))
    geo.setAttribute('aE1', new THREE.BufferAttribute(e1, 3))
    geo.setAttribute('aE2', new THREE.BufferAttribute(e2, 3))
    geo.setAttribute('aOrbit', new THREE.BufferAttribute(orbit, 4))
    geo.setAttribute('aKick', new THREE.BufferAttribute(kick, 3))
    this.fragMat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uScale: { value: this.scale } },
      vertexShader: fragVertex,
      fragmentShader: fragFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const pts = new THREE.Points(geo, this.fragMat)
    pts.frustumCulled = false
    this.scene.add(pts)

    const n = this.sats.length
    const se1 = new Float32Array(n * 3)
    const se2 = new Float32Array(n * 3)
    const sorb = new Float32Array(n * 4)
    const hero = new Float32Array(n)
    this.sats.forEach((s, i) => {
      se1.set([s.e1.x, s.e1.y, s.e1.z], 3 * i)
      se2.set([s.e2.x, s.e2.y, s.e2.z], 3 * i)
      sorb.set([s.r, s.w, s.phi, Number.isFinite(s.death) ? s.death : 1e9], 4 * i)
      hero[i] = s.hero
    })
    const sgeo = new THREE.BufferGeometry()
    sgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    sgeo.setAttribute('aE1', new THREE.BufferAttribute(se1, 3))
    sgeo.setAttribute('aE2', new THREE.BufferAttribute(se2, 3))
    sgeo.setAttribute('aOrbit', new THREE.BufferAttribute(sorb, 4))
    sgeo.setAttribute('aHero', new THREE.BufferAttribute(hero, 1))
    this.satMat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uScale: { value: this.scale } },
      vertexShader: satVertex,
      fragmentShader: satFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const spts = new THREE.Points(sgeo, this.satMat)
    spts.frustumCulled = false
    this.scene.add(spts)
  }

  _buildFlashes() {
    const tex = flashTexture()
    this.flashes = this.events.map((ev, i) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
      s.position.copy(ev.pos)
      s.visible = false
      s.userData.big = i === 0
      this.scene.add(s)
      return s
    })
  }

  _buildHeroOrbits() {
    this.heroLines = this.sats.slice(0, 2).map((s) => {
      const pts = []
      for (let k = 0; k <= 160; k++) pts.push(this.satPos(s, (k / 160) * TWO_PI - s.phi))
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }))
      this.scene.add(line)
      return line
    })
  }

  /** Сколько столкновений и обломков уже произошло к моменту p. */
  stats(p = this.p) {
    const T = progressToTime(p)
    let collisions = 0
    let fragments = 0
    for (const ev of this.events) {
      if (ev.T <= T) {
        collisions++
        fragments += ev.n
      }
    }
    return { collisions, fragments }
  }

  _cameraAt(p) {
    const hitDir = this.hitPoint.clone().normalize()
    const Y = new THREE.Vector3(0, 1, 0)
    const around = (dist, angle, height) =>
      hitDir.clone().applyAxisAngle(Y, angle).multiplyScalar(dist).addScaledVector(Y, height)
    // камера у столкновения следует за «главным» спутником, а после удара — за облаком обломков
    const T = progressToTime(p)
    const hero = this.sats[0]
    const focus = this.satPos(hero, T)
    const th = hero.w * T + hero.phi
    const along = hero.e1.clone().multiplyScalar(-Math.sin(th)).addScaledVector(hero.e2, Math.cos(th)).normalize()
    const rad = focus.clone().normalize()
    const side = new THREE.Vector3().crossVectors(rad, along).normalize()
    const near = (s, r, a) => focus.clone().addScaledVector(side, s).addScaledVector(rad, r).addScaledVector(along, -a)
    const keys = [
      { p: 0.0, pos: around(4.6, -0.9, 1.4), look: new THREE.Vector3() },
      { p: 0.12, pos: around(3.6, -0.55, 1.0), look: new THREE.Vector3() },
      { p: 0.24, pos: near(0.42, 0.2, 0.3), look: focus.clone() },
      { p: 0.34, pos: near(0.55, 0.26, 0.42), look: focus.clone() },
      { p: 0.44, pos: near(1.3, 0.8, 1.0), look: focus.clone().multiplyScalar(0.55) },
      { p: 0.6, pos: around(3.7, 0.5, 1.6), look: new THREE.Vector3() },
      { p: 0.8, pos: around(3.9, 1.3, 0.9), look: new THREE.Vector3() },
      { p: 1.0, pos: around(4.4, 2.0, 2.0), look: new THREE.Vector3() },
    ]
    let i = 0
    while (i < keys.length - 2 && p > keys[i + 1].p) i++
    const a = keys[i]
    const b = keys[i + 1]
    const t = smooth(a.p, b.p, p)
    // путь камеры — по дуге вокруг центра Земли, чтобы не пролетать сквозь неё
    const ra = a.pos.length()
    const rb = b.pos.length()
    const dir = a.pos.clone().normalize().lerp(b.pos.clone().normalize(), t).normalize()
    return { pos: dir.multiplyScalar(ra + (rb - ra) * t), look: a.look.clone().lerp(b.look, t) }
  }

  setProgress(p) {
    this.p = Math.min(1, Math.max(0, p))
    this.render()
  }

  render() {
    const p = this.p
    const T = progressToTime(p)
    this.fragMat.uniforms.uT.value = T
    this.satMat.uniforms.uT.value = T
    this.earth.setRotation(T / 16)

    // вспышки
    this.events.forEach((ev, i) => {
      const s = this.flashes[i]
      const age = T - ev.T
      s.visible = age >= 0 && age < 2.5
      if (s.visible) {
        const f = Math.exp(-age / (s.userData.big ? 0.45 : 0.3))
        s.material.opacity = f
        s.scale.setScalar((s.userData.big ? 0.42 : 0.2) * (0.4 + 1.6 * (1 - f)))
      }
    })
    // орбиты двух спутников, которые столкнутся
    const show = smooth(0.06, 0.13, p) * (1 - smooth(0.3, 0.38, p))
    for (const l of this.heroLines) l.material.opacity = 0.45 * show

    const cam = this._cameraAt(p)
    this.camera.position.copy(cam.pos)
    this.camera.lookAt(cam.look)
    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    const w = this.container.clientWidth || 1
    const h = this.container.clientHeight || 1
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.fov = w < h ? 55 : 40
    this.camera.updateProjectionMatrix()
    this.render()
  }

  dispose() {
    this.ro.disconnect()
    this.earth.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
