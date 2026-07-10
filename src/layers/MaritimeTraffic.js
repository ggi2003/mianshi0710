import * as THREE from 'three';
import { latLonToVec3 } from '../utils/math.js';
import { EARTH_RADIUS } from '../config.js';

let group, entities = [];

const MARITIME_COLOR = 0x1565C0;
const DASH_LENGTH = 0.1;
const DASH_COUNT = 200;
const SPEED = 0.0004; // very slow crawl

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  entities = [];
  data.forEach(vessel => {
    const rawFrom = latLonToVec3(vessel.from.lat, vessel.from.lon, EARTH_RADIUS * 1.008);
    const rawTo = latLonToVec3(vessel.to.lat, vessel.to.lon, EARTH_RADIUS * 1.008);
    const from = new THREE.Vector3(rawFrom.x, rawFrom.y, rawFrom.z);
    const to = new THREE.Vector3(rawTo.x, rawTo.y, rawTo.z);

    // Build great-circle arc points
    const omega = Math.acos(Math.max(-1, Math.min(1,
      (from.x * to.x + from.y * to.y + from.z * to.z) / (EARTH_RADIUS * EARTH_RADIUS))));
    const so = Math.sin(omega);

    const totalSubPoints = 256;
    const allPoints = [];
    for (let i = 0; i <= totalSubPoints; i++) {
      const t = i / totalSubPoints;
      const a = so === 0 ? 1 - t : Math.sin((1 - t) * omega) / so;
      const b = so === 0 ? t : Math.sin(t * omega) / so;
      const px = a * from.x + b * to.x;
      const py = a * from.y + b * to.y;
      const pz = a * from.z + b * to.z;
      const len = Math.sqrt(px * px + py * py + pz * pz);
      const r = EARTH_RADIUS * 1.008;
      allPoints.push(new THREE.Vector3(px / len * r, py / len * r, pz / len * r));
    }

    // Build dashed line — many short dashes
    const dashGeo = new THREE.BufferGeometry();
    const dashVertices = [];
    const pointsPerDash = 4;

    for (let d = 0; d < DASH_COUNT; d++) {
      const tBase = d / DASH_COUNT;
      for (let p = 0; p < pointsPerDash; p++) {
        const t = tBase + (p / (DASH_COUNT * pointsPerDash)) * (DASH_LENGTH / 2);
        const tClamped = t % 1;
        const idx = tClamped * totalSubPoints;
        const i0 = Math.floor(idx);
        const i1 = (i0 + 1) % (totalSubPoints + 1);
        const frac = idx - i0;
        const pt = new THREE.Vector3().lerpVectors(allPoints[i0], allPoints[i1], frac);
        dashVertices.push(pt.x, pt.y, pt.z);
      }
    }

    dashGeo.setAttribute('position', new THREE.Float32BufferAttribute(dashVertices, 3));
    const dashMat = new THREE.LineBasicMaterial({ color: MARITIME_COLOR, transparent: true, opacity: 0.7 });
    const dashLine = new THREE.Line(dashGeo, dashMat);
    dashLine.visible = true;
    group.add(dashLine);

    // Vessel marker (cone) at midpoint
    const markerGeo = new THREE.ConeGeometry(0.18, 0.45, 4);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x90CAF9 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    const mid = Math.floor(allPoints.length / 2);
    marker.position.copy(allPoints[mid]);
    marker.visible = true;
    group.add(marker);

    entities.push({
      vessel,
      dashLine,
      dashGeo,
      allPoints,
      totalSubPoints,
      marker,
      markerOffset: 0, // flow offset: 0..1
      timestamp: Date.parse(vessel.timestamp),
    });
  });
  earthGroup.add(group);
  return group;
}

/**
 * Advance dash flow animation.
 * @param {number} dt  Delta time in milliseconds.
 */
export function animate(dt) {
  if (!group || !group.visible) return;
  const totalPoints = 256;
  const pointsPerDash = 4;

  entities.forEach(e => {
    e.markerOffset = (e.markerOffset + SPEED * dt) % 1;

    const vertices = [];
    for (let d = 0; d < DASH_COUNT; d++) {
      const tBase = ((d / DASH_COUNT) + e.markerOffset) % 1;
      for (let p = 0; p < pointsPerDash; p++) {
        const t = (tBase + (p / (DASH_COUNT * pointsPerDash)) * (DASH_LENGTH / 2)) % 1;
        const idx = t * totalPoints;
        const i0 = Math.floor(idx);
        const i1 = (i0 + 1) % (totalPoints + 1);
        const frac = idx - i0;
        const pt = new THREE.Vector3().lerpVectors(e.allPoints[i0], e.allPoints[i1], frac);
        vertices.push(pt.x, pt.y, pt.z);
      }
    }

    e.dashGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    e.dashGeo.attributes.position.needsUpdate = true;
  });
}

export function update(timeRange) {
  // Maritime traffic is always visible regardless of time window
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
