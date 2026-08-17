# Architecture — justdemo

## 项目概述

徒步路线展示与装备管理网站。路线、地图、装备知识和推荐仍由 React SPA 提供；个人装备清单在本机通过 Node API 与 SQLite 持久化。UI 使用中文。

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
| 地图 | MapLibre GL JS + MapTiler Outdoor | 5.24 |
| 本地服务 | Node.js HTTP + Vite middleware | Node 22.5+（需要 `node:sqlite`） |
| 本地数据库 | SQLite（`node:sqlite`） | 随 Node 提供 |
| 静态部署 | Netlify | 路线与知识 SPA；不承载本机装备数据库 |

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
│   │   ├── GearKnowledgePage.tsx
│   │   ├── GearSystemPage.tsx
│   │   └── MyGearPage.tsx
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
│   │   ├── Gear.tsx / GearSystemCard.tsx / GearSystemIcon.tsx
│   │   ├── GearAdvisorModal.tsx
│   │   ├── GearInventory.tsx / GearInventorySystemCard.tsx
│   │   ├── WantedGearList.tsx / GearItemActionPanel.tsx
│   │   ├── GearDetailPanel.tsx
│   │   ├── GearAnatomyViewer.tsx
│   │   └── BackpackModel.tsx
│   ├── data/                  # 数据层
│   │   ├── routes.ts          # 路由注册表
│   │   ├── routeData.ts       # 单条路线数据
│   │   ├── mapStyle.ts        # 全国与详情地图共享 Outdoor 样式
│   │   ├── gearCatalog.ts     # 产品数据库
│   │   ├── gearSystems.ts     # 六大装备系统定义与查询
│   │   ├── gearGuideData.ts   # 装备指南内容
│   │   ├── gearKnowledge.ts   # 装备知识文章
│   │   ├── gearAnatomyData.ts # 3D 解剖数据
│   │   ├── regions.ts         # 区域定义
│   │   └── routeGeoData.ts    # 全国地图路线地点
│   └── lib/                   # 业务逻辑
│       ├── gearInventory.ts   # 清单纯函数与 API 客户端
│       ├── gearSystemState.ts # 装备知识 URL 状态规则
│       └── routeMapState.ts   # 地图状态与纯函数规则
├── server/
│   ├── dev.mjs                # localhost:58514 页面与 API 服务
│   ├── gearApi.mjs            # GET/PUT /api/gear
│   └── gearDatabase.mjs       # SQLite schema、校验与事务
├── scripts/                   # Node 内置测试
├── .local-data/
│   └── gear.sqlite            # 单机装备数据库（Git 忽略）
├── third-party-licenses/      # 第三方字体许可与来源说明
└── docs/                      # 项目文档
    ├── architecture.md
    ├── decisions.md
    └── code_review.md
```

## 路由映射

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomePage | 全国地图与路线卡片 |
| `/region/:regionSlug` | RegionPage | 区域旅游区页面 |
| `/route/:routeSlug` | RoutePage | 单条路线详情页 |
| `/gear-knowledge` | GearKnowledgePage | 装备知识列表 |
| `/gear-knowledge/:systemSlug` | GearSystemPage | 六大装备系统详情 |
| `/my-gear` | MyGearPage | 已有装备与待购买清单 |

## 核心模块

### 数据层

- `routeDataMap` 以 slug 为 key 的路线数据登记处
- 当前只注册乌孙古道与哈巴西坡；不存在的路线不得进入地图、区域或装备配置
- `gearCatalog` 按品类分组的品牌产品数据库
- 路线、装备知识和产品数据为硬编码 TypeScript 模块
- 个人装备是单机动态数据，只通过 `/api/gear` 访问 `.local-data/gear.sqlite`

### 个人装备清单

```
MyGearPage
  └── GearInventory（状态与同步写锁）
      ├── GearInventorySystemCard（已有装备六系统看板）
      ├── WantedGearList（待购买单列）
      └── GearItemActionPanel（编辑、移动、删除）
             │
             ▼
       GET/PUT /api/gear
             │
             ▼
       .local-data/gear.sqlite
```

- 单机单用户，不依赖登录状态或浏览器存储；关闭浏览器或项目进程后数据仍保留
- 清单分为 `owned` 与 `wanted`，名称全局去重，新增时按名称自动推断六大系统并允许手动修改
- `PUT /api/gear` 使用递增 revision 和 SQLite 事务，旧页面提交过期快照时返回 409
- `npm run dev` 在 `localhost:58514` 同时提供 Vite 页面与本地 API

### 交互路线地图

```
RouteMapExperience（选中节点与移动端抽屉状态）
  ├── RouteMapCanvas（MapLibre、GeoJSON、轨迹与节点图层）
  ├── RouteNodeList（桌面节点列表）
  ├── RouteDetailPanel（桌面节点详情）
  └── RouteMobileSheet（移动端三段式抽屉）
```

- MapTiler Outdoor 提供等高线、山体阴影和户外道路底图，Key 由 `VITE_MAPTILER_API_KEY` 注入
- 首页全国地图与路线详情共用 MapLibre Outdoor；全国尺度只显示路线地点和名称，点击直接进入详情
- 路线轨迹和节点来自本地脱敏 GeoJSON，地图组件按路由动态加载
- 乌孙古道使用单条连续轨迹；哈巴西坡使用三条按日分色的连续轨迹
- 地图 source/layer ID 按 route slug 隔离，路线摘要、路径名称和节点内容由配置注入
- 节点名称由 MapLibre Symbol 图层绘制：桌面显示全部，移动端优先显示核心节点
- 选中节点使用深绿双环；聚焦位置按桌面浮层和移动端详情面板的可见区域偏移
- 进入或切换路线详情时立即回到地图顶部；地图下方直接进入四卡路线概况，不重复显示摘要条
- 路线图片和节点图片允许缺省；无图路线不会渲染空图片框或无效请求

## 样式体系

- **色板**：`forest`（墨绿系）和 `sand`（沙色系）双色系统，在 `tailwind.config.js` 中定义
- **字体**：正文使用 Satoshi + Noto Sans SC 回退；h1–h3 使用 Nohemi + Noto Sans SC 回退
- **动画**：GSAP（已安装 skill），组件进场和交互动画
- **布局**：Tailwind utility class 为主，全响应式
- **装备模块材质**：个人装备与装备知识共享全宽 forest/sand 环境背景和 `gear-glass-*` 材质；玻璃承载导航、控件、独立卡片、折叠组外壳和操作面板，连续介绍正文直接显示在环境背景上，折叠组内部使用实色 forest/sand 层级而不叠加玻璃
- **辅助显示**：装备模块统一覆盖 reduced-motion、reduced-transparency 与高对比模式；模态顾问支持初始聚焦、Tab 循环、Esc 关闭和焦点恢复

---

Last updated: 2026-08-17
