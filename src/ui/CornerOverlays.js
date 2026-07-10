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

export function init(container) {
  blEl = document.getElementById('corner-bottom-left');
  brEl = document.getElementById('corner-bottom-right');

  if (blEl) blEl.innerHTML = `<div id="bl-coords" style="text-shadow:0 0 4px #00F0FF;">--°--'--"N --°--'--"E</div><div id="bl-status" style="margin-top:2px;opacity:0.7;">MSGS: --</div>`;
  if (brEl) brEl.innerHTML = `
    <div id="br-stats-line" style="text-shadow:0 0 4px #00F0FF;"><span data-i18n="corner.layers">${t('corner.layers')}</span>: <span id="br-layer-count">0</span> <span data-i18n="corner.active">${t('corner.active')}</span></div>
    <div id="br-alerts-line" style="margin-top:2px;opacity:0.7;"><span data-i18n="corner.alerts">${t('corner.alerts')}</span>: <span id="br-alert-count">0</span> <span data-i18n="corner.pending">${t('corner.pending')}</span></div>
    <div id="br-event-line" style="margin-top:2px;font-size:0.85em;opacity:0.5;"><span id="br-latest-event">—</span></div>
  `;

  syncCornerBottom();
  resizeObs = new ResizeObserver(() => syncCornerBottom());
  const bb = document.getElementById('bottom-bar');
  if (bb) resizeObs.observe(bb);
  window.addEventListener('resize', syncCornerBottom);

  window.addEventListener('langchange', () => {
    // Restore values after lang change rewrites data-i18n
    const lc = document.getElementById('br-layer-count');
    const ac = document.getElementById('br-alert-count');
    const le = document.getElementById('br-latest-event');
    if (lc) lc.textContent = _lastLayerCount;
    if (ac) ac.textContent = _lastAlertCount;
    if (le) le.textContent = _lastLatestEvent;
  });

  return { blEl, brEl };
}

let _lastLayerCount = 0;
let _lastAlertCount = 0;
let _lastLatestEvent = '—';

/** Format lat/lon as DD°MM'SS"X */
function formatLatLon(lat, lon) {
  const fmt = (deg, pos, neg) => {
    const sign = deg >= 0;
    const d = Math.abs(deg);
    const dd = Math.floor(d);
    const mm = Math.floor((d - dd) * 60);
    const ss = Math.round((d - dd - mm / 60) * 3600);
    return `${dd}°${String(mm).padStart(2,'0')}'${String(ss).padStart(2,'0')}"${sign ? pos : neg}`;
  };
  return `${fmt(lat, 'N', 'S')} ${fmt(lon, 'E', 'W')}`;
}

export function updateCoordinates(lat, lon) {
  const el = document.getElementById('bl-coords');
  if (el) el.textContent = formatLatLon(lat, lon);
}

/**
 * Push playback-reactive data into the corner overlays.
 * @param {number} layerCount
 * @param {number} alertCount    number of visible events
 * @param {Array}  visibleEvents full event objects (for latest-event label)
 */
export function updateStats(layerCount, alertCount, visibleEvents) {
  _lastLayerCount = layerCount;
  _lastAlertCount = alertCount;

  const lc = document.getElementById('br-layer-count');
  const ac = document.getElementById('br-alert-count');
  const le = document.getElementById('br-latest-event');

  if (lc) lc.textContent = layerCount;
  if (ac) ac.textContent = alertCount;

  if (le) {
    if (visibleEvents && visibleEvents.length > 0) {
      const latest = visibleEvents[visibleEvents.length - 1];
      const short = latest.name?.slice(0, 45) || '—';
      _lastLatestEvent = `LATEST: ${latest.severity || ''} — ${short}`;
    } else {
      _lastLatestEvent = '—';
    }
    le.textContent = _lastLatestEvent;
  }
}

export function updateStatus(messages, statusCode) {
  const el = document.getElementById('bl-status');
  if (el) el.textContent = `MSGS: ${messages} ${statusCode}`;
}

export function destroy() {
  if (resizeObs) { resizeObs.disconnect(); resizeObs = null; }
  window.removeEventListener('resize', syncCornerBottom);
  if (blEl) blEl.innerHTML = '';
  if (brEl) brEl.innerHTML = '';
}
