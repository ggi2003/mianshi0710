# 全球数据情报平台 (Geo Intelligence Dashboard) — 脑暴文档

**版本:** 1.0  
**创建日期:** 2026-07-10  
**来源:** docs/prd.txt + docs/buju.txt  
**状态:** 待审核

---

## 1. 需求概述与目标

### 1.1 项目定义

开发一个**全球数据情报平台**（Global Data Intelligence Platform），核心为一个可交互的 3D 地球仪表盘，叠加多种情报数据图层，支持视觉模式切换、时间轴回放和 AI 辅助分析。整体采用深色军工风全息雷达监视系统 UI，用于技术面试场景展示前端工程能力。

### 1.2 核心目标

- 在 Three.js 中手写构建可旋转、可缩放的 3D 地球，支持近地鸟瞰和太空弧面两种视角
- 叠加 7 个独立数据图层（航班、GPS 干扰、卫星轨道、海上交通、禁飞区、互联网中断、情报事件）
- 实现正常彩色/灰度热成像（夜视）视觉模式切换，光晕/锐化/色调 Shader 参数实时调节
- 底部时间轴支持拖拽与历史事件回放
- 事件标注点可点击弹出信息卡片，AI 分析面板展示 Mock 分析结果
- 整体暗色终端风格：纯黑背景、扫描线质感、发光文字

### 1.3 约束条件

| 约束 | 说明 |
|------|------|
| 数据 | 所有数据使用本地静态 JSON Mock 数据，无外部 API 依赖 |
| 零构建运行 | `npm run dev` (Vite) 即可启动 |
| 浏览器兼容 | Chrome/Firefox/Edge 最新版，需 WebGL 2.0 |
| 包体积 | three 为主依赖，总计 < 2MB gzipped |
| 帧率目标 | ≥45 FPS（中等硬件，所有图层开启）|
| 无框架 | Vanilla HTML/JS，不依赖 React/Vue 等框架 |

### 1.4 成功标准

1. ✅ 3D 地球可旋转、缩放，两种视角可平滑切换（1.5s 过渡动画）
2. ✅ 7 个数据图层均可独立开关，视觉区分明显
3. ✅ 正常/夜视两种视觉模式可切换，Shader 效果可见
4. ✅ 光晕/锐化/色调滑块实时生效
5. ✅ 事件标注可点击弹出信息卡片（类型、时间、名称）
6. ✅ 底部时间轴可拖拽回放，图层数据随时间变化（7天/小时粒度）
7. ✅ 四角固定标注信息正确显示（坐标、状态、参数）
8. ✅ AI 分析面板可弹出展示 Mock 分析结果
9. ✅ 整体暗色军工终端风格，扫描线/发光文字效果到位
10. ✅ 可运行前端项目，含简要 README

---

## 2. 方案对比与推荐方案

### 2.1 前端技术栈

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Vanilla HTML/JS + Three.js** ✅ | 展示 JS 基础功底；无框架依赖；项目轻量；面试含金量高 | 需要自行管理 DOM 状态和模块组织 |
| React + Three.js (R3F) | 生态活跃；组件化好；状态管理方便 | 增加依赖；可能掩盖 JS 基础能力 |
| Vue 3 + Three.js (TresJS) | 适合 Vue 技术栈候选人 | 同上 |

**→ 选择: Vanilla HTML/JS + Three.js。** 原生 JS 最能体现候选人的前端工程基础，Three.js 手写地球展示 3D 编程深度。

### 2.2 3D 地球渲染

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Three.js 手写** ✅ | 完全控制；展示 3D 功底；灵活定制 | 需要从球体 + 纹理开始搭建 |
| Globe.GL 库 | 开箱即用 | 定制灵活度低；隐藏技术细节 |
| CesiumJS | 专业 GIS 引擎；功能全面 | 重量级；学习曲线陡 |

**→ 选择: Three.js 手写。** SphereGeometry + 地球纹理贴图 + 手写图层系统，充分展示 3D 编程能力。

### 2.3 AI 分析功能

