import * as THREE from 'three';
import { latLonToVec3 } from '../utils/math.js';
import { EARTH_RADIUS } from '../config.js';

let group, entities = [];

const FLIGHT_COLOR = 0x4FC3F7;

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  entities = [];
  data.forEach(flight => {
    const rawFrom = latLonToVec3(flight.from.lat, flight.from.lon, EARTH_RADIUS * 1.005);
    const rawTo = latLonToVec3(flight.to.lat, flight.to.lon, EARTH_RADIUS * 1.005);
    const from = new THREE.Vector3(rawFrom.x, rawFrom.y, rawFrom.z);
    const to = new THREE.Vector3(rawTo.x, rawTo.y, rawTo.z);
    const segments = 32;
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
      points.push(new THREE.Vector3(px / len * EARTH_RADIUS * 1.005, py / len * EARTH_RADIUS * 1.005, pz / len * EARTH_RADIUS * 1.005));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(64);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const lineMat = new THREE.LineBasicMaterial({ color: FLIGHT_COLOR, transparent: true, opacity: 0.6 });
    const line = new THREE.Line(lineGeo, lineMat);
    line.visible = false;
    group.add(line);

    // Aircraft marker
    const markerGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(points[Math.floor(points.length / 2)]);
    marker.visible = false;
    group.add(marker);

    entities.push({
      flight,
      timestamp: Date.parse(flight.timestamp),
      line,
      marker,
    });
    // Show immediately since flights are always visible
    line.visible = true;
    marker.visible = true;
  });
  earthGroup.add(group);
  return group;
}

export function update(timeRange) {
  // Flights are always visible regardless of time window
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
