# 全球数据情报平台 (Geo Intelligence Dashboard) — 规格文档

**版本:** 1.0
**创建日期:** 2026-07-10
**来源:** brainstorm-geo-intelligence-dashboard.md

---

## 概述

一个全球数据情报可视化平台，核心为基于 Three.js 手写构建的 3D 交互地球，叠加 7 种情报数据图层，支持视觉模式切换、Shader 参数调节、时间轴历史回放及 AI Mock 辅助分析。整体采用深色军工风全息雷达监控终端 UI（参考 WORLDVIEW 布局规范）。

---

## 功能需求

### FR-1: 3D 地球渲染与交互

**描述:** 在页面中央渲染一个带纹理贴图的可交互 3D 地球，支持鼠标拖拽旋转和滚轮缩放。

**验收条件:**
- 地球使用 `SphereGeometry(radius, 128, 64)` + 2048×1024 卫星纹理贴图
- 鼠标拖拽可水平旋转（Y轴）和垂直倾斜（X轴），极轴角限制 ±85°
- 滚轮缩放范围限制在 1.5×R ~ 8×R（R = 地球半径）
- 包含大气光晕层（菲涅尔边缘发光 Shader）
- 包含星空背景（包裹球体 + 粒子系统）
- WebGL 不可用时显示替代文本不阻塞页面

**优先级:** P0 — 核心

---

### FR-2: 双视角切换

**描述:** 支持近地鸟瞰和太空弧面两种相机视角，通过按钮切换并带有平滑过渡动画。

**验收条件:**
- 近地鸟瞰：距离 ≈ 2R，俯角 ≈ 45°，FOV = 45°
- 太空弧面：距离 ≈ 5R，俯角 ≈ 20°，FOV = 30°
- 切换时 1.5s 线性插值（lerp）平滑过渡
- 切换按钮位于底部控制栏，键盘快捷键也可触发

**优先级:** P0 — 核心

---

### FR-3: 数据图层系统

**描述:** 地球上叠加 7 个独立数据图层，每层支持独立开关。

**验收条件:**

| 图层 ID | 名称 | 视觉形态 | 数据来源 | 开关控制 |
|---------|------|---------|---------|---------|
| flights | 航班轨迹 | 浅蓝色弧线 + 小飞机图标 | `data/flights.json` | 底部复选框 |
| gps-jamming | GPS干扰热力 | 红/橙渐变半透明圆斑 | `data/gps-jamming.json` | 底部复选框 |
| satellites | 卫星轨道 | 白色虚线椭圆环 + 运动光点 | `data/satellites.json` | 底部复选框 |
| maritime | 海上交通 | 蓝色粗弧线 + 慢速移动标记 | `data/maritime.json` | 底部复选框 |
| no-fly-zones | 禁飞区 | 红色半透明多边形曲面 | `data/no-fly-zones.json` | 底部复选框 |
| blackouts | 互联网中断 | 红色脉冲波纹标注 | `data/blackouts.json` | 底部复选框 |
| intel-events | 情报事件 | 黄/红色锥形标记（可点击） | `data/intel-events.json` | 底部复选框 |

- 每个图层为独立 `THREE.Group`，通过 `visible` 属性控制
- 所有图层在地球坐标系下渲染（经纬度 → 3D 坐标转换）
- JSON 数据加载失败时该图层静默隐藏

**优先级:** P0 — 核心

---

### FR-4: 航班轨迹图层

**描述:** 在地球上渲染航班飞行路线，使用大圆航线插值绘制弧线。

**验收条件:**
- 每条航线用 `CatmullRomCurve3` 绘制从起点到终点的贝塞尔弧线
- 航线颜色为浅蓝色 `#4FC3F7`
- 每段航线上显示 1 个小飞机标记（`ConeGeometry` 指示方向）
- 数据从 `data/flights.json` 加载，含 `from`(lat,lon)、`to`(lat,lon)、`flightId`、`airline`、`timestamp`

**优先级:** P0 — 核心

---

### FR-5: GPS 干扰热力图层

**描述:** 在地球表面标注 GPS 信号干扰区域，使用热力渐变视觉。

