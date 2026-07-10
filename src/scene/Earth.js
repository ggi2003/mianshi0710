import * as THREE from 'three';
import { EARTH_RADIUS } from '../config.js';

let earthGroup;
let textureSphere; // the textured sphere mesh, exposed for alignment

const textureLoader = new THREE.TextureLoader();

export function create(scene) {
  earthGroup = new THREE.Group();

  // ── Textured sphere with real world map ──
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 128, 64);

  // Load equirectangular world map texture (4096×2048, 2:1 ratio)
  const dayTexture = textureLoader.load('/textures/earth-blue-marble.jpg');
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  dayTexture.anisotropy = 16; // sharpen texture at grazing angles

  const material = new THREE.MeshPhongMaterial({
    map: dayTexture,
    color: 0xffffff,       // white = no tint, show true map colours
    specular: 0x111111,
    shininess: 5,
  });

  textureSphere = new THREE.Mesh(geometry, material);

  // ── Alignment ──
  // Three.js SphereGeometry default UV: U=0→lon=-180°(-X), U=0.5→lon=0°(+X).
  // latLonToVec3: lon=0→+X, lon=-180°→-X.  They match natively — no rotation.
  // Verified: every 90° of longitude aligns correctly at the equator.

  earthGroup.add(textureSphere);

  // Atmosphere glow (unchanged)
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
  return earthGroup;
}

export function getGroup() {
  return earthGroup;
}

export function getTextureSphere() {
  return textureSphere;
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
