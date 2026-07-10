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

function build() {
  if (blEl) blEl.innerHTML = `<div id="bl-coords" style="text-shadow:0 0 4px #00F0FF;">--°--'--"N --°--'--"E</div><div id="bl-status" style="margin-top:2px;opacity:0.7;">MSGS: --</div>`;
  if (brEl) brEl.innerHTML = `
    <div id="br-stats-line" style="text-shadow:0 0 4px #00F0FF;">${t('corner.layers')}: <span id="br-layer-count">${_lastLayerCount}</span> ${t('corner.active')}</div>
    <div id="br-alerts-line" style="margin-top:2px;opacity:0.7;">${t('corner.alerts')}: <span id="br-alert-count">${_lastAlertCount}</span> ${t('corner.pending')}</div>
    <div id="br-event-line" style="margin-top:2px;font-size:0.85em;opacity:0.5;"><span id="br-latest-event">${_lastLatestEvent}</span></div>
    <div id="br-fps-line" style="margin-top:2px;font-size:0.8em;opacity:0.4;">${t('corner.fps')}: <span id="br-fps-value">--</span></div>
  `;
  syncCornerBottom();
}

export function init(container) {
  blEl = document.getElementById('corner-bottom-left');
  brEl = document.getElementById('corner-bottom-right');
  build();

  syncCornerBottom();
  resizeObs = new ResizeObserver(() => syncCornerBottom());
  const bb = document.getElementById('bottom-bar');
  if (bb) resizeObs.observe(bb);
  window.addEventListener('resize', syncCornerBottom);
  window.addEventListener('langchange', build);

  return { blEl, brEl };
}

let _lastLayerCount = 0;
let _lastAlertCount = 0;
let _lastLatestEvent = '—';
let _lastFps = 0;

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
      _lastLatestEvent = `LATEST: ${latest.severity || ''} — ${(latest.name || '').slice(0, 45)}`;
    } else {
      _lastLatestEvent = '—';
    }
    le.textContent = _lastLatestEvent;
  }
}

export function updateFps(fps) {
  _lastFps = fps;
  const el = document.getElementById('br-fps-value');
  if (el) el.textContent = fps;
}

export function updateStatus(messages, statusCode) {
  const el = document.getElementById('bl-status');
  if (el) el.textContent = `MSGS: ${messages} ${statusCode}`;
}

export function destroy() {
  window.removeEventListener('langchange', build);
  if (resizeObs) { resizeObs.disconnect(); resizeObs = null; }
  window.removeEventListener('resize', syncCornerBottom);
  if (blEl) blEl.innerHTML = '';
  if (brEl) brEl.innerHTML = '';
}
