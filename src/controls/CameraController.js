import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CAMERA_DEFAULTS, EARTH_RADIUS } from '../config.js';
import { latLonToVec3 } from '../utils/math.js';
import { lerp, easeInOutCubic } from '../utils/animation.js';

let camera, renderer, controls, viewMode;
let fovAnimation = null;

// ── tracking state ──
// While non-null the camera continuously follows this geographic point,
// re-projecting its world position every frame so it stays centred on
// screen even when the earthGroup rotates.
let tracking = null; // { group, lat, lon, dist }

viewMode = 'low-orbit';

const UP = new THREE.Vector3(0, 1, 0);

/** Same formula as math.js::latLonToVec3 */
function geoToLocal(lat, lon, radius) {
  const raw = latLonToVec3(lat, lon, radius);
  return new THREE.Vector3(raw.x, raw.y, raw.z);
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
  if (camera) {
    camera.fov = defaults.fov;
    camera.updateProjectionMatrix();
  }
}

// ── view-mode switches (FOV only, no position change) ──

export function switchToLowOrbit() {
  viewMode = 'low-orbit';
  fovAnimation = {
    startFov: camera.fov,
    endFov:   CAMERA_DEFAULTS.lowOrbit.fov,
    startTime: performance.now(),
    duration:  1200,
  };
}

export function switchToSpaceArc() {
  viewMode = 'space-arc';
  fovAnimation = {
    startFov: camera.fov,
    endFov:   CAMERA_DEFAULTS.spaceArc.fov,
    startTime: performance.now(),
    duration:  1200,
  };
}

// ── tracking (replaces one-shot flyTo) ──

/**
 * Start continuously tracking a geographic point — the camera will
 * interpolate to it and then keep it centred every frame.  Cancel a
 * previous track if one is in-flight.
 *
 * @param {THREE.Group} earthGroup
 * @param {number} lat
 * @param {number} lon
 * @param {number} [dist=3.5]  camera altitude above surface
 */
export function trackPoint(earthGroup, lat, lon, dist = 3.5) {
  const localPt = geoToLocal(lat, lon, EARTH_RADIUS);

  // snapshot current real camera state as start
  tracking = {
    group:       earthGroup,
    localTarget: localPt,
    lat,
    lon,
    dist,
    // start state (frozen — used for smooth interpolation)
    startPos:    camera.position.clone(),
    startQuat:   camera.quaternion.clone(),
    startTime:   performance.now(),
    duration:    800,
  };
}

/** Stop tracking — user can freely orbit again. */
export function stopTracking() {
  tracking = null;
}

export function getViewMode() { return viewMode; }

/** Returns the currently tracked {lat, lon} or null. */
export function getCurrentTarget() {
  return tracking ? { lat: tracking.lat, lon: tracking.lon } : null;
}

// ═══════════════════════════════════════════════════════════════════
//  Per-frame update
// ═══════════════════════════════════════════════════════════════════

export function update() {
  // 1. FOV-only animation (view-mode toggle)
  if (fovAnimation) {
    const t = Math.min(
      (performance.now() - fovAnimation.startTime) / fovAnimation.duration,
      1,
    );
    camera.fov = lerp(fovAnimation.startFov, fovAnimation.endFov, easeInOutCubic(t));
    camera.updateProjectionMatrix();
    if (t >= 1) {
      camera.fov = fovAnimation.endFov;
      camera.updateProjectionMatrix();
      fovAnimation = null;
    }
  }

  // 2. OrbitControls idle damping (skip when we're driving the camera)
  if (controls) {
    controls.update();
  }

  // 3. Track a geographic point — override controls
  if (tracking) {
    const elapsed = performance.now() - tracking.startTime;
    const t = Math.min(elapsed / tracking.duration, 1);
    const et = easeInOutCubic(t);

    // live world-space position of the tracked point
    const worldTarget = tracking.group.localToWorld(
      tracking.localTarget.clone(),
    );
    const normal = worldTarget.clone().normalize();
    const worldCamPos = worldTarget.clone().add(
      normal.multiplyScalar(tracking.dist),
    );
    const worldQuat = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(worldCamPos, worldTarget, UP),
    );

    if (t < 1) {
      // still in the transition — interpolate from frozen start
      camera.position.lerpVectors(tracking.startPos, worldCamPos, et * 0.12 + 0.01);
      camera.quaternion.slerpQuaternions(tracking.startQuat, worldQuat, et * 0.12 + 0.01);
    } else {
      // tracking "settled" — just keep it centred
      camera.position.lerp(worldCamPos, 0.15);
      camera.quaternion.slerp(worldQuat, 0.15);
    }

    // always point OrbitControls target at the live world position
    if (controls) controls.target.copy(worldTarget);
  }
}

export function getControls() {
  return controls;
}

export function dispose() {
  if (controls) { controls.dispose(); controls = null; }
  camera = null;
  renderer = null;
  tracking = null;
  fovAnimation = null;
}
