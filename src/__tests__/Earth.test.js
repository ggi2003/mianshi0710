import { describe, it, expect } from 'vitest';

describe('Earth', () => {
  it('should export create, getGroup, getSurfacePoint, dispose', async () => {
    const Earth = await import('../scene/Earth.js');
    expect(typeof Earth.create).toBe('function');
    expect(typeof Earth.getGroup).toBe('function');
    expect(typeof Earth.getSurfacePoint).toBe('function');
    expect(typeof Earth.dispose).toBe('function');
  });
});
