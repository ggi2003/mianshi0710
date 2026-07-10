export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function lerpVector3(start, end, t) {
  return {
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t),
    z: lerp(start.z, end.z, t),
  };
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Ease-out (fast start → slow end) — cubic deceleration */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