**验收条件:**
- 每个干扰点为半透明 `CircleGeometry`，颜色从红（高强度）到橙（低强度）
- 使用自定义 ShaderMaterial 实现径向渐变（中心红 → 边缘透明）
- 干扰强度通过 `opacity` 和圆片半径体现
- 数据从 `data/gps-jamming.json` 加载，含 `lat`、`lon`、`intensity`(0-1)、`radius`、`timestamp`

**优先级:** P1

---

### FR-6: 卫星轨道图层

**描述:** 在地球上绘制卫星运行轨道环和运动卫星标记。

**验收条件:**
- 每颗卫星用 `Line` 或 `RingGeometry` 绘制其轨道倾角环（白色，虚线或半透明）
- 轨道环上有一个运动光点代表卫星当前位置
- 光点沿轨道运动动画（requestAnimationFrame 驱动）
- 数据从 `data/satellites.json` 加载，含 `name`、`inclination`、`altitude`、`phase`、`period`

**优先级:** P1

---

### FR-7: 海上交通图层

**描述:** 在地球上渲染海上船舶航线。

**验收条件:**
- 类似航班轨迹，绘制贝塞尔弧线 + 船舶标记
- 线条较粗（lineWidth 等效）、蓝色 `#1565C0`
- 船舶标记移动速度慢于航班
- 数据从 `data/maritime.json` 加载，含 `from`、`to`、`vesselId`、`vesselName`、`timestamp`

**优先级:** P1

---

### FR-8: 禁飞区图层

**描述:** 在地球表面绘制红色半透明禁飞/隔离区域。

**验收条件:**
- 每个禁飞区为贴在地球曲面上的半透明多边形
- 颜色为红色 `#FF1744`，透明度 0.3，边界线为红色实线
- 通过 `ShapeGeometry` 顶点投影到球面构建
- 数据从 `data/no-fly-zones.json` 加载，含 `name`、`vertices`(lat/lon 数组)、`startTime`、`endTime`

**优先级:** P1

---

### FR-9: 互联网中断图层

**描述:** 在地球表面标注互联网中断位置，带脉冲波纹动画。

**验收条件:**
- 每个中断点为红色锥形标记
- 带有向外扩散的波纹动画（半透明环随时间放大 + 淡出）
- 波纹循环播放，周期约 2 秒
- 数据从 `data/blackouts.json` 加载，含 `lat`、`lon`、`region`、`severity`、`startTime`、`endTime`

**优先级:** P2

---

### FR-10: 情报事件图层

**描述:** 在地球上放置可点击的情报事件标记点。

**验收条件:**
- 标记点为黄色锥形（`ConeGeometry`）+ 发光 `Sprite` 图标
- 鼠标悬停时标记放大 1.2x 并高亮
- 点击标记触发 `RaycasterPicker` → 弹出事件信息卡片 + 相机 flyTo
- 按 ESC 或点击空白处关闭卡片
- 数据从 `data/intel-events.json` 加载，含 `id`、`type`、`name`、`lat`、`lon`、`timestamp`、`severity`

**优先级:** P0 — 核心

---

### FR-11: 视觉模式切换

**描述:** 正常彩色模式与灰度热成像（夜视）模式之间切换。

**验收条件:**
- 默认正常彩色模式
- 切换为夜视模式时，场景经 `thermal.frag` Shader 处理后输出灰度→热成像色彩映射
- 切换按钮位于底部控制栏，标签 `NIGHT VISION`
- 切换即时生效（无渐变动画），但可通过配置开关过渡

**优先级:** P0 — 核心

---

### FR-12: 视觉参数调节

**描述:** 提供滑块控件实时调节光晕、锐化、色调 Shader 参数。

**验收条件:**
- 光晕强度滑块：范围 0.0 ~ 2.0，默认 1.0，步长 0.05
- 锐化滑块：范围 0.0 ~ 1.0，默认 0.3，步长 0.05
- 色调滑块：范围 -180° ~ 180°，默认 0°，步长 1°
- 滑块拖拽时 Shader uniform 实时更新，延迟 < 16ms（一帧内）
- 滑块位于底部控制栏右侧

