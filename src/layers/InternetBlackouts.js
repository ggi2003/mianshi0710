import * as THREE from 'three';
import { latLonToVec3 } from '../utils/math.js';
import { EARTH_RADIUS } from '../config.js';

let group, entities = [];

/**
 * Build a network-outage icon — globe core + broken signal arcs + X mark.
 * All parts use the outage color tone.
 */
function createOutageIcon() {
  const icon = new THREE.Group();
  const color = 0xFF6D00;

  const lineMat  = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
  const faintMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });

  // Broken signal arcs — 3 concentric incomplete rings
  const arcRadii = [0.20, 0.28, 0.36];
  const arcGaps   = [0.15, 0.18, 0.22]; // gap angle (rad) where signal is "broken"

  arcRadii.forEach((radius, i) => {
    const gap = arcGaps[i];
    const totalAngle = Math.PI * 2 - gap;
    const segments = 24;
    const arcPoints = [];
    const startAngle = gap / 2; // center the gap at top
    for (let s = 0; s <= segments; s++) {
      const a = startAngle + (s / segments) * totalAngle;
      arcPoints.push(new THREE.Vector3(
        Math.cos(a) * radius,
        Math.sin(a) * radius + 0.05 * i,
        0
      ));
    }
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arc = new THREE.Line(arcGeo, i === 1 ? lineMat : faintMat);
    icon.add(arc);
  });

  // Cross / X mark through the core — "no connection"
  const xLen = 0.18;
  const xGeo1 = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-xLen, -xLen, 0), new THREE.Vector3(xLen, xLen, 0)
  ]);
  const xGeo2 = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-xLen, xLen, 0), new THREE.Vector3(xLen, -xLen, 0)
  ]);
  const x1 = new THREE.Line(xGeo1, new THREE.LineBasicMaterial({ color: 0xFF1744, transparent: true, opacity: 0.85 }));
  const x2 = new THREE.Line(xGeo2, new THREE.LineBasicMaterial({ color: 0xFF1744, transparent: true, opacity: 0.85 }));
  icon.add(x1);
  icon.add(x2);

  return icon;
}

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  entities = [];
  data.forEach(bl => {
    const raw = latLonToVec3(bl.lat, bl.lon, EARTH_RADIUS * 1.02);
    const pos = new THREE.Vector3(raw.x, raw.y, raw.z);

    // Replace cone with outage icon
    const icon = createOutageIcon();
    icon.position.copy(pos);
    icon.lookAt(new THREE.Vector3(0, 0, 0));
    icon.visible = false;
    group.add(icon);

    const ringGeo = new THREE.RingGeometry(0.45, 0.65, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xFF6D00, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    ring.visible = false;
    group.add(ring);

    entities.push({
      icon,
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
    e.icon.visible = visible;
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
