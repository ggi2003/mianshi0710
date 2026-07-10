import * as THREE from 'three';
import { latLonToVec3 } from '../utils/math.js';
import { EARTH_RADIUS } from '../config.js';

let group, entities = [];

const MARITIME_COLOR = 0x1565C0;
const DASH_LENGTH = 0.1;
const DASH_COUNT = 200;
const SPEED = 0.0004;

/**
 * Build a ship icon group — hull + superstructure + funnel + wake.
 * The ship faces +Z (forward) with beam along X.
 */
function createShipIcon() {
  const icon = new THREE.Group();

  const hullMat = new THREE.MeshBasicMaterial({ color: 0x37474F });
  const deckMat = new THREE.MeshBasicMaterial({ color: 0x546E7A });
  const funnelMat = new THREE.MeshBasicMaterial({ color: 0x90A4AE });
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xECEFF1 });

  // Hull — tapered bottom, wider at deck
  const hullGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.30, 5);
  hullGeo.rotateX(Math.PI / 2);   // align along Z
  hullGeo.translate(0, -0.04, 0); // sit below deck line
  const hull = new THREE.Mesh(hullGeo, hullMat);
  icon.add(hull);

  // Deck — flat box
  const deckGeo = new THREE.BoxGeometry(0.10, 0.02, 0.28);
  deckGeo.translate(0, 0.01, 0.02);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  icon.add(deck);

  // Superstructure / bridge
  const bridgeGeo = new THREE.BoxGeometry(0.06, 0.08, 0.10);
  bridgeGeo.translate(0, 0.06, 0.08);
  const bridge = new THREE.Mesh(bridgeGeo, whiteMat);
  icon.add(bridge);

  // Funnel
  const funnelGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.10, 5);
  funnelGeo.translate(0, 0.09, 0.00);
  const funnel = new THREE.Mesh(funnelGeo, funnelMat);
  icon.add(funnel);

  // Bow — pointed front
  const bowGeo = new THREE.ConeGeometry(0.04, 0.08, 4);
  bowGeo.rotateX(-Math.PI / 2);
  bowGeo.translate(0, -0.01, 0.19);
  const bow = new THREE.Mesh(bowGeo, hullMat);
  icon.add(bow);

  return icon;
}

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  entities = [];
  data.forEach(vessel => {
    const rawFrom = latLonToVec3(vessel.from.lat, vessel.from.lon, EARTH_RADIUS * 1.008);
    const rawTo = latLonToVec3(vessel.to.lat, vessel.to.lon, EARTH_RADIUS * 1.008);
    const from = new THREE.Vector3(rawFrom.x, rawFrom.y, rawFrom.z);
    const to = new THREE.Vector3(rawTo.x, rawTo.y, rawTo.z);

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

    // Dashed line
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

    // Ship icon at midpoint, oriented along path
    const mid = Math.floor(allPoints.length / 2);
    const midPt = allPoints[mid].clone();
    const nextPt = allPoints[Math.min(mid + 1, allPoints.length - 1)].clone();
    const forward = nextPt.sub(midPt).normalize();

    const marker = createShipIcon();
    marker.position.copy(allPoints[mid]);

    // Orient: ship body (+Z) along forward, deck up radially
    const up = allPoints[mid].clone().normalize();
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();
    const correctedUp = new THREE.Vector3().crossVectors(right, forward).normalize();
    const m4 = new THREE.Matrix4();
    m4.makeBasis(right, correctedUp, forward);
    marker.setRotationFromMatrix(m4);

    marker.visible = true;
    group.add(marker);

    entities.push({
      vessel,
      dashLine,
      dashGeo,
      allPoints,
      totalSubPoints,
      marker,
      markerOffset: 0,
      timestamp: Date.parse(vessel.timestamp),
    });
  });
  earthGroup.add(group);
  return group;
}

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
