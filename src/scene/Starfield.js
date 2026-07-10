import * as THREE from 'three';

let starfieldGroup;

export function create(scene) {
  starfieldGroup = new THREE.Group();

  // Large sphere for stars
  const geo = new THREE.SphereGeometry(100, 64, 32);
  const mat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
  const bgSphere = new THREE.Mesh(geo, mat);
  starfieldGroup.add(bgSphere);

  // Star particles
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 95 + Math.random() * 5;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, blending: THREE.AdditiveBlending });
  const particles = new THREE.Points(particleGeo, particleMat);
  starfieldGroup.add(particles);

  scene.add(starfieldGroup);
  return starfieldGroup;
}

export function dispose() {
  if (starfieldGroup) {
    starfieldGroup.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
    starfieldGroup.parent?.remove(starfieldGroup);
    starfieldGroup = null;
  }
}
