import { describe, it, expect } from 'vitest';

describe('math utilities', () => {
  it('should convert lat/lon to Vec3 on sphere surface', async () => {
    const math = await import('../utils/math.js');
    const result = math.latLonToVec3(0, 0, 10);
    expect(result.x).toBeCloseTo(10, 1);
    expect(result.y).toBeCloseTo(0, 1);
    expect(result.z).toBeCloseTo(0, 1);
  });

  it('should place equator point correctly', async () => {
    const math = await import('../utils/math.js');
    const result = math.latLonToVec3(0, 90, 10);
    expect(result.z).toBeCloseTo(-10, 1);
    expect(result.y).toBeCloseTo(0, 1);
  });

  it('should place north pole point correctly', async () => {
    const math = await import('../utils/math.js');
    const result = math.latLonToVec3(90, 0, 10);
    expect(result.x).toBeCloseTo(0, 1);
    expect(result.y).toBeCloseTo(10, 1);
    expect(result.z).toBeCloseTo(0, 1);
  });

  it('should clamp values within range', async () => {
    const math = await import('../utils/math.js');
    expect(math.clamp(5, 0, 10)).toBe(5);
    expect(math.clamp(-1, 0, 10)).toBe(0);
    expect(math.clamp(15, 0, 10)).toBe(10);
  });

  it('should convert degrees to radians and back', async () => {
    const math = await import('../utils/math.js');
    expect(math.degToRad(180)).toBeCloseTo(Math.PI);
    expect(math.degToRad(90)).toBeCloseTo(Math.PI / 2);
    expect(math.radToDeg(Math.PI)).toBeCloseTo(180);
    expect(math.radToDeg(Math.PI / 2)).toBeCloseTo(90);
  });

  it('should interpolate great circle route', async () => {
    const math = await import('../utils/math.js');
    const points = math.greatCircleInterpolation(
      { lat: 0, lon: 0 },
      { lat: 0, lon: 90 },
      5
    );
    expect(Array.isArray(points)).toBe(true);
    expect(points.length).toBe(5);
    expect(points[0]).toHaveProperty('x');
    expect(points[0]).toHaveProperty('y');
    expect(points[0]).toHaveProperty('z');
    points.forEach(p => {
      const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
      expect(dist).toBeCloseTo(10, 0);
    });
  });
});
