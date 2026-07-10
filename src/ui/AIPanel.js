import { COLORS } from '../config.js';
import { t } from '../i18n.js';

let el, listeners = {};

export function init(container) {
  el = document.createElement('div');
  el.style.cssText = `position:fixed;top:0;right:-100%;width:min(380px, 90vw);height:100%;background:${COLORS.panelBg};border-left:1px solid ${COLORS.border};z-index:200;transition:right 0.3s ease;padding:20px;overflow-y:auto;font-size:clamp(11px, 1.2vw, 13px);box-shadow:-4px 0 20px rgba(0,0,0,0.8);`;
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <span data-i18n="ai.title" style="font-size:16px;text-shadow:0 0 6px ${COLORS.primaryText};">${t('ai.title')}</span>
      <span id="ai-close" style="cursor:pointer;font-size:20px;">×</span>
    </div>
    <div id="ai-content"></div>
  `;
  document.body.appendChild(el);
  el.querySelector('#ai-close').addEventListener('click', () => hide());

  // Re-show content with current language when switching
  window.addEventListener('langchange', () => {
    if (el.style.right === '0px' || el.style.right === '0') {
      const contentType = el.getAttribute('data-event-type') || 'generic';
      const eventName = el.getAttribute('data-event-name') || t('ai.global-overview');
      showContent(contentType, eventName);
    }
  });

  return el;
}

function showContent(eventType, eventName) {
  el.style.right = '0';
  el.setAttribute('data-event-type', eventType);
  el.setAttribute('data-event-name', eventName);
  const content = el.querySelector('#ai-content');
  content.innerHTML = `<div style="color:#00F0FF;">${t('ai.loading')}</div>`;

  import('../data/ai-responses.json').then(mod => {
    const responses = mod.default || mod;
    const match = responses.find(r => r.eventType === eventType) || responses.find(r => r.eventType === 'generic') || responses[0];
    if (match) {
      content.innerHTML = `
        <div style="margin-bottom:12px;">
          <div style="color:rgba(0,240,255,0.6);font-size:10px;">${t('ai.event')}</div>
          <div style="font-size:14px;">${eventName || t('value.unknown')}</div>
        </div>
        <div style="margin-bottom:12px;">
          <div style="color:rgba(0,240,255,0.6);font-size:10px;">${t('ai.threat-level')}</div>
          <div style="font-size:16px;color:${match.threatLevel === 'CRITICAL' ? '#FF1744' : match.threatLevel === 'HIGH' ? '#FF9800' : '#FFEB3B'};">${match.threatLevel}</div>
        </div>
        <div style="margin-bottom:12px;padding:12px;background:rgba(0,0,0,0.3);border-left:2px solid ${COLORS.primaryText};">
          <div style="color:rgba(0,240,255,0.6);font-size:10px;margin-bottom:4px;">${t('ai.analysis-summary')}</div>
          <div style="line-height:1.6;">${match.summary}</div>
        </div>
        <div style="margin-bottom:12px;padding:12px;background:rgba(0,0,0,0.3);border-left:2px solid ${COLORS.warning};">
          <div style="color:rgba(0,240,255,0.6);font-size:10px;margin-bottom:4px;">${t('ai.trend-forecast')}</div>
          <div style="line-height:1.6;">${match.trend}</div>
        </div>
        <div style="margin-top:12px;">
          <div style="color:rgba(0,240,255,0.6);font-size:10px;margin-bottom:4px;">${t('ai.recommended-actions')}</div>
          ${(match.actions || []).map((a, i) => `<div style="margin-bottom:4px;padding:4px 8px;background:rgba(0,240,255,0.05);">${i + 1}. ${a}</div>`).join('')}
        </div>
      `;
    }
  });
}

export function show(eventType, eventName) {
  showContent(eventType, eventName);
}

export function showOverview() {
  show('generic', t('ai.global-overview'));
}

export function hide() {
  if (el) el.style.right = '-100%';
  emit('close');
}

function emit(event) { if (listeners[event]) listeners[event].forEach(cb => cb()); }

export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

export function destroy() {
  if (el) { el.remove(); el = null; listeners = {}; }
}
