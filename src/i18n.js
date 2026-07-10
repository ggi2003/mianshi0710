const STORAGE_KEY = 'worldview-lang';

const translations = {
  zh: {
    // 图层名称
    'layer.flights': '商业航班',
    'layer.gps-jamming': 'GPS干扰',
    'layer.satellites': '卫星轨道',
    'layer.maritime': '海上交通',
    'layer.no-fly-zones': '禁飞区',
    'layer.blackouts': '网络中断',
    'layer.intel-events': '情报事件',

    // BottomBar
    'speed.1/6x': '1/6x',
    'speed.1/3x': '1/3x',
    'speed.1x': '1x',
    'speed.5x': '5x',
    'speed.15x': '15x',
    'speed.1h/x': '1h/x',
    'speed.10h/x': '10h/x',
    'speed.50h/x': '50h/x',
    'speed.200h/x': '200h/x',
    'btn.pause': '暂停',
    'btn.off': '关闭',
    'label.now': '现在',
    'label.glow': '辉光',
    'label.sharp': '锐化',
    'label.hue': '色相',
    'btn.alert': '警报',
    'btn.spiral': '螺旋',
    'btn.night-vision': '夜视模式',
    'btn.normal-color': '正常色彩',
    'btn.space-arc': '太空弧线',
    'btn.low-orbit': '低轨道',

    // TopBar
    'btn.playback': '回放',
    'btn.playing': '播放中',
    'label.lang': 'EN',

    // LeftPanel
    'label.data-summary': '▶ 数据摘要',
    'label.active': '活跃:',
    'label.events': '事件:',
    'label.alert': '警报:',

    // RightPanel
    'label.force': '兵力',
    'label.surveillance': '监视',
    'label.threat': '威胁',
    'label.gso': 'GSO:',
    'label.ntirs': 'NTIRS:',
    'label.alt': ' ALT:',
    'label.sun': 'SUN:',
    'btn.ai-analysis': 'AI 分析',

    // RightPanel severity counts & events header (hardcoded text)
    'rp.active-events': '活跃事件',
    'rp.crit': '危急',
    'rp.high': '高危',
    'rp.med': '中警',
    'rp.no-events': '— 当前窗口无事件 —',
    'rp.rec': '记录',

    // EventCard
    'card.title': '情报事件',
    'field.type': '类型:',
    'field.name': '名称:',
    'field.time': '时间:',
    'field.location': '位置:',
    'field.severity': '严重程度:',
    'btn.view-ai': '查看 AI 分析',
    'value.unknown': '未知',
    'value.unnamed': '未命名',
    'value.na': '无',

    // AIPanel
    'ai.title': 'AI 情报分析',
    'ai.loading': '加载分析中...',
    'ai.event': '事件',
    'ai.threat-level': '威胁等级',
    'ai.analysis-summary': '分析摘要',
    'ai.trend-forecast': '趋势预测',
    'ai.recommended-actions': '建议行动',
    'ai.global-overview': '全球态势概览',

    // CornerOverlays
    'corner.layers': '图层',
    'corner.active': '活跃',
    'corner.alerts': '警报',
    'corner.pending': '待处理',
    'corner.fps': 'FPS',
    'corner.lat': '延迟',
  },

  en: {
    // Layer names
    'layer.flights': 'Commercial Flights',
    'layer.gps-jamming': 'GPS Jamming',
    'layer.satellites': 'Satellite Orbits',
    'layer.maritime': 'Maritime Traffic',
    'layer.no-fly-zones': 'No-Fly Zones',
    'layer.blackouts': 'Internet Blackouts',
    'layer.intel-events': 'Intel Events',

    // BottomBar
    'speed.1/6x': '1/6x',
    'speed.1/3x': '1/3x',
    'speed.1x': '1x',
    'speed.5x': '5x',
    'speed.15x': '15x',
    'speed.1h/x': '1h/x',
    'speed.10h/x': '10h/x',
    'speed.50h/x': '50h/x',
    'speed.200h/x': '200h/x',
    'btn.pause': 'PAUSE',
    'btn.off': 'OFF',
    'label.now': 'NOW',
    'label.glow': 'GLOW',
    'label.sharp': 'SHARP',
    'label.hue': 'HUE',
    'btn.alert': 'ALERT',
    'btn.spiral': 'SPIRAL',
    'btn.night-vision': 'NIGHT VISION',
    'btn.normal-color': 'NORMAL COLOR',
    'btn.space-arc': 'SPACE ARC',
    'btn.low-orbit': 'LOW ORBIT',

    // TopBar
    'btn.playback': 'PLAYBACK',
    'btn.playing': 'PLAYING',
    'label.lang': '中文',

    // LeftPanel
    'label.data-summary': '▶ DATA SUMMARY',
    'label.active': 'ACTIVE:',
    'label.events': 'EVENTS:',
    'label.alert': 'ALERT:',

    // RightPanel
    'label.force': 'FORCE',
    'label.surveillance': 'SURVEILLANCE',
    'label.threat': 'THREAT',
    'label.gso': 'GSO:',
    'label.ntirs': 'NTIRS:',
    'label.alt': 'ALT:',
    'label.sun': 'SUN:',
    'btn.ai-analysis': 'AI ANALYSIS',

    // RightPanel severity counts & events header
    'rp.active-events': 'ACTIVE EVENTS',
    'rp.crit': 'CRIT',
    'rp.high': 'HIGH',
    'rp.med': 'MED',
    'rp.no-events': '— NO EVENTS IN WINDOW —',
    'rp.rec': 'REC',

    // EventCard
    'card.title': 'INTEL EVENT',
    'field.type': 'TYPE:',
    'field.name': 'NAME:',
    'field.time': 'TIME:',
    'field.location': 'LOCATION:',
    'field.severity': 'SEVERITY:',
    'btn.view-ai': 'VIEW AI ANALYSIS',
    'value.unknown': 'Unknown',
    'value.unnamed': 'Unnamed',
    'value.na': 'N/A',

    // AIPanel
    'ai.title': 'AI INTEL ANALYSIS',
    'ai.loading': 'Loading analysis...',
    'ai.event': 'EVENT',
    'ai.threat-level': 'THREAT LEVEL',
    'ai.analysis-summary': 'ANALYSIS SUMMARY',
    'ai.trend-forecast': 'TREND FORECAST',
    'ai.recommended-actions': 'RECOMMENDED ACTIONS',
    'ai.global-overview': 'GLOBAL SITUATION OVERVIEW',

    // CornerOverlays
    'corner.layers': 'LAYERS',
    'corner.active': 'ACTIVE',
    'corner.alerts': 'ALERTS',
    'corner.pending': 'PENDING',
    'corner.fps': 'FPS',
    'corner.lat': 'LAT',
  },
};

let currentLang = localStorage.getItem(STORAGE_KEY) || 'zh';

export function t(key) {
  const dict = translations[currentLang];
  return dict?.[key] ?? key;
}

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (lang === currentLang || !translations[lang]) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

// Layer name lookup helper
export function layerName(layerId) {
  return t(`layer.${layerId}`);
}
