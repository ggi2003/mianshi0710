import { describe, it, expect } from 'vitest';
['TopBar','LeftPanel','RightPanel','BottomBar','AIPanel','EventCard','CornerOverlays','UIManager'].forEach(name => {
  describe(name, () => {
    it('should export init and destroy', async () => {
      const mod = await import(`../ui/${name}.js`);
      expect(typeof mod.init).toBe('function');
      expect(typeof mod.destroy).toBe('function');
    });
  });
});
