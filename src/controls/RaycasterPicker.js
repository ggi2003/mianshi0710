import * as THREE from 'three';
let camera, renderer, clickables, pickCallback, onClickBound;

export function init(cam, rend) {
  camera = cam;
  renderer = rend;
  clickables = [];
  onClickBound = (e) => {
    if (!pickCallback || !clickables.length) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickables, true);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      const eventData = obj.userData?.event || {};
      pickCallback({ object: obj, event: eventData, lat: eventData.lat, lon: eventData.lon });
    }
  };
  renderer.domElement.addEventListener('click', onClickBound);
}

export function setClickableObjects(objects) { clickables = objects || []; }

export function onPicked(callback) { pickCallback = callback; }

export function dispose() {
  if (renderer?.domElement && onClickBound) {
    renderer.domElement.removeEventListener('click', onClickBound);
  }
  clickables = null;
  pickCallback = null;
}
