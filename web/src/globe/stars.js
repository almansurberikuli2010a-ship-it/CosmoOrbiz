import * as THREE from 'three'

// Звёздный фон: случайные точки на большой сфере (не сдвигаются вместе с миром).
export function createStars(count = 3500, radius = 150, seed = 7) {
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const pos = new Float32Array(count * 3)
  const size = new Float32Array(count)
  const tint = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const u = rnd() * 2 - 1
    const phi = rnd() * Math.PI * 2
    const r = Math.sqrt(1 - u * u)
    pos.set([radius * r * Math.cos(phi), radius * u, radius * r * Math.sin(phi)], 3 * i)
    const bright = rnd()
    size[i] = 0.6 + Math.pow(bright, 6) * 2.4
    const warm = rnd()
    tint.set([0.75 + 0.25 * warm, 0.8 + 0.1 * warm, 1.0 - 0.2 * warm], 3 * i)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  geo.setAttribute('aTint', new THREE.BufferAttribute(tint, 3))
  const mat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: Math.min(window.devicePixelRatio, 2) } },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute vec3 aTint;
      uniform float uScale;
      varying vec3 vTint;
      varying float vA;
      void main() {
        vTint = aTint;
        vA = clamp(aSize / 2.0, 0.25, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uScale;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vTint;
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(vTint, smoothstep(0.5, 0.0, d) * vA * 0.85);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
  })
  const pts = new THREE.Points(geo, mat)
  pts.frustumCulled = false
  pts.renderOrder = -1
  return pts
}
