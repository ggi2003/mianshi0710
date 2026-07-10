import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CAMERA_DEFAULTS, EARTH_RADIUS } from '../config.js';
import { lerp, easeInOutCubic } from '../utils/animation.js';

let camera, renderer, controls, viewMode, cameraTarget, isFlying, flyAnimation;
viewMode = 'low-orbit';
cameraTarget = { lat: 25, lon: 55 };
isFlying = false;
flyAnimation = null;

export function init(cam, rend) {
  camera = cam;
  renderer = rend;

  // OrbitControls: 滚轮缩放 + 拖拽旋转 + 右键平移
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = EARTH_RADIUS + 1;   // 防止缩进地球内部
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

export function flyTo(earthGroup, lat, lon, distance, onComplete) {
  const target = earthGroup.localToWorld(
    new THREE.Vector3().setFromSphericalCoords(
      EARTH_RADIUS + (distance || 0.5),
      ((90 - lat) * Math.PI) / 180,
      ((lon + 90) * Math.PI) / 180
    )
  );
  isFlying = true;
  flyAnimation = {
    startPos: camera.position.clone(),
    endPos: target,
    startTime: performance.now(),
    duration: 1500,
    onComplete,
  };
  cameraTarget = { lat, lon };
}

export function getViewMode() { return viewMode; }

export function getCurrentTarget() { return { ...cameraTarget }; }

export function update() {
  if (isFlying && flyAnimation) {
    const elapsed = performance.now() - flyAnimation.startTime;
    const t = Math.min(elapsed / flyAnimation.duration, 1);
    const et = easeInOutCubic(t);

    if (flyAnimation.endPos) {
      camera.position.lerp(flyAnimation.endPos, et * 0.1 + 0.02);
    }
    if (flyAnimation.endFov) {
      camera.fov = lerp(flyAnimation.startFov, flyAnimation.endFov, et);
      camera.updateProjectionMatrix();
    }

    if (t >= 1) {
      isFlying = false;
      if (flyAnimation.endFov) { camera.fov = flyAnimation.endFov; camera.updateProjectionMatrix(); }
      if (flyAnimation.onComplete) flyAnimation.onComplete();
      flyAnimation = null;
    }
  } else if (controls) {
    controls.update();
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
