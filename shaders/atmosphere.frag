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
