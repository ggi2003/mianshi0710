import * as THREE from 'three';
import { latLonToVec3 } from '../utils/math.js';
import { EARTH_RADIUS } from '../config.js';

let group, markers;

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  markers = [];
  data.forEach(event => {
    const raw = latLonToVec3(event.lat, event.lon, EARTH_RADIUS * 1.04);
    const pos = new THREE.Vector3(raw.x, raw.y, raw.z);
    const color = event.severity === 'CRITICAL' ? 0xFF1744 : event.severity === 'HIGH' ? 0xFF9800 : 0xFFEB3B;

    // Cone marker
    const coneGeo = new THREE.ConeGeometry(0.25, 0.7, 6);
    const coneMat = new THREE.MeshBasicMaterial({ color });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.copy(pos);
    cone.lookAt(new THREE.Vector3(0, 0, 0));
    cone.userData = { eventId: event.id, event };

    // Glow sprite
    const spriteMat = new THREE.SpriteMaterial({ color, transparent: true, opacity: 0.6 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(pos);
    sprite.scale.set(1.5, 1.5, 1);
    sprite.userData = { eventId: event.id, event };

    group.add(cone);
    group.add(sprite);
    markers.push(cone);
  });
  earthGroup.add(group);
  return group;
}

export function getClickableObjects() { return markers || []; }
export function getEventById(id) {
  return markers ? markers.find(m => m.userData?.eventId === id)?.userData?.event || null : null;
}

export function update(timeRange) {}
export function setVisible(visible) { if (group) group.visible = visible; }
export function dispose() {
  if (group) {
    group.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
    group.parent?.remove(group);
    group = null;
    markers = null;
  }
}
