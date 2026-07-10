# 全球数据情报平台 (Geo Intelligence Dashboard) — 实施计划

> **目标:** 构建一个基于 Vanilla JS + Three.js 的全球数据情报可视化平台
> **架构:** ES Module 模块化架构，scene / layers / controls / ui / utils 五层分离，事件驱动 UI-3D 通信
> **技术栈:** Vanilla JS (ES Module) + Three.js + Vite + Vitest
> **计划执行方式:** 严格 TDD 循环 (RED → GREEN → REFACTOR)，每个 Task 独立提交

---

## 全局约束

- 语言：JavaScript (ES Module)，不使用 TypeScript
- 构建：Vite (`npm run dev` 启动)
- 测试：Vitest + jsdom
- 依赖限制：运行时仅 `three`；开发时 `vite` + `vitest`
- 文件命名：kebab-case 目录，PascalCase 文件名
- 提交格式：`feat(geo-intel): TN - task-name`
- TDD 铁律：先写失败测试 → 验证失败 → 最小实现 → 验证通过 → 重构

---

## 依赖关系图

```
T1 (脚手架)
 ├─ T2 (工具函数)
 ├─ T27 (Mock数据)
 │
 ├─ T3 (SceneManager) ← T2
 │   ├─ T4 (Earth) ← T3
 │   ├─ T5 (Starfield) ← T3
 │   └─ T16 (PostProcessing) ← T3, T17
 │
 ├─ T6 (CameraController) ← T3
 ├─ T7 (LayerManager) ← T3, T2
 │   ├─ T8  (FlightTrajectories) ← T7
 │   ├─ T9  (GPSJamming) ← T7
 │   ├─ T10 (SatelliteOrbits) ← T7
 │   ├─ T11 (MaritimeTraffic) ← T7
 │   ├─ T12 (NoFlyZones) ← T7
 │   ├─ T13 (InternetBlackouts) ← T7
 │   └─ T14 (IntelEvents) ← T7
 │
 ├─ T15 (RaycasterPicker) ← T3, T14
 │
 ├─ T17 (Shader文件) ← 无依赖
 │
 ├─ T18-T24 (UI组件) ← 无依赖（纯 DOM）
 │   ├─ T18 (TopBar)
 │   ├─ T19 (LeftPanel)
 │   ├─ T20 (RightPanel)
 │   ├─ T21 (BottomBar)
 │   ├─ T22 (AIPanel)
 │   ├─ T23 (EventCard)
 │   └─ T24 (CornerOverlays)
 │
 ├─ T25 (UIManager) ← T18-T24
 │
 └─ T26 (main.js) ← 所有模块
     └─ T28 (README)
```

---

## 文件结构

```
geo-intelligence-dashboard/
├── index.html
├── README.md                      # T28
├── package.json                   # T1
├── vite.config.js                 # T1
├── public/textures/               # (手动放置)
│   ├── earth-day.jpg
│   ├── earth-night.jpg
│   └── starfield.png
├── src/
│   ├── main.js                    # T26
│   ├── config.js                  # T1
│   ├── scene/
│   │   ├── SceneManager.js        # T3
│   │   ├── Earth.js               # T4
│   │   ├── Starfield.js           # T5
│   │   └── PostProcessing.js      # T16
│   ├── layers/
│   │   ├── LayerManager.js        # T7
│   │   ├── FlightTrajectories.js  # T8
│   │   ├── GPSJamming.js          # T9
│   │   ├── SatelliteOrbits.js     # T10
│   │   ├── MaritimeTraffic.js     # T11
│   │   ├── NoFlyZones.js          # T12
│   │   ├── InternetBlackouts.js   # T13
│   │   └── IntelEvents.js         # T14
│   ├── controls/
│   │   ├── CameraController.js    # T6
│   │   └── RaycasterPicker.js     # T15
│   ├── ui/
│   │   ├── UIManager.js           # T25
│   │   ├── TopBar.js              # T18
│   │   ├── LeftPanel.js           # T19
│   │   ├── RightPanel.js          # T20
│   │   ├── BottomBar.js           # T21
│   │   ├── AIPanel.js             # T22
│   │   ├── EventCard.js           # T23
│   │   └── CornerOverlays.js      # T24
│   ├── data/                      # T27
│   │   ├── flights.json
│   │   ├── gps-jamming.json
│   │   ├── satellites.json
│   │   ├── maritime.json
│   │   ├── no-fly-zones.json
│   │   ├── blackouts.json
│   │   ├── intel-events.json
│   │   └── ai-responses.json
│   └── utils/
│       ├── math.js                # T2
│       └── animation.js           # T2
├── shaders/                       # T17
│   ├── scanline.vert
│   ├── scanline.frag
│   ├── thermal.frag
│   ├── glow.frag
│   ├── sharpen.frag
│   └── atmosphere.frag
└── spec/
    └── geo-intelligence-dashboard/
        ├── brainstorm-geo-intelligence-dashboard.md
        ├── spec-geo-intelligence-dashboard.md
        ├── plan-geo-intelligence-dashboard.md
        └── task-geo-intelligence-dashboard.md
```

