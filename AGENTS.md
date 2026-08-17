# AGENTS.md — justdemo

## 技术栈

Vite 5 · React 18 · TypeScript 5 (strict) · Tailwind CSS 3.4 · react-router-dom v7 · GSAP 3.12 · Three.js 0.160 + @react-three/fiber + drei · MapLibre GL JS 5.24 · Node.js 本地 API · SQLite。项目按本地单用户运行；`/my-gear` 的持久化依赖本机 Node 服务。

## 文件结构

```
src/
├── pages/       页面组件（Router 入口，组合子组件，不持有数据）
├── components/  通用 UI 组件（数据通过 props 传入，不直接 import 数据常量）
├── data/        静态数据模块（硬编码 TypeScript，export 数据 + 查询函数）
├── lib/         纯业务逻辑函数（纯函数，无 React 依赖）
├── types.ts     全局共享类型
├── App.tsx      路由定义
└── index.css    Tailwind 指令 + 自定义 CSS（liquid-glass 系列、动画关键帧）
server/
├── dev.mjs           本地页面服务与 `/api/gear` 入口
├── gearApi.mjs       装备清单 HTTP API
└── gearDatabase.mjs  SQLite 校验、事务与 revision 写锁
scripts/              Node 内置测试（装备、API、数据库、路线）
.local-data/          本机 SQLite 数据目录（Git 忽略）
```

## 文档入口

- `docs/architecture.md`：当前模块、路由、本地 API 与数据流
- `docs/decisions.md`：架构决策及被取代的历史方案
- `docs/code_review.md`：前端、API、SQLite 和视觉 QA 审查标准
- `TODO.md`：已完成能力与未闭环事项
- `docs/designs/` / `docs/plans/`：功能设计与实施记录


## VibeCoding 工作流（必读）

> 每次开发 session 遵循此流程：阶段式的技能调用 + 记忆系统读写。
> 记忆系统位于 `/Users/jon/Documents/Obliviate`，由 00_System/AGENTS.md 定义规则。

### 可用能力速查

| 能力 | 调用方式 | 适用阶段 |
|---|---|---|
| Obliviate 记忆系统 | 读路径：`20_Projects/justdemo/` · `10_User/` · `40_Agent/Cases/` | 全程 |
| OpenSpec | `/opsx:explore` `/opsx:propose` `/opsx:apply` `/opsx:archive` | 设计+计划+实现 |
| brainstorming skill | AI 自动调用 | 需求设计 |
| writing-plans skill | AI 自动调用 | 实现计划 |
| test-driven-development skill | AI 自动调用 | 编码实现 |
| systematic-debugging skill | AI 自动调用 | 排查 bug |
| requesting-code-review skill | AI 调用或 `/opsx:review` | 代码审查 |
| gstack QA / browser | `qa` skill 或手动浏览器测试 | 验证交付 |

### 标准流程