**优先级:** P1

---

### FR-13: 扫描线 CRT 效果

**描述:** 整体画面叠加 CRT 扫描线质感，营造复古监控终端视觉。

**验收条件:**
- 扫描线通过 `scanline.frag` Shader + CSS `repeating-linear-gradient` overlay 双重实现
- 扫描线密度可调（Shader 参数）
- 微噪点颗粒感通过 Shader 噪声函数添加

**优先级:** P1

---

### FR-14: 顶部标题栏

**描述:** 页面顶部显示系统名称、回放状态和密级信息。

**验收条件:**
- 左侧大字标题 `WORLDVIEW`，右侧小字显示 `PLAYBACK` 回放状态标签
- 密级标注 `TOP SECRET // SI-TK // NOFORN`
- 编号显示 `KB11-6040 OPS-4138`
- 系统状态指示灯 + `NORMAL` 文本，下方 `NORMAL GLOBAL`
- 样式：发光青蓝色文字 `#00F0FF`，暗色背景

**优先级:** P1

---

### FR-15: 左上信息面板

**描述:** 左上角显示密级、编号、系统状态和可折叠的数据摘要。

**验收条件:**
- 密级 + 编号行
- 系统状态标签：绿色指示灯 + `NORMAL` + 子标题
- 可折叠数据摘要区（默认展开）：活跃图层数、当前事件数、告警等级
- 点击折叠按钮收起/展开摘要区

**优先级:** P1

---

### FR-16: 右上参数面板

**描述:** 右上角显示录制时间、设备遥测参数和 AI 分析入口。

**验收条件:**
- REC 录制时间戳（UTC 格式：`YYYY-MM-DD HH:MM:SSZ`），每秒或每 10 秒更新
- FORCE 模块：蓝色指示灯 + 数字参数
- SURVEILLANCE 模块：蓝色指示灯 + 覆盖百分比
- THREAT 模块：下拉框可选 `Tactical` / `Strategic` / `Operational`
- 底部遥测行：`GSO: 575.68M NTIRS: 0.0` 和 `ALT: 1935159N SUN: -24.3° EL`
- `AI ANALYSIS` 按钮：荧光青蓝色边框，hover 发光增强

**优先级:** P1

---

### FR-17: 底部控制栏

**描述:** 底部全宽控制栏，包含时间轴、倍速控制、图层开关、视觉模式、参数滑块。

**验收条件:**

**时间轴模块：**
- 可拖拽范围滑块（双端或单 thumb），覆盖最近 7 天（小时粒度）
- 倍速按钮：1/6x、1/3x、1x、5x、15x、1hx
- PLAY/PAUSE 按钮、OFF 停止按钮
- 当前时间标签显示

**图层开关模块：**
- 每个图层一个复选框（带颜色图例圆点）
- 图层名与 FR-3 一致
- 勾选/取消即时反映到 3D 场景

**视角参数模块：**
- AZIM 方位角滑块（0°~360°）
- ELEV 俯仰角滑块（0°~90°）

**功能按钮模块：**
- ALERT（告警）按钮
- SPIRAL OUT（螺旋扫描）按钮
- 监视距离阈值显示（250km）
- FOV 切换（45° / 60°）

**视觉切换模块：**
- NIGHT VISION 模式切换按钮
- 视角切换按钮（NEAR ORBIT / SPACE ARC）
- 光晕/锐化/色调参数滑块

**优先级:** P0 — 核心

---

### FR-18: 四角固定标注

**描述:** 左下角显示坐标和状态码，右下角显示图层统计和性能数据。

**验收条件:**

**左下角：**
- 实时经纬度坐标（相机指向的地球表面位置）：`22°14'46.55"N 058°51'11.71"E`
- 状态码行：`MSGS: 39Q VE 9544 5824`

**右下角：**
- 活跃图层计数：`LAYERS: N ACTIVE`
- 待处理告警：`ALERTS: N PENDING`
- 性能指示：`FPS: NN | LAT: Nms`

**优先级:** P1

---

### FR-19: 事件信息卡片

