import { describe, it, expect } from 'vitest';
describe('RaycasterPicker', () => {
  it('should export required functions', async () => {
    const rp = await import('../controls/RaycasterPicker.js');
    expect(typeof rp.init).toBe('function');
    expect(typeof rp.setClickableObjects).toBe('function');
    expect(typeof rp.onPicked).toBe('function');
    expect(typeof rp.dispose).toBe('function');
  });
});
