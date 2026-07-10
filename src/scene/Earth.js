import * as THREE from 'three';
import { EARTH_RADIUS } from '../config.js';

let earthGroup;

export function create(scene) {
  earthGroup = new THREE.Group();

  // Sphere
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 128, 64);
  const material = new THREE.MeshPhongMaterial({
    color: 0x1a5a8c,
    shininess: 10,
  });
  const sphere = new THREE.Mesh(geometry, material);
  earthGroup.add(sphere);

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
  return earthGroup;
}

export function getGroup() {
  return earthGroup;
}

export function getSurfacePoint(lat, lon) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  const x = EARTH_RADIUS * Math.sin(phi) * Math.cos(theta);
  const y = EARTH_RADIUS * Math.cos(phi);
  const z = -EARTH_RADIUS * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

export function dispose() {
  if (earthGroup) {
    earthGroup.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    earthGroup.parent?.remove(earthGroup);
    earthGroup = null;
  }
}
