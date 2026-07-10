import * as THREE from 'three';
import { EARTH_RADIUS } from '../config.js';
import { easeOutCubic } from '../utils/animation.js';

let earthGroup;
let textureSphere;
let introSpin = null; // { startTime, duration, startY, endY }

const textureLoader = new THREE.TextureLoader();

export function create(scene) {
  earthGroup = new THREE.Group();

  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 128, 64);

  const dayTexture = textureLoader.load('/textures/earth-blue-marble.jpg');
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  dayTexture.anisotropy = 16;

  const material = new THREE.MeshPhongMaterial({
    map: dayTexture,
    color: 0xffffff,
    specular: 0x111111,
    shininess: 5,
  });

  textureSphere = new THREE.Mesh(geometry, material);

  // Three.js SphereGeometry UV → latLonToVec3 alignment is natively correct.
  earthGroup.add(textureSphere);

  // Atmosphere glow
  const atmosGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.02, 64, 32);
  const atmosMat = new THREE.ShaderMaterial({
    uniforms: {
      uGlowColor: { value: new THREE.Color(0x4fc3f7) },
      uIntensity: { value: 1.0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vPosition = worldPos.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform vec3 uGlowColor;
      uniform float uIntensity;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vPosition);
        float fresnel = 1.0 - abs(dot(viewDir, vNormal));
        fresnel = pow(fresnel, 3.0);
        gl_FragColor = vec4(uGlowColor, fresnel * uIntensity * 0.6);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
  earthGroup.add(atmosphere);

  scene.add(earthGroup);

  // ── Intro spin animation ──
  // Rapid horizontal rotation 225° (1.25π) around Y, ease-out deceleration.
  introSpin = {
    startTime: performance.now(),
    duration: 1800,  // ms
    startY: 0,
    endY: 1.25 * Math.PI,  // 225°
  };

  return earthGroup;
}

export function getGroup() {
  return earthGroup;
}

export function getTextureSphere() {
  return textureSphere;
}

/**
 * Update the intro spin animation.  Call once per frame.
 * Returns true while the animation is still running.
 */
export function updateIntroSpin() {
  if (!introSpin) return false;
  const elapsed = performance.now() - introSpin.startTime;
  const t = Math.min(elapsed / introSpin.duration, 1);
  earthGroup.rotation.y = introSpin.startY + (introSpin.endY - introSpin.startY) * easeOutCubic(t);
  if (t >= 1) {
    earthGroup.rotation.y = introSpin.endY;
    introSpin = null;
    return false;
  }
  return true;
}

/**
 * Convert geographic (lat, lon) → world-space point on the Earth surface.
 * Identical to utils/math.js → latLonToVec3.
 *   lon = 0    →  (+x, 0, 0)    (Prime Meridian / Greenwich)
 *   lon = -90  →  (0,  0, +z)   (90° W)
 *   lon = 90   →  (0,  0, -z)   (90° E)
 *   lat = 90   →  (0, +y, 0)    (North Pole)
 *   lat = -90  →  (0, -y, 0)    (South Pole)
 */
export function getSurfacePoint(lat, lon) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  const x = -EARTH_RADIUS * Math.sin(phi) * Math.cos(theta);
  const y = EARTH_RADIUS * Math.cos(phi);
  const z = EARTH_RADIUS * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

export function dispose() {
  if (earthGroup) {
    earthGroup.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
    earthGroup.parent?.remove(earthGroup);
    earthGroup = null;
    textureSphere = null;
  }
}
