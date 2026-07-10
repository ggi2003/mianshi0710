import { COLORS } from '../config.js';
import { t } from '../i18n.js';

let el, listeners = {};
let _lastEvent = null;

export function init(container) {
  el = document.createElement('div');
  el.style.cssText = `display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);min-width:min(320px, 85vw);max-width:95vw;background:${COLORS.panelBg};border:1px solid ${COLORS.border};z-index:150;padding:16px;box-shadow:0 0 30px rgba(0,0,0,0.9);font-size:clamp(11px, 1.2vw, 13px);`;
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <span data-i18n="card.title" style="font-size:14px;text-shadow:0 0 4px ${COLORS.primaryText};color:${COLORS.primaryText};">${t('card.title')}</span>
      <span id="ec-close" style="cursor:pointer;font-size:18px;">×</span>
    </div>
    <div id="ec-content"></div>
  `;
  document.body.appendChild(el);
  el.querySelector('#ec-close').addEventListener('click', () => hide());

  // Re-render card content on lang change if visible
  window.addEventListener('langchange', () => {
    if (el.style.display === 'block' && _lastEvent) {
      show(_lastEvent);
    }
  });

  return el;
}

export function show(event) {
  if (!el) return;
  _lastEvent = event;
  el.style.display = 'block';
  const severityColor = event.severity === 'CRITICAL' ? COLORS.danger : event.severity === 'HIGH' ? COLORS.warning : COLORS.success;
  el.querySelector('#ec-content').innerHTML = `
    <div style="margin-bottom:8px;"><span style="color:rgba(0,240,255,0.6);">${t('field.type')}</span> ${event.type || t('value.unknown')}</div>
    <div style="margin-bottom:8px;"><span style="color:rgba(0,240,255,0.6);">${t('field.name')}</span> ${event.name || t('value.unnamed')}</div>
    <div style="margin-bottom:8px;"><span style="color:rgba(0,240,255,0.6);">${t('field.time')}</span> ${event.timestamp || ''}</div>
    <div style="margin-bottom:8px;"><span style="color:rgba(0,240,255,0.6);">${t('field.location')}</span> ${event.lat?.toFixed(2) || '?'}, ${event.lon?.toFixed(2) || '?'}</div>
    <div style="margin-bottom:12px;"><span style="color:rgba(0,240,255,0.6);">${t('field.severity')}</span> <span style="color:${severityColor};">${event.severity || t('value.na')}</span></div>
    <button id="ec-ai-btn" data-i18n="btn.view-ai" style="width:100%;padding:6px;background:rgba(0,240,255,0.1);border:1px solid ${COLORS.primaryText};color:${COLORS.primaryText};cursor:pointer;font-size:11px;">${t('btn.view-ai')}</button>
  `;
  el.querySelector('#ec-ai-btn').addEventListener('click', () => emit('ai-analysis-click', event));
}

export function hide() {
  _lastEvent = null;
  if (el) el.style.display = 'none';
  emit('close');
}

function emit(event, data) { if (listeners[event]) listeners[event].forEach(cb => cb(data)); }

export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

export function destroy() {
  if (el) { el.remove(); el = null; listeners = {}; }
}
