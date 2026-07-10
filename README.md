# WORLDVIEW — Global Intelligence Platform

一个全球数据情报可视化平台，核心为基于 Three.js 手写构建的 3D 交互地球，叠加 7 种情报数据图层，支持视觉模式切换、Shader 参数调节、时间轴历史回放及 AI Mock 辅助分析。

## 技术栈

- **Runtime:** Vanilla JavaScript (ES Module) + Three.js
- **Build:** Vite
- **Test:** Vitest + jsdom
- **No frameworks:** 零前端框架依赖

## 目录结构

```
├── index.html              # 入口 HTML，CSS Grid 布局骨架
├── src/
│   ├── main.js             # 应用入口，模块串联
│   ├── config.js           # 全局配置常量
│   ├── scene/              # Three.js 场景管理
│   │   ├── SceneManager.js # scene/camera/renderer
│   │   ├── Earth.js        # 地球球体 + 大气光晕
│   │   ├── Starfield.js    # 星空背景
│   │   └── PostProcessing.js
│   ├── layers/             # 7 个数据图层
│   │   ├── LayerManager.js
│   │   ├── FlightTrajectories.js
│   │   ├── GPSJamming.js
│   │   ├── SatelliteOrbits.js
│   │   ├── MaritimeTraffic.js
│   │   ├── NoFlyZones.js
│   │   ├── InternetBlackouts.js
│   │   └── IntelEvents.js
│   ├── controls/           # 交互控制
│   │   ├── CameraController.js
│   │   └── RaycasterPicker.js
│   ├── ui/                 # UI overlay 组件
│   │   ├── UIManager.js
│   │   ├── TopBar.js
│   │   ├── LeftPanel.js
│   │   ├── RightPanel.js
│   │   ├── BottomBar.js
│   │   ├── AIPanel.js
│   │   ├── EventCard.js
│   │   └── CornerOverlays.js
│   ├── data/               # Mock 数据 (8 JSON)
│   ├── utils/              # 工具函数
│   │   ├── math.js
│   │   └── animation.js
│   └── __tests__/          # 测试文件 (14 个)
├── shaders/                # GLSL 着色器 (6 个)
└── spec/                   # Spec-Kit 文档
```

## 运行方式

```bash
npm install
npm run dev      # 启动开发服务器 → http://localhost:3000
npm test         # 运行全部测试
npm run build    # 构建生产版本
```

## 功能列表

- ✅ 3D 地球可旋转、缩放，两种视角（近地鸟瞰 / 太空弧面）平滑切换
- ✅ 7 个独立数据图层可独立开关
- ✅ 正常彩色 / 灰度热成像夜视模式切换
- ✅ 光晕/锐化/色调 Shader 参数实时调节
- ✅ 事件标注可点击弹出信息卡片
- ✅ 底部时间轴可拖拽回放
- ✅ 四角固定标注（坐标、状态、图层统计、FPS）
- ✅ AI 分析面板 Mock 分析结果
- ✅ 整体暗色军工终端风格 + CRT 扫描线

## 架构说明

```
JSON 数据源 → LayerManager → Three.js Scene → PostProcessing → Canvas
     ↑              ↑                                    ↑
  UI 控制 ←→ 事件总线 ←→ CameraController / RaycasterPicker
```

五层架构：
1. **数据层** — JSON Mock 文件
2. **场景层** — Three.js Scene/Earth/Starfield/PostProcessing
3. **图层管理层** — LayerManager → 7 个 Layer 模块
4. **控制层** — CameraController + RaycasterPicker
5. **UI 层** — HTML/CSS overlay 组件

## 测试运行

```bash
npm test          # 运行全部 50 个测试
npm run test:watch # 监听模式
```