| 方案 | 优点 | 缺点 |
|------|------|------|
| **纯前端 Mock AI 面板** ✅ | 无外部依赖；演示稳定；展示 AI 产品设计思维 | 非真实 AI |
| 调用浏览器 LLM API | 真实推理 | 增加复杂度；浏览器 API 不稳定 |
| 仅界面占位 | 实现简单 | 缺乏交互深度 |

**→ 选择: 纯前端 Mock AI 面板。** 静态 JSON 匹配事件类型 → 预置分析文案，展示完整的 AI 辅助决策产品流程。

### 2.4 Mock 数据

| 方案 | 优点 | 缺点 |
|------|------|------|
| **静态 JSON 文件** ✅ | 数据可控；演示稳定；可精心设计故事线 | 数据量固定 |
| 程序化动态生成 | 每次不同；数据量大 | 演示不稳定；难以复现问题 |
| 核心 JSON + 辅助生成 | 兼顾可控性丰富度 | 增加复杂度 |

**→ 选择: 静态 JSON 文件。** 每个图层用精心设计的 50-200 条数据，确保演示效果稳定可预期。

### 2.5 视觉特效

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Three.js Shader 后处理** ✅ | 技术深度高；效果统一；面试加分 | Shader 调试难度 |
| CSS 滤镜 + 覆盖层 | 简单直接 | 效果有限；无法作用于 3D 场景 |
| Shader + CSS 混合 | 取两者之长 | 实现路径分裂 |

**→ 选择: Three.js Shader 后处理。** EffectComposer + 自定义 ShaderPass 统一处理扫描线、热成像色彩映射、光晕、锐化、色调，技术含金量最高。

---

## 3. 架构设计

### 3.1 整体界面布局

遵循 `docs/buju.txt` 的军工风监控终端布局规范：

```
┌──────────────────────────────────────────────────────┐
│ 【顶部标题栏】                                        │
│ WORLDVIEW  │ PLAYBACK │ TOP SECRET // SI-TK // NOFORN │
├────────────┬──────────────────────────┬───────────────┤
│【左上-信息面板】│                        │【右上-参数面板】 │
│ 密级/编号   │    🌍 中央3D地球视窗      │ REC时间戳     │
│ 状态标签   │   (Three.js 渲染)        │ FORCE/SURV/  │
│ 折叠信息框  │   可旋转/缩放/视角切换    │ THREAT参数   │
│            │   叠加数据图层           │ 遥测数据     │
│            │                        │              │
│ 左下-坐标  │                        │              │
│ 状态码    │                        │              │
├────────────┴──────────────────────────┴───────────────┤
│【底部控制栏 - 全宽】                                    │
│ 时间轴拖拽 │ 倍速控制 │ 图层开关 │ 视觉参数 │ 功能按钮     │
└──────────────────────────────────────────────────────┘
```

视觉风格统一：
- 纯黑底色 `#000000`，发光文字 `#00F0FF` 系荧光青蓝色
- CRT 扫描线通过 Shader + CSS overlay 双重实现
- 像素颗粒微噪点模拟复古监控屏质感

### 3.2 3D 地球核心结构

| 层级 | 实现 | 说明 |
|------|------|------|
| 球体网格 | `SphereGeometry(radius, 128, 64)` | 高分段数保证曲面平滑 |
| 地表纹理 | `TextureLoader` 加载 2048×1024 equirectangular 卫星图 | MeshPhongMaterial.map |
| 大气光晕 | 略大透明球体 + 自定义 ShaderMaterial（菲涅尔边缘发光） | 模拟大气散射 |
| 星空背景 | 大半径 SphereGeometry 内表面 + 星空粒子 | 包裹整个场景 |

### 3.3 视角系统

两种视角，手写 lerp 平滑过渡（1.5s）：

| 属性 | 近地鸟瞰 (Low Orbit) | 太空弧面 (Space Arc) |
|------|---------------------|---------------------|
| 相机距离 | ~2R（地球半径） | ~5R |
| 俯角 | ~45° | ~20° |
| FOV | 45° | 30° |
| 适用 | 查看航班/海上轨迹细节 | 全局态势感知 |

旋转交互基于自定义 OrbitControls（极轴角 ±85°，缩放限制 1.5R~8R）。

### 3.4 数据图层系统

#### 坐标转换

