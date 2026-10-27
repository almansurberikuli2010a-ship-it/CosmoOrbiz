import * as THREE from 'three'

// Земля: дневная текстура (NASA Blue Marble) на освещённой стороне, ночные огни
// (NASA Black Marble) на тёмной, граница день/ночь — по реальному положению Солнца.

const earthVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const earthFragment = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform vec3 sunDir;
  uniform float nightBoost;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 n = normalize(vNormalW);
    float l = dot(n, sunDir);
    vec3 day = texture2D(dayMap, vUv).rgb;
    vec3 night = texture2D(nightMap, vUv).rgb;
    float dayMix = smoothstep(-0.10, 0.22, l);
    vec3 lit = day * (0.05 + 1.15 * clamp(l, 0.0, 1.0));
    vec3 lights = night * vec3(1.0, 0.78, 0.48) * nightBoost * (1.0 - smoothstep(-0.22, 0.04, l));
    vec3 col = mix(lights + day * 0.018, lit, dayMix);
    vec3 v = normalize(cameraPosition - vPosW);
    float fres = pow(1.0 - max(dot(v, n), 0.0), 3.0);
    col += vec3(0.25, 0.5, 1.0) * fres * 0.55 * smoothstep(-0.3, 0.45, l);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

const atmoVertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const atmoFragment = /* glsl */ `
  uniform vec3 sunDir;
  uniform float strength;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vPosW);
    float f = 1.0 - max(dot(v, n), 0.0);
    float glow = pow(f, 3.2) * strength;
    float day = smoothstep(-0.35, 0.4, dot(n, sunDir));
    vec3 col = vec3(0.30, 0.58, 1.0) * glow * (0.18 + 0.9 * day);
    gl_FragColor = vec4(col, glow);
    #include <colorspace_fragment>
  }
`

export function createEarth(renderer, { segments = 128, nightBoost = 1.5 } = {}) {
  const loader = new THREE.TextureLoader()
  const aniso = renderer.capabilities.getMaxAnisotropy()
  const load = (url) => {
    const t = loader.load(url)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = Math.min(8, aniso)
    return t
  }
  const sunDir = new THREE.Vector3(1, 0, 0)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      dayMap: { value: load('/textures/earth_day.jpg') },
      nightMap: { value: load('/textures/earth_night.jpg') },
      sunDir: { value: sunDir },
      nightBoost: { value: nightBoost },
    },
    vertexShader: earthVertex,
    fragmentShader: earthFragment,
  })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, Math.round(segments * 0.75)), material)

  const atmoMaterial = new THREE.ShaderMaterial({
    uniforms: { sunDir: { value: sunDir }, strength: { value: 1.0 } },
    vertexShader: atmoVertex,
    fragmentShader: atmoFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.03, 96, 64), atmoMaterial)

  const group = new THREE.Group()
  group.add(mesh, atmosphere)
  return {
    group,
    mesh,
    setSun(dir) {
      sunDir.copy(dir)
    },
    setRotation(angle) {
      mesh.rotation.y = angle
    },
    dispose() {
      material.uniforms.dayMap.value.dispose()
      material.uniforms.nightMap.value.dispose()
      material.dispose()
      atmoMaterial.dispose()
      mesh.geometry.dispose()
      atmosphere.geometry.dispose()
    },
  }
}
