import * as THREE from 'three'

// Единица длины в сцене — радиус Земли. Ось Y сцены — ось вращения Земли (на север).
export const RE_KM = 6378.137
export const M = 1 / (RE_KM * 1000) // один метр в единицах сцены

/** TEME (x, y, z), км -> сцена: (x, z, -y) в радиусах Земли. Поворот, а не отражение. */
export function temeToScene(p, out = new THREE.Vector3()) {
  return out.set(p.x / RE_KM, p.z / RE_KM, -p.y / RE_KM)
}

/** Направление на Солнце в той же системе (формула Астрономического ежегодника, ~0.01°). */
export function sunDirection(date, out = new THREE.Vector3()) {
  const n = date.getTime() / 86400000 + 2440587.5 - 2451545.0
  const rad = Math.PI / 180
  const L = (280.46 + 0.9856474 * n) * rad
  const g = (357.528 + 0.9856003 * n) * rad
  const lambda = L + (1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad
  const eps = (23.439 - 0.0000004 * n) * rad
  const x = Math.cos(lambda)
  const y = Math.cos(eps) * Math.sin(lambda)
  const z = Math.sin(eps) * Math.sin(lambda)
  return out.set(x, z, -y).normalize()
}

/** Сферическая интерполяция единичных векторов. */
export function slerpUnit(a, b, t, out = new THREE.Vector3()) {
  const dot = THREE.MathUtils.clamp(a.dot(b), -1, 1)
  if (dot > 0.9995) return out.copy(a).lerp(b, t).normalize()
  if (dot < -0.9995) {
    // почти противоположные: поворачиваем через любую перпендикулярную ось
    const axis = new THREE.Vector3(1, 0, 0).cross(a)
    if (axis.lengthSq() < 1e-6) axis.set(0, 1, 0).cross(a)
    return out.copy(a).applyAxisAngle(axis.normalize(), Math.PI * t)
  }
  const omega = Math.acos(dot)
  const s = Math.sin(omega)
  const wa = Math.sin((1 - t) * omega) / s
  const wb = Math.sin(t * omega) / s
  return out.set(a.x * wa + b.x * wb, a.y * wa + b.y * wb, a.z * wa + b.z * wb)
}

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
