import * as THREE from 'three'

// Простые процедурные модели для вида со спутника. Размеры — в метрах
// (масштаб в единицы сцены задаёт GlobeScene). Оси модели:
// +X — по направлению движения, +Y — от Земли (вверх), Z — поперёк орбиты.

let materials = null
function mats() {
  if (materials) return materials
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  g.fillStyle = '#0a1a3d'
  g.fillRect(0, 0, 256, 256)
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const shade = 34 + ((x * 7 + y * 13) % 9)
      g.fillStyle = `rgb(${shade - 20}, ${shade + 6}, ${shade + 70})`
      g.fillRect(x * 32 + 2, y * 32 + 2, 28, 28)
    }
  }
  g.strokeStyle = 'rgba(190, 210, 255, 0.35)'
  g.lineWidth = 1
  for (let i = 0; i <= 256; i += 32) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke()
    g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke()
  }
  const panelTex = new THREE.CanvasTexture(c)
  panelTex.colorSpace = THREE.SRGBColorSpace
  panelTex.wrapS = panelTex.wrapT = THREE.RepeatWrapping
  panelTex.anisotropy = 4

  materials = {
    gold: new THREE.MeshStandardMaterial({ color: 0xd8a93c, metalness: 0.9, roughness: 0.32 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.85, roughness: 0.28 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x2b3038, metalness: 0.55, roughness: 0.55 }),
    white: new THREE.MeshStandardMaterial({ color: 0xe6e9ee, metalness: 0.05, roughness: 0.75 }),
    panel: new THREE.MeshStandardMaterial({ map: panelTex, metalness: 0.35, roughness: 0.4, side: THREE.DoubleSide }),
    debris: new THREE.MeshStandardMaterial({ color: 0x8a7f74, metalness: 0.7, roughness: 0.55, flatShading: true }),
    burnt: new THREE.MeshStandardMaterial({ color: 0x3a2e28, metalness: 0.4, roughness: 0.8, flatShading: true }),
  }
  return materials
}

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  return m
}

function panel(len, width, mat, repeat) {
  const geo = new THREE.BoxGeometry(width, 0.05, len)
  const m = new THREE.Mesh(geo, mat)
  if (repeat) {
    const t = mat.map.clone()
    t.needsUpdate = true
    t.repeat.set(repeat[0], repeat[1])
    m.material = mat.clone()
    m.material.map = t
  }
  return m
}

function generic() {
  const { gold, silver, dark, panel: pm } = mats()
  const g = new THREE.Group()
  g.add(box(2.0, 2.2, 1.8, gold))
  for (const s of [-1, 1]) {
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8), silver)
    boom.rotation.x = Math.PI / 2
    boom.position.z = s * 1.5
    g.add(boom)
    const p = panel(5.6, 1.9, pm, [2, 6])
    p.position.z = s * (2.1 + 2.8)
    g.add(p)
  }
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3.2), silver)
  dish.rotation.x = Math.PI
  dish.position.y = -1.0
  g.add(dish)
  g.add(box(0.3, 0.5, 0.3, dark, 0.6, 1.3, 0.4))
  g.add(box(0.5, 0.15, 0.5, dark, -0.6, 1.15, -0.3))
  return g
}

function starlink() {
  const { silver, dark, panel: pm } = mats()
  const g = new THREE.Group()
  g.add(box(2.8, 0.22, 1.35, dark))
  g.add(box(2.6, 0.04, 1.2, silver, 0, 0.13, 0))
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), silver)
  boom.rotation.x = Math.PI / 2
  boom.position.z = 1.1
  g.add(boom)
  const p = panel(8.0, 2.6, pm, [3, 9])
  p.position.set(0, 0.0, 1.55 + 4.0)
  p.rotation.z = 0.35
  g.add(p)
  g.add(box(0.35, 0.18, 0.35, dark, 1.0, -0.2, -0.3))
  g.add(box(0.35, 0.18, 0.35, dark, -1.0, -0.2, -0.3))
  return g
}

function station() {
  const { silver, white, gold, panel: pm } = mats()
  const g = new THREE.Group()
  g.add(box(2.2, 2.2, 100, silver))                       // ферма поперёк орбиты
  const mod = (len, r, x) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 24), white)
    c.rotation.z = Math.PI / 2
    c.position.set(x, -3.2, 0)
    return c
  }
  g.add(mod(14, 2.1, -18), mod(12, 2.2, -4), mod(10, 2.1, 8), mod(9, 2.0, 18), mod(8, 1.9, 27))
  g.add(box(3, 3, 3, gold, -26, -3.2, 0))
  const node = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 9, 20), white)
  node.position.set(-4, -3.2, 6.5)
  node.rotation.x = Math.PI / 2
  g.add(node)
  for (const z of [-46, -38, 38, 46]) {
    for (const s of [-1, 1]) {
      const p = panel(33, 11, pm, [3, 10])
      p.rotation.y = Math.PI / 2
      p.position.set(s * 18.5, 0, z)
      g.add(p)
    }
  }
  for (const z of [-22, 22]) g.add(box(0.2, 11, 13, white, 0, 6.5, z))   // радиаторы
  return g
}

function debris(seed = 3) {
  const { debris: dm, burnt } = mats()
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const g = new THREE.Group()
  const geo = new THREE.IcosahedronGeometry(0.7, 1)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const k = 0.55 + rnd() * 0.75
    p.setXYZ(i, p.getX(i) * k * 1.4, p.getY(i) * k * 0.6, p.getZ(i) * k)
  }
  geo.computeVertexNormals()
  g.add(new THREE.Mesh(geo, dm))
  const shard = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.6), burnt)
  shard.position.set(0.6, 0.3, 0.2)
  shard.rotation.set(0.4, 0.3, 0.8)
  g.add(shard)
  return g
}

export function modelKind(name, type) {
  const n = (name || '').toUpperCase()
  if (type === 'D') return 'debris'
  if (n.startsWith('STARLINK')) return 'starlink'
  if (/^(ISS|CSS) \(/.test(n)) return 'station'
  return 'generic'
}

// с какого расстояния (м) по умолчанию смотрит камера
export const CHASE_DISTANCE_M = { generic: 12, starlink: 15, station: 130, debris: 4.5 }

export function createSatelliteModel(kind) {
  if (kind === 'starlink') return starlink()
  if (kind === 'station') return station()
  if (kind === 'debris') return debris()
  return generic()
}
