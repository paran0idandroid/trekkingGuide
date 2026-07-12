# 乌孙古道户外地图升级 Implementation Plan

> **For agentic workers:** 按 TDD 顺序在当前任务内执行；每项完成后运行对应验证。

**Goal:** 将乌孙古道地图升级为带等高线、山体阴影和动态轨迹的户外地图。

**Architecture:** 保留现有 MapLibre 与组件结构，将样式 URL 从静态值改为由纯函数生成的 MapTiler Outdoor URL。轨迹动画封装为可测试的纯状态函数，画布组件只负责按帧更新独立虚线图层。

**Tech Stack:** React 18、TypeScript、MapLibre GL JS、MapTiler Outdoor、Node 内置测试。

---

### Task 1: MapTiler 样式配置

**Files:**
- Modify: `src/lib/routeMapState.ts`
- Modify: `src/data/routeMapData.ts`
- Modify: `src/types.ts`
- Test: `scripts/route-map-state.test.mjs`

- [ ] 先添加失败测试：要求 Key 为空时抛出中文错误，非空时生成 `outdoor-v4` 样式 URL。
- [ ] 运行 `node --test scripts/route-map-state.test.mjs`，确认因函数不存在而失败。
- [ ] 实现 `createMapTilerOutdoorStyleUrl(apiKey)`，并让配置使用 `import.meta.env.VITE_MAPTILER_API_KEY`。
- [ ] 再次运行测试并确认通过。

### Task 2: 动态轨迹状态

**Files:**
- Modify: `src/lib/routeMapState.ts`
- Modify: `src/components/RouteMapCanvas.tsx`
- Test: `scripts/route-map-state.test.mjs`

- [ ] 先添加失败测试：动画相位循环且输出固定长度虚线数组。
- [ ] 运行测试，确认因函数不存在而失败。
- [ ] 实现最小纯函数，并在地图加载后添加动态虚线层。
- [ ] 使用 `requestAnimationFrame` 更新图层；页面隐藏、减少动态效果或卸载时停止。
- [ ] 运行全部 Node 测试。

### Task 3: 工程与视觉验证

**Files:**
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/STATUS.md`
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/DECISIONS.md`
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/OPEN_LOOPS.md`

- [ ] 运行 `npx vite build`，确认生产打包通过且 Key 未出现在 Git diff。
- [ ] 启动开发服务器，检查桌面和移动端地图加载、等高线与动态轨迹。
- [ ] 执行代码审查并修复 Critical/Important 问题。
- [ ] 完成 AGENTS.md 合规扫描和 Memory Closeout，重建记忆索引。
