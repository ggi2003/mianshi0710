import * as TopBar from './TopBar.js';
import * as LeftPanel from './LeftPanel.js';
import * as RightPanel from './RightPanel.js';
import * as BottomBar from './BottomBar.js';
import * as AIPanel from './AIPanel.js';
import * as EventCard from './EventCard.js';
import * as CornerOverlays from './CornerOverlays.js';

let components = {};

export function init() {
  TopBar.init(document.getElementById('top-bar'));
  LeftPanel.init(document.getElementById('left-panel'));
  RightPanel.init(document.getElementById('right-panel'));
  BottomBar.init(document.getElementById('bottom-bar'));
  AIPanel.init(document.body);
  EventCard.init(document.body);
  CornerOverlays.init(document.body);

  // Layer toggle labels for bottom bar
  import('../config.js').then(config => {
    const states = config.LAYERS.map(l => ({ id: l.id, name: l.name, visible: l.enabled }));
    BottomBar.setLayerStates(states);
  });

  return {
    topBar: TopBar,
    leftPanel: LeftPanel,
    rightPanel: RightPanel,
    bottomBar: BottomBar,
    aiPanel: AIPanel,
    eventCard: EventCard,
    cornerOverlays: CornerOverlays,
  };
}

export function getAllComponents() {
  return {
    topBar: TopBar,
    leftPanel: LeftPanel,
    rightPanel: RightPanel,
    bottomBar: BottomBar,
    aiPanel: AIPanel,
    eventCard: EventCard,
    cornerOverlays: CornerOverlays,
  };
}

export function destroy() {
  TopBar.destroy();
  LeftPanel.destroy();
  RightPanel.destroy();
  BottomBar.destroy();
  AIPanel.destroy();
  EventCard.destroy();
  CornerOverlays.destroy();
}
