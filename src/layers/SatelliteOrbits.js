import * as THREE from 'three';
import { EARTH_RADIUS } from '../config.js';

let group, entities = [];
let lastTime = null;

const VISUAL_SPEED = 2 * Math.PI * 100; // radians/sec base — makes LEO sats orbit in ~2s

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  entities = [];
  lastTime = null;

  data.forEach(sat => {
    const orbitRadius = EARTH_RADIUS + sat.altitude * 0.02;
    const inclinationRad = sat.inclination * Math.PI / 180;

    // ── Orbit ring (static reference) ──
    const ringPoints = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(
        orbitRadius * Math.cos(angle),
        orbitRadius * Math.sin(angle) * Math.sin(inclinationRad),
        orbitRadius * Math.sin(angle) * Math.cos(inclinationRad)
      ));
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.3 });
    const line = new THREE.Line(lineGeo, lineMat);
    line.visible = true;
    group.add(line);

    // ── Satellite dot ──
    const startAngle = sat.phase * Math.PI * 2;
    const dotGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x00E676 });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(
      orbitRadius * Math.cos(startAngle),
      orbitRadius * Math.sin(startAngle) * Math.sin(inclinationRad),
      orbitRadius * Math.sin(startAngle) * Math.cos(inclinationRad)
    );
    dot.visible = true;
    group.add(dot);

    entities.push({
      line,
      dot,
      orbitRadius,
      inclinationRad,
      period: sat.period,       // minutes
      currentAngle: startAngle,
      timestamp: Date.parse(sat.timestamp),
    });
  });

  earthGroup.add(group);
  return group;
}

/**
 * Advance each satellite along its orbit.
 * @param {number} dt  Delta time in milliseconds.
 */
export function animate(dt) {
  if (!group || !group.visible) return;
  const dtSec = dt / 1000;
  entities.forEach(e => {
    e.currentAngle += dtSec * VISUAL_SPEED / e.period;
    // Keep angle in [0, 2π) to avoid floating-point drift
    if (e.currentAngle > Math.PI * 2) e.currentAngle -= Math.PI * 2;
    e.dot.position.set(
      e.orbitRadius * Math.cos(e.currentAngle),
      e.orbitRadius * Math.sin(e.currentAngle) * Math.sin(e.inclinationRad),
      e.orbitRadius * Math.sin(e.currentAngle) * Math.cos(e.inclinationRad)
    );
  });
}

export function update(timeRange) {
  // Satellites are always visible regardless of time window
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
