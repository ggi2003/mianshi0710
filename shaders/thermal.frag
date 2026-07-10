uniform sampler2D tDiffuse;
uniform bool uEnabled;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  if (uEnabled) {
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    // Thermal palette: black -> green -> yellow -> red -> white
    vec3 thermal;
    if (gray < 0.25) thermal = mix(vec3(0.0, 0.0, 0.0), vec3(0.0, 0.5, 0.0), gray / 0.25);
    else if (gray < 0.5) thermal = mix(vec3(0.0, 0.5, 0.0), vec3(1.0, 1.0, 0.0), (gray - 0.25) / 0.25);
    else if (gray < 0.75) thermal = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (gray - 0.5) / 0.25);
    else thermal = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), (gray - 0.75) / 0.25);
    gl_FragColor = vec4(thermal, color.a);
  } else {
    gl_FragColor = color;
  }
}
