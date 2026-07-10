import { describe, it, expect } from 'vitest';
describe('PostProcessing', () => {
  it('should export required functions', async () => {
    const pp = await import('../scene/PostProcessing.js');
    expect(typeof pp.init).toBe('function');
    expect(typeof pp.setMode).toBe('function');
    expect(typeof pp.setGlow).toBe('function');
    expect(typeof pp.setSharpen).toBe('function');
    expect(typeof pp.setHue).toBe('function');
    expect(typeof pp.render).toBe('function');
    expect(typeof pp.dispose).toBe('function');
  });
});
