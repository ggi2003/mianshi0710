import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { create, update, dispose } from '../layers/IntelEvents.js';

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

describe('IntelEvents', () => {
  it('should show markers only when the playback window contains their timestamp', () => {
    const scene = new THREE.Scene();
    const earthGroup = new THREE.Group();
    const eventData = [{
      id: 'evt-test',
      type: 'naval_exercise',
      name: 'Test Event',
      lat: 0,
      lon: 0,
      timestamp: '2026-07-03T18:30:00.000Z',
      severity: 'MEDIUM',
    }];

    const group = create(scene, earthGroup, eventData);
    const marker = group.children[0];

    update({ start: Date.parse('2026-07-03T17:00:00.000Z'), end: Date.parse('2026-07-03T18:00:00.000Z') });
    expect(marker.visible).toBe(false);

    update({ start: Date.parse('2026-07-03T18:00:00.000Z'), end: Date.parse('2026-07-03T18:30:00.000Z') });
    expect(marker.visible).toBe(true);

    update({ start: Date.parse('2026-07-03T18:00:00.000Z'), end: Date.parse('2026-07-03T19:00:00.000Z') });
    expect(marker.visible).toBe(true);

    dispose();
  });
});
