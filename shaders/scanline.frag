uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  float scanline = sin(vUv.y * 800.0 + uTime * 2.0) * 0.5 + 0.5;
  float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
  float crt = mix(1.0, scanline * 0.15 + noise * 0.03, uIntensity);
  gl_FragColor = vec4(vec3(0.0), crt);
}
