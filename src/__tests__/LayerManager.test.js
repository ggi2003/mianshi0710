import { describe, it, expect } from 'vitest';
describe('LayerManager', () => {
  it('should export required functions', async () => {
    const lm = await import('../layers/LayerManager.js');
    expect(typeof lm.init).toBe('function');
    expect(typeof lm.registerLayer).toBe('function');
    expect(typeof lm.toggleLayer).toBe('function');
    expect(typeof lm.updateTimeRange).toBe('function');
    expect(typeof lm.getLayer).toBe('function');
    expect(typeof lm.getAllLayerStates).toBe('function');
    expect(typeof lm.dispose).toBe('function');
  });
});
