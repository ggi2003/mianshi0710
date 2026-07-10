import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CAMERA_DEFAULTS, EARTH_RADIUS } from '../config.js';
import { latLonToVec3 } from '../utils/math.js';
import { lerp, easeInOutCubic } from '../utils/animation.js';

let camera, renderer, controls, viewMode;
let fovAnimation = null;
let tracking = null;

viewMode = 'low-orbit';

const WORLD_UP = new THREE.Vector3(0, 1, 0);

function geoToLocal(lat, lon, radius) {
  const raw = latLonToVec3(lat, lon, radius);
  return new THREE.Vector3(raw.x, raw.y, raw.z);
}

/** Build camera-look frame for a world-space surface point */
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

/**
 * Rotate the earth group so the local point faces +Z (the camera's
 * default forward direction).  Then place camera on +Z looking at
 * origin and the event is dead-centre.
 */
function spinEarthToFace(earthGroup, localTarget, dist) {
  // The target point in local space must end up at (+Z * R) in world
  // space (i.e.  facing the default camera position along +Z).
  const localNorm = localTarget.clone().normalize();
  const desiredWorldNorm = new THREE.Vector3(0, 0, 1);

  // Quaternion that rotates localNorm → desiredWorldNorm
  const q = new THREE.Quaternion().setFromUnitVectors(localNorm, desiredWorldNorm);

  // Apply to earthGroup
  earthGroup.quaternion.copy(q);

  // Now the surface point is at (0, 0, R) in world space
  const worldTarget = new THREE.Vector3(0, 0, EARTH_RADIUS);
  return worldTarget;
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

export function trackPoint(earthGroup, lat, lon, dist = 2.8) {
  const localPt = geoToLocal(lat, lon, EARTH_RADIUS);

  // Snapshot current earth quaternion for interpolation
  tracking = {
    group:       earthGroup,
    localTarget: localPt,
    lat,
    lon,
    dist,
    startQuat:   earthGroup.quaternion.clone(),
    startCamPos: camera.position.clone(),
    startCamQuat: camera.quaternion.clone(),
    startTime:   performance.now(),
    duration:    1200,
  };
}

export function stopTracking() { tracking = null; }
export function getViewMode() { return viewMode; }
export function getCurrentTarget() {
  return tracking ? { lat: tracking.lat, lon: tracking.lon } : null;
}

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

  // 3. Tracking — rotate earth so event faces camera
  if (tracking) {
    const elapsed = performance.now() - tracking.startTime;
    const t = Math.min(elapsed / tracking.duration, 1);
    const et = easeInOutCubic(t);

    // Compute the target earth quaternion that puts the event at +Z
    const localNorm = tracking.localTarget.clone().normalize();
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(localNorm, new THREE.Vector3(0, 0, 1));

    // Interpolate earth rotation
    tracking.group.quaternion.copy(
      tracking.startQuat.clone().slerp(targetQuat, et)
    );

    // The event is now at (0, 0, R) in world space — camera sits on +Z
    const worldTarget = new THREE.Vector3(0, 0, EARTH_RADIUS);
    const { camPos: endCamPos, quat: endCamQuat } = lookFrame(worldTarget, tracking.dist);

    if (t < 1) {
      camera.position.lerpVectors(tracking.startCamPos, endCamPos, et);
      camera.quaternion.slerpQuaternions(tracking.startCamQuat, endCamQuat, et);
    } else {
      camera.position.lerp(endCamPos, 0.15);
      camera.quaternion.slerp(endCamQuat, 0.15);
    }

    if (controls) controls.target.copy(worldTarget);
  }
}

export function getControls() { return controls; }

export function dispose() {
  if (controls) { controls.dispose(); controls = null; }
  camera = null; renderer = null; tracking = null; fovAnimation = null;
}