```
Phase 0 ── 启动 session
  │  读 Obliviate: STATUS.md + OPEN_LOOPS.md + DECISIONS.md
  │  读 Obliviate: 10_User/Preferences.md + Constraints.md
  │  读 Obliviate: 40_Agent/Cases/（相关经验）
  └─ 明确本次任务目标
       │
Phase 1 ── 需求与设计
  │  用: brainstorming skill（/opsx:explore 视情况）
  │  读: DECISIONS.md（避免重复决策）
  │  写: 产生新决策 → DECISIONS.md
  │  ★ 粒度说明：小改动（单文件/少量修改，不涉及新模块或
  │    路由变更）走轻量 scope 确认——输出目标/scope/约束/
  │    验收条件（一两句话），你确认后直接跳过 Phase 2 进入实现；
  │    大改动走完整 brainstorming + writing-plans 流程
  └─ 验证: 用户确认设计
       │
Phase 2 ── 实现计划
  │  用: writing-plans skill（/opsx:propose 视情况）
  │  读: OPEN_LOOPS.md（当前未闭环）
  │  写: 计划关联新开环项 → OPEN_LOOPS.md
  └─ 验证: 计划保存到 docs/plans/（禁止写入 docs/superpowers/）
       │
Phase 3 ── 编码实现
  │  用: test-driven-development skill（新逻辑）
  │  读: 40_Agent/Cases/（同类模式参考）
  │  写: 学到可复用模式 → 40_Agent/Cases/
  └─ 验证: 构建通过
       │
Phase 4 ── 代码审查
  │  用: requesting-code-review skill
  │  读: 10_User/Preferences.md（审查标准）
  │  ★ 合规扫描：diff 逐条核对 AGENTS.md「关键约定」中
  │    本次改动涉及的相关规则（数据入口/颜色/图片路径/导出
  │    方式等），确保不违规
  └─ 验证: 修复审查发现
       │
Phase 5 ── 验证与 QA（可选但推荐）
  │  用: 浏览器测试 / gstack QA
  │  读: STATUS.md（测试范围）
  │  写: QA 结果摘要 → STATUS.md
  └─ 验证: 功能通过
       │
Phase 6 ── 排查 Bug（条件触发）
  │  用: systematic-debugging skill
  │  写: bug 根因 + 修复 → 40_Agent/Cases/
  └─ 验证: 修复确认
       │
Phase 7 ── Memory Closeout（必做）
  │  产生了新决策？       → DECISIONS.md
  │  有了未闭环事项？     → OPEN_LOOPS.md
  │  项目状态有变化？     → STATUS.md
  │  学到了一类经验？     → 40_Agent/Cases/
  │  发现了用户偏好？     → 10_User/Preferences.md
  │  配置或命令有变化？   → ENV.md / COMMANDS.md
  └─ 跑索引: python3 .index/scripts/memory_index.py --scan
```

### Phase 说明

- **Phase 1-2 的设计与计划阶段**，如果 OpenSpec 已初始化，可替换为 `/opsx:explore` + `/opsx:propose` 流程，产出 `openspec/specs/` + `openspec/changes/`
- **Phase 1 粒度**：小改动用轻量 scope 确认后可跳过 Phase 2 直接进 Phase 3；大改动走完整 brainstorming + writing-plans 流程。判定标准：是否涉及新模块、路由变更、数据模型变更或跨多文件的新功能。
- **Phase 4 审查可跳过但合规扫描不可跳过**：简单 bug 修复或一次性小改动可跳过 requesting-code-review，但合规扫描（核对 AGENTS.md「关键约定」中本次改动涉及的规则）必须执行，不因改动小而不做。
- **Phase 5 QA 可选但推荐**：涉及 UI 变更、交互新功能、路由修改时必须执行
- **Phase 6 仅在遇到 bug 时触发**：不阻塞流程
- **Phase 7 不可跳过**：这是记忆系统持续运转的保证

### 记忆读写速查表

| 技能/阶段 | 执行前应读 | 执行后可能写 |
|---|---|---|
| brainstorming / opsx:explore | DECISIONS.md | DECISIONS.md（新决策） |
| writing-plans / opsx:propose | OPEN_LOOPS.md | OPEN_LOOPS.md（新开环项） |
| test-driven-development | 40_Agent/Cases/ | 40_Agent/Cases/（新模式） |
| requesting-code-review | 10_User/Preferences.md | 40_Agent/Cases/（系统性问题） |
| systematic-debugging | 40_Agent/Cases/ | 40_Agent/Cases/（根因+修复） |
| gstack QA / browser test | STATUS.md | STATUS.md（QA 摘要） |
| Phase 4 合规扫描 | AGENTS.md「关键约定」 | — |
| Memory Closeout | （全部） | DECISIONS + OPEN_LOOPS + STATUS + Cases + Preferences |
| 任何新功能开发前 | STATUS.md + OPEN_LOOPS.md | — |

### 不调用哪个 skill

以下是当前环境中有、但本工作流不需要调用的：
- `using-superpowers` — 入口 skill，仅在 AI 启动时自动触发，不手动调用
- OpenSpec `/opsx:apply` `/opsx:archive` — 如果不用 OpenSpec，就不调


