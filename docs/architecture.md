# Architecture — justdemo

## 项目概述

"乌孙古道"徒步路线展示网站。以新疆乌孙古道为核心，提供路线详情、装备推荐、装备知识等内容。纯前端 SPA，中文 UI。

## 技术栈

| 层 | 技术 | 版本 |
|---|------|------|
| 构建 | Vite | 5.x |
| UI 框架 | React | 18.x |
| 语言 | TypeScript | 5.x |
| 样式 | Tailwind CSS | 3.4 |
| 路由 | react-router-dom | 7.x |
| 动画 | GSAP | 3.12 |
| 3D | Three.js + @react-three/fiber + drei | 0.160 |
| 图表 | ECharts + echarts-for-react | 6.1 |
| 地图 | MapLibre GL JS + MapTiler Outdoor | 5.24 |
| 部署 | Netlify | — |

## 项目结构

```
justdemo/
├── index.html                 # HTML 入口，Satoshi / Noto Sans SC Web Font
├── vite.config.ts             # Vite + React 插件
├── tailwind.config.js         # 自定义色板 (forest/sand)
├── tsconfig.json              # TypeScript 配置
├── postcss.config.js          # PostCSS + Tailwind
├── public/
│   ├── pics/                  # 静态图片素材 (.webp)
│   ├── routes/                # 脱敏路线 GeoJSON
│   └── fonts/nohemi/          # Nohemi 本地 WOFF2 字体
├── src/
│   ├── main.tsx               # React 入口
│   ├── App.tsx                # 路由定义 (BrowserRouter)
│   ├── index.css              # Tailwind 指令
│   ├── types.ts               # 全局类型定义
│   ├── pages/                 # 页面组件
│   │   ├── HomePage.tsx
│   │   ├── RegionPage.tsx
│   │   ├── RoutePage.tsx
│   │   └── GearKnowledgePage.tsx
│   ├── components/            # 通用 UI 组件
│   │   ├── Nav.tsx
│   │   ├── Hero.tsx
│   │   ├── Overview.tsx
│   │   ├── Highlights.tsx
│   │   ├── Timeline.tsx
│   │   ├── Risks.tsx
│   │   ├── ChinaMap.tsx
│   │   ├── RouteMapExperience.tsx
│   │   ├── RouteMapCanvas.tsx
│   │   ├── RouteNodeList.tsx / RouteDetailPanel.tsx
│   │   ├── RouteMobileSheet.tsx
│   │   ├── Footer.tsx
│   │   ├── Gear.tsx / GearCard.tsx
│   │   ├── GearDetailPanel.tsx
│   │   ├── GearAdvisor.tsx / GearQuiz.tsx / GearResults.tsx
│   │   ├── GearAnatomyViewer.tsx
│   │   └── BackpackModel.tsx
│   ├── data/                  # 数据层
│   │   ├── routes.ts          # 路由注册表
│   │   ├── routeData.ts       # 单条路线数据
│   │   ├── gearCatalog.ts     # 产品数据库
│   │   ├── gearGuideData.ts   # 装备指南内容
│   │   ├── gearKnowledge.ts   # 装备知识文章
│   │   ├── gearAnatomyData.ts # 3D 解剖数据
│   │   ├── regions.ts         # 区域定义
│   │   ├── routeGeoData.ts    # 地理数据
│   │   └── routeProfiles.ts   # 路线装备配置文件
│   └── lib/                   # 业务逻辑
│       ├── gearEngine.ts      # 装备推荐引擎
│       └── routeMapState.ts   # 地图状态与纯函数规则
├── third-party-licenses/      # 第三方字体许可与来源说明
└── docs/                      # 项目文档
    ├── architecture.md
    ├── decisions.md
    └── code_review.md
```

## 路由映射

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomePage | 首页/乌孙古道详情 |
| `/region/:regionSlug` | RegionPage | 区域旅游区页面 |
| `/route/:routeSlug` | RoutePage | 单条路线详情页 |
| `/gear-knowledge` | GearKnowledgePage | 装备知识列表 |

## 核心模块

### 装备推荐系统

```
GearAdvisor (状态编排)
  ├── GearQuiz (5步11题问卷)
  ├── gearEngine (推荐引擎，纯函数)
  └── GearResults (推荐结果卡片)
```

- 纯前端规则引擎，无外部 API / AI 调用
- 用户画像（身体数据、预算、偏好）× 路线环境配置 → 排序后的装备推荐
- 产品库内置品牌旗舰店链接

### 数据层

- `routeDataMap` 以 slug 为 key 的路线数据登记处
- `gearCatalog` 按品类分组的品牌产品数据库
- 所有数据为硬编码 TypeScript 模块，无后端依赖

### 交互路线地图

```
RouteMapExperience（选中节点与移动端抽屉状态）
  ├── RouteMapCanvas（MapLibre、GeoJSON、轨迹与节点图层）
  ├── RouteNodeList（桌面节点列表）
  ├── RouteDetailPanel（桌面节点详情）
  └── RouteMobileSheet（移动端三段式抽屉）
```

- MapTiler Outdoor 提供等高线、山体阴影和户外道路底图，Key 由 `VITE_MAPTILER_API_KEY` 注入
- 路线轨迹和节点来自本地脱敏 GeoJSON，地图组件按路由动态加载
- 乌孙古道使用单条连续轨迹；哈巴西坡使用三条按日分色的连续轨迹
- 地图 source/layer ID 按 route slug 隔离，路线摘要、路径名称和节点内容由配置注入
- 节点名称由 MapLibre Symbol 图层绘制：桌面显示全部，移动端优先显示核心节点
- 选中节点使用深绿双环；聚焦位置按桌面浮层和移动端详情面板的可见区域偏移
- 路线图片和节点图片允许缺省；无图路线不会渲染空图片框或无效请求

## 样式体系

- **色板**：`forest`（墨绿系）和 `sand`（沙色系）双色系统，在 `tailwind.config.js` 中定义
- **字体**：正文使用 Satoshi + Noto Sans SC 回退；h1–h3 使用 Nohemi + Noto Sans SC 回退
- **动画**：GSAP（已安装 skill），组件进场和交互动画
- **布局**：Tailwind utility class 为主，全响应式

---

Last updated: 2026-07-19
