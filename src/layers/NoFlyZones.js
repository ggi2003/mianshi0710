import * as THREE from 'three';
import { latLonToVec3 } from '../utils/math.js';
import { EARTH_RADIUS } from '../config.js';

let group;

function toVec3(raw) {
  return new THREE.Vector3(raw.x, raw.y, raw.z);
}

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  data.forEach(zone => {
    const centerLat = zone.vertices.reduce((s, v) => s + v.lat, 0) / zone.vertices.length;
    const centerLon = zone.vertices.reduce((s, v) => s + v.lon, 0) / zone.vertices.length;
    const rawCp = latLonToVec3(centerLat, centerLon, EARTH_RADIUS);
    const cp = toVec3(rawCp);

    const shape = new THREE.Shape();
    zone.vertices.forEach((v, i) => {
      const raw = latLonToVec3(v.lat, v.lon, EARTH_RADIUS);
      const diff = new THREE.Vector3(raw.x - cp.x, raw.y - cp.y, raw.z - cp.z);
      if (i === 0) shape.moveTo(diff.x, diff.y);
      else shape.lineTo(diff.x, diff.y);
    });

    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFF1744, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    const rawCp2 = latLonToVec3(centerLat, centerLon, EARTH_RADIUS * 1.015);
    mesh.position.copy(toVec3(rawCp2));
    mesh.lookAt(new THREE.Vector3(0, 0, 0));
    group.add(mesh);

    const borderPoints = zone.vertices.map(v => toVec3(latLonToVec3(v.lat, v.lon, EARTH_RADIUS * 1.015)));
    borderPoints.push(borderPoints[0]);
    const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);
    const borderMat = new THREE.LineBasicMaterial({ color: 0xFF1744, transparent: true, opacity: 0.8 });
    const border = new THREE.Line(borderGeo, borderMat);
    group.add(border);
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