```js
function latLonToVec3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
```

#### 7 个图层规格

| 图层 | 视觉形态 | 实现方式 | 数据量 |
|------|---------|---------|--------|
| 航班轨迹 ✈️ | 浅蓝弧线 + 飞机图标 | CatmullRomCurve3 大圆航线 + 小标记 | ~100条 |
| GPS 干扰热力 🔥 | 红/橙渐变圆斑 | CircleGeometry 半透明 + 强度分级 Shader | ~50点 |
| 卫星轨道 🛰️ | 白虚线椭圆 + 光点 | RingGeometry / Line + 运动光点 | ~20颗 |
| 海上交通 🚢 | 蓝粗慢移线 | 类似航班，速度慢线条粗 | ~60条 |
| 禁飞区 🚫 | 红半透明区块 | ShapeGeometry 贴地球曲面 | ~15区域 |
| 互联网中断 ⚡ | 红脉冲波纹 | 动画波纹扩散 Shader | ~30点 |
| 情报事件 📋 | 黄/红锥形标记 | ConeGeometry + Sprite，可点击 | ~80事件 |

每个图层封装为独立 THREE.Group，挂载在 LayerManager 统一管理 `group.visible` 开关。

### 3.5 视觉模式与后处理

基于 Three.js EffectComposer + 自定义 ShaderPass：

| Shader | 功能 | 参数 |
|--------|------|------|
| `scanline.frag` | CRT 扫描线质感 | 扫描线密度、透明度 |
| `thermal.frag` | 灰度→热成像色彩映射 | 模式开关 (bool) |
| `glow.frag` | 光晕/辉光强度 | 强度 0.0-2.0 |
| `sharpen.frag` | 锐化程度 | 强度 0.0-1.0 |
| `atmosphere.frag` | 大气菲涅尔边缘光 | 颜色、强度 |

色调调节通过 `hue-rotate` 等效 Shader 或直接修改 thermal 色彩 LUT 实现。

### 3.6 UI 组件体系

所有 UI 为 HTML/CSS overlay 层，通过 `pointer-events` 控制穿透：

| 组件 | 位置 | 内容 |
|------|------|------|
| TopBar | 顶部 | WORLDVIEW 标题 + PLAYBACK 状态 |
| LeftPanel | 左上 | 密级、编号、系统状态(NORMAL)、折叠数据摘要 |
| RightPanel | 右上 | REC 时间戳、FORCE/SURV/THREAT 参数、遥测数据、AI ANALYSIS 按钮 |
| BottomBar | 底部 | 时间轴滑块、倍速按钮、方位角/俯仰角、图层复选框、视觉模式切换、参数滑块 |
| AIPanel | 右侧滑入 | 事件类型、时间、威胁评估、分析摘要、趋势预测、建议行动（Mock 数据） |
| EventCard | 浮动弹出 | 事件类型、时间、名称、详情、AI分析入口 |
| CornerOverlays | 左下/右下 | 坐标、状态码、图层统计、FPS |

### 3.7 数据流

```
                    ┌──────────────┐
                    │  JSON 数据源  │
                    │ (7个图层文件) │
                    └──────┬───────┘
                           │ import
                           ▼
┌─────────┐     ┌──────────────────┐     ┌─────────────┐
│ UI 控制  │────▶│  LayerManager    │────▶│ Three.js    │
│ (开关/   │     │  (数据→3D对象)   │     │ Scene       │
│  参数)   │     └──────────────────┘     │ (渲染)      │
└─────────┘                               └──────┬──────┘
     ▲                                           │
     │                                           ▼
     │                                    ┌──────────────┐
     │                                    │PostProcessing│
     └────────────────────────────────────│ (Shader效果) │
        Uniform 更新 (光晕/锐化/色调)      └──────┬───────┘
                                                  │
                                                  ▼
                                            ┌──────────┐
                                            │  Canvas  │
                                            └──────────┘
```

**关键路径：**

