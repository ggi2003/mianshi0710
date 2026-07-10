uniform sampler2D tDiffuse;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  vec2 texelSize = vec2(1.0 / 1024.0, 1.0 / 768.0);
  vec4 blurred = vec4(0.0);
  float total = 0.0;
  for (int x = -2; x <= 2; x++) {
    for (int y = -2; y <= 2; y++) {
      vec4 sample = texture2D(tDiffuse, vUv + vec2(float(x), float(y)) * texelSize);
      blurred += sample;
      total += 1.0;
    }
  }
  blurred /= total;
  // Unsharp mask
  gl_FragColor = mix(color, color + (color - blurred) * uIntensity, uIntensity);
}
