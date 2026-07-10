export const EARTH_RADIUS = 10;

export const CAMERA_DEFAULTS = {
  lowOrbit: {
    distance: 20,
    polarAngle: Math.PI / 4,
    fov: 45,
  },
  spaceArc: {
    distance: 50,
    polarAngle: (Math.PI / 9) * 7,
    fov: 30,
  },
};

export const LAYERS = [
  { id: 'flights', name: 'Commercial Flights', dataFile: 'flights.json', enabled: true },
  { id: 'gps-jamming', name: 'GPS Jamming', dataFile: 'gps-jamming.json', enabled: true },
  { id: 'satellites', name: 'Satellite Orbits', dataFile: 'satellites.json', enabled: true },
  { id: 'maritime', name: 'Maritime Traffic', dataFile: 'maritime.json', enabled: true },
  { id: 'no-fly-zones', name: 'No-Fly Zones', dataFile: 'no-fly-zones.json', enabled: true },
  { id: 'blackouts', name: 'Internet Blackouts', dataFile: 'blackouts.json', enabled: true },
  { id: 'intel-events', name: 'Intel Events', dataFile: 'intel-events.json', enabled: true },
];

export const TIME_RANGE = {
  days: 7,
  granularity: 'hour',
};

export const COLORS = {
  background: '#000000',
  primaryText: '#00F0FF',
  accent: '#00F0FF',
  warning: '#FF9800',
  danger: '#FF1744',
  success: '#00E676',
  panelBg: 'rgba(0, 20, 30, 0.85)',
  border: 'rgba(0, 240, 255, 0.3)',
  scanline: 'rgba(0, 240, 255, 0.03)',
};
