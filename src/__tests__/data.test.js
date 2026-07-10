import { describe, it, expect } from 'vitest';

const dataFiles = [
  { name: 'flights.json', hasFields: ['flightId', 'airline', 'from', 'to', 'timestamp'] },
  { name: 'gps-jamming.json', hasFields: ['id', 'lat', 'lon', 'intensity', 'radius', 'timestamp'] },
  { name: 'satellites.json', hasFields: ['name', 'inclination', 'altitude', 'phase', 'period', 'timestamp'] },
  { name: 'maritime.json', hasFields: ['vesselId', 'vesselName', 'from', 'to', 'timestamp'] },
  { name: 'no-fly-zones.json', hasFields: ['name', 'vertices', 'startTime', 'endTime'] },
  { name: 'blackouts.json', hasFields: ['id', 'lat', 'lon', 'region', 'severity', 'startTime', 'endTime'] },
  { name: 'intel-events.json', hasFields: ['id', 'type', 'name', 'lat', 'lon', 'timestamp', 'severity'] },
  { name: 'ai-responses.json', isArray: true },
];

describe('mock data files', () => {
  dataFiles.forEach(({ name, hasFields, isArray }) => {
    it(`${name} should exist and be valid JSON array`, async () => {
      const data = await import(`../data/${name}`);
      expect(Array.isArray(data.default)).toBe(true);
      expect(data.default.length).toBeGreaterThan(0);
      if (hasFields) {
        data.default.forEach(item => {
          hasFields.forEach(field => {
            expect(item).toHaveProperty(field);
          });
        });
      }
    });
  });
});