**描述:** 点击情报事件标注后弹出浮动信息卡片。

**验收条件:**
- 卡片显示：事件类型、时间、名称、位置坐标
- 卡片包含 `[查看AI分析]` 按钮
- 右上角关闭按钮 `×`
- 按 ESC 或点击地图空白处关闭
- 卡片从标注点附近弹出，定位在屏幕空间（HTML overlay）

**优先级:** P0 — 核心

---

### FR-20: AI 分析面板

**描述:** 右侧滑入的 Mock AI 情报分析面板。

**验收条件:**
- 面板从右侧滑入，宽度 380px，带 300ms 过渡动画
- 显示：事件类型、时间、威胁评估等级（LOW/MEDIUM/HIGH/CRITICAL）
- 分析摘要：2-4 句 Mock 分析文案
- 趋势预测：1-2 句趋势描述
- 建议行动：2-3 条编号建议
- 关闭按钮 + ESC 关闭
- 内容根据事件类型从 `data/ai-responses.json` 匹配预置文案
- 也可通过右上角 `AI ANALYSIS` 按钮打开（展示通用态势概览）

**优先级:** P1

---

### FR-21: 时间轴历史回放

**描述:** 底部时间轴支持拖拽回放，图层数据随时间变化。

**验收条件:**
- 时间跨度：最近 7 天（168 小时）
- 拖拽滑块改变当前时间 → LayerManager 过滤各图层数据时间窗口
- 过滤逻辑：`data.timestamp` 在 `[currentTime - window, currentTime]` 范围内可见
- 倍速播放：1/6x、1/3x、1x、5x、15x、1hx 自动推进时间
- PAUSE 暂停推进，OFF 停止并重置到当前时间

**优先级:** P0 — 核心

---

### FR-22: 项目入口与 README

**描述:** `index.html` 作为项目入口，`README.md` 说明架构与运行方式。

**验收条件:**
- `index.html` 包含完整 HTML 布局骨架 + Three.js canvas 容器 + UI overlay 结构
- `npm run dev` 通过 Vite 启动开发服务器
- README 包含：项目简介、技术栈、目录结构图、运行方式、功能列表

**优先级:** P2

---

## 非功能需求

### NFR-1: 性能

- 目标帧率 ≥45 FPS（Chrome/Edge，中等硬件 i5+8GB RAM，全图层开启）
- 性能不足（FPS < 30）时自动降级：减粒子数 → 减曲线分段 → 关闭部分 ShaderPass
- Three.js 渲染器使用 `requestAnimationFrame` 循环
- 纹理总大小 < 10MB

### NFR-2: 浏览器兼容

- 支持 Chrome 90+、Firefox 90+、Edge 90+
- 需 WebGL 2.0 支持，不支持时显示降级文本

### NFR-3: 可维护性

- ES Module 组织代码，每个文件单一职责
- 全局配置集中在 `src/config.js`
- 图层遵循统一接口：`create(scene, data)` / `update(timeRange)` / `setVisible(bool)` / `dispose()`
- 无第三方 UI 框架依赖

### NFR-4: 零外部依赖

- 运行时仅依赖 `three` npm 包
- 开发依赖：`vite`、`vitest`
- 无 CDN 外链、无在线字体/图标库

---

## 接口定义

### 图层接口

每个图层模块实现以下统一接口：

```js
// 每个图层模块导出
export function create(scene, earthGroup, data)  // 创建图层 THREE.Group 并挂载到 earthGroup
export function update(timeRange)                 // 根据 { start, end } 时间范围更新可见数据
export function setVisible(visible)              // 设置 group.visible
export function dispose()                        // 释放 GPU 资源
```

### LayerManager 接口

```js
// src/layers/LayerManager.js
export function init(scene, earthGroup)           // 初始化，加载所有图层
export function registerLayer(id, layerModule)    // 注册图层模块
export function toggleLayer(id, visible)          // 开关图层
export function updateTimeRange(start, end)       // 更新时间窗口
export function getLayer(id)                      // 获取图层实例
export function getAllLayers()                    // 获取所有图层状态
```

### CameraController 接口

