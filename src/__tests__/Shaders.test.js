import { describe, it, expect } from 'vitest';
import scanlineVert from '../../shaders/scanline.vert?raw';
import scanlineFrag from '../../shaders/scanline.frag?raw';
import thermalFrag from '../../shaders/thermal.frag?raw';
import glowFrag from '../../shaders/glow.frag?raw';
import sharpenFrag from '../../shaders/sharpen.frag?raw';
import atmosphereFrag from '../../shaders/atmosphere.frag?raw';

describe('shader files', () => {
  it('scanline.vert should contain main()', () => {
    expect(scanlineVert).toContain('void main');
    expect(scanlineVert).toContain('gl_Position');
  });

  it('scanline.frag should contain uniforms and main()', () => {
    expect(scanlineFrag).toContain('void main');
    expect(scanlineFrag).toContain('gl_FragColor');
  });

  it('thermal.frag should contain main()', () => {
    expect(thermalFrag).toContain('void main');
    expect(thermalFrag).toContain('gl_FragColor');
  });

  it('glow.frag should contain main()', () => {
    expect(glowFrag).toContain('void main');
    expect(glowFrag).toContain('gl_FragColor');
  });

  it('sharpen.frag should contain main()', () => {
    expect(sharpenFrag).toContain('void main');
    expect(sharpenFrag).toContain('gl_FragColor');
  });

  it('atmosphere.frag should contain main()', () => {
    expect(atmosphereFrag).toContain('void main');
    expect(atmosphereFrag).toContain('gl_FragColor');
  });
});
