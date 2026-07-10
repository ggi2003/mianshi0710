import * as THREE from 'three';
import { EARTH_RADIUS } from '../config.js';

let group, entities = [];

const VISUAL_SPEED = 2 * Math.PI * 100; // radians/sec base — makes LEO sats orbit in ~2s

/**
 * Build a satellite icon — central body + two solar panels + dish.
 * Body along Z (forward = orbit tangent), panels along X (radial).
 */
function createSatelliteIcon() {
  const icon = new THREE.Group();

  const bodyMat = new THREE.MeshBasicMaterial({ color: 0xB0BEC5 });
  const panelMat = new THREE.MeshBasicMaterial({ color: 0x1B5E20 });
  const dishMat = new THREE.MeshBasicMaterial({ color: 0xECEFF1 });
  const accentMat = new THREE.MeshBasicMaterial({ color: 0xFFD54F });

  // Central body — box
  const bodyGeo = new THREE.BoxGeometry(0.12, 0.12, 0.20);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  icon.add(body);

  // Solar panels — two flat rectangles along X axis
  const panelGeo = new THREE.BoxGeometry(0.50, 0.005, 0.18);
  // Left panel
  const leftPanel = new THREE.Mesh(panelGeo, panelMat);
  leftPanel.position.set(-0.30, 0, 0);
  icon.add(leftPanel);
  // Right panel
  const rightPanel = new THREE.Mesh(panelGeo, panelMat);
  rightPanel.position.set(0.30, 0, 0);
  icon.add(rightPanel);

  // Panel support struts
  const strutGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.24, 5);
  strutGeo.rotateX(Math.PI / 2);
  const leftStrut = new THREE.Mesh(strutGeo, accentMat);
  leftStrut.position.set(-0.18, 0, 0);
  icon.add(leftStrut);
  const rightStrut = new THREE.Mesh(strutGeo, accentMat);
  rightStrut.position.set(0.18, 0, 0);
  icon.add(rightStrut);

  // Antenna dish — cone pointing down (toward Earth)
  const dishGeo = new THREE.ConeGeometry(0.06, 0.08, 6);
  dishGeo.rotateX(Math.PI);
  dishGeo.translate(0, -0.09, 0);
  const dish = new THREE.Mesh(dishGeo, dishMat);
  icon.add(dish);

  // Dish stalk
  const stalkGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 5);
  stalkGeo.translate(0, -0.07, 0);
  const stalk = new THREE.Mesh(stalkGeo, accentMat);
  icon.add(stalk);

  return icon;
}

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  entities = [];

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

    // ── Satellite icon at starting position ──
    const startAngle = sat.phase * Math.PI * 2;
    const icon = createSatelliteIcon();
    icon.position.set(
      orbitRadius * Math.cos(startAngle),
      orbitRadius * Math.sin(startAngle) * Math.sin(inclinationRad),
      orbitRadius * Math.sin(startAngle) * Math.cos(inclinationRad)
    );
    icon.visible = true;
    group.add(icon);

    entities.push({
      line,
      icon,
      orbitRadius,
      inclinationRad,
      period: sat.period,
      currentAngle: startAngle,
      timestamp: Date.parse(sat.timestamp),
    });
  });

  earthGroup.add(group);
  return group;
}

/**
 * Advance each satellite along its orbit + orient the icon correctly.
 */
export function animate(dt) {
  if (!group || !group.visible) return;
  const dtSec = dt / 1000;
  entities.forEach(e => {
    e.currentAngle += dtSec * VISUAL_SPEED / e.period;
    if (e.currentAngle > Math.PI * 2) e.currentAngle -= Math.PI * 2;

    const { orbitRadius, inclinationRad, currentAngle, icon } = e;

    // Position
    const px = orbitRadius * Math.cos(currentAngle);
    const py = orbitRadius * Math.sin(currentAngle) * Math.sin(inclinationRad);
    const pz = orbitRadius * Math.sin(currentAngle) * Math.cos(inclinationRad);
    icon.position.set(px, py, pz);

    // Orientation: body (+Z) = tangent, panels (+X) = radial-out from Earth
    const radial = new THREE.Vector3(px, py, pz).normalize(); // away from Earth center
    const tangent = new THREE.Vector3(
      -Math.sin(currentAngle),
      Math.cos(currentAngle) * Math.sin(inclinationRad),
      Math.cos(currentAngle) * Math.cos(inclinationRad)
    ).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, radial).normalize();

    const m4 = new THREE.Matrix4();
    m4.makeBasis(radial, side.negate(), tangent);
    icon.setRotationFromMatrix(m4);
  });
}

export function update(timeRange) {}
export function setVisible(visible) { if (group) group.visible = visible; }

export function dispose() {
  if (group) {
    group.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
    group.parent?.remove(group);
    group = null;
    entities = [];
  }
}
