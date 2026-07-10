import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CAMERA_DEFAULTS, EARTH_RADIUS } from '../config.js';
import { latLonToVec3 } from '../utils/math.js';
import { lerp, easeInOutCubic } from '../utils/animation.js';

let camera, renderer, controls, viewMode, cameraTarget, isFlying, flyAnimation;
viewMode = 'low-orbit';
cameraTarget = { lat: 25, lon: 55 };
isFlying = false;
flyAnimation = null;

const UP = new THREE.Vector3(0, 1, 0);
const WORLD_CENTER = new THREE.Vector3(0, 0, 0);

export function init(cam, rend) {
  camera = cam;
  renderer = rend;

  // OrbitControls: scroll zoom + drag rotate + right-click pan
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

/**
 * Convert geographic coords → world point on Earth surface.
 * Uses the SAME formula as latLonToVec3 (and Earth.getSurfacePoint).
 *
 *   lon = 0  →  (+x, 0, 0)    Prime Meridian
 *   lon = -90 →  (0, 0, +z)   90° West
 *   lon = 90  →  (0, 0, -z)   90° East
 *   lat = 90  →  (0, +y, 0)   North Pole
 */
function geoToWorld(lat, lon, radius) {
  const raw = latLonToVec3(lat, lon, radius);
  return new THREE.Vector3(raw.x, raw.y, raw.z);
}

export function switchToLowOrbit() {
  viewMode = 'low-orbit';
  isFlying = true;
  flyAnimation = {
    startFov: camera.fov,
    endFov: CAMERA_DEFAULTS.lowOrbit.fov,
    startTime: performance.now(),
    duration: 1500,
  };
}

export function switchToSpaceArc() {
  viewMode = 'space-arc';
  isFlying = true;
  flyAnimation = {
    startFov: camera.fov,
    endFov: CAMERA_DEFAULTS.spaceArc.fov,
    startTime: performance.now(),
    duration: 1500,
  };
}

/**
 * Fly camera so the given (lat, lon) point on the Earth surface
 * appears in the centre of the screen.
 *
 * @param {THREE.Group} earthGroup — the earth group (may be rotating)
 * @param {number} lat  — geographic latitude
 * @param {number} lon  — geographic longitude
 * @param {number} distance — how far above the surface to place the camera
 * @param {Function} onComplete
 */
export function flyTo(earthGroup, lat, lon, distance, onComplete) {
  // Cache the point in earthGroup-local space so we can re-project it
  // every frame while the earth rotates.
  const localPoint = geoToWorld(lat, lon, EARTH_RADIUS);

  // Compute the initial world-space surface point right now
  const surfaceWorld = earthGroup.localToWorld(localPoint.clone());
  const normal = surfaceWorld.clone().normalize();
  const camEnd = surfaceWorld.clone().add(
    normal.clone().multiplyScalar(distance || 3.5)
  );
  const lookMatrix = new THREE.Matrix4().lookAt(camEnd, surfaceWorld, UP);
  const endQuat = new THREE.Quaternion().setFromRotationMatrix(lookMatrix);

  isFlying = true;
  flyAnimation = {
    startPos:   camera.position.clone(),
    startQuat:  camera.quaternion.clone(),
    endPos:     camEnd,
    endQuat,
    endTarget:  surfaceWorld,
    // Live target tracking — recompute world position each frame
    groupRef:   earthGroup,
    localTarget: localPoint,
    distance:   distance || 3.5,
    startTime:  performance.now(),
    duration:   1000,
    onComplete,
  };
  cameraTarget = { lat, lon };
}

export function getViewMode() { return viewMode; }

export function getCurrentTarget() { return { ...cameraTarget }; }

export function update() {
  if (controls) {
    controls.update();
  }

  if (isFlying && flyAnimation) {
    const elapsed = performance.now() - flyAnimation.startTime;
    const t = Math.min(elapsed / flyAnimation.duration, 1);
    const et = easeInOutCubic(t);

    if (flyAnimation.endPos) {
      camera.position.lerpVectors(flyAnimation.startPos, flyAnimation.endPos, et);
      camera.quaternion.slerpQuaternions(flyAnimation.startQuat, flyAnimation.endQuat, et);
    }
    if (flyAnimation.endFov) {
      camera.fov = lerp(flyAnimation.startFov, flyAnimation.endFov, et);
      camera.updateProjectionMatrix();
    }

    if (t >= 1) {
      isFlying = false;

      // Final precise snap: recompute target in current world-space
      // in case the earth rotated during the flight.
      if (flyAnimation.groupRef && flyAnimation.localTarget) {
        const liveWorld = flyAnimation.groupRef.localToWorld(
          flyAnimation.localTarget.clone()
        );
        const normal = liveWorld.clone().normalize();
        const dist = flyAnimation.distance;
        const finalPos = liveWorld.clone().add(normal.multiplyScalar(dist));
        const finalQuat = new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().lookAt(finalPos, liveWorld, UP)
        );
        camera.position.copy(finalPos);
        camera.quaternion.copy(finalQuat);
        if (controls) controls.target.copy(liveWorld);
      } else {
        camera.position.copy(flyAnimation.endPos);
        camera.quaternion.copy(flyAnimation.endQuat);
        if (flyAnimation.endTarget && controls) {
          controls.target.copy(flyAnimation.endTarget);
        }
      }

      if (flyAnimation.endFov) {
        camera.fov = flyAnimation.endFov;
        camera.updateProjectionMatrix();
      }
      if (flyAnimation.onComplete) flyAnimation.onComplete();
      flyAnimation = null;
    }
  }
}

export function getControls() {
  return controls;
}

export function dispose() {
  if (controls) {
    controls.dispose();
    controls = null;
  }
  camera = null;
  renderer = null;
  flyAnimation = null;
}
