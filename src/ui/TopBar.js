import { t, setLang, getLang } from '../i18n.js';
import { COLORS } from '../config.js';

let el, playbackBtn, langBtn;
let _playbackCallback = null;
let _isPlaying = false;

function formatBeijingShort(ms) {
  const d = new Date(ms + 8 * 3600000);
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function build() {
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:24px;">
      <div style="font-size:18px;font-weight:bold;text-shadow:0 0 8px #00F0FF;">WORLDVIEW</div>
      <span id="tb-cursor-time" style="font-size:11px;color:#00F0FF;">--:--:-- BJT</span>
    </div>
    <div style="display:flex;align-items:center;gap:20px;">
      <span id="tb-threat-badge" style="font-size:11px;padding:1px 8px;border:1px solid #00E676;color:#00E676;">${getLang() === 'zh' ? '正常' : 'NORMAL'}</span>
      <span style="font-size:11px;color:rgba(0,240,255,0.6);">TOP SECRET // SI-TK // NOFORN</span>
      <span style="font-size:11px;">KB11-6040 OPS-4138</span>
      <span id="playback-btn" style="cursor:pointer;padding:2px 10px;border:1px solid #00F0FF;color:#00F0FF;font-size:11px;">${t(_isPlaying ? 'btn.playing' : 'btn.playback')}</span>
      <span id="lang-btn" style="cursor:pointer;padding:2px 10px;border:1px solid ${COLORS.warning};color:${COLORS.warning};font-size:11px;">${t('label.lang')}</span>
    </div>
  `;

  playbackBtn = el.querySelector('#playback-btn');
  langBtn = el.querySelector('#lang-btn');

  langBtn.addEventListener('click', () => {
    const next = getLang() === 'zh' ? 'en' : 'zh';
    setLang(next);
  });

  if (_playbackCallback && playbackBtn) {
    playbackBtn.addEventListener('click', _playbackCallback);
  }
}

export function init(container) {
  el = document.createElement('div');
  el.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;';
  container.appendChild(el);
  build();
  window.addEventListener('langchange', build);
  return el;
}

export function setPlaybackState(isPlaying) {
  _isPlaying = isPlaying;
  if (playbackBtn) playbackBtn.textContent = t(isPlaying ? 'btn.playing' : 'btn.playback');
}

export function updateForPlaybackTime(cursorMs, events) {
  if (!el) return;

  const timeEl = el.querySelector('#tb-cursor-time');
  if (timeEl) timeEl.textContent = formatBeijingShort(Date.now()) + ' BJT';

  const badge = el.querySelector('#tb-threat-badge');
  if (badge) {
    const has = (s) => events && events.some(e => e.severity === s);
    const isZh = getLang() === 'zh';
    let text = isZh ? '正常' : 'NORMAL', color = '#00E676';
    if (has('CRITICAL')) { text = isZh ? '危急' : 'CRITICAL'; color = '#FF1744'; }
    else if (has('HIGH')) { text = isZh ? '升高' : 'ELEVATED'; color = '#FF9800'; }
    else if (has('MEDIUM')) { text = isZh ? '警戒' : 'GUARDED'; color = '#FFEB3B'; }
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
  window.removeEventListener('langchange', build);
  if (el) { el.remove(); el = null; }
}
