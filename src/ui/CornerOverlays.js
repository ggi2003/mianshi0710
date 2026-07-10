import { COLORS } from '../config.js';
import { t } from '../i18n.js';

let blEl, brEl, resizeObs;

function syncCornerBottom() {
  const bb = document.getElementById('bottom-bar');
  const h = bb ? bb.getBoundingClientRect().height : 120;
  const gap = 8;
  if (blEl) blEl.style.bottom = (h + gap) + 'px';
  if (brEl) brEl.style.bottom = (h + gap) + 'px';
}

let _lastLayerCount = 0;
let _lastAlertCount = 0;
let _lastFps = '--';
let _lastLatency = '-ms';

export function init(container) {
  blEl = document.getElementById('corner-bottom-left');
  brEl = document.getElementById('corner-bottom-right');

  if (blEl) blEl.innerHTML = `<div id="bl-coords" style="text-shadow:0 0 4px #00F0FF;">22°14'46.55"N 058°51'11.71"E</div><div id="bl-status" style="margin-top:2px;opacity:0.7;">MSGS: 39Q VE 9544 5824</div>`;
  if (brEl) brEl.innerHTML = `
    <div id="br-stats-line" style="text-shadow:0 0 4px #00F0FF;"><span data-i18n="corner.layers">${t('corner.layers')}</span>: <span id="br-layer-count">0</span> <span data-i18n="corner.active">${t('corner.active')}</span></div>
    <div id="br-alerts-line" style="margin-top:2px;opacity:0.7;"><span data-i18n="corner.alerts">${t('corner.alerts')}</span>: <span id="br-alert-count">0</span> <span data-i18n="corner.pending">${t('corner.pending')}</span></div>
    <div id="br-perf-line" style="margin-top:2px;font-size:0.9em;opacity:0.5;"><span data-i18n="corner.fps">${t('corner.fps')}</span>: <span id="br-fps">--</span> | <span data-i18n="corner.lat">${t('corner.lat')}</span>: <span id="br-latency">-ms</span></div>
  `;

  syncCornerBottom();
  resizeObs = new ResizeObserver(() => syncCornerBottom());
  const bb = document.getElementById('bottom-bar');
  if (bb) resizeObs.observe(bb);
  window.addEventListener('resize', syncCornerBottom);

  // Restore values after lang change (setLang re-writes data-i18n elements)
  window.addEventListener('langchange', () => {
    _restoreCornerState();
  });

  return { blEl, brEl };
}

function _restoreCornerState() {
  const lc = document.getElementById('br-layer-count');
  const ac = document.getElementById('br-alert-count');
  const fc = document.getElementById('br-fps');
  const lat = document.getElementById('br-latency');
  if (lc) lc.textContent = _lastLayerCount;
  if (ac) ac.textContent = _lastAlertCount;
  if (fc) fc.textContent = _lastFps;
  if (lat) lat.textContent = _lastLatency;
}

export function updateCoordinates(lat, lon) {
  const el = document.getElementById('bl-coords');
  if (el) el.textContent = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
}

export function updateStatus(messages, statusCode) {
  const el = document.getElementById('bl-status');
  if (el) el.textContent = `MSGS: ${messages} ${statusCode}`;
}

export function updateStats(layerCount, alertCount, fps, latency) {
  _lastLayerCount = layerCount;
  _lastAlertCount = alertCount;
  _lastFps = fps !== undefined && fps !== null ? fps : '--';
  _lastLatency = latency !== undefined && latency !== null ? latency + 'ms' : '-ms';

  const lc = document.getElementById('br-layer-count');
  const ac = document.getElementById('br-alert-count');
  const fc = document.getElementById('br-fps');
  const lat = document.getElementById('br-latency');

  if (lc) lc.textContent = layerCount;
  if (ac) ac.textContent = alertCount;
  if (fc) fc.textContent = _lastFps;
  if (lat) lat.textContent = _lastLatency;
}

export function destroy() {
  if (resizeObs) { resizeObs.disconnect(); resizeObs = null; }
  window.removeEventListener('resize', syncCornerBottom);
  if (blEl) blEl.innerHTML = '';
  if (brEl) brEl.innerHTML = '';
}