---

## 任务列表

---

### Task 1: 项目脚手架

**文件:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/config.js`
- Create: `src/main.js` (空壳)

**接口:**
- Produces: `config.EARTH_RADIUS`, `config.CAMERA_DEFAULTS`, `config.LAYERS`, `config.TIME_RANGE`, `config.COLORS`

**描述:** 搭建项目基础结构，Vite 配置，index.html 布局骨架（CSS Grid 5 区域），全局配置常量。

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T1 - project scaffold`

**测试文件:** `src/__tests__/config.test.js` — 验证 config 导出结构完整性

---

### Task 2: 工具函数

**文件:**
- Create: `src/utils/math.js`
- Create: `src/utils/animation.js`

**接口:**
- Consumes: (无)
- Produces:
  - `math.latLonToVec3(lat, lon, radius)` → `THREE.Vector3`
  - `math.greatCircleInterpolation(from, to, segments)` → `THREE.Vector3[]`
  - `math.clamp(value, min, max)` → `number`
  - `math.degToRad(deg)` / `math.radToDeg(rad)` → `number`
  - `animation.lerp(start, end, t)` → `number`
  - `animation.lerpVector3(start, end, t)` → `THREE.Vector3`
  - `animation.easeInOutCubic(t)` → `number`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T2 - utility functions`

**测试文件:** `src/__tests__/math.test.js`, `src/__tests__/animation.test.js`

---

### Task 3: SceneManager

**文件:**
- Create: `src/scene/SceneManager.js`

**接口:**
- Consumes: `config` (EARTH_RADIUS, CAMERA_DEFAULTS)
- Produces:
  - `SceneManager.init(container)` → `{ scene, camera, renderer }`
  - `SceneManager.getScene()` → `THREE.Scene`
  - `SceneManager.getCamera()` → `THREE.PerspectiveCamera`
  - `SceneManager.getRenderer()` → `THREE.WebGLRenderer`
  - `SceneManager.animate(callback)` → 注册 render loop
  - `SceneManager.dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T3 - scene manager`

**测试文件:** `src/__tests__/SceneManager.test.js`

---

### Task 4: Earth

**文件:**
- Create: `src/scene/Earth.js`

**接口:**
- Consumes: `SceneManager.getScene()`, `config.EARTH_RADIUS`
- Produces:
  - `Earth.create(scene)` → `THREE.Group` (地球球体 + 大气光晕)
  - `Earth.getGroup()` → `THREE.Group`
  - `Earth.getSurfacePoint(lat, lon)` → `THREE.Vector3`
  - `Earth.dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T4 - earth sphere`

**测试文件:** `src/__tests__/Earth.test.js`

---

### Task 5: Starfield

**文件:**
- Create: `src/scene/Starfield.js`

**接口:**
- Consumes: `SceneManager.getScene()`
- Produces:
  - `Starfield.create(scene)` → `THREE.Group`
  - `Starfield.dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T5 - starfield background`

**测试文件:** `src/__tests__/Starfield.test.js`

---

### Task 6: CameraController

**文件:**
- Create: `src/controls/CameraController.js`

**接口:**
- Consumes: `SceneManager.getCamera()`, `SceneManager.getRenderer()`, `config.CAMERA_DEFAULTS`, `animation`
- Produces:
  - `CameraController.init(camera, renderer)` → 绑定 OrbitControls + resize
  - `CameraController.switchToLowOrbit()`
  - `CameraController.switchToSpaceArc()`
  - `CameraController.flyTo(earthGroup, lat, lon, distance, onComplete)`
  - `CameraController.getViewMode()` → `'low-orbit' | 'space-arc'`
  - `CameraController.getCurrentTarget()` → `{ lat, lon }`
  - `CameraController.update()`
  - `CameraController.dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T6 - camera controller`

**测试文件:** `src/__tests__/CameraController.test.js`

---

### Task 7: LayerManager

**文件:**
- Create: `src/layers/LayerManager.js`

**接口:**
- Consumes: `config.LAYERS`
- Produces:
  - `LayerManager.init(scene, earthGroup)` → `{ layers }`
  - `LayerManager.registerLayer(id, layerModule)`
  - `LayerManager.toggleLayer(id, visible)`
  - `LayerManager.updateTimeRange(start, end)`
  - `LayerManager.getLayer(id)` → layer module
  - `LayerManager.getAllLayerStates()` → `[{ id, name, visible, error }]`
  - `LayerManager.dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T7 - layer manager`

**测试文件:** `src/__tests__/LayerManager.test.js`

---

### Task 8: 航班轨迹图层

**文件:**
- Create: `src/layers/FlightTrajectories.js`

**接口:**
- Consumes: `LayerManager.registerLayer`, `math`, `data/flights.json`
- Produces:
  - `create(scene, earthGroup, data)` → `THREE.Group`
  - `update(timeRange)` → 过滤可见航线
  - `setVisible(visible)`
  - `dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T8 - flight trajectories layer`

**测试文件:** `src/__tests__/FlightTrajectories.test.js`

---

### Task 9: GPS 干扰热力图层

**文件:**
- Create: `src/layers/GPSJamming.js`

**接口:**
- Consumes: `LayerManager.registerLayer`, `math`, `data/gps-jamming.json`
- Produces:
  - `create(scene, earthGroup, data)` → `THREE.Group`
  - `update(timeRange)`
  - `setVisible(visible)`
  - `dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T9 - GPS jamming layer`

**测试文件:** `src/__tests__/GPSJamming.test.js`

---

### Task 10: 卫星轨道图层

**文件:**
- Create: `src/layers/SatelliteOrbits.js`

**接口:**
- Consumes: `LayerManager.registerLayer`, `math`, `animation`, `data/satellites.json`
- Produces:
  - `create(scene, earthGroup, data)` → `THREE.Group`
  - `update(timeRange)`
  - `setVisible(visible)`
  - `dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T10 - satellite orbits layer`

**测试文件:** `src/__tests__/SatelliteOrbits.test.js`

---

### Task 11: 海上交通图层

**文件:**
- Create: `src/layers/MaritimeTraffic.js`

**接口:**
- Consumes: `LayerManager.registerLayer`, `math`, `data/maritime.json`
- Produces:
  - `create(scene, earthGroup, data)` → `THREE.Group`
  - `update(timeRange)`
  - `setVisible(visible)`
  - `dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T11 - maritime traffic layer`

**测试文件:** `src/__tests__/MaritimeTraffic.test.js`

---

### Task 12: 禁飞区图层

**文件:**
- Create: `src/layers/NoFlyZones.js`

**接口:**
- Consumes: `LayerManager.registerLayer`, `math`, `data/no-fly-zones.json`
- Produces:
  - `create(scene, earthGroup, data)` → `THREE.Group`
  - `update(timeRange)`
  - `setVisible(visible)`
  - `dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T12 - no-fly zones layer`

**测试文件:** `src/__tests__/NoFlyZones.test.js`

---

### Task 13: 互联网中断图层

**文件:**
- Create: `src/layers/InternetBlackouts.js`

**接口:**
- Consumes: `LayerManager.registerLayer`, `math`, `data/blackouts.json`
- Produces:
  - `create(scene, earthGroup, data)` → `THREE.Group`
  - `update(timeRange)`
  - `setVisible(visible)`
  - `dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T13 - internet blackouts layer`

**测试文件:** `src/__tests__/InternetBlackouts.test.js`

---

### Task 14: 情报事件图层

**文件:**
- Create: `src/layers/IntelEvents.js`

**接口:**
- Consumes: `LayerManager.registerLayer`, `math`, `data/intel-events.json`
- Produces:
  - `create(scene, earthGroup, data)` → `THREE.Group`
  - `getClickableObjects()` → `THREE.Object3D[]` (锥形标记)
  - `getEventById(id)` → event 对象
  - `update(timeRange)`
  - `setVisible(visible)`
  - `dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T14 - intel events layer`

**测试文件:** `src/__tests__/IntelEvents.test.js`

---

### Task 15: RaycasterPicker

**文件:**
- Create: `src/controls/RaycasterPicker.js`

**接口:**
- Consumes: `SceneManager.getCamera()`, `IntelEvents.getClickableObjects()`
- Produces:
  - `RaycasterPicker.init(camera, renderer)`
  - `RaycasterPicker.setClickableObjects(objects)`
  - `RaycasterPicker.onPicked(callback)` → 回调参数 `{ object, event, lat, lon }`
  - `RaycasterPicker.dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T15 - raycaster picker`

**测试文件:** `src/__tests__/RaycasterPicker.test.js`

---

### Task 16: PostProcessing

**文件:**
- Create: `src/scene/PostProcessing.js`

**接口:**
- Consumes: `SceneManager.getScene()`, `SceneManager.getCamera()`, `SceneManager.getRenderer()`, shader 文件
- Produces:
  - `PostProcessing.init(renderer, scene, camera)`
  - `PostProcessing.setMode(mode)` — `'normal' | 'night-vision'`
  - `PostProcessing.setGlow(intensity)` — 0.0 ~ 2.0
  - `PostProcessing.setSharpen(intensity)` — 0.0 ~ 1.0
  - `PostProcessing.setHue(degrees)` — -180 ~ 180
  - `PostProcessing.render(deltaTime)`
  - `PostProcessing.dispose()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T16 - post processing`

**测试文件:** `src/__tests__/PostProcessing.test.js`

---

### Task 17: Shader 文件

**文件:**
- Create: `shaders/scanline.vert`
- Create: `shaders/scanline.frag`
- Create: `shaders/thermal.frag`
- Create: `shaders/glow.frag`
- Create: `shaders/sharpen.frag`
- Create: `shaders/atmosphere.frag`

**接口:**
- Produces: GLSL 着色器源码字符串（通过 Vite `?raw` import）

**描述:** 创建所有 GLSL 着色器文件。顶点着色器为基础全屏 quad pass-through；片段着色器实现各效果。

- [ ] Step 1: 编写失败测试（验证 Shader 字符串可 import，含 main() 函数）
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T17 - shader files`

