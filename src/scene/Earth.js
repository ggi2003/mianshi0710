import * as THREE from 'three';
import { EARTH_RADIUS } from '../config.js';
import { easeOutCubic } from '../utils/animation.js';

let earthGroup;
let textureSphere;
let introSpin = null;
let atmosphere;
let earthMaterial;
let atmosMaterial;

let currentMode = 'normal';

const textureLoader = new THREE.TextureLoader();

/**
 * Shared vertex shader.
 * Passes UV, world-space position, and normal to fragment shader.
 */
const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vPosition = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader: normal color vs grayscale night-vision.
 *
 * Uniforms:
 *   uMode    — 0=normal RGB, 1=night-vision grayscale
 *   uGlow    — atmosphere rim intensity (0..2)
 *   uSharpen — sharpen amount (0..1)
 *   uHue     — hue rotation degrees (-180..180)
 */
const earthFragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform sampler2D uTexture;
  uniform float uMode;
  uniform float uGlow;
  uniform float uSharpen;
  uniform float uHue;
  uniform vec3  uLightDir;
  uniform float uTime;

  // Pseudo-random hash for film grain
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // RGB → HSV → RGB for hue rotation
  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);

    // Diffuse Lambertian lighting — simulates natural daylight or moonlight
    float NdotL = dot(vNormal, normalize(uLightDir));
    float lighting = 0.25 + 0.75 * max(NdotL, 0.0);

    if (uMode < 0.5) {
      // ═══════════════════════════════════════
      //  NORMAL COLOR MODE
      // ═══════════════════════════════════════
      vec3 lit = texColor.rgb * lighting;

      // ── Hue rotation ──
      if (abs(uHue) > 0.5) {
        vec3 hsv = rgb2hsv(lit);
        hsv.x = fract(hsv.x + uHue / 360.0);
        lit = hsv2rgb(hsv);
      }

      // ── Sharpen (unsharp mask via Laplacian sampling neighbours) ──
      if (uSharpen > 0.001) {
        float stepU = 1.0 / 256.0;
        float stepV = 1.0 / 128.0;
        vec3 n  = texture2D(uTexture, vUv + vec2(0.0,  stepV)).rgb;
        vec3 s  = texture2D(uTexture, vUv + vec2(0.0, -stepV)).rgb;
        vec3 e  = texture2D(uTexture, vUv + vec2( stepU, 0.0)).rgb;
        vec3 w  = texture2D(uTexture, vUv + vec2(-stepU, 0.0)).rgb;
        vec3 blur = (n + s + e + w) * 0.25;
        vec3 sharp = lit + (lit - blur) * uSharpen * 3.0;
        lit = mix(lit, sharp, uSharpen);
      }

      gl_FragColor = vec4(lit, 1.0);

    } else {
      // ═══════════════════════════════════════
      //  NIGHT-VISION MONOCHROME MODE
      // ═══════════════════════════════════════
      float lum = dot(texColor.rgb, vec3(0.2126, 0.7152, 0.0722));
      float contrast = smoothstep(0.08, 0.72, lum);
      float gray = 0.04 + contrast * 0.88;
      vec3 mono = vec3(gray);

      // ── Hue still applies (tint the grey slightly) ──
      if (abs(uHue) > 0.5) {
        vec3 hsv = rgb2hsv(mono);
        hsv.x = fract(hsv.x + uHue / 360.0);
        mono = hsv2rgb(hsv);
      }

      // ── Sharpen on mono ──
      if (uSharpen > 0.001) {
        float stepU = 1.0 / 256.0;
        float stepV = 1.0 / 128.0;
        float n = texture2D(uTexture, vUv + vec2(0.0,  stepV)).r;
        float s = texture2D(uTexture, vUv + vec2(0.0, -stepV)).r;
        float e = texture2D(uTexture, vUv + vec2( stepU, 0.0)).r;
        float w = texture2D(uTexture, vUv + vec2(-stepU, 0.0)).r;
        float blur = (n + s + e + w) * 0.25;
        float sharp = gray + (gray - blur) * uSharpen * 3.0;
        gray = mix(gray, sharp, uSharpen);
        mono = vec3(gray);
      }

      mono *= lighting;

      float grain = (hash(vUv * 1234.0 + uTime * 0.01) - 0.5) * 0.04;
      mono += grain;

      float vignette = 1.0 - length(vUv - 0.5) * 0.6;
      mono *= smoothstep(0.3, 1.0, vignette);

      mono = clamp(mono, 0.0, 1.0);
      gl_FragColor = vec4(mono, 1.0);
    }
  }
