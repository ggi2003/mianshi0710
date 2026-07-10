import { describe, it, expect } from 'vitest';

describe('config', () => {
  it('should export EARTH_RADIUS as a positive number', async () => {
    const config = await import('../config.js');
    expect(config.EARTH_RADIUS).toBeDefined();
    expect(typeof config.EARTH_RADIUS).toBe('number');
    expect(config.EARTH_RADIUS).toBeGreaterThan(0);
  });

  it('should export CAMERA_DEFAULTS with required properties', async () => {
    const config = await import('../config.js');
    expect(config.CAMERA_DEFAULTS).toBeDefined();
    expect(config.CAMERA_DEFAULTS).toHaveProperty('lowOrbit');
    expect(config.CAMERA_DEFAULTS).toHaveProperty('spaceArc');
    expect(config.CAMERA_DEFAULTS.lowOrbit).toHaveProperty('distance');
    expect(config.CAMERA_DEFAULTS.lowOrbit).toHaveProperty('polarAngle');
    expect(config.CAMERA_DEFAULTS.lowOrbit).toHaveProperty('fov');
    expect(config.CAMERA_DEFAULTS.spaceArc).toHaveProperty('distance');
    expect(config.CAMERA_DEFAULTS.spaceArc).toHaveProperty('polarAngle');
    expect(config.CAMERA_DEFAULTS.spaceArc).toHaveProperty('fov');
  });

  it('should export LAYERS as an array with 7 layer configs', async () => {
    const config = await import('../config.js');
    expect(Array.isArray(config.LAYERS)).toBe(true);
    expect(config.LAYERS).toHaveLength(7);
    config.LAYERS.forEach(layer => {
      expect(layer).toHaveProperty('id');
      expect(layer).toHaveProperty('name');
      expect(layer).toHaveProperty('dataFile');
      expect(layer).toHaveProperty('enabled');
      expect(typeof layer.id).toBe('string');
      expect(typeof layer.name).toBe('string');
      expect(typeof layer.enabled).toBe('boolean');
    });
  });

  it('should export TIME_RANGE with start and end', async () => {
    const config = await import('../config.js');
    expect(config.TIME_RANGE).toBeDefined();
    expect(config.TIME_RANGE).toHaveProperty('days');
    expect(config.TIME_RANGE).toHaveProperty('granularity');
    expect(config.TIME_RANGE.days).toBe(7);
  });

  it('should export COLORS with terminal theme colors', async () => {
    const config = await import('../config.js');
    expect(config.COLORS).toBeDefined();
    expect(config.COLORS).toHaveProperty('background');
    expect(config.COLORS).toHaveProperty('primaryText');
    expect(config.COLORS).toHaveProperty('accent');
    expect(config.COLORS.background).toBe('#000000');
  });
});
