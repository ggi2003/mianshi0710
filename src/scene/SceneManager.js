import * as THREE from 'three';

let scene, camera, renderer, animCallback;

export function init(container) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 200);
  camera.position.set(0, 5, 25);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(10, 20, 5);
  scene.add(directionalLight);

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  return { scene, camera, renderer };
}

export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getRenderer() { return renderer; }

export function animate(callback) {
  animCallback = callback;
  function loop(time) {
    requestAnimationFrame(loop);
    if (animCallback) animCallback(time);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);
}

export function dispose() {
  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
  }
  scene = null;
  camera = null;
  renderer = null;
  animCallback = null;
}