1. **图层渲染流**：JSON → LayerManager.createLayerObjects() → THREE.Group → Scene.add()
2. **图层开关流**：底部复选框 → LayerManager.toggleLayer(id) → group.visible = bool
3. **视觉参数流**：滑块 → PostProcessing.updateUniform(key, value) → Shader 实时更新
4. **时间轴回放流**：时间轴拖动 → LayerManager.updateTimeRange(start, end) → 各图层过滤当前时间窗口 → 重绘
5. **事件交互流**：鼠标点击 → RaycasterPicker → IntelEvents.getNearest(latlng) → EventCard 弹出 + CameraController.flyTo()
6. **AI 分析流**：事件选中 / AI按钮 → AIPanel.show(eventType) → ai-responses.json 匹配 → 渲染 Mock 文案

### 3.8 错误处理

| 场景 | 处理策略 |
|------|---------|
| 纹理加载失败 | 回退纯色材质 `#1a3a5c`，`console.warn` |
| WebGL 不支持 | Canvas 替换为提示文字，不阻塞页面 |
| JSON 数据解析失败 | try-catch；该图层静默隐藏，不中断其他图层 |
| Shader 编译错误 | PostProcessing 检测状态，降级为无后期效果 |
| 性能不足 FPS<30 | 自动降级：减粒子数、减曲线段数、关闭部分 ShaderPass |

### 3.9 测试策略

| 层级 | 范围 | 工具 |
|------|------|------|
| 单元测试 | `utils/math.js` 坐标转换、插值函数；数据 JSON Schema 校验 | Vitest |
| 组件测试 | LayerManager 开关逻辑；UIManager 事件绑定/解绑 | Vitest + jsdom |
| 集成测试 | 完整交互流：点击标注→卡片弹出→AI面板→关闭 | Vitest + jsdom |
| 视觉回归 | 暂不纳入（面试项目），手动截图比对 | - |

---

## 4. 项目文件结构

```
geo-intelligence-dashboard/
├── index.html                    # 入口，布局骨架
├── README.md                     # 架构与运行说明
├── package.json                  # 依赖：three + vite + vitest
├── vite.config.js
├── public/
│   └── textures/
│       ├── earth-day.jpg         # 地球日间纹理 2048x1024
│       ├── earth-night.jpg       # 地球夜间纹理（热成像模式）
│       └── starfield.png         # 星空背景
├── src/
│   ├── main.js                   # 入口：初始化场景、启动渲染循环
│   ├── config.js                 # 全局配置常量
│   ├── scene/
│   │   ├── SceneManager.js       # scene/camera/renderer 创建与管理
│   │   ├── Earth.js              # 地球球体 + 大气光晕
│   │   ├── Starfield.js          # 星空背景
│   │   └── PostProcessing.js     # EffectComposer + 自定义 ShaderPass
│   ├── layers/
│   │   ├── LayerManager.js       # 图层注册/开关/时间过滤统一管理
│   │   ├── FlightTrajectories.js # 航班轨迹图层
│   │   ├── GPSJamming.js         # GPS干扰热力图层
│   │   ├── SatelliteOrbits.js    # 卫星轨道图层
│   │   ├── MaritimeTraffic.js    # 海上交通图层
│   │   ├── NoFlyZones.js         # 禁飞区图层
│   │   ├── InternetBlackouts.js  # 互联网中断标注图层
│   │   └── IntelEvents.js        # 情报事件卡片图层（含 Raycaster 点击）
│   ├── controls/
│   │   ├── CameraController.js   # OrbitControls + 视角切换 + flyTo
│   │   └── RaycasterPicker.js    # 鼠标点击拾取
│   ├── ui/
│   │   ├── UIManager.js          # UI 模块总协调
│   │   ├── TopBar.js             # 顶部标题栏
│   │   ├── LeftPanel.js          # 左上信息面板 + 左下坐标
│   │   ├── RightPanel.js         # 右上参数面板 + AI入口
│   │   ├── AIPanel.js            # AI 分析弹出面板
│   │   ├── BottomBar.js          # 底部控制栏（时间轴/图层/参数/模式）
│   │   ├── EventCard.js          # 事件信息卡片
│   │   └── CornerOverlays.js     # 四角固定标注渲染
│   ├── data/
│   │   ├── flights.json          # ~100航班轨迹
│   │   ├── gps-jamming.json      # ~50GPS干扰点
│   │   ├── satellites.json       # ~20卫星轨道
│   │   ├── maritime.json         # ~60海上航线
│   │   ├── no-fly-zones.json     # ~15禁飞区
│   │   ├── blackouts.json        # ~30互联网中断点
│   │   ├── intel-events.json     # ~80情报事件
│   │   └── ai-responses.json     # AI Mock 回复模板
│   └── utils/
│       ├── math.js               # latLonToVec3、大圆航线插值
│       └── animation.js          # lerp、缓动函数、flyTo动画
├── shaders/
│   ├── scanline.vert / .frag     # CRT 扫描线
│   ├── thermal.frag              # 热成像色彩映射
│   ├── glow.frag                 # 光晕调节
│   ├── sharpen.frag              # 锐化
│   └── atmosphere.frag           # 大气菲涅尔
└── spec/
    └── geo-intelligence-dashboard/
        └── brainstorm-geo-intelligence-dashboard.md
```

