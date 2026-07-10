import { describe, it, expect } from 'vitest';

describe('SceneManager', () => {
  it('should export init function', async () => {
    const sm = await import('../scene/SceneManager.js');
    expect(typeof sm.init).toBe('function');
    expect(typeof sm.getScene).toBe('function');
    expect(typeof sm.getCamera).toBe('function');
    expect(typeof sm.getRenderer).toBe('function');
    expect(typeof sm.animate).toBe('function');
    expect(typeof sm.dispose).toBe('function');
  });
});
