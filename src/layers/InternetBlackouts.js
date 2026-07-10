import * as THREE from 'three';
import { latLonToVec3 } from '../utils/math.js';
import { EARTH_RADIUS } from '../config.js';

let group;

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  data.forEach(bl => {
    const raw = latLonToVec3(bl.lat, bl.lon, EARTH_RADIUS * 1.02);
    const pos = new THREE.Vector3(raw.x, raw.y, raw.z);
    // Cone marker
    const coneGeo = new THREE.ConeGeometry(0.3, 0.8, 8);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xFF1744 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.copy(pos);
    cone.lookAt(new THREE.Vector3(0, 0, 0));
    group.add(cone);

    // Pulse ring (static for now)
    const ringGeo = new THREE.RingGeometry(0.4, 0.6, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xFF1744, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    group.add(ring);
  });
  earthGroup.add(group);
  return group;
}

export function update(timeRange) {}
export function setVisible(visible) { if (group) group.visible = visible; }
export function dispose() {
  if (group) {
    group.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
    group.parent?.remove(group);
    group = null;
  }
}
