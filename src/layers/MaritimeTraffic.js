import * as THREE from 'three';
import { latLonToVec3, greatCircleInterpolation } from '../utils/math.js';
import { EARTH_RADIUS } from '../config.js';

let group;

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  data.forEach(vessel => {
    const rawFrom = latLonToVec3(vessel.from.lat, vessel.from.lon, EARTH_RADIUS * 1.008);
    const rawTo = latLonToVec3(vessel.to.lat, vessel.to.lon, EARTH_RADIUS * 1.008);
    const pts = greatCircleInterpolation(vessel.from, vessel.to, 32);
    const points = pts.map(p => new THREE.Vector3(
      p.x / Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) * EARTH_RADIUS * 1.008,
      p.y / Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) * EARTH_RADIUS * 1.008,
      p.z / Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) * EARTH_RADIUS * 1.008
    ));
    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(64);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x1565C0, transparent: true, opacity: 0.7, linewidth: 2 });
    const line = new THREE.Line(lineGeo, lineMat);
    group.add(line);

    // Marker
    const markerGeo = new THREE.ConeGeometry(0.18, 0.45, 4);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x90CAF9 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(points[Math.floor(points.length / 2)]);
    group.add(marker);
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