**测试文件:** `src/__tests__/Shaders.test.js`

---

### Task 18: TopBar

**文件:**
- Create: `src/ui/TopBar.js`

**接口:**
- Consumes: `config.COLORS`
- Produces:
  - `TopBar.init(container)` → DOM element
  - `TopBar.setPlaybackState(isPlaying)`
  - `TopBar.on(event, callback)` — events: `playback-click`
  - `TopBar.destroy()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T18 - top bar UI`

**测试文件:** `src/__tests__/TopBar.test.js`

---

### Task 19: LeftPanel

**文件:**
- Create: `src/ui/LeftPanel.js`

**接口:**
- Consumes: `config.COLORS`
- Produces:
  - `LeftPanel.init(container)` → DOM element
  - `LeftPanel.updateSummary(layerCount, eventCount, alertLevel)`
  - `LeftPanel.toggleSummary()`
  - `LeftPanel.destroy()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T19 - left panel UI`

**测试文件:** `src/__tests__/LeftPanel.test.js`

---

### Task 20: RightPanel

**文件:**
- Create: `src/ui/RightPanel.js`

**接口:**
- Consumes: `config.COLORS`
- Produces:
  - `RightPanel.init(container)` → DOM element
  - `RightPanel.updateTimestamp(timestamp)`
  - `RightPanel.updateTelemetry(gso, ntirs, alt, sunAngle)`
  - `RightPanel.setThreatLevel(level)`
  - `RightPanel.on(event, callback)` — events: `ai-analysis-click`, `threat-change`
  - `RightPanel.destroy()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T20 - right panel UI`

