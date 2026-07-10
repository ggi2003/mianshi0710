import { t, setLang, getLang } from '../i18n.js';
import { COLORS } from '../config.js';

let el, playbackBtn, langBtn;
let _playbackCallback = null;

export function init(container) {
  el = document.createElement('div');
  el.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;';
  el.innerHTML = `
    <div style="font-size:18px;font-weight:bold;text-shadow:0 0 8px #00F0FF;">WORLDVIEW</div>
    <div style="display:flex;align-items:center;gap:20px;">
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

  // Rebind playback callback when lang btn is clicked (in case it was deferred)
  if (_playbackCallback && playbackBtn) {
    playbackBtn.addEventListener('click', _playbackCallback);
  }

  return el;
}

export function setPlaybackState(isPlaying) {
  if (playbackBtn) playbackBtn.textContent = t(isPlaying ? 'btn.playing' : 'btn.playback');
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
