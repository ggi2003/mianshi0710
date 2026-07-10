import { t } from '../i18n.js';

function formatBeijingTime() {
  const now = new Date();
  const bj = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 8 * 3600000);
  const y = bj.getFullYear();
  const m = String(bj.getMonth() + 1).padStart(2, '0');
  const d = String(bj.getDate()).padStart(2, '0');
  const h = String(bj.getHours()).padStart(2, '0');
  const min = String(bj.getMinutes()).padStart(2, '0');
  const s = String(bj.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s} BJT`;
}

let el, aiBtn, threatSelect;
let listeners = {};

export function init(container) {
  el = document.createElement('div');
  el.style.cssText = 'font-size:11px;';
  el.innerHTML = `
    <div style="margin-bottom:6px;">
      <div style="color:#00F0FF;">REC ${formatBeijingTime()}</div>
      <div style="font-size:9px;opacity:0.5;">LOG #0451 DESC OK</div>
    </div>
    <div style="margin-top:12px;padding:6px 0;border-top:1px solid rgba(0,240,255,0.2);">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="display:inline-block;width:6px;height:6px;background:#2196F3;box-shadow:0 0 4px #2196F3;"></span>
        <span data-i18n="label.force">${t('label.force')}</span>
        <span style="color:#2196F3;">2.4k</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="display:inline-block;width:6px;height:6px;background:#2196F3;box-shadow:0 0 4px #2196F3;"></span>
        <span data-i18n="label.surveillance">${t('label.surveillance')}</span>
        <span style="color:#2196F3;">89%</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="display:inline-block;width:6px;height:6px;background:#FF9800;box-shadow:0 0 4px #FF9800;"></span>
        <span data-i18n="label.threat">${t('label.threat')}</span>
        <select id="threat-select" style="background:#000;color:#FF9800;border:1px solid rgba(255,152,0,0.5);font-size:10px;font-family:inherit;">
          <option>Tactical</option>
          <option>Strategic</option>
          <option>Operational</option>
        </select>
      </div>
    </div>
    <div style="margin-top:12px;padding-top:6px;border-top:1px solid rgba(0,240,255,0.2);font-size:9px;">
      <div><span data-i18n="label.gso">${t('label.gso')}</span> <span>575.68M</span> <span data-i18n="label.ntirs">${t('label.ntirs')}</span> <span>0.0</span></div>
      <div><span data-i18n="label.alt">${t('label.alt')}</span> <span>1935159N</span> <span data-i18n="label.sun">${t('label.sun')}</span> <span>-24.3° EL</span></div>
    </div>
    <div style="margin-top:16px;">
      <button id="ai-analysis-btn" data-i18n="btn.ai-analysis" style="width:100%;padding:8px;background:rgba(0,240,255,0.1);border:1px solid #00F0FF;color:#00F0FF;font-family:inherit;font-size:12px;cursor:pointer;text-shadow:0 0 4px #00F0FF;">${t('btn.ai-analysis')}</button>
    </div>
  `;
  container.appendChild(el);

  aiBtn = el.querySelector('#ai-analysis-btn');
  threatSelect = el.querySelector('#threat-select');
  aiBtn.addEventListener('click', () => listeners['ai-analysis-click']?.forEach(cb => cb()));
  threatSelect.addEventListener('change', (e) => listeners['threat-change']?.forEach(cb => cb(e.target.value)));

  return el;
}

export function updateTimestamp(ts) {
  const d = el?.querySelector('div:first-child div:first-child');
  if (d) d.textContent = 'REC ' + ts;
}

export function updateTelemetry(gso, ntirs, alt, sun) {}

export function setThreatLevel(level) {
  if (threatSelect) threatSelect.value = level;
}

export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

export function destroy() {
  if (el) { el.remove(); el = null; listeners = {}; }
}