## 工程原则
> 全局规范源头：`/Users/jon/Documents/Obliviate/30_Knowledge/Workflows/工程原则.md`
> 新建项目时可复制此内容到 AGENTS.md，并以全局文件为准保持更新。

### 1. 优先复用成熟方案
如果 GitHub / npm 上有成熟的开源方案，直接复用，不自研。
复用前必须确认：项目是什么、star 数、最近更新日期、是否仍维护。
不确认清楚就 `npm install` 是禁止的。

### 2. 从第一性原理分析 bug
排查 bug 时从第一性原理出发。不依赖经验猜测，不跳过根因分析直接修症状。
每一步问自己：这个行为在底层是怎么运作的？

### 3. 不要搞兜底实现
兜底（fallback / try-catch 吞异常 / 隐式默认值）会掩盖主流程的错误。
如果某个路径不应该走到兜底层，就让它报错，把问题暴露出来修，而不是静默处理。

## AI 高频修改的文件

按修改频率排列：

1. **data/ 目录**（gearKnowledge.ts · gearCatalog.ts · gearAnatomyData.ts · routes.ts · routeData.ts）— 新增内容
2. **components/ 目录**（GearAdvisorModal.tsx · GearDetailPanel.tsx）— 新功能
3. **pages/ 目录** — 路由集成
4. **index.css** — 视觉打磨
5. **tailwind.config.js** — 色板调整

## 关键约定（AI 最常违反的规则）

1. **数据入口唯一**：路线数据必须通过 `getRouteBySlug()` / `getRoutesByRegion()`（在 `routes.ts`）查询，组件不直接 import `routeDataMap` 或 `wusunRoute`。
2. **新增路线流程**：`routeData.ts` 定义完整 `RouteData` → `routes.ts` 注册到 `routeDataMap`。不用修改任何组件。
3. **新增产品流程**：`gearCatalog.ts` 按品类分组添加，用 `p()` 辅助函数创建对象。
4. **颜色值**：UI 标签、背景、边框等 CSS 场景只用 `forest-{50-900}` / `sand-{50-900}`。唯有 Three.js 3D 场景（灯光、材质）允许写 hex 值。
5. **图片路径**：`/pics/xxx.webp`（`.webp` 格式，放 `public/pics/`）。不要用绝对路径或 jpg/png。
6. **中文 UI / 英文代码**：用户可见文案、注释用中文。变量名、函数名、类型名、文件名用英文。
7. **默认导出**：所有组件 `export default function Name()`。
8. **Props 接口**：定义在组件文件顶部。全局共享类型放 `types.ts`。
9. **不引入未列出的依赖**：不走 `npm install` 新增 package.json 外的库。
10. **无测试框架**：新增纯函数逻辑推荐保持在可单元测试的层级，但暂不引入测试工具。
11. **装备数据入口唯一**：个人装备只通过 `GET/PUT /api/gear` 读写；数据库固定在项目 `.local-data/gear.sqlite`，组件不得直接访问 SQLite。
12. **本地服务入口**：使用 `npm run dev` 同时启动 Vite 与装备 API，固定地址为 `http://localhost:58514`；不要另起只提供 Vite 的开发命令。

## 常见遗漏

- 新增路线只写了 `routeData.ts`，漏了在 `routes.ts` 注册 → 路由 404
- 图片引用写成了绝对路径（如 `/Users/.../pics/xxx.webp`）→ 必须 `/pics/xxx.webp`
- 组件直接 import 了 `wusunRoute` 常量 → 必须走 `getRouteBySlug()`
- 背景色用了 hex 值没走 Tailwind 色板 → 用 `forest-500` 替代 `#1a4d3e`
- `/my-gear` 显示空清单：确认从包含目标数据库的项目目录执行 `npm run dev`，并检查 `.local-data/gear.sqlite`

## 禁止修改

- `.agents/skills/` · `.codex/skills/` · `docs/superpowers/` · `skills-lock.json` · `.netlify/` — 只读
- 已有业务代码：不修改与当前需求无关的文件

---

Last updated: 2026-08-10
