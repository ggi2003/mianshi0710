import * as THREE from 'three';
import { latLonToVec3 } from '../utils/math.js';
import { EARTH_RADIUS } from '../config.js';

let group, entities = [];

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  entities = [];
  data.forEach(bl => {
    const raw = latLonToVec3(bl.lat, bl.lon, EARTH_RADIUS * 1.02);
    const pos = new THREE.Vector3(raw.x, raw.y, raw.z);
    const coneGeo = new THREE.ConeGeometry(0.3, 0.8, 8);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xFF6D00 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.copy(pos);
    cone.lookAt(new THREE.Vector3(0, 0, 0));
    cone.visible = false;
    group.add(cone);

    const ringGeo = new THREE.RingGeometry(0.4, 0.6, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xFF6D00, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    ring.visible = false;
    group.add(ring);

    entities.push({
      cone,
      ring,
      startTime: Date.parse(bl.startTime),
      endTime: Date.parse(bl.endTime),
    });
  });
  earthGroup.add(group);
  return group;
}

export function update(timeRange) {
  const cursor = timeRange?.end ?? Date.now();
  entities.forEach(e => {
    const visible = (Number.isNaN(e.startTime) || cursor >= e.startTime) &&
                    (Number.isNaN(e.endTime) || cursor <= e.endTime);
    e.cone.visible = visible;
    e.ring.visible = visible;
  });
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
