import { describe, it, expect } from 'vitest';
describe('CameraController', () => {
  it('should export required functions', async () => {
    const cc = await import('../controls/CameraController.js');
    expect(typeof cc.init).toBe('function');
    expect(typeof cc.switchToLowOrbit).toBe('function');
    expect(typeof cc.switchToSpaceArc).toBe('function');
    expect(typeof cc.trackPoint).toBe('function');
    expect(typeof cc.stopTracking).toBe('function');
    expect(typeof cc.getViewMode).toBe('function');
    expect(typeof cc.getCurrentTarget).toBe('function');
    expect(typeof cc.update).toBe('function');
    expect(typeof cc.getControls).toBe('function');
  }, 15000);
}, 15000);
