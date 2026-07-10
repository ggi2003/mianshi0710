import { init as initScene, getScene, getCamera, getRenderer, animate } from './scene/SceneManager.js';
import { create as createEarth, dispose as disposeEarth, updateIntroSpin } from './scene/Earth.js';
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
  let lastTrackedId = null;

  /** Derive full state from playbackPosition and push to all subsystems */
  function tickPlaybackState(position) {
    const now = Date.now();
    const cursorTime = getPlaybackCursorTime(position, now);
    const start = playbackWindowStart + position * 3600000;
    const range = { start, end: cursorTime };

    updateTimeRange(start, cursorTime);
    intelMod?.setCurrentPlaybackTime?.(range);

    // ── visible intel events for this window ──
    const visibleEvents = intelEventsData
      .filter(e => { const ts = Date.parse(e.timestamp); return !Number.isNaN(ts) && ts >= start && ts <= cursorTime; })
      .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));

    const nextVisibleIds = new Set(visibleEvents.map(e => e.id));
    const newlyVisible = visibleEvents.filter(e => !activeEventIds.has(e.id));
    if (newlyVisible.length > 0) {
      const target = newlyVisible[0];
      if (target.id !== lastTrackedId) {
        lastTrackedId = target.id;
        trackPoint(earthGroup, target.lat, target.lon, 2.4);
      }
    }
    for (const oldId of activeEventIds) {
      if (!nextVisibleIds.has(oldId)) intelMod?.hideEvent?.(oldId);
    }
    activeEventIds = nextVisibleIds;
    if (visibleEvents.length === 0) { stopTracking(); lastTrackedId = null; }

    // ── UI updates ──
    bottomBar.setTimelinePosition(position);

    const critCount = visibleEvents.filter(e => e.severity === 'CRITICAL').length;
    const highCount = visibleEvents.filter(e => e.severity === 'HIGH').length;
    const medCount  = visibleEvents.filter(e => e.severity === 'MEDIUM').length;
    rightPanel.updateForPlaybackTime(cursorTime, visibleEvents, { critical: critCount, high: highCount, medium: medCount });

    // Corner overlays — show the tracked event's coords or the latest visible event
    const trackedOrLatest = (lastTrackedId && visibleEvents.find(e => e.id === lastTrackedId)) || visibleEvents[0];
    if (trackedOrLatest) {
      cornerOverlays.updateCoordinates(trackedOrLatest.lat, trackedOrLatest.lon);
    }
    cornerOverlays.updateStats(
      Object.values(getAllLayerStates()).filter(s => s.visible).length,
      visibleEvents.length,
      0, 0
    );
  }

  function deprecate_old_syncVisibleEvents(start, end) {
    // kept for compatibility — all logic merged into tickPlaybackState
    tickPlaybackState(playbackPosition);
  }

  function syncVisibleEvents(start, end) {
    tickPlaybackState(playbackPosition);
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
    // Trigger re-evaluation for the now-position
    tickPlaybackState(TIME_WINDOW_HOURS);
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
    playbackPosition = hour;
    tickPlaybackState(hour);
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

    // Intro spin — runs each frame until complete, then stops
    updateIntroSpin();

    const isPlaybackActive = !isStopped && !isPaused;

    // Time playback logic
    if (!isStopped && !isPaused) {
      // Advance playback time based on speed
      const deltaTime = time - lastFrameTime;
      playbackPosition += deltaTime * playbackSpeed / 3600000;

      if (playbackPosition >= TIME_WINDOW_HOURS) {
        playbackPosition = TIME_WINDOW_HOURS;
        isStopped = true;
        console.log('Timeline reached current time');
      }

      tickPlaybackState(playbackPosition);
    }

    lastFrameTime = time;

    fpsFrames++;
    if (time - fpsTime >= 1000) {
      currentFps = Math.round(fpsFrames / ((time - fpsTime) / 1000));
      fpsFrames = 0;
      fpsTime = time;
    }
  });

  // Initial layer state display
  cornerOverlays.updateStats(
    LAYERS.filter(l => l.enabled).length,
    0, 0, 0
  );

  // 11. Auto-start playback on page load
  playbackPosition = 0;
  playbackSpeed = 12000;
  isStopped = false;
  playbackPlaying = true;
  topBar.setPlaybackState(true);
  bottomBar.setTimelinePosition(0);
  bottomBar.setActiveSpeed(12000);
  tickPlaybackState(0);
  console.log('Auto-start playback from position 0 with speed 200h/x');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
