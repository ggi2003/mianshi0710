import * as THREE from 'three';
import { latLonToVec3 } from '../utils/math.js';
import { EARTH_RADIUS } from '../config.js';

let group, entities = [];

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  entities = [];
  data.forEach(point => {
    const raw = latLonToVec3(point.lat, point.lon, EARTH_RADIUS * 1.01);
    const pos = new THREE.Vector3(raw.x, raw.y, raw.z);
    const size = point.radius * 0.01;
    const geo = new THREE.CircleGeometry(size, 16);
    const color = new THREE.Color().setHSL(0.05 - point.intensity * 0.1, 1, 0.5 - point.intensity * 0.2);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: point.intensity * 0.7, side: THREE.DoubleSide });
    const circle = new THREE.Mesh(geo, mat);
    circle.position.copy(pos);
    circle.lookAt(new THREE.Vector3(0, 0, 0));
    // Show immediately — GPS jamming is always visible like other layers
    circle.visible = true;
    group.add(circle);
    entities.push({
      circle,
      timestamp: Date.parse(point.timestamp),
    });
  });
  earthGroup.add(group);
  return group;
}

export function update(timeRange) {
  // GPS jamming is always visible regardless of time window
}

export function setVisible(visible) { if (group) group.visible = visible; }
export function dispose() {
  if (group) {
    group.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
    group.parent?.remove(group);
    group = null;
    entities = [];
  }
}