```js
// src/controls/CameraController.js
export function init(camera, renderer)            // 绑定 OrbitControls + resize
export function switchToLowOrbit()                // 切换到近地鸟瞰
export function switchToSpaceArc()                // 切换到太空弧面
export function flyTo(lat, lon, distance, onComplete) // 飞到指定坐标
export function getViewMode()                     // 返回当前视角模式
export function update()                          // 每帧更新
```

### RaycasterPicker 接口

```js
// src/controls/RaycasterPicker.js
export function init(camera, renderer, earthGroup) // 绑定 click 事件
export function setClickableObjects(objects)       // 设置可点击对象列表
export function onPicked(callback)                 // 注册拾取回调 (event) => void
```

### PostProcessing 接口

```js
// src/scene/PostProcessing.js
export function init(renderer, scene, camera)      // 创建 EffectComposer + ShaderPass 管线
export function setMode(mode)                      // 'normal' | 'night-vision'
export function setGlow(intensity)                 // 设置光晕 0.0-2.0
export function setSharpen(intensity)              // 设置锐化 0.0-1.0
export function setHue(degrees)                    // 设置色调 -180~180
export function render(deltaTime)                  // 执行后处理渲染
export function dispose()                          // 释放资源
```

### UI 组件接口

所有 UI 组件遵循如下模式：

```js
// src/ui/<Component>.js
export function init(container)                    // 创建 DOM 元素并挂载
export function update(data)                       // 更新显示数据
export function show() / hide()                    // 显隐控制
export function on(event, callback)                // 事件监听
export function destroy()                          // 清理 DOM + 事件
```

### 数据格式契约

#### flights.json
```json
[
  {
    "flightId": "UAE817",
    "airline": "Emirates",
    "from": { "lat": 25.25, "lon": 55.36 },
    "to": { "lat": 51.47, "lon": -0.45 },
    "timestamp": "2026-07-09T14:30:00Z"
  }
]
```

#### gps-jamming.json
```json
[
  {
    "id": "jam-001",
    "lat": 26.5,
    "lon": 52.1,
    "intensity": 0.85,
    "radius": 80,
    "timestamp": "2026-07-09T15:00:00Z"
  }
]
```

#### satellites.json
```json
[
  {
    "name": "USA-245",
    "inclination": 63.4,
    "altitude": 400,
    "phase": 0.35,
    "period": 92.6,
    "timestamp": "2026-07-09T00:00:00Z"
  }
]
```

#### maritime.json
```json
[
  {
    "vesselId": "SHIP-042",
    "vesselName": "Atlantic Voyager",
    "from": { "lat": 24.1, "lon": 57.2 },
    "to": { "lat": 12.9, "lon": 45.0 },
    "timestamp": "2026-07-09T10:00:00Z"
  }
]
```

#### no-fly-zones.json
```json
[
  {
    "name": "PERSIAN-GULF-RESTRICTED",
    "vertices": [
      { "lat": 27.0, "lon": 49.5 },
      { "lat": 27.5, "lon": 51.0 },
      { "lat": 26.0, "lon": 52.0 },
      { "lat": 25.5, "lon": 50.0 }
    ],
    "startTime": "2026-07-08T00:00:00Z",
    "endTime": "2026-07-12T00:00:00Z"
  }
]
```

#### blackouts.json
```json
[
  {
    "id": "blk-001",
    "lat": 30.3,
    "lon": 48.5,
    "region": "Basra",
    "severity": "complete",
    "startTime": "2026-07-09T06:00:00Z",
    "endTime": "2026-07-10T06:00:00Z"
  }
]
```

#### intel-events.json
```json
[
  {
    "id": "evt-001",
    "type": "airspace_closure",
    "name": "波斯湾禁飞区激活",
    "lat": 26.2,
    "lon": 50.5,
    "timestamp": "2026-07-09T12:00:00Z",
    "severity": "HIGH"
  }
]
```

#### ai-responses.json
```json
[
  {
    "eventType": "airspace_closure",
    "threatLevel": "HIGH",
    "summary": "该区域空域封锁由军事演习触发，预计持续72小时...",
    "trend": "基于历史模式，封锁将在48小时后逐步解除...",
    "actions": [
      "调整民航航线避开受影响空域",
      "启动备用导航信标",
      "通报盟友空中力量"
    ]
  }
]
```

