# 极简待购买装备清单实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use test-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将待购买标签改为统一单列清单，自动保存六大系统归属并允许手动修正，最后把用户提供的 25 件装备写入当前 IndexedDB。

**Architecture:** `GearInventory` 保持唯一的数据与持久化入口，根据活动标签选择已有装备系统看板或新的 `WantedGearList`。`WantedGearList` 只管理待购买的添加和条目交互；`inferGearSystem` 扩展本地关键词，不修改 IndexedDB 结构。

**Tech Stack:** React 18、TypeScript 5、Tailwind CSS 3.4、Node 内置测试、原生 IndexedDB、Vite 5。

---

### Task 1: 扩展待购买装备自动分类

**Files:**
- Modify: `scripts/gear-inventory.test.mjs`
- Modify: `src/lib/gearInventory.ts`

- [ ] **Step 1: 写失败测试**

新增 25 件待购买装备的系统映射：

```js
const wantedCases = [
  ['帐篷', 'shelter'],
  ['大容量充电宝', 'navigation-safety'],
  ['髌骨带', 'wear-movement'],
  ['地垫 地布', 'shelter'],
  ['睡垫 气垫 R值', 'sleep'],
  ['排骨羽绒', 'wear-movement'],
  ['背包罩', 'carry-storage'],
  ['宜家托运袋', 'carry-storage'],
  ['雨衣', 'wear-movement'],
  ['营地鞋', 'wear-movement'],
  ['钛杯', 'food-hydration'],
  ['钛餐具', 'food-hydration'],
  ['炉头', 'food-hydration'],
  ['防水pe袋 压缩袋', 'carry-storage'],
  ['气罐', 'food-hydration'],
  ['净水器 康迪', 'food-hydration'],
  ['药物 急救包', 'navigation-safety'],
  ['充气枕头', 'sleep'],
  ['北斗徽章', 'navigation-safety'],
  ['营地灯', 'navigation-safety'],
  ['大蛋巢', 'sleep'],
  ['保温杯', 'food-hydration'],
  ['3天补给', 'food-hydration'],
  ['湿纸巾', 'navigation-safety'],
  ['现金', 'navigation-safety'],
];
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test scripts/gear-inventory.test.mjs`

Expected: FAIL，现有关键词无法识别部分待购买装备。

- [ ] **Step 3: 最小扩展关键词**

在 `GEAR_SYSTEM_KEYWORDS` 对应系统中加入本次名称需要的明确关键词，不改变匹配算法或数据库。

- [ ] **Step 4: 运行逻辑测试**

Run: `node --test scripts/gear-inventory.test.mjs`

Expected: 11 tests PASS。

### Task 2: 建立极简待购买组件契约

**Files:**
- Modify: `scripts/gear-inventory-ui.test.mjs`
- Create: `src/components/WantedGearList.tsx`
- Modify: `src/components/GearInventory.tsx`

- [ ] **Step 1: 写失败的 UI 静态测试**

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

- [ ] **Step 2: 运行 UI 测试确认失败**

Run: `node --test scripts/gear-inventory-ui.test.mjs`

Expected: FAIL，因为 `WantedGearList.tsx` 尚不存在。

- [ ] **Step 3: 新建 `WantedGearList`**

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

- [ ] **Step 4: 集成到 `GearInventory`**

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

- [ ] **Step 5: 运行定向测试**

Run: `node --test scripts/gear-inventory.test.mjs scripts/gear-inventory-ui.test.mjs`

Expected: 全部 PASS。

### Task 3: 写入用户清单并完成 QA

**Files:**
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/STATUS.md`
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/DECISIONS.md`
- Modify: `/Users/jon/Documents/Obliviate/10_User/Preferences.md`

- [ ] **Step 1: 自动化回归**

Run:

```bash
node --test scripts/*.test.mjs
npx vite build
npm run build
git diff --check
```

Expected: Node、Vite 和 diff check 通过；完整 build 只允许既有 `GearAdvisorModal` 与 `ImportMeta.env` 诊断。

- [ ] **Step 2: 浏览器写入 25 件装备**

在当前 `/my-gear` 的待购买标签，通过统一添加入口逐项新增用户清单；若出现“清单中已有该装备”，跳过该项并保留原数据。

- [ ] **Step 3: 浏览器验证**

在 1440×900 与 390×844 验证：

- 待购买页面没有六大系统板块。
- 25 件装备显示并在刷新后保留。
- 新增、编辑、手动改系统、已买到和删除确认正常。
- 已买到后进入已有装备的自动分类系统。
- 移动端无横向溢出且触控目标不少于 44px。

- [ ] **Step 4: 合规与代码审查**

确认只用 forest/sand 色板、中文 UI、默认组件导出、无新依赖；独立审查后修复全部 Critical/Important。

- [ ] **Step 5: 记忆收尾**

更新决策、状态和用户偏好，然后运行：

```bash
python3 .index/scripts/memory_index.py --scan
```
