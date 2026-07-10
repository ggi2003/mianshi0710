import { init as initScene, getScene, getCamera, getRenderer, animate } from './scene/SceneManager.js';
import { create as createEarth, dispose as disposeEarth } from './scene/Earth.js';
import { create as createStars, dispose as disposeStars } from './scene/Starfield.js';
import { init as initPP, setMode, setGlow, setSharpen, setHue, render as renderPP } from './scene/PostProcessing.js';
import { init as initCamera, switchToLowOrbit, switchToSpaceArc, trackPoint, stopTracking, update as updateCamera, getViewMode } from './controls/CameraController.js';
import { init as initPicker, setClickableObjects, onPicked } from './controls/RaycasterPicker.js';
import { init as initLayers, registerLayer, toggleLayer, updateTimeRange, getAllLayerStates } from './layers/LayerManager.js';
import { init as initUI, getAllComponents } from './ui/UIManager.js';
import { LAYERS } from './config.js';

// Data imports
import flightsData from './data/flights.json';
import gpsJammingData from './data/gps-jamming.json';
import satellitesData from './data/satellites.json';
import maritimeData from './data/maritime.json';
import noFlyZonesData from './data/no-fly-zones.json';
import blackoutsData from './data/blackouts.json';
import intelEventsData from './data/intel-events.json';

const dataMap = {
  flights: flightsData,
  'gps-jamming': gpsJammingData,
  satellites: satellitesData,
  maritime: maritimeData,
  'no-fly-zones': noFlyZonesData,
  blackouts: blackoutsData,
  'intel-events': intelEventsData,
};

function getPlaybackCursorTime(position, baseTime = Date.now()) {
  return baseTime - (168 - position) * 3600000;
}