---

## 数据模型

### 实体关系

```
SceneManager (1) ──── (1) Earth
SceneManager (1) ──── (1) Starfield
SceneManager (1) ──── (1) PostProcessing
SceneManager (1) ──── (1) LayerManager
LayerManager  (1) ──── (7) Layer (FlightTrajectories, GPSJamming, ...)
SceneManager (1) ──── (1) CameraController
SceneManager (1) ──── (1) RaycasterPicker
UIManager     (1) ──── (7) UI Components
```

### 核心实体

| 实体 | 属性 | 约束 |
|------|------|------|
| Earth | radius, segments(128/64), texture(2048×1024), atmosphereRadius | radius > 0 |
| CameraState | distance, azimuthAngle, polarAngle, fov, target(lat,lon) | distance ∈ [1.5R, 8R]; polarAngle ∈ [5°, 85°] |
| LayerConfig | id, name, color, dataFile, enabled(default) | id 唯一，小写连字符 |
| TimeRange | start(timestamp), end(timestamp) | start <= end; 跨度 ≤ 7天 |
| IntelEvent | id, type, name, lat, lon, timestamp, severity | severity ∈ {LOW, MEDIUM, HIGH, CRITICAL} |
| VisualParams | glow(0-2), sharpen(0-1), hue(-180~180), mode(normal/thermal) | - |
| TelemetryData | gso, ntirs, alt, sunAngle | 静态 Mock 值 |

---

## 错误处理

| 异常场景 | 处理策略 | 用户可见影响 |
|---------|---------|------------|
| 纹理图片加载失败 | `TextureLoader` onError → 回退 `MeshBasicMaterial({ color: #1a3a5c })`；`console.warn` | 地球显示为纯色蓝灰球体 |
| WebGL 上下文不可用 | 检测 `renderer` 创建失败 → 显示 `<div>` 提示文字 "WebGL 2.0 is not supported..." | 无法使用 3D 视图 |
| JSON 数据解析失败 | 每个 `import` / `fetch` 包裹 try-catch → 图层静默跳过，设置内部 `error` 标志 | 该图层无渲染，其他图层正常 |
| GLSL Shader 编译错误 | `ShaderMaterial` 创建时检查 `compileStatus` → 该 Pass 降级跳过 | 该 Shader 效果缺失，其余正常 |
| 性能不足 (FPS < 30) | 连续 3 秒检测后触发降级：粒子数减半 → 曲线分段减半 → 关闭 sharpen/glow Pass | 视觉质量下降但帧率恢复 |
| 空数据集 | 图层 `create()` 时数据数组为空 → 创建空 Group 并标记，不崩溃 | 该图层无渲染内容 |
| 坐标超出范围 | `lat` ∈ [-90, 90]、`lon` ∈ [-180, 180] 校验，越界值 clamp 并 `console.warn` | 数据点被钳制到有效范围 |

---

## 约束与假设

### 约束

1. 所有数据为本地静态文件，无网络请求（除项目启动时的本地文件加载）
2. 构建工具为 Vite，`npm run dev` 启动
3. 依赖仅 `three`（运行时）+ `vite`、`vitest`（开发时）
4. 不使用任何前端框架（React/Vue/Angular）
5. 不使用 CDN 外部资源
6. 不使用 TypeScript（纯 JavaScript ES Module）

### 假设

1. 地球纹理图片 `earth-day.jpg` 和 `earth-night.jpg` 由开发者自行获取（公共领域卫星纹理）
2. 用户使用现代浏览器（Chrome/Firefox/Edge 最新 2 个大版本）
3. 屏幕分辨率 ≥ 1280×720
4. 系统时间轴默认展示最近 7 天数据，当前时间为 `Date.now()`
5. `data/ai-responses.json` 中的 Mock 文案覆盖 `intel-events.json` 中所有 `eventType` 类型
6. 面试演示时按全图层开启、正常模式运行
