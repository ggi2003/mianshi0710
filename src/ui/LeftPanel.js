import { t } from '../i18n.js';

let el;

export function init(container) {
  el = document.createElement('div');
  el.style.cssText = 'font-size:11px;';
  el.innerHTML = `
    <div style="margin-bottom:8px;color:#00F0FF;text-shadow:0 0 6px #00F0FF;">
      <div>TOP SECRET // SI-TK // NOFORN</div>
      <div style="margin-top:2px;">KB11-6040 OPS-4138</div>
      <div style="margin-top:6px;display:flex;align-items:center;gap:6px;">
        <span style="display:inline-block;width:8px;height:8px;background:#00E676;box-shadow:0 0 6px #00E676;"></span>
        <span style="font-size:16px;font-weight:bold;">NORMAL</span>
      </div>
      <div style="font-size:10px;opacity:0.7;">NORMAL GLOBAL</div>
    </div>
    <div id="left-summary" style="margin-top:16px;border-top:1px solid rgba(0,240,255,0.2);padding-top:8px;">
      <div style="cursor:pointer;color:#00F0FF;" data-i18n="label.data-summary">${t('label.data-summary')}</div>
      <div style="padding-left:12px;margin-top:4px;">
        <div><span data-i18n="label.active">${t('label.active')}</span> <span id="sum-layer-count">0</span>/7</div>
        <div><span data-i18n="label.events">${t('label.events')}</span> <span id="sum-event-count">0</span></div>
        <div><span data-i18n="label.alert">${t('label.alert')}</span> <span id="sum-alert-level">YELLOW</span></div>
      </div>
    </div>
  `;
  container.appendChild(el);

  el.querySelector('#left-summary div:first-child').addEventListener('click', () => {
    const content = el.querySelector('#left-summary div:last-child');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
  });

  return el;
}

export function updateSummary(layerCount, eventCount, alertLevel) {
  const lc = el?.querySelector('#sum-layer-count');
  const ec = el?.querySelector('#sum-event-count');
  const al = el?.querySelector('#sum-alert-level');
  if (lc) lc.textContent = layerCount;
  if (ec) ec.textContent = eventCount;
  if (al) al.textContent = alertLevel;
}

export function toggleSummary() {
  const content = el?.querySelector('#left-summary div:last-child');
  if (content) content.style.display = content.style.display === 'none' ? 'block' : 'none';
}

export function destroy() {
  if (el) { el.remove(); el = null; }
}
