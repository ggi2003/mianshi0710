import { t, getLang } from '../i18n.js';

let el;

function alertLabel(events) {
  if (!events || events.length === 0) return getLang() === 'zh' ? '正常' : 'NORMAL';
  const has = (s) => events.some(e => e.severity === s);
  const zh = getLang() === 'zh';
  if (has('CRITICAL')) return zh ? '红色警报' : 'RED ALERT';
  if (has('HIGH'))     return zh ? '橙色警报' : 'ORANGE ALERT';
  if (has('MEDIUM'))   return zh ? '黄色警告' : 'YELLOW';
  return zh ? '正常' : 'NORMAL';
}

function statusLabel(events) {
  if (!events || events.length === 0) return getLang() === 'zh' ? '全球正常' : 'NORMAL GLOBAL';
  const has = (s) => events.some(e => e.severity === s);
  const zh = getLang() === 'zh';
  if (has('CRITICAL')) return zh ? '危急 — 多战区冲突' : 'CRITICAL — MULTIPLE THEATRES';
  if (has('HIGH'))     return zh ? '升高 — 区域不稳定' : 'ELEVATED — REGIONAL INSTABILITY';
  if (has('MEDIUM'))   return zh ? '警戒 — 局部活动' : 'GUARDED — LOCALISED ACTIVITY';
  return zh ? '全球正常' : 'NORMAL GLOBAL';
}

function statusColor(events) {
  if (!events || events.length === 0) return '#00E676';
  const has = (s) => events.some(e => e.severity === s);
  if (has('CRITICAL')) return '#FF1744';
  if (has('HIGH'))     return '#FF9800';
  if (has('MEDIUM'))   return '#FFEB3B';
  return '#00E676';
}

function build() {
  if (!el) return;
  el.innerHTML = `
    <div id="lp-status-block" style="margin-bottom:8px;color:#00F0FF;text-shadow:0 0 6px #00F0FF;">
      <div>TOP SECRET // SI-TK // NOFORN</div>
      <div style="margin-top:2px;">KB11-6040 OPS-4138</div>
      <div style="margin-top:6px;display:flex;align-items:center;gap:6px;">
        <span id="lp-status-dot" style="display:inline-block;width:8px;height:8px;background:#00E676;box-shadow:0 0 6px #00E676;"></span>
        <span id="lp-status-text" style="font-size:16px;font-weight:bold;">${getLang() === 'zh' ? '正常' : 'NORMAL'}</span>
      </div>
      <div id="lp-status-sub" style="font-size:10px;opacity:0.7;">${getLang() === 'zh' ? '全球正常' : 'NORMAL GLOBAL'}</div>
    </div>
    <div id="left-summary" style="margin-top:16px;border-top:1px solid rgba(0,240,255,0.2);padding-top:8px;">
      <div style="cursor:pointer;color:#00F0FF;" data-i18n="label.data-summary">${t('label.data-summary')}</div>
      <div id="left-summary-detail" style="padding-left:12px;margin-top:4px;">
        <div><span data-i18n="label.active">${t('label.active')}</span> <span id="sum-layer-count">0</span>/7</div>
        <div><span data-i18n="label.events">${t('label.events')}</span> <span id="sum-event-count">0</span></div>
        <div><span data-i18n="label.alert">${t('label.alert')}</span> <span id="sum-alert-level">${getLang() === 'zh' ? '正常' : 'NORMAL'}</span></div>
        <div style="margin-top:4px;font-size:9px;opacity:0.6;">
          <span id="sum-latest-name">—</span>
        </div>
      </div>
    </div>
  `;

  el.querySelector('#left-summary > div:first-child').addEventListener('click', () => {
    const detail = el.querySelector('#left-summary-detail');
    detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
  });
}

export function init(container) {
  el = document.createElement('div');
  el.style.cssText = 'font-size:11px;';
  container.appendChild(el);
  build();

  window.addEventListener('langchange', build);
  return el;
}

export function updateForPlaybackTime(cursorMs, visibleEvents) {
  if (!el) return;

  const alert = alertLabel(visibleEvents);
  const sub   = statusLabel(visibleEvents);
  const color = statusColor(visibleEvents);

  const dot  = el.querySelector('#lp-status-dot');
  const txt  = el.querySelector('#lp-status-text');
  const subt = el.querySelector('#lp-status-sub');
  if (dot)  { dot.style.background = color; dot.style.boxShadow = `0 0 6px ${color}`; }
  if (txt)  { txt.textContent = alert; txt.style.color = color; }
  if (subt) subt.textContent = sub;

  const eventCount = visibleEvents ? visibleEvents.length : 0;
  const lc = el.querySelector('#sum-event-count');
  const al = el.querySelector('#sum-alert-level');
  const ln = el.querySelector('#sum-latest-name');
  if (lc) lc.textContent = eventCount;
  if (al) al.textContent = alert;
  if (ln) {
    const latest = visibleEvents?.[visibleEvents.length - 1];
    ln.textContent = latest ? `${latest.severity} — ${latest.name?.slice(0,40)}` : '—';
  }
}

export function updateSummary(layerCount, eventCount, alertLevel) {
  const lc = el?.querySelector('#sum-layer-count');
  const ec = el?.querySelector('#sum-event-count');
  const al = el?.querySelector('#sum-alert-level');
  if (lc) lc.textContent = layerCount;
  if (ec) ec.textContent = eventCount;
  if (al) al.textContent = alertLevel;
}

export function destroy() {
  window.removeEventListener('langchange', build);
  if (el) { el.remove(); el = null; }
}
