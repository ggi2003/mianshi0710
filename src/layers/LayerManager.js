let scene, earthGroup, layers, currentTimeRange;
layers = {};
currentTimeRange = { start: Date.now() - 7 * 86400000, end: Date.now() };

export function init(sc, eg) {
  scene = sc;
  earthGroup = eg;
  return { layers };
}

export function registerLayer(id, layerModule, group) {
  layers[id] = { module: layerModule, group, visible: true, error: false };
  if (group) {
    earthGroup.add(group);
  }
}

export function toggleLayer(id, visible) {
  if (layers[id]) {
    layers[id].visible = visible;
    if (layers[id].module.setVisible) {
      layers[id].module.setVisible(visible);
    }
  }
}

export function updateTimeRange(start, end) {
  const range = { start, end };
  Object.values(layers).forEach(layer => {
    if (layer.module.update && layer.visible) {
      layer.module.update(range);
    }
  });
}

export function getLayer(id) {
  return layers[id]?.module || null;
}

export function getAllLayerStates() {
  return Object.entries(layers).map(([id, l]) => ({
    id,
    name: id,
    visible: l.visible,
    error: l.error,
  }));
}

export function dispose() {
  Object.values(layers).forEach(l => { if (l.module.dispose) l.module.dispose(); });
  layers = {};
}
