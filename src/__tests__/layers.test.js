import { describe, it, expect } from 'vitest';
['FlightTrajectories','GPSJamming','SatelliteOrbits','MaritimeTraffic','NoFlyZones','InternetBlackouts','IntelEvents'].forEach(name => {
  describe(name, () => {
    it('should export layer interface', async () => {
      const mod = await import(`../layers/${name}.js`);
      expect(typeof mod.create).toBe('function');
      expect(typeof mod.update).toBe('function');
      expect(typeof mod.setVisible).toBe('function');
      expect(typeof mod.dispose).toBe('function');
    });
  });
});