async function main() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  // 1. Init scene
  const { scene } = initScene(container);

  // 2. Create earth + stars
  const earthGroup = createEarth(scene);
  const starGroup = createStars(scene);

  // 3. Init camera
  const camera = getCamera();
  const renderer = getRenderer();
  initCamera(camera, renderer);

  // 4. Init post-processing
  initPP(renderer, scene, camera);

  // 5. Init layer manager
  initLayers(scene, earthGroup);

  // 6. Load all layers dynamically
  const layerModules = {
    flights: await import('./layers/FlightTrajectories.js'),
    'gps-jamming': await import('./layers/GPSJamming.js'),
    satellites: await import('./layers/SatelliteOrbits.js'),
    maritime: await import('./layers/MaritimeTraffic.js'),
    'no-fly-zones': await import('./layers/NoFlyZones.js'),
    blackouts: await import('./layers/InternetBlackouts.js'),
    'intel-events': await import('./layers/IntelEvents.js'),
  };

  LAYERS.forEach(({ id, enabled }) => {
    const mod = layerModules[id];
    if (mod && dataMap[id]) {
      const layerGroup = mod.create(scene, earthGroup, dataMap[id]);
      registerLayer(id, mod, layerGroup);
      if (!enabled) toggleLayer(id, false);
    }
  });

  // 7. Init UI
  const ui = initUI();
  const { topBar, bottomBar, rightPanel, aiPanel, eventCard, cornerOverlays } = ui;

  // 8. Init RaycasterPicker
  initPicker(camera, renderer);
  const intelMod = layerModules['intel-events'];
  if (intelMod?.getClickableObjects) {
    setClickableObjects(intelMod.getClickableObjects());
  }

  // 9. Wire events

  // Time playback system variables (must be defined before use)
  const TIME_WINDOW_HOURS = 168; // 7 days
  const playbackWindowStart = Date.now() - TIME_WINDOW_HOURS * 3600000;
  let currentPlaybackTime = Date.now();
  let playbackSpeed = 1;
  let isPaused = false;
  let isStopped = true;
  let playbackPosition = TIME_WINDOW_HOURS; // Position in hours from start (0 = 7 days ago, 168 = now)

  // Playback state
  let playbackPlaying = false;
  let activeEventIds = new Set();
  let lastTrackedId = null; // avoid re-tracking the same event

  function syncVisibleEvents(start, end) {
    const visibleEvents = intelEventsData
      .filter(event => {
        const timestamp = Date.parse(event.timestamp);
        return !Number.isNaN(timestamp) && timestamp >= start && timestamp <= end;
      })
      .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));

    const nextVisibleIds = new Set(visibleEvents.map(event => event.id));
    const newlyVisibleEvents = visibleEvents.filter(event => !activeEventIds.has(event.id));
    if (newlyVisibleEvents.length > 0) {
      const targetEvent = newlyVisibleEvents[0];
      // Only fly if it's a different event — avoid camera jitter
      if (targetEvent.id !== lastTrackedId) {
        lastTrackedId = targetEvent.id;
        trackPoint(earthGroup, targetEvent.lat, targetEvent.lon, 2.4);
      }
    }
    activeEventIds = nextVisibleIds;
  }

  topBar.on('playback-click', () => {
    playbackPlaying = !playbackPlaying;
    topBar.setPlaybackState(playbackPlaying);

    if (playbackPlaying) {
      // Start playback
      isStopped = false;
      isPaused = false;
      playbackSpeed = 12000; // Default speed: 200h/x
      // If at NOW position, reset to beginning for playback
      if (playbackPosition >= TIME_WINDOW_HOURS) {
        playbackPosition = 0;
      }
      console.log('Playback started from position:', playbackPosition, 'with speed 200h/x');
    } else {
      // Pause playback
      isPaused = true;
      console.log('Playback paused');
    }
  });

  // Speed change
  bottomBar.on('speed-change', (speed) => {
    playbackSpeed = speed;
    isStopped = false;
    // If starting from current time (position=168), reset to beginning for playback
    if (playbackPosition >= TIME_WINDOW_HOURS) {
      playbackPosition = 0;
    }
    // Convert speed to readable format
    const speedText = speed >= 60 ? `${speed / 60}h/x` : `${speed}x`;
    console.log(`Speed set to ${speedText}, playback started`);
  });

  // Pause / Off
  bottomBar.on('pause-click', () => {
    isPaused = !isPaused;
    console.log(isPaused ? 'Playback paused' : 'Playback resumed');
  });

  bottomBar.on('off-click', () => {
    isStopped = true;
    isPaused = false;
    playbackSpeed = 1;
    // Reset to current time
    const now = Date.now();
    currentPlaybackTime = now;
    playbackPosition = TIME_WINDOW_HOURS;
    updateTimeRange(now - TIME_WINDOW_HOURS * 3600000, now);
    intelMod?.setCurrentPlaybackTime?.({ start: now - TIME_WINDOW_HOURS * 3600000, end: now });
    activeEventIds = new Set();
    lastTrackedId = null;
    stopTracking();
    // Reset slider to NOW position
    bottomBar.setTimelinePosition(TIME_WINDOW_HOURS);
    console.log('Timeline stopped and reset to current time');
  });

  // Alert / Spiral
  bottomBar.on('alert-click', () => {
    console.log('Alert triggered');
  });
  bottomBar.on('spiral-click', () => {
    console.log('Spiral view toggled');
  });

  // Night vision toggle
  let nightVision = false;
  bottomBar.on('night-vision-toggle', () => {
    nightVision = !nightVision;
    bottomBar.setNightVision(nightVision);
    setMode(nightVision ? 'night-vision' : 'normal');
  });

  // View toggle
  bottomBar.on('view-toggle', () => {
    const currentMode = getViewMode();
    if (currentMode === 'low-orbit') {
      switchToSpaceArc();
      bottomBar.setViewMode('space-arc');
    } else {
      switchToLowOrbit();
      bottomBar.setViewMode('low-orbit');
    }
  });

  // Visual params
  bottomBar.on('glow-change', v => setGlow(v));
  bottomBar.on('sharpen-change', v => setSharpen(v));
  bottomBar.on('hue-change', v => setHue(v));

  // Layer toggle
  bottomBar.on('layer-toggle', ({ id, visible }) => {
    toggleLayer(id, visible);
    cornerOverlays.updateStats(
      Object.values(getAllLayerStates()).filter(s => s.visible).length,
      Object.values(getAllLayerStates()).filter(s => s.visible).length,
      0, 0
    );
  });

  // Timeline
  bottomBar.on('time-change', ({ hour }) => {
    const now = Date.now();
    const cursorTime = getPlaybackCursorTime(hour, now);
    const start = playbackWindowStart + hour * 3600000;
    updateTimeRange(start, cursorTime);
    intelMod?.setCurrentPlaybackTime?.({ start, end: cursorTime });
    syncVisibleEvents(start, cursorTime);
    // Update playback position
    playbackPosition = hour;
    currentPlaybackTime = cursorTime;
    // Update slider visual position
    bottomBar.setTimelinePosition(hour);
  });

  // Pick events → EventCard
  onPicked(({ event }) => {
    if (event?.id) {
      eventCard.show(event);
    }
  });

  // EventCard AI button
  eventCard.on('ai-analysis-click', (event) => {
    eventCard.hide();
    aiPanel.show(event.type, event.name);
  });

  // Right panel AI button
  rightPanel.on('ai-analysis-click', () => {
    aiPanel.showOverview();
  });

  // AI panel close
  aiPanel.on('close', () => {});

  // 10. Start render loop
  let fpsFrames = 0, fpsTime = performance.now(), currentFps = 0;
  let lastFrameTime = performance.now();
  animate((time) => {
    updateCamera();
    renderPP();

    const isPlaybackActive = !isStopped && !isPaused;
    if (earthGroup) {
      earthGroup.rotation.y += isPlaybackActive ? 0.0012 : 0.0003;
    }

    // Time playback logic
    if (!isStopped && !isPaused) {
      // Advance playback time based on speed
      // playbackSpeed: 1/6x (0.166), 1/3x (0.33), 1x (1), 5x, 15x, 60x (1h)
      // Playback moves from past (position=0) toward now (position=168)
      const deltaTime = time - lastFrameTime; // milliseconds since last frame
      const playbackAdvance = deltaTime * playbackSpeed / 3600000; // Convert to hours

      // Move playback position forward in time
      playbackPosition += playbackAdvance;

      // Clamp to valid range [0, TIME_WINDOW_HOURS]
      if (playbackPosition >= TIME_WINDOW_HOURS) {
        playbackPosition = TIME_WINDOW_HOURS;
        isStopped = true; // Reached current time
        console.log('Timeline reached current time');
      }

      // Update time range
      const now = Date.now();
      const cursorTime = getPlaybackCursorTime(playbackPosition, now);
      const start = playbackWindowStart + playbackPosition * 3600000;
      updateTimeRange(start, cursorTime);
      intelMod?.setCurrentPlaybackTime?.({ start, end: cursorTime });
      syncVisibleEvents(start, cursorTime);

      // Update slider visual position
      bottomBar.setTimelinePosition(playbackPosition);
    }

    // Update last frame time
    lastFrameTime = time;

    // FPS
    fpsFrames++;
    if (time - fpsTime >= 1000) {
      currentFps = Math.round(fpsFrames / ((time - fpsTime) / 1000));
      fpsFrames = 0;
      fpsTime = time;
    }

    // Update corner overlays
    cornerOverlays.updateStats(
      Object.values(getAllLayerStates()).filter(s => s.visible).length,
      3,
      currentFps,
      Math.round(performance.now() - time)
    );
    cornerOverlays.updateCoordinates(26.2, 50.5);
  });

  // Initial layer state display
  cornerOverlays.updateStats(
    LAYERS.filter(l => l.enabled).length,
    3, 0, 0
  );

  // 11. Auto-start playback on page load
  playbackPosition = 0; // Start from the beginning
  playbackSpeed = 12000; // 200h/x speed
  isStopped = false; // Enable playback
  playbackPlaying = true;
  topBar.setPlaybackState(true); // Update UI button text to "播放中"
  bottomBar.setTimelinePosition(0); // Update slider to beginning
  bottomBar.setActiveSpeed(12000); // Highlight 200h/x button
  const initialCursorTime = getPlaybackCursorTime(0, Date.now());
  intelMod?.setCurrentPlaybackTime?.({ start: playbackWindowStart, end: initialCursorTime });
  syncVisibleEvents(playbackWindowStart, initialCursorTime);
  console.log('Auto-start playback from position 0 with speed 200h/x');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
