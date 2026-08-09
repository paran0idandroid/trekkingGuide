# 极简待购买装备清单实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use test-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将待购买标签改为统一单列清单，自动保存六大系统归属并允许手动修正，最后通过页面把用户提供的装备批次写入当前 IndexedDB。

**Architecture:** `GearInventory` 保持唯一的数据与持久化入口，根据活动标签选择已有装备系统看板或新的 `WantedGearList`。`WantedGearList` 只管理待购买的添加和条目交互；`inferGearSystem` 扩展本地关键词，不修改 IndexedDB 结构。

**Tech Stack:** React 18、TypeScript 5、Tailwind CSS 3.4、Node 内置测试、原生 IndexedDB、Vite 5。

---

### Task 1: 扩展待购买装备自动分类

**Files:**
- Modify: `scripts/gear-inventory.test.mjs`
- Modify: `src/lib/gearInventory.ts`

- [x] **Step 1: 写失败测试**

使用不包含用户个人清单的合成名称覆盖六大系统关键词：

```js
const wantedCases = [
  ['测试四季帐篷', 'shelter'],
  ['备用充电宝', 'navigation-safety'],
  ['运动髌骨带', 'wear-movement'],
  ['轻量气垫', 'sleep'],
  ['旅行托运袋', 'carry-storage'],
  ['露营钛餐具', 'food-hydration'],
];
```

- [x] **Step 2: 运行测试确认失败**

Run: `node --test scripts/gear-inventory.test.mjs`

Expected: FAIL，现有关键词无法识别部分待购买装备。

- [x] **Step 3: 最小扩展关键词**

在 `GEAR_SYSTEM_KEYWORDS` 对应系统中加入本次名称需要的明确关键词，不改变匹配算法或数据库。

- [x] **Step 4: 运行逻辑测试**

Run: `node --test scripts/gear-inventory.test.mjs`

Expected: 13 tests PASS。

### Task 2: 建立极简待购买组件契约

**Files:**
- Modify: `scripts/gear-inventory-ui.test.mjs`
- Create: `src/components/WantedGearList.tsx`
- Modify: `src/components/GearInventory.tsx`

- [x] **Step 1: 写失败的 UI 静态测试**

断言：

```js
assert.match(inventory, /activeStatus === 'owned'/);
assert.match(inventory, /WantedGearList/);
assert.match(wanted, /export default function WantedGearList/);
assert.match(wanted, /添加待购买装备/);
assert.match(wanted, /已买到/);
assert.match(wanted, /编辑名称/);
assert.match(wanted, /更改系统/);
assert.match(wanted, /确认删除/);
assert.doesNotMatch(wanted, /representativeItems|getGearSystems\(\)\.map/);
```

- [x] **Step 2: 运行 UI 测试确认失败**

Run: `node --test scripts/gear-inventory-ui.test.mjs`

Expected: FAIL，因为 `WantedGearList.tsx` 尚不存在。

- [x] **Step 3: 新建 `WantedGearList`**

组件 Props：

```ts
interface WantedGearListProps {
  items: GearInventoryItem[];
  systems: GearSystem[];
  isSaving: boolean;
  onAdd: (name: string) => Promise<string | null>;
  onRename: (id: string, name: string) => Promise<string | null>;
  onMoveOwned: (id: string) => Promise<boolean>;
  onMoveSystem: (id: string, systemSlug: GearSystemSlug) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}
```

实现统一输入框、单列条目、名称操作层、编辑、系统选择、“已买到”和删除确认；复用现有焦点、触控和 `gear-surface-enter` 规则。

- [x] **Step 4: 集成到 `GearInventory`**

将新增方法改为允许 `GearSystemSlug | null`，并增加：

```ts
const addWantedItem = (name: string) => addItem(name, inferGearSystem(name));
```

渲染规则：

```tsx
activeStatus === 'owned'
  ? <已有装备六大系统看板 />
  : <WantedGearList items={wantedItems} ... />
```

- [x] **Step 5: 运行定向测试**

Run: `node --test scripts/gear-inventory.test.mjs scripts/gear-inventory-ui.test.mjs`

Expected: 全部 PASS。

### Task 3: 写入用户清单并完成 QA

**Files:**
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/STATUS.md`
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/DECISIONS.md`
- Modify: `/Users/jon/Documents/Obliviate/10_User/Preferences.md`

- [x] **Step 1: 自动化回归**

Run:

```bash
node --test scripts/*.test.mjs
npx vite build
npm run build
git diff --check
```

Expected: Node、Vite 和 diff check 通过；完整 build 只允许既有 `GearAdvisorModal` 与 `ImportMeta.env` 诊断。

- [x] **Step 2: 浏览器写入用户装备批次**

在当前 `/my-gear` 的待购买标签，通过统一添加入口逐项新增用户清单；若出现“清单中已有该装备”，跳过该项并保留原数据。

- [x] **Step 3: 浏览器验证**

在 1440×900 与 390×844 验证：

- 待购买页面没有六大系统板块。
- 25 件装备显示并在刷新后保留。
- 新增、编辑、手动改系统、已买到和删除确认正常。
- 已买到后进入已有装备的自动分类系统。
- 移动端无横向溢出且触控目标不少于 44px。

- [x] **Step 4: 合规与代码审查**

确认只用 forest/sand 色板、中文 UI、默认组件导出、无新依赖；独立审查后修复全部 Critical/Important。

- [x] **Step 5: 记忆收尾**

更新决策、状态和用户偏好，然后运行：

```bash
python3 .index/scripts/memory_index.py --scan
```

**完成结果：** 全量 Node 测试 69 项与 Vite production build 通过；新增行为测试覆盖 IndexedDB 用户隔离、重新读取和迁移失败保留旧数据；浏览器在 1440×900 和 390×844 下完成写入、刷新持久化、手动改系统入口及“已买到”归位验证；完整 TypeScript build 仍仅有既有诊断。
