# 装备操作弹窗点击外部关闭实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use test-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让已有装备和待购买装备的操作弹窗在点击当前装备操作区域之外时立即关闭。

**Architecture:** 两个清单组件各自保存装备行 DOM 引用，并仅在弹窗打开时注册 `document.pointerdown` 监听。事件落在当前装备名称或弹窗内部时保持打开，落在其他位置时关闭；不改变编辑、改系统或删除确认状态。

**Tech Stack:** React 18、TypeScript 5、Node 内置测试、Vite 5。

---

## 文件职责

- Modify `scripts/gear-inventory-ui.test.mjs`：增加两个清单都实现外部点击关闭与监听清理的结构契约。
- Modify `src/components/GearInventorySystemCard.tsx`：已有装备操作弹窗的外部点击检测。
- Modify `src/components/WantedGearList.tsx`：待购买装备操作弹窗的外部点击检测。
- Modify `/Users/jon/Documents/Obliviate/20_Projects/justdemo/STATUS.md`：记录 QA 结果。
- Modify `/Users/jon/Documents/Obliviate/10_User/Preferences.md`：记录弹出交互应支持点击外部关闭的偏好。

### Task 1: 两类装备弹窗支持点击外部关闭

**Files:**
- Modify: `scripts/gear-inventory-ui.test.mjs`
- Modify: `src/components/GearInventorySystemCard.tsx`
- Modify: `src/components/WantedGearList.tsx`

- [x] **Step 1: 写失败测试**

在 `scripts/gear-inventory-ui.test.mjs` 新增：

```js
test('装备操作弹窗点击当前装备区域外后关闭', async () => {
  const components = await Promise.all([
    readFile(new URL('src/components/GearInventorySystemCard.tsx', root), 'utf8'),
    readFile(new URL('src/components/WantedGearList.tsx', root), 'utf8'),
  ]);

  for (const component of components) {
    assert.match(component, /actionAreaRefs/);
    assert.match(component, /document\.addEventListener\('pointerdown'/);
    assert.match(component, /document\.removeEventListener\('pointerdown'/);
    assert.match(component, /\.contains\(event\.target\)/);
    assert.match(component, /setOpenMenuId\(null\)/);
  }
});
```

- [x] **Step 2: 运行测试确认失败**

Run: `node --test scripts/gear-inventory-ui.test.mjs`  
Expected: FAIL，两个组件尚无 `actionAreaRefs` 或 `pointerdown` 监听。

- [x] **Step 3: 实现最小外部点击检测**

两个组件均使用现有 React import 中的 `useEffect`、`useRef` 和 `useState`。新增装备行引用：

```ts
const actionAreaRefs = useRef<Record<string, HTMLDivElement | null>>({});
```

仅在弹窗打开时监听：

```ts
useEffect(() => {
  if (!openMenuId) return;

  const handlePointerDown = (event: PointerEvent) => {
    const actionArea = actionAreaRefs.current[openMenuId];
    if (event.target instanceof Node && actionArea?.contains(event.target)) return;
    setOpenMenuId(null);
  };

  document.addEventListener('pointerdown', handlePointerDown);
  return () => document.removeEventListener('pointerdown', handlePointerDown);
}, [openMenuId]);
```

在两个组件的 `items.map()` 顶层装备行元素上保存引用：

```tsx
ref={element => {
  actionAreaRefs.current[item.id] = element;
}}
```

已有装备组件保留现有 `activeStatus` effect；待购买组件把 React import 补为 `useEffect, useRef, useState`。不添加遮罩层，不让外部点击取消编辑、改系统或删除确认。

- [x] **Step 4: 运行目标测试确认通过**

Run: `node --test scripts/gear-inventory-ui.test.mjs`  
Expected: PASS。

- [x] **Step 5: 运行全量自动化验证**

```bash
node --test scripts/*.test.mjs
npx vite build
git diff --check
```

Expected: 全量 Node 测试、Vite production build 和差异格式检查通过。

### Task 2: 浏览器 QA 与记忆收尾

**Files:**
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/STATUS.md`
- Modify: `/Users/jon/Documents/Obliviate/10_User/Preferences.md`

- [x] **Step 1: 桌面浏览器验证**

在 `http://localhost:58514/my-gear` 验证：

1. 已有装备：点击名称打开弹窗，点击页面标题或另一张系统卡空白处后关闭。
2. 点击弹窗内部“编辑名称”，正常进入行内编辑，不被提前关闭。
3. 待购买：点击名称打开弹窗，点击输入框或清单外区域后关闭。
4. 重复点击同一装备名称仍可关闭；点击另一装备名称可直接切换弹窗。

- [x] **Step 2: 移动端验证**

在 390×844 下重复已有装备与待购买的打开、外部点击关闭和内部操作，确认触控正常且无横向溢出。

- [x] **Step 3: 合规扫描与代码审查**

确认只修改两个组件和相关测试；无新依赖、无新颜色、中文 UI 未变化、组件仍为默认导出。完成独立代码审查并修复 Critical/Important。

- [x] **Step 4: 更新记忆并刷新索引**

在 STATUS 记录浏览器和自动化 QA；在 Preferences 记录“弹出操作应支持点击页面其他位置关闭”。运行：

```bash
python3 .index/scripts/memory_index.py --scan
```
