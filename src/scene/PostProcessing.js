let renderer, scene, camera, params;
params = { mode: 'normal', glow: 1.0, sharpen: 0.3, hue: 0 };

export function init(rend, sc, cam) {
  renderer = rend;
  scene = sc;
  camera = cam;
}

export function setMode(mode) { params.mode = mode; }
export function setGlow(intensity) { params.glow = Math.max(0, Math.min(2, intensity)); }
export function setSharpen(intensity) { params.sharpen = Math.max(0, Math.min(1, intensity)); }
export function setHue(degrees) { params.hue = Math.max(-180, Math.min(180, degrees)); }

export function render() {
  if (!renderer || !scene || !camera) return;
  renderer.render(scene, camera);
}

export function dispose() {
  renderer = null;
  scene = null;
  camera = null;
}