`;

export function create(scene) {
  earthGroup = new THREE.Group();

  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 128, 64);

  const dayTexture = textureLoader.load('/textures/earth-blue-marble.jpg');
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  dayTexture.anisotropy = 16;

  earthMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTexture:  { value: dayTexture },
      uMode:     { value: 0 },
      uGlow:     { value: 1.0 },
      uSharpen:  { value: 0.3 },
      uHue:      { value: 0 },
      uLightDir: { value: new THREE.Vector3(0.577, 0.577, 0.577) },
      uTime:     { value: 0 },
    },
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
  });

  textureSphere = new THREE.Mesh(geometry, earthMaterial);
  earthGroup.add(textureSphere);

  // ── Atmosphere glow (Fresnel rim) ──
  // Normal mode: faint cyan-blue halo
  // Night-vision mode: subtle grey halo (minimal glow, no false colour)
  const atmosGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.02, 64, 32);
  atmosMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uGlowColor: { value: new THREE.Color(0x4fc3f7) },
      uIntensity: { value: 1.0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vPosition = worldPos.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform vec3 uGlowColor;
      uniform float uIntensity;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vPosition);
        float fresnel = 1.0 - abs(dot(viewDir, vNormal));
        fresnel = pow(fresnel, 3.0);
        gl_FragColor = vec4(uGlowColor, fresnel * uIntensity * 0.6);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  atmosphere = new THREE.Mesh(atmosGeo, atmosMaterial);
  earthGroup.add(atmosphere);

  scene.add(earthGroup);

  // ── Intro spin animation ──
  introSpin = {
    startTime: performance.now(),
    duration: 1800,       // ms
    startY: 0,
    endY: 1.25 * Math.PI, // 225°
  };

  return earthGroup;
}

/** Switch between "normal" (full RGB) and "night-vision" (grayscale NVG). */
export function setMode(mode) {
  if (!earthMaterial) return;
  currentMode = mode;
  earthMaterial.uniforms.uMode.value = mode === 'night-vision' ? 1 : 0;

  if (atmosMaterial) {
    if (mode === 'night-vision') {
      atmosMaterial.uniforms.uGlowColor.value.set(0x888888);
      atmosMaterial.uniforms.uIntensity.value = 0.6;
    } else {
      atmosMaterial.uniforms.uGlowColor.value.set(0x4fc3f7);
      atmosMaterial.uniforms.uIntensity.value = 1.0;
    }
  }
}

export function setGlow(v) {
  if (earthMaterial) earthMaterial.uniforms.uGlow.value = v;
  if (atmosMaterial) atmosMaterial.uniforms.uIntensity.value = v;
}

export function setSharpen(v) {
  if (earthMaterial) earthMaterial.uniforms.uSharpen.value = v;
}

export function setHue(d) {
  if (earthMaterial) earthMaterial.uniforms.uHue.value = d;
}

export function getMode() { return currentMode; }

export function updateTime(time) {
  if (earthMaterial) {
    earthMaterial.uniforms.uTime.value = time * 0.001;
  }
}

export function getGroup() { return earthGroup; }
export function getTextureSphere() { return textureSphere; }

export function updateIntroSpin() {
  if (!introSpin) return false;
  const elapsed = performance.now() - introSpin.startTime;
  const t = Math.min(elapsed / introSpin.duration, 1);
  earthGroup.rotation.y = introSpin.startY + (introSpin.endY - introSpin.startY) * easeOutCubic(t);
  if (t >= 1) { introSpin = null; }
  return t < 1;
}

export function isIntroActive() { return introSpin !== null; }

export function finishIntro() {
  if (introSpin) { earthGroup.rotation.y = introSpin.endY; introSpin = null; }
}

export function getSurfacePoint(lat, lon) {
  const phi   = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  const x = -EARTH_RADIUS * Math.sin(phi) * Math.cos(theta);
  const y =  EARTH_RADIUS * Math.cos(phi);
  const z =  EARTH_RADIUS * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

export function dispose() {
  if (earthGroup) {
    earthGroup.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.uniforms?.uTexture?.value) {
          child.material.uniforms.uTexture.value.dispose();
        }
        child.material.dispose();
      }
    });
    earthGroup.parent?.remove(earthGroup);
    earthGroup = null;
    textureSphere = null;
    earthMaterial = null;
    atmosMaterial = null;
  }
}
