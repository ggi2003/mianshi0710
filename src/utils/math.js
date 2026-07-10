export function latLonToVec3(lat, lon, radius) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return { x, y, z };
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

export function greatCircleInterpolation(from, to, segments) {
  const fromVec = latLonToVec3(from.lat, from.lon, 10);
  const toVec = latLonToVec3(to.lat, to.lon, 10);

  const points = [];
  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    // Slerp on the sphere surface
    const omega = Math.acos(
      Math.max(-1, Math.min(1, (fromVec.x * toVec.x + fromVec.y * toVec.y + fromVec.z * toVec.z) / (10 * 10)))
    );
    const sinOmega = Math.sin(omega);
    const a = sinOmega === 0 ? 1 - t : Math.sin((1 - t) * omega) / sinOmega;
    const b = sinOmega === 0 ? t : Math.sin(t * omega) / sinOmega;

    const x = a * fromVec.x + b * toVec.x;
    const y = a * fromVec.y + b * toVec.y;
    const z = a * fromVec.z + b * toVec.z;

    // Normalize back to sphere surface
    const len = Math.sqrt(x * x + y * y + z * z);
    points.push({ x: (x / len) * 10, y: (y / len) * 10, z: (z / len) * 10 });
  }
  return points;
}