---

## 5. 关键决策记录

| # | 决策点 | 考虑方案 | 最终选择 | 理由 |
|---|--------|---------|---------|------|
| D1 | 前端技术栈 | React / Vue / Vanilla | **Vanilla HTML/JS** | 面试考察 JS 基础功底，无框架依赖，项目轻量 |
| D2 | 3D 引擎 | Cesium / Globe.GL / Three.js | **Three.js 手写** | 展示 3D 编程深度，灵活定制，生态成熟 |
| D3 | AI 分析 | 真实 LLM / Mock / 占位 | **纯前端 Mock** | 面试可控，展示 AI 产品设计思维，不引入外部依赖 |
| D4 | Mock 数据 | 动态生成 / 静态 JSON / 混合 | **静态 JSON** | 数据可控，演示稳定，可精心设计故事线 |
| D5 | 视觉特效 | CSS / Shader 混合 / 纯 Shader | **Shader 后处理** | 技术深度最高，面试加分，效果统一 |
| D6 | 时间轴范围 | 24h / 7天 / 30天 | **7天/小时粒度** | 演示紧凑，数据密度适中 |
| D7 | 界面布局 | 自行设计 / 参考 buju.txt | **严格参考 buju.txt** | 用户指定，军工风监控终端是成熟参考 |
| D8 | 构建工具 | Webpack / Vite / esbuild | **Vite** | 零配置启动，HMR，面试演示流畅 |
| D9 | 测试框架 | Jest / Vitest / 无测试 | **Vitest** | 与 Vite 生态一致，TDD 友好 |
| D10 | 动画库 | GSAP / 手写 lerp / anime.js | **手写 lerp** | 减少依赖，展示动画原理理解 |

---

## 6. 约束条件与成功标准

### 6.1 硬约束

- ✅ 所有数据来自本地 JSON 文件，无外部 API 调用
- ✅ `npm run dev` 一键启动
- ✅ 现代浏览器（Chrome/Firefox/Edge），需 WebGL 2.0
- ✅ 总包体积 < 2MB gzipped
- ✅ 仅依赖 three + vite + vitest

### 6.2 性能标准

- 目标帧率 ≥45 FPS（全图层开启，中等硬件）
- 性能不足时自动降级策略
- 3D 纹理总大小 < 10MB

### 6.3 交付标准

1. 可运行前端项目（`npm run dev` 或直接打开 HTML）
2. README 说明架构与运行方式
3. 面试结束时可口头说明：完成项、未完成项、后续计划

---

## 7. 自检清单

| 检查项 | 状态 |
|--------|------|
| 无占位符/待定项（TODO/FIXME/HACK） | ✅ |
| 所有功能需求（PRD）有对应设计 | ✅ |
| 所有布局要求（buju.txt）有对应设计 | ✅ |
| 组件职责边界清晰，无重叠/冲突 | ✅ |
| 数据流路径完整可追溯 | ✅ |
| 错误处理覆盖关键异常场景 | ✅ |
| 测试策略与 Step 3 TDD 实现对齐 | ✅ |
| 文件结构与实际实现规划一致 | ✅ |
| 成功标准可量化验证 | ✅ |
| 无架构矛盾或范围不清 | ✅ |
