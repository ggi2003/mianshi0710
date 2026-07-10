import * as THREE from 'three';
import { EARTH_RADIUS } from '../config.js';

let group, entities = [];

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  entities = [];
  data.forEach(sat => {
    const orbitRadius = EARTH_RADIUS + sat.altitude * 0.02;
    const points = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      const x = orbitRadius * Math.cos(angle);
      const y = orbitRadius * Math.sin(angle) * Math.sin(sat.inclination * Math.PI / 180);
      const z = orbitRadius * Math.sin(angle) * Math.cos(sat.inclination * Math.PI / 180);
      points.push(new THREE.Vector3(x, y, z));
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.3 });
    const line = new THREE.Line(lineGeo, lineMat);
    line.visible = false;
    group.add(line);

    const phaseAngle = sat.phase * Math.PI * 2;
    const sx = orbitRadius * Math.cos(phaseAngle);
    const sy = orbitRadius * Math.sin(phaseAngle) * Math.sin(sat.inclination * Math.PI / 180);
    const sz = orbitRadius * Math.sin(phaseAngle) * Math.cos(sat.inclination * Math.PI / 180);
    const dotGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x00E676 });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(sx, sy, sz);
    dot.visible = false;
    group.add(dot);

    entities.push({ line, dot, timestamp: Date.parse(sat.timestamp) });
    // Show immediately since satellites are always visible
    line.visible = true;
    dot.visible = true;
  });
  earthGroup.add(group);
  return group;
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
