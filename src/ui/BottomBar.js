import { COLORS } from '../config.js';
import { t, layerName } from '../i18n.js';

let el, listeners = {};
let _viewMode = 'low-orbit';
let _nightVision = false;
let _paused = false;
let _off = false;
let _alertActive = false;
let _spiralActive = false;
let _activeSpeedBtn = null;

function build() {
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <button data-speed="0.166" data-i18n="speed.1/6x" style="border:1px solid ${COLORS.border};background:${COLORS.panelBg};color:${COLORS.primaryText};padding:2px 6px;cursor:pointer;font-size:10px;">${t('speed.1/6x')}</button>
      <button data-speed="0.33" data-i18n="speed.1/3x" style="border:1px solid ${COLORS.border};background:${COLORS.panelBg};color:${COLORS.primaryText};padding:2px 6px;cursor:pointer;font-size:10px;">${t('speed.1/3x')}</button>
      <button data-speed="1" data-i18n="speed.1x" style="border:1px solid ${COLORS.primaryText};background:${COLORS.panelBg};color:#FFFFFF;padding:2px 6px;cursor:pointer;font-size:10px;text-shadow:0 0 8px ${COLORS.primaryText};">${t('speed.1x')}</button>
      <button data-speed="5" data-i18n="speed.5x" style="border:1px solid ${COLORS.border};background:${COLORS.panelBg};color:${COLORS.primaryText};padding:2px 6px;cursor:pointer;font-size:10px;">${t('speed.5x')}</button>
      <button data-speed="15" data-i18n="speed.15x" style="border:1px solid ${COLORS.border};background:${COLORS.panelBg};color:${COLORS.primaryText};padding:2px 6px;cursor:pointer;font-size:10px;">${t('speed.15x')}</button>
      <button data-speed="60" data-i18n="speed.1h/x" style="border:1px solid ${COLORS.border};background:${COLORS.panelBg};color:${COLORS.primaryText};padding:2px 6px;cursor:pointer;font-size:10px;">${t('speed.1h/x')}</button>
      <button data-speed="600" data-i18n="speed.10h/x" style="border:1px solid ${COLORS.border};background:${COLORS.panelBg};color:${COLORS.primaryText};padding:2px 6px;cursor:pointer;font-size:10px;">${t('speed.10h/x')}</button>
      <button data-speed="3000" data-i18n="speed.50h/x" style="border:1px solid ${COLORS.border};background:${COLORS.panelBg};color:${COLORS.primaryText};padding:2px 6px;cursor:pointer;font-size:10px;">${t('speed.50h/x')}</button>
      <button data-speed="12000" data-i18n="speed.200h/x" style="border:1px solid ${COLORS.border};background:${COLORS.panelBg};color:${COLORS.primaryText};padding:2px 6px;cursor:pointer;font-size:10px;">${t('speed.200h/x')}</button>
      <button id="pause-btn" data-i18n="btn.pause" style="border:1px solid ${COLORS.warning};background:${COLORS.panelBg};color:${COLORS.warning};padding:2px 8px;cursor:pointer;font-size:10px;">${_paused ? '▶' : t('btn.pause')}</button>
      <button id="off-btn" data-i18n="btn.off" style="border:1px solid ${COLORS.danger};background:${COLORS.panelBg};color:${COLORS.danger};padding:2px 8px;cursor:pointer;font-size:10px;">${_off ? '✕' : t('btn.off')}</button>
      <input type="range" id="timeline-slider" min="0" max="168" value="168" style="flex:1;min-width:100px;accent-color:${COLORS.primaryText};">
      <span id="time-label" data-i18n="label.now" style="font-size:10px;">${t('label.now')}</span>
    </div>
    <div id="layer-toggles" style="display:flex;gap:10px;flex-wrap:wrap;font-size:10px;"></div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <button id="view-toggle-btn" data-i18n="btn.space-arc" style="border:1px solid ${COLORS.primaryText};background:${COLORS.panelBg};color:${COLORS.primaryText};padding:3px 10px;cursor:pointer;font-size:10px;">${t('btn.space-arc')}</button>
      <button id="night-vision-btn" data-i18n="btn.night-vision" style="border:1px solid ${COLORS.primaryText};background:${COLORS.panelBg};color:${COLORS.primaryText};padding:3px 10px;cursor:pointer;font-size:10px;">${_nightVision ? t('btn.normal-color') : t('btn.night-vision')}</button>
      <label style="font-size:10px;display:inline-flex;align-items:center;gap:3px;"><span data-i18n="label.glow">${t('label.glow')}</span> <input type="range" id="glow-slider" min="0" max="200" value="100" style="width:60px;accent-color:${COLORS.primaryText};"></label>
      <label style="font-size:10px;display:inline-flex;align-items:center;gap:3px;"><span data-i18n="label.sharp">${t('label.sharp')}</span> <input type="range" id="sharpen-slider" min="0" max="100" value="30" style="width:60px;accent-color:${COLORS.primaryText};"></label>
      <label style="font-size:10px;display:inline-flex;align-items:center;gap:3px;"><span data-i18n="label.hue">${t('label.hue')}</span> <input type="range" id="hue-slider" min="-180" max="180" value="0" style="width:60px;accent-color:${COLORS.primaryText};"></label>
      <button id="alert-btn" data-i18n="btn.alert" style="border:1px solid ${COLORS.warning};background:${COLORS.panelBg};color:${COLORS.warning};padding:3px 8px;cursor:pointer;font-size:10px;">${t('btn.alert')}</button>
      <button id="spiral-btn" data-i18n="btn.spiral" style="border:1px solid ${COLORS.primaryText};background:${COLORS.panelBg};color:${COLORS.primaryText};padding:3px 8px;cursor:pointer;font-size:10px;">${t('btn.spiral')}</button>
    </div>
  `;

  bindEvents();
  // Rebuild layer toggles immediately
  window.dispatchEvent(new CustomEvent('bottombar-rebuilt'));
}

function bindEvents() {
  const speedBtns = el.querySelectorAll('[data-speed]');
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => {
        b.style.borderColor = COLORS.border;
        b.style.color = COLORS.primaryText;
        b.style.textShadow = 'none';
      });
      btn.style.borderColor = COLORS.primaryText;
      btn.style.color = '#FFFFFF';
      btn.style.textShadow = '0 0 8px ' + COLORS.primaryText;
      _activeSpeedBtn = btn;
      emit('speed-change', parseFloat(btn.dataset.speed));
    });
  });

  el.querySelector('#pause-btn').addEventListener('click', function() {
    _paused = !_paused;
    if (_paused) {
      this.textContent = '▶';
      this.style.borderColor = COLORS.success;
      this.style.color = COLORS.success;
    } else {
      this.textContent = t('btn.pause');
      this.style.borderColor = COLORS.warning;
      this.style.color = COLORS.warning;
    }
    emit('pause-click');
  });

  el.querySelector('#off-btn').addEventListener('click', function() {
    _off = !_off;
    if (_off) {
      this.textContent = '✕';
      this.style.borderColor = '#888888';
      this.style.color = '#888888';
    } else {
      this.textContent = t('btn.off');
      this.style.borderColor = COLORS.danger;
      this.style.color = COLORS.danger;
    }
    emit('off-click');
  });

  el.querySelector('#timeline-slider').addEventListener('input', (e) => {
    emit('time-change', { hour: parseInt(e.target.value) });
    const label = el.querySelector('#time-label');
    if (label) label.textContent = 'H-' + (168 - parseInt(e.target.value));
  });

  el.querySelector('#view-toggle-btn').addEventListener('click', () => emit('view-toggle'));
  el.querySelector('#night-vision-btn').addEventListener('click', function() {
    _nightVision = !_nightVision;
    if (_nightVision) {
      this.textContent = t('btn.normal-color');
      this.style.color = '#00E676';
      this.style.borderColor = '#00E676';
    } else {
      this.textContent = t('btn.night-vision');
      this.style.color = COLORS.primaryText;
      this.style.borderColor = COLORS.primaryText;
    }
    emit('night-vision-toggle');
  });

  el.querySelector('#glow-slider').addEventListener('input', e => emit('glow-change', parseFloat(e.target.value) / 100));
  el.querySelector('#sharpen-slider').addEventListener('input', e => emit('sharpen-change', parseFloat(e.target.value) / 100));
  el.querySelector('#hue-slider').addEventListener('input', e => emit('hue-change', parseInt(e.target.value)));

  el.querySelector('#alert-btn').addEventListener('click', function() {
    _alertActive = !_alertActive;
    if (_alertActive) {
      this.style.color = '#FF1744';
      this.style.borderColor = '#FF1744';
      this.style.textShadow = '0 0 10px #FF1744';
    } else {
      this.style.color = COLORS.warning;
      this.style.borderColor = COLORS.warning;
      this.style.textShadow = 'none';
    }
    emit('alert-click');
  });

  el.querySelector('#spiral-btn').addEventListener('click', function() {
    _spiralActive = !_spiralActive;
    if (_spiralActive) {
      this.style.color = '#FFFFFF';
      this.style.borderColor = '#FFFFFF';
      this.style.textShadow = '0 0 8px #FFFFFF';
    } else {
      this.style.color = COLORS.primaryText;
      this.style.borderColor = COLORS.primaryText;
      this.style.textShadow = 'none';
    }
    emit('spiral-click');
  });
}

function emit(event, data) {
  if (listeners[event]) listeners[event].forEach(cb => cb(data));
}

export function init(container) {
  el = document.createElement('div');
  el.style.cssText = 'display:flex;flex-direction:column;gap:6px;font-size:11px;width:100%;';
  container.appendChild(el);
  build();
  window.addEventListener('langchange', build);
  return el;
}

export function setTimelinePosition(position) {
  const slider = el?.querySelector('#timeline-slider');
  const label = el?.querySelector('#time-label');
  if (slider) slider.value = Math.round(position);
  if (label) {
    const hoursToEnd = Math.round(168 - position);
    label.textContent = hoursToEnd === 0 ? t('label.now') : `H-${hoursToEnd}`;
  }
}

export function setActiveSpeed(speed) {
  const speedBtns = el?.querySelectorAll('[data-speed]');
  if (!speedBtns) return;
  speedBtns.forEach(b => {
    b.style.borderColor = COLORS.border;
    b.style.color = COLORS.primaryText;
    b.style.textShadow = 'none';
  });
  if (speed === null) { _activeSpeedBtn = null; return; }
  const targetBtn = Array.from(speedBtns).find(btn => parseFloat(btn.dataset.speed) === speed);
  if (targetBtn) {
    targetBtn.style.borderColor = COLORS.primaryText;
    targetBtn.style.color = '#FFFFFF';
    targetBtn.style.textShadow = '0 0 8px ' + COLORS.primaryText;
    _activeSpeedBtn = targetBtn;
  }
}

export function showPlayIcon() {
  _paused = true;
  const btn = el?.querySelector('#pause-btn');
  if (btn) {
    btn.textContent = '▶';
    btn.style.borderColor = COLORS.success;
    btn.style.color = COLORS.success;
  }
}

export function setLayerStates(states) {
  const container = el?.querySelector('#layer-toggles');
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#FFFFFF','#E53935','#00E676','#2196F3','#FF1744','#FF6D00','#FFEB3B'];
  states.forEach((s, i) => {
    const label = document.createElement('label');
    label.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;';
    const nameSpan = document.createElement('span');
    nameSpan.style.color = colors[i] || '#00F0FF';
    nameSpan.setAttribute('data-i18n', 'layer.' + s.id);
    nameSpan.textContent = layerName(s.id);
    label.innerHTML = '<input type="checkbox" ' + (s.visible ? 'checked' : '') + ' data-layer-id="' + s.id + '" style="accent-color:' + (colors[i]||'#00F0FF') + ';">';
    label.appendChild(nameSpan);
    label.querySelector('input').addEventListener('change', (e) => {
      emit('layer-toggle', { id: s.id, visible: e.target.checked });
    });
    container.appendChild(label);
  });
}

export function setViewMode(mode) {
  _viewMode = mode;
  const btn = el?.querySelector('#view-toggle-btn');
  if (btn) btn.textContent = mode === 'low-orbit' ? t('btn.space-arc') : t('btn.low-orbit');
}

export function setNightVision(enabled) {
  _nightVision = enabled;
  const btn = el?.querySelector('#night-vision-btn');
  if (btn) {
    btn.textContent = enabled ? t('btn.normal-color') : t('btn.night-vision');
    btn.style.color = enabled ? '#00E676' : COLORS.primaryText;
    btn.style.borderColor = enabled ? '#00E676' : COLORS.primaryText;
  }
}

export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

export function destroy() {
  window.removeEventListener('langchange', build);
  if (el) { el.remove(); el = null; listeners = {}; }
}
