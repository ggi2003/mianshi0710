import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CAMERA_DEFAULTS, EARTH_RADIUS } from '../config.js';
import { latLonToVec3 } from '../utils/math.js';
import { lerp, easeInOutCubic } from '../utils/animation.js';

let camera, renderer, controls, viewMode;
let fovAnimation = null;
let tracking = null; // null | { group, startQuat, targetQuat, startCamPos, targetCamPos: {camPos, quat}, startTime, duration }
let introDone = false;

viewMode = 'low-orbit';

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const FORWARD = new THREE.Vector3(0, 0, 1);  // +Z = screen front

function geoToLocal(lat, lon, radius) {
  const raw = latLonToVec3(lat, lon, radius);
  return new THREE.Vector3(raw.x, raw.y, raw.z);
}

/** Build camera position + orientation looking at a world-space surface point */
function lookFrame(worldTarget, dist) {
  const n = worldTarget.clone().normalize();
  const cp = worldTarget.clone().add(n.clone().multiplyScalar(dist));
  const right = new THREE.Vector3().crossVectors(n, WORLD_UP).normalize();
  const up = right.length() < 0.001
    ? new THREE.Vector3(1, 0, 0)
    : new THREE.Vector3().crossVectors(right, n).normalize();
  const quat = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().lookAt(cp, worldTarget, up),
  );
  return { camPos: cp, quat };
}

// ═══════════════════════════════════════════════════════════════════
//  Public API
// ═══════════════════════════════════════════════════════════════════

export function init(cam, rend) {
  camera = cam;
  renderer = rend;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = EARTH_RADIUS + 1;
  controls.maxDistance = 100;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.5;
  controls.target.set(0, 0, 0);

  applyViewMode(viewMode);
}

function applyViewMode(mode) {
  const defaults = mode === 'low-orbit' ? CAMERA_DEFAULTS.lowOrbit : CAMERA_DEFAULTS.spaceArc;
  if (camera) { camera.fov = defaults.fov; camera.updateProjectionMatrix(); }
}

export function switchToLowOrbit() {
  viewMode = 'low-orbit';
  fovAnimation = { startFov: camera.fov, endFov: CAMERA_DEFAULTS.lowOrbit.fov, startTime: performance.now(), duration: 1200 };
}

export function switchToSpaceArc() {
  viewMode = 'space-arc';
  fovAnimation = { startFov: camera.fov, endFov: CAMERA_DEFAULTS.spaceArc.fov, startTime: performance.now(), duration: 1200 };
}

/**
 * Called once from main.js once the intro spin has finished.
 * Unlocks the camera to actually track events (rotation is forbidden
 * during the intro so the two animations don't fight).
 */
export function markIntroDone() { introDone = true; }

/** Rotate earth AND camera so the event at (lat, lon) faces the screen. */
export function trackPoint(earthGroup, lat, lon, dist = 2.8) {
  if (!introDone) return; // don't hijack the intro spin

  const localPt = geoToLocal(lat, lon, EARTH_RADIUS);
  const localNorm = localPt.clone().normalize();

  // Earth quaternion that puts the event at +Z (forward)
  const targetEarthQuat = new THREE.Quaternion().setFromUnitVectors(localNorm, FORWARD);

  // Camera target: (0, 0, R) + outward by `dist`
  const worldTarget = new THREE.Vector3(0, 0, EARTH_RADIUS);
  const { camPos: targetCamPos, quat: targetCamQuat } = lookFrame(worldTarget, dist);

  tracking = {
    group:         earthGroup,
    startQuat:     earthGroup.quaternion.clone(),
    targetQuat:    targetEarthQuat,
    startCamPos:   camera.position.clone(),
    startCamQuat:  camera.quaternion.clone(),
    targetCamPos,
    targetCamQuat,
    startTime:     performance.now(),
    duration:      900,
  };
}

export function stopTracking() { tracking = null; }
export function getViewMode() { return viewMode; }
export function getCurrentTarget() { return null; }

// ═══════════════════════════════════════════════════════════════════
//  Per-frame update
// ═══════════════════════════════════════════════════════════════════

export function update() {
  // 1. FOV
  if (fovAnimation) {
    const t = Math.min((performance.now() - fovAnimation.startTime) / fovAnimation.duration, 1);
    camera.fov = lerp(fovAnimation.startFov, fovAnimation.endFov, easeInOutCubic(t));
    camera.updateProjectionMatrix();
    if (t >= 1) { camera.fov = fovAnimation.endFov; camera.updateProjectionMatrix(); fovAnimation = null; }
  }

  // 2. OrbitControls
  if (controls) controls.update();

  // 3. Tracking — rotate earth + camera so event faces screen
  if (tracking && introDone) {
    const elapsed = performance.now() - tracking.startTime;
    const t = Math.min(elapsed / tracking.duration, 1);
    const et = easeInOutCubic(t);

    // Interpolate earth rotation
    tracking.group.quaternion.copy(
      tracking.startQuat.clone().slerp(tracking.targetQuat, et)
    );

    // Interpolate camera
    camera.position.lerpVectors(tracking.startCamPos, tracking.targetCamPos, et);
    camera.quaternion.slerpQuaternions(tracking.startCamQuat, tracking.targetCamQuat, et);

    // OrbitControls target on the surface point at (0,0,R)
    if (controls) {
      const worldTarget = new THREE.Vector3(0, 0, EARTH_RADIUS);
      controls.target.copy(worldTarget);
    }

    if (t >= 1) {
      tracking = null;
    }
  }
}

export function getControls() { return controls; }

export function dispose() {
  if (controls) { controls.dispose(); controls = null; }
  camera = null; renderer = null; tracking = null; fovAnimation = null;
}