**测试文件:** `src/__tests__/RightPanel.test.js`

---

### Task 21: BottomBar

**文件:**
- Create: `src/ui/BottomBar.js`

**接口:**
- Consumes: `config.LAYERS`, `config.COLORS`
- Produces:
  - `BottomBar.init(container)` → DOM element
  - `BottomBar.setTimeRange(start, end)`
  - `BottomBar.setPlaybackSpeed(speed)` — `1/6 | 1/3 | 1 | 5 | 15 | 60`
  - `BottomBar.setLayerStates(states)` — `[{ id, visible }]`
  - `BottomBar.setViewMode(mode)` — `'low-orbit' | 'space-arc'`
  - `BottomBar.setNightVision(enabled)`
  - `BottomBar.setVisualParams({ glow, sharpen, hue })`
  - `BottomBar.on(event, callback)` — events: `time-change`, `speed-change`, `layer-toggle`, `view-toggle`, `night-vision-toggle`, `glow-change`, `sharpen-change`, `hue-change`, `alert-click`, `spiral-click`
  - `BottomBar.destroy()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T21 - bottom bar UI`

**测试文件:** `src/__tests__/BottomBar.test.js`

---

### Task 22: AIPanel

**文件:**
- Create: `src/ui/AIPanel.js`

**接口:**
- Consumes: `data/ai-responses.json`, `config.COLORS`
- Produces:
  - `AIPanel.init(container)` → DOM element
  - `AIPanel.show(eventType, eventName)` — 匹配 ai-responses 数据
  - `AIPanel.showOverview()` — 通用态势概览
  - `AIPanel.hide()`
  - `AIPanel.on(event, callback)` — events: `close`
  - `AIPanel.destroy()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T22 - AI panel UI`

