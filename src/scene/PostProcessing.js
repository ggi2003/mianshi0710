import * as THREE from 'three';
import { setMode as setEarthMode, setGlow as setEarthGlow, setSharpen as setEarthSharpen, setHue as setEarthHue } from './Earth.js';

let renderer, scene, camera;

export function init(rend, sc, cam) {
  renderer = rend;
  scene = sc;
  camera = cam;
}

export function setMode(mode)     { setEarthMode(mode); }
export function setGlow(v)        { setEarthGlow(v); }
export function setSharpen(v)     { setEarthSharpen(v); }
export function setHue(d)         { setEarthHue(d); }

export function render() {
  if (!renderer || !scene || !camera) return;
  renderer.render(scene, camera);
}

export function dispose() {
  renderer = null;
  scene = null;
  camera = null;
}
