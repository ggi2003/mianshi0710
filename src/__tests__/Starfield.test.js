import { describe, it, expect } from 'vitest';
describe('Starfield', () => {
  it('should export create and dispose', async () => {
    const sf = await import('../scene/Starfield.js');
    expect(typeof sf.create).toBe('function');
    expect(typeof sf.dispose).toBe('function');
  });
});
