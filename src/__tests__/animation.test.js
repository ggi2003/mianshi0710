import { describe, it, expect } from 'vitest';

describe('animation utilities', () => {
  it('should lerp between two numbers', async () => {
    const anim = await import('../utils/animation.js');
    expect(anim.lerp(0, 10, 0)).toBe(0);
    expect(anim.lerp(0, 10, 1)).toBe(10);
    expect(anim.lerp(0, 10, 0.5)).toBe(5);
    expect(anim.lerp(100, 200, 0.25)).toBe(125);
  });

  it('should easeInOutCubic at boundaries', async () => {
    const anim = await import('../utils/animation.js');
    expect(anim.easeInOutCubic(0)).toBe(0);
    expect(anim.easeInOutCubic(1)).toBe(1);
  });

  it('should easeInOutCubic be symmetric', async () => {
    const anim = await import('../utils/animation.js');
    const mid = anim.easeInOutCubic(0.5);
    expect(mid).toBeCloseTo(0.5, 1);
  });
});
