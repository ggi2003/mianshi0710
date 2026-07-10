# 全球数据情报平台 (Geo Intelligence Dashboard) — 任务看板

**版本:** 1.0
**创建日期:** 2026-07-10
**来源:** plan-geo-intelligence-dashboard.md

---

## 进度总览

| 指标 | 值 |
|------|-----|
| 总计 | 28 个任务 |
| 完成 | 27 |
| 进行中 | 0 |
| 待开始 | 1 |
| 完成率 | 96% |

---

## 任务看板

| ID | 任务 | 状态 | 依赖 | 优先级 |
|----|------|------|------|--------|
| T1 | 项目脚手架 (package.json, vite, index.html, config) | ✅ Done | - | P0 |
| T2 | 工具函数 (math.js, animation.js) | ✅ Done | - | P0 |
| T3 | SceneManager (Three.js 场景初始化) | ✅ Done | T2 | P0 |
| T4 | Earth (地球球体 + 大气光晕) | ✅ Done | T3 | P0 |
| T5 | Starfield (星空背景) | ✅ Done | T3 | P1 |
| T6 | CameraController (旋转/缩放/视角切换/flyTo) | ✅ Done | T3 | P0 |
| T7 | LayerManager (图层注册/开关/时间过滤) | ✅ Done | T3, T2 | P0 |
| T8 | FlightTrajectories (航班轨迹图层) | ✅ Done | T7 | P0 |
| T9 | GPSJamming (GPS干扰热力图层) | ✅ Done | T7 | P1 |
| T10 | SatelliteOrbits (卫星轨道图层) | ✅ Done | T7 | P1 |
| T11 | MaritimeTraffic (海上交通图层) | ✅ Done | T7 | P1 |
| T12 | NoFlyZones (禁飞区图层) | ✅ Done | T7 | P1 |
| T13 | InternetBlackouts (互联网中断图层) | ✅ Done | T7 | P2 |
| T14 | IntelEvents (情报事件图层 + 可点击) | ✅ Done | T7 | P0 |
| T15 | RaycasterPicker (鼠标拾取) | ✅ Done | T3, T14 | P0 |
| T16 | PostProcessing (EffectComposer + ShaderPass) | ✅ Done | T3, T17 | P0 |
| T17 | Shader 文件 (5 个 GLSL 着色器) | ✅ Done | - | P1 |
| T18 | TopBar (顶部标题栏 UI) | ✅ Done | - | P1 |
| T19 | LeftPanel (左上信息面板 UI) | ✅ Done | - | P1 |
| T20 | RightPanel (右上参数面板 UI) | ✅ Done | - | P1 |
| T21 | BottomBar (底部控制栏 UI) | ✅ Done | - | P0 |
| T22 | AIPanel (AI 分析面板 UI) | ✅ Done | - | P1 |
| T23 | EventCard (事件信息卡片 UI) | ✅ Done | - | P0 |
| T24 | CornerOverlays (四角固定标注 UI) | ✅ Done | - | P1 |
| T25 | UIManager (UI 总协调) | ✅ Done | T18-T24 | P0 |
| T26 | main.js 入口整合 | ✅ Done | 所有模块 | P0 |
| T27 | Mock 数据文件 (8 个 JSON) | ✅ Done | - | P0 |
| T28 | README | ✅ Done | T26 | P2 |

---

## 执行顺序建议

### 第一批 (基础设施 — 8个任务，并行度高)

| 任务 | 可并行 |
|------|--------|
| T1, T2, T17, T27 | ✅ 4 个可同时进行 |

### 第二批 (核心3D — 7个任务)

| 任务 | 可并行 |
|------|--------|
| T3 → T4, T5 | T4, T5 可并行 |
| T3 → T6 | 独立 |
| T3, T2 → T7 | 独立 |
| T7 → T8, T14 | 优先 P0 图层 |

### 第三批 (P1图层 — 4个任务)

| 任务 | 可并行 |
|------|--------|
| T9, T10, T11, T12 | ✅ 4 个可同时 |

### 第四批 (交互 + 次要图层 — 2个任务)

| 任务 | 可并行 |
|------|--------|
| T15 | 需 T14 |
| T13 | P2，可后置 |

### 第五批 (后处理 + 全部UI — 9个任务)

| 任务 | 可并行 |
|------|--------|
| T16 | 需 T3, T17 |
| T18-T24 | ✅ 7 个 UI 组件可同时 |
| T25 → 需 T18-T24 | - |

### 第六批 (集成 — 2个任务)

| 任务 | 可并行 |
|------|--------|
| T26 | 需所有模块 |
| T28 | 需 T26 |

---

## 关键路径

```
T1/T2 → T3 → T7 → T14 → T15 → T26 → T28
                      └→ T8   ┘
          └→ T6 ──────────────┘
          └→ T16(T17) ────────┘
T18-T24 → T25 ────────────────┘
```

---

## 风险项

| 风险 | 影响任务 | 缓解措施 |
|------|---------|---------|
| Three.js PostProcessing 与 Vite import 兼容性 | T16, T17 | Shader 使用 `?raw` import，EffectComposer 从 `three/examples/jsm/` 引入 |
| 性能不达标（全图层 < 45FPS） | T26 | T26 内建 FPS 监控 + 降级开关；纹理压缩 |
| jsdom 不完全支持 WebGL 测试 | T3-T16 | 3D 核心逻辑提取纯函数测试；集成测试用 e2e 兜底 |
| Shader 调试困难 | T16, T17 | 使用 ShaderToy 风格本地预调；每个 Shader 独立可测试 |
| JSON 数据格式不一致 | T8-T14, T27 | T27 中先定义 JSON Schema 验证规则，再写数据 |
