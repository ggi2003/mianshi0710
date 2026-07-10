import { t, setLang, getLang } from '../i18n.js';
import { COLORS } from '../config.js';

let el, playbackBtn, langBtn;
let _playbackCallback = null;

function formatBeijingShort(ms) {
  const d = new Date(ms + 8 * 3600000);
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function init(container) {
  el = document.createElement('div');
  el.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;';
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:24px;">
      <div style="font-size:18px;font-weight:bold;text-shadow:0 0 8px #00F0FF;">WORLDVIEW</div>
      <span id="tb-cursor-time" style="font-size:11px;color:#00F0FF;">--:--:-- BJT</span>
    </div>
    <div style="display:flex;align-items:center;gap:20px;">
      <span id="tb-threat-badge" style="font-size:11px;padding:1px 8px;border:1px solid #00E676;color:#00E676;">NORMAL</span>
      <span style="font-size:11px;color:rgba(0,240,255,0.6);">TOP SECRET // SI-TK // NOFORN</span>
      <span style="font-size:11px;">KB11-6040 OPS-4138</span>
      <span id="playback-btn" data-i18n="btn.playback" style="cursor:pointer;padding:2px 10px;border:1px solid #00F0FF;color:#00F0FF;font-size:11px;">${t('btn.playback')}</span>
      <span id="lang-btn" data-i18n="label.lang" style="cursor:pointer;padding:2px 10px;border:1px solid ${COLORS.warning};color:${COLORS.warning};font-size:11px;">${t('label.lang')}</span>
    </div>
  `;
  container.appendChild(el);

  playbackBtn = el.querySelector('#playback-btn');
  langBtn = el.querySelector('#lang-btn');

  langBtn.addEventListener('click', () => {
    const next = getLang() === 'zh' ? 'en' : 'zh';
    setLang(next);
  });

  if (_playbackCallback && playbackBtn) {
    playbackBtn.addEventListener('click', _playbackCallback);
  }

  return el;
}

export function setPlaybackState(isPlaying) {
  if (playbackBtn) playbackBtn.textContent = t(isPlaying ? 'btn.playing' : 'btn.playback');
}

/**
 * Push playback-time-reactive data into the top bar.
 * tb-cursor-time always shows the current system clock.
 * @param {number} cursorMs   current playback time (ms) — NOT used for clock
 * @param {Array}  events     visible intel events
 */
export function updateForPlaybackTime(cursorMs, events) {
  if (!el) return;

  // Always show live system clock, not playback time
  const timeEl = el.querySelector('#tb-cursor-time');
  if (timeEl) timeEl.textContent = formatBeijingShort(Date.now()) + ' BJT';

  // Threat badge
  const badge = el.querySelector('#tb-threat-badge');
  if (badge) {
    const has = (s) => events && events.some(e => e.severity === s);
    let text = 'NORMAL', color = '#00E676';
    if (has('CRITICAL')) { text = 'CRITICAL'; color = '#FF1744'; }
    else if (has('HIGH')) { text = 'ELEVATED'; color = '#FF9800'; }
    else if (has('MEDIUM')) { text = 'GUARDED'; color = '#FFEB3B'; }
    badge.textContent = text;
    badge.style.color = color;
    badge.style.borderColor = color;
  }
}

export function on(event, callback) {
  if (event === 'playback-click') {
    _playbackCallback = callback;
    if (playbackBtn) playbackBtn.addEventListener('click', callback);
  }
}

export function destroy() {
  if (el) { el.remove(); el = null; }
}
