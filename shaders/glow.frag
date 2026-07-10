uniform sampler2D tDiffuse;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  // Simple glow: increase brightness of bright areas
  float brightness = dot(color.rgb, vec3(0.333));
  float glow = smoothstep(0.6, 1.0, brightness) * uIntensity * 0.3;
  gl_FragColor = vec4(color.rgb + glow, color.a);
}
