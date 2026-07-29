# 我的装备六大系统看板 Implementation Plan

> **For agentic workers:** 按任务顺序执行；所有业务逻辑遵循 test-driven-development，先观察测试因缺少功能而失败，再编写最小实现。

**Goal:** 将 `/my-gear` 改为按六大装备系统组织的响应式看板，并安全迁移现有 IndexedDB 装备。

**Architecture:** 数据层为装备增加可空的 `systemSlug`，通过纯函数推断旧名称并在首次读取时回写。页面继续由 `GearInventory` 管理加载、持久化、状态切换和写锁，新建系统卡组件负责系统内新增、编辑、移动与删除交互。

**Tech Stack:** React 18、TypeScript、Tailwind CSS、原生 IndexedDB、Node 内置测试。

---

### Task 1: 系统归类与旧数据迁移

**Files:**
- Modify: `src/types.ts`
- Modify: `src/lib/gearInventory.ts`
- Test: `scripts/gear-inventory.test.mjs`

- [ ] 为 `GearInventoryItem` 增加 `systemSlug: GearSystemSlug | null`。
- [ ] 先测试 `inferGearSystem(name)` 对当前 19 件装备的归类，以及未知名称返回 `null`。
- [ ] 先测试 `normalizeGearInventory()` 同时补齐旧 `status` 与旧 `systemSlug`，并保留已有合法值。
- [ ] 实现 `inferGearSystem()`、`updateGearItemSystem()` 和迁移回写判断。
- [ ] 运行 `node --test scripts/gear-inventory.test.mjs`，确认归类、移动、旧数据和既有增删改测试全部通过。

### Task 2: 六大系统卡交互

**Files:**
- Create: `src/components/GearInventorySystemCard.tsx`
- Modify: `src/components/GearInventory.tsx`
- Test: `scripts/gear-inventory-ui.test.mjs`

- [ ] 先测试页面复用 `getGearSystems()` 并渲染六个系统卡，而非硬编码另一份系统列表。
- [ ] 先测试系统卡包含系统内添加、空状态、已买到、编辑、更改系统和二次确认删除。
- [ ] 实现桌面 3×2、移动端单列的系统看板；穿着系统的装备列表在桌面内部使用双列。
- [ ] 系统卡的添加按钮直接写入当前 `status` 与该卡 `systemSlug`。
- [ ] 无法归类的旧装备显示“待归类”区域，选择系统后从该区域移入对应卡。
- [ ] 保留 owner 校验、同步写锁、跨状态全局重名校验和保存失败不提前更新 UI。
- [ ] 运行装备清单定向测试，确认新旧行为同时通过。

### Task 3: Apple Design 触感与可访问性

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/GearInventorySystemCard.tsx`
- Test: `scripts/gear-inventory-ui.test.mjs`

- [ ] 为可按压控件增加 pointer-down 即时缩放反馈。
- [ ] 为系统内添加区和锚定菜单增加 180ms 的轻微缩放淡入，菜单 `transform-origin` 指向触发按钮。
- [ ] 在 `prefers-reduced-motion: reduce` 下移除缩放和位移动画。
- [ ] 保持 forest/sand 色板、中文 UI、14px 以上装备名称和可见焦点状态，不使用 liquid-glass 或新增依赖。

### Task 4: 验证与收尾

**Files:**
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/DECISIONS.md`
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/OPEN_LOOPS.md`
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/STATUS.md`

- [ ] 运行 `node --test scripts/*.test.mjs`。
- [ ] 运行 `npx vite build`、`npm run build` 和 `git diff --check`，记录既有 TypeScript 阻塞。
- [ ] 在 Chrome 的 `http://127.0.0.1:5175/my-gear` 验证现有 19 件装备自动归类并刷新保留。
- [ ] 在 1440×900 验证六个系统与全部已有装备无需页面滚动即可扫视。
- [ ] 在 390×844 验证系统区块、添加、编辑、更改系统、已买到和删除。
- [ ] 独立代码审查后修复 Critical/Important 问题并重跑相关检查。
- [ ] 更新 Obliviate 并执行 `python3 .index/scripts/memory_index.py --scan`。

## Defaults

- “蛋巢屁垫”归入睡眠系统。
- 未识别历史装备使用 `systemSlug: null`，不猜测归属。
- 系统顺序和名称只读取 `gearSystems.ts`。
- 实现不自动提交，以免混入当前工作树中用户已有的未提交业务修改。
