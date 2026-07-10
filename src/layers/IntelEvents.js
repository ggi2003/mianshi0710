import * as THREE from 'three';
import { latLonToVec3 } from '../utils/math.js';
import { EARTH_RADIUS } from '../config.js';

let group, markers, currentPlaybackTime, currentTimeRange, eventData;
const markerLookup = new Map(); // id → marker for fast show/hide

function updateMarkerVisibility() {
  const start = currentTimeRange?.start ?? -Infinity;
  const end = currentTimeRange?.end ?? currentPlaybackTime ?? Date.now();
  (markers || []).forEach(marker => {
    const event = marker.userData?.event;
    const timestamp = event ? Date.parse(event.timestamp) : NaN;
    const isVisible = !Number.isNaN(timestamp) && timestamp >= start && timestamp <= end;
    marker.visible = isVisible;
    if (marker.userData?.sprite) {
      marker.userData.sprite.visible = isVisible;
    }
  });
}

export function create(scene, earthGroup, data) {
  group = new THREE.Group();
  markers = [];
  markerLookup.clear();
  eventData = data || [];
  eventData.forEach(event => {
    const raw = latLonToVec3(event.lat, event.lon, EARTH_RADIUS * 1.04);
    const pos = new THREE.Vector3(raw.x, raw.y, raw.z);
    const color = event.severity === 'CRITICAL' ? 0xFF1744 : event.severity === 'HIGH' ? 0xFF9800 : 0xFFEB3B;

    // Cone marker
    const coneGeo = new THREE.ConeGeometry(0.25, 0.7, 6);
    const coneMat = new THREE.MeshBasicMaterial({ color });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.copy(pos);
    cone.lookAt(new THREE.Vector3(0, 0, 0));
    cone.visible = false;

    // Glow sprite
    const spriteMat = new THREE.SpriteMaterial({ color, transparent: true, opacity: 0.6 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(pos);
    sprite.scale.set(1.5, 1.5, 1);
    sprite.visible = false;

    cone.userData = { eventId: event.id, event, sprite };
    sprite.userData = { eventId: event.id, event, marker: cone };

    group.add(cone);
    group.add(sprite);
    markers.push(cone);
    markerLookup.set(event.id, cone);
  });
  earthGroup.add(group);
  return group;
}

export function getClickableObjects() { return markers || []; }
export function getEventById(id) {
  return markers ? markers.find(m => m.userData?.eventId === id)?.userData?.event || null : null;
}

/** Hide a single event by ID (called when it exits the time window) */
export function hideEvent(id) {
  const marker = markerLookup.get(id);
  if (marker) {
    marker.visible = false;
    if (marker.userData?.sprite) {
      marker.userData.sprite.visible = false;
    }
  }
}

export function update(timeRange) {
  currentTimeRange = timeRange || currentTimeRange || { start: null, end: Date.now() };
  currentPlaybackTime = currentTimeRange?.end ?? currentPlaybackTime ?? Date.now();
  updateMarkerVisibility();
}

export function setCurrentPlaybackTime(timeRange) {
  if (typeof timeRange === 'number') {
    currentTimeRange = { start: null, end: timeRange };
    currentPlaybackTime = timeRange;
  } else {
    currentTimeRange = timeRange || currentTimeRange || { start: null, end: Date.now() };
    currentPlaybackTime = currentTimeRange?.end ?? currentPlaybackTime ?? Date.now();
  }
  updateMarkerVisibility();
}

export function setVisible(visible) { if (group) group.visible = visible; }
export function dispose() {
  if (group) {
    group.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
    group.parent?.remove(group);
    group = null;
    markers = null;
    markerLookup.clear();
    currentPlaybackTime = null;
    currentTimeRange = null;
    eventData = null;
  }
}
