import { t } from '../i18n.js';

let el, aiBtn, threatSelect;
let listeners = {};

/** Format a Date (or timestamp ms) as "YYYY-MM-DD HH:MM:SS BJT" */
function formatBeijingTime(dateOrMs) {
  const d = dateOrMs instanceof Date ? dateOrMs : new Date(dateOrMs);
  const bj = new Date(d.getTime() + 8 * 3600000);
  const y = bj.getUTCFullYear();
  const m = String(bj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(bj.getUTCDate()).padStart(2, '0');
  const h = String(bj.getUTCHours()).padStart(2, '0');
  const min = String(bj.getUTCMinutes()).padStart(2, '0');
  const s = String(bj.getUTCSeconds()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}:${s} BJT`;
}

export function init(container) {
  el = document.createElement('div');
  el.style.cssText = 'font-size:11px;';
  el.innerHTML = `
    <div style="margin-bottom:6px;">
      <div id="rp-rec-line" style="color:#00F0FF;">REC ${formatBeijingTime(Date.now())}</div>
      <div style="font-size:9px;opacity:0.5;">LOG #0451 DESC OK</div>
    </div>
    <div id="rp-events-section" style="margin-top:12px;padding:6px 0;border-top:1px solid rgba(0,240,255,0.2);max-height:240px;overflow-y:auto;">
      <div id="rp-events-title" style="font-size:10px;opacity:0.6;margin-bottom:4px;">ACTIVE EVENTS</div>
      <div id="rp-events-list" style="font-size:10px;"></div>
    </div>
    <div style="margin-top:12px;padding-top:6px;border-top:1px solid rgba(0,240,255,0.2);font-size:9px;">
      <div><span>CRIT</span> <span id="rp-crit-count">0</span> &nbsp; <span>HIGH</span> <span id="rp-high-count">0</span> &nbsp; <span>MED</span> <span id="rp-med-count">0</span></div>
    </div>
    <div style="margin-top:12px;">
      <button id="ai-analysis-btn" data-i18n="btn.ai-analysis" style="width:100%;padding:8px;background:rgba(0,240,255,0.1);border:1px solid #00F0FF;color:#00F0FF;font-family:inherit;font-size:12px;cursor:pointer;text-shadow:0 0 4px #00F0FF;">${t('btn.ai-analysis')}</button>
    </div>
  `;
  container.appendChild(el);

  aiBtn = el.querySelector('#ai-analysis-btn');
  threatSelect = el.querySelector('#threat-select');
  aiBtn.addEventListener('click', () => listeners['ai-analysis-click']?.forEach(cb => cb()));
  if (threatSelect) {
    threatSelect.addEventListener('change', (e) => listeners['threat-change']?.forEach(cb => cb(e.target.value)));
  }

  return el;
}

/**
 * Update the right panel for a specific playback time.
 * rp-rec-line shows the playback TIME_WINDOW time.
 * When the timeline reaches "now" (position >= 168h), it shows current system time.
 * @param {number} cursorMs        — current playback cursor (ms since epoch)
 * @param {boolean} isNow           — true when the timeline is at "now"
 * @param {Array} [events]          — visible intel events at this time
 * @param {Object} [counts]         — { critical, high, medium, low }
 */
export function updateForPlaybackTime(cursorMs, events, counts, isNow) {
  if (!el) return;

  // 1. REC line — shows playback time, or real-time clock only when "now"
  const recTime = isNow ? Date.now() : cursorMs;
  const recLine = el.querySelector('#rp-rec-line');
  if (recLine) recLine.textContent = 'REC ' + formatBeijingTime(recTime);

  // 2. Event list
  const list = el.querySelector('#rp-events-list');
  if (list) {
    if (!events || events.length === 0) {
      list.innerHTML = '<div style="opacity:0.3;">— NO EVENTS IN WINDOW —</div>';
    } else {
      list.innerHTML = events.slice(0, 12).map(e => {
        const color = e.severity === 'CRITICAL' ? '#FF1744'
          : e.severity === 'HIGH' ? '#FF9800'
          : e.severity === 'MEDIUM' ? '#FFEB3B'
          : '#00E676';
        return `<div style="margin-bottom:3px;border-left:2px solid ${color};padding-left:4px;">
          <span style="color:${color};">${e.severity?.slice(0, 4) || '??'}</span>
          ${e.name?.slice(0, 28) || '—'}
        </div>`;
      }).join('');
      if (events.length > 12) {
        list.innerHTML += `<div style="opacity:0.4;">… +${events.length - 12} more</div>`;
      }
    }
  }

  // 3. Counts
  if (counts) {
    const crit = el.querySelector('#rp-crit-count');
    const high = el.querySelector('#rp-high-count');
    const med  = el.querySelector('#rp-med-count');
    if (crit) crit.textContent = counts.critical ?? 0;
    if (high) high.textContent = counts.high ?? 0;
    if (med)  med.textContent  = counts.medium ?? 0;
  }
}

export function updateTimestamp(ts) {
  const d = el?.querySelector('#rp-rec-line');
  if (d) d.textContent = 'REC ' + ts;
}

export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

export function destroy() {
  if (el) { el.remove(); el = null; listeners = {}; }
}