**测试文件:** `src/__tests__/AIPanel.test.js`

---

### Task 23: EventCard

**文件:**
- Create: `src/ui/EventCard.js`

**接口:**
- Consumes: `config.COLORS`
- Produces:
  - `EventCard.init(container)` → DOM element
  - `EventCard.show(event)` — 参数：`{ type, name, timestamp, severity, lat, lon }`
  - `EventCard.hide()`
  - `EventCard.on(event, callback)` — events: `close`, `ai-analysis-click`
  - `EventCard.destroy()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T23 - event card UI`

**测试文件:** `src/__tests__/EventCard.test.js`

---

### Task 24: CornerOverlays

**文件:**
- Create: `src/ui/CornerOverlays.js`

**接口:**
- Consumes: `config.COLORS`
- Produces:
  - `CornerOverlays.init(container)` → DOM element
  - `CornerOverlays.updateCoordinates(lat, lon)`
  - `CornerOverlays.updateStatus(messages, statusCode)`
  - `CornerOverlays.updateStats(layerCount, alertCount, fps, latency)`
  - `CornerOverlays.destroy()`

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T24 - corner overlays UI`

**测试文件:** `src/__tests__/CornerOverlays.test.js`

---

### Task 25: UIManager

**文件:**
- Create: `src/ui/UIManager.js`

**接口:**
- Consumes: All UI component modules (TopBar, LeftPanel, RightPanel, BottomBar, AIPanel, EventCard, CornerOverlays)
- Produces:
  - `UIManager.init()` — 初始化所有 UI 组件，挂载到 DOM → 返回所有引用
  - `UIManager.getAllComponents()` → `{ topBar, leftPanel, rightPanel, bottomBar, aiPanel, eventCard, cornerOverlays }`
  - `UIManager.destroy()` — 清理所有 UI

- [ ] Step 1: 编写失败测试
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T25 - UI manager`

**测试文件:** `src/__tests__/UIManager.test.js`

---

### Task 26: main.js 入口整合

**文件:**
- Update: `src/main.js`

**接口:**
- Consumes: 所有模块
- Produces: 完整运行的应用

**描述:** 串联所有模块：
1. SceneManager.init()
2. Earth.create() + Starfield.create()
3. LayerManager.init() → 注册 7 个图层
4. CameraController.init()
5. PostProcessing.init()
6. UIManager.init()
7. RaycasterPicker.init()
8. 绑定事件：图层开关 ↔ LayerManager ↔ UI / 时间轴 ↔ LayerManager / 视觉模式 ↔ PostProcessing / 点击事件 ↔ EventCard + flyTo / AI按钮 ↔ AIPanel
9. 启动 render loop
10. 性能监控 FPS 计算

- [ ] Step 1: 编写失败测试（集成测试：验证 main.js 初始化不报错）
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写最小实现
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T26 - main entry integration`

**测试文件:** `src/__tests__/main.test.js`

---

### Task 27: Mock 数据文件

**文件:**
- Create: `src/data/flights.json`
- Create: `src/data/gps-jamming.json`
- Create: `src/data/satellites.json`
- Create: `src/data/maritime.json`
- Create: `src/data/no-fly-zones.json`
- Create: `src/data/blackouts.json`
- Create: `src/data/intel-events.json`
- Create: `src/data/ai-responses.json`

**描述:** 创建所有 Mock 数据 JSON 文件，遵循 spec 中定义的数据格式契约。

- [ ] Step 1: 编写失败测试（验证 JSON Schema 符合 spec 定义）
- [ ] Step 2: 验证测试失败
- [ ] Step 3: 编写数据文件
- [ ] Step 4: 验证测试通过
- [ ] Step 5: 提交 `feat(geo-intel): T27 - mock data files`

**测试文件:** `src/__tests__/data.test.js`

---

### Task 28: README

**文件:**
- Create: `README.md`

**描述:** 编写项目 README，包含：
- 项目简介（全球数据情报平台）
- 技术栈列表
- 目录结构图
- 运行方式 (`npm install && npm run dev`)
- 功能列表（对应 PRD 需求）
- 架构说明（五层架构图）
- 测试运行 (`npm test`)

- [ ] Step 1: 验证 README 文件存在（无需 TDD）
- [ ] Step 2: 编写 README 内容
- [ ] Step 3: 验证内容完整性
- [ ] Step 4: 提交 `feat(geo-intel): T28 - README`
