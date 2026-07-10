import * as THREE from 'three';
import { latLonToVec3 } from '../utils/math.js';
import { EARTH_RADIUS } from '../config.js';

let group, entities = [];

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  entities = [];
  data.forEach(vessel => {
    const rawFrom = latLonToVec3(vessel.from.lat, vessel.from.lon, EARTH_RADIUS * 1.008);
    const rawTo = latLonToVec3(vessel.to.lat, vessel.to.lon, EARTH_RADIUS * 1.008);
    const from = new THREE.Vector3(rawFrom.x, rawFrom.y, rawFrom.z);
    const to = new THREE.Vector3(rawTo.x, rawTo.y, rawTo.z);
    const segments = 24;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const omega = Math.acos(Math.max(-1, Math.min(1,
        (from.x * to.x + from.y * to.y + from.z * to.z) / (EARTH_RADIUS * EARTH_RADIUS))));
      const so = Math.sin(omega);
      const a = so === 0 ? 1 - t : Math.sin((1 - t) * omega) / so;
      const b = so === 0 ? t : Math.sin(t * omega) / so;
      const px = a * from.x + b * to.x;
      const py = a * from.y + b * to.y;
      const pz = a * from.z + b * to.z;
      const len = Math.sqrt(px * px + py * py + pz * pz);
      const r = EARTH_RADIUS * 1.008;
      points.push(new THREE.Vector3(px / len * r, py / len * r, pz / len * r));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(64);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x1565C0, transparent: true, opacity: 0.7 });
    const line = new THREE.Line(lineGeo, lineMat);
    line.visible = false;
    group.add(line);

    const markerGeo = new THREE.ConeGeometry(0.18, 0.45, 4);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x90CAF9 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(points[Math.floor(points.length / 2)]);
    marker.visible = false;
    group.add(marker);

    entities.push({
      line,
      marker,
      timestamp: Date.parse(vessel.timestamp),
    });
  });
  earthGroup.add(group);
  return group;
}

export function update(timeRange) {
  const start = timeRange?.start ?? -Infinity;
  const end = timeRange?.end ?? Infinity;
  entities.forEach(e => {
    const visible = !Number.isNaN(e.timestamp) && e.timestamp >= start && e.timestamp <= end;
    e.line.visible = visible;
    e.marker.visible = visible;
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
