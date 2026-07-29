# 装备名称操作入口实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use test-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除装备条目的三个点按钮，让装备名称直接打开和关闭原有操作层。

**Architecture:** 仅调整 `GearInventorySystemCard` 的条目触发器，不改变既有状态机、操作回调或 IndexedDB 数据流。装备名称从文本节点改为带 `aria-expanded` 的按钮，复用 `openMenuId` 控制操作层；待购买的“已买到”保持独立。

**Tech Stack:** React 18、TypeScript 5、Tailwind CSS 3.4、Node 内置测试、Vite 5。

---

### Task 1: 锁定名称操作入口契约

**Files:**
- Modify: `scripts/gear-inventory-ui.test.mjs`
- Test: `scripts/gear-inventory-ui.test.mjs`

- [ ] **Step 1: 更新失败测试**

在“系统卡支持系统内添加、空状态和装备操作”测试中增加：

```js
assert.match(card, /aria-label=\{`操作 \$\{item\.name\}`\}/);
assert.match(card, /aria-expanded=\{openMenuId === item\.id\}/);
assert.doesNotMatch(card, /aria-label="更多操作"/);
assert.doesNotMatch(card, />\\s*···\\s*</);
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test scripts/gear-inventory-ui.test.mjs`

Expected: FAIL，因为组件仍包含“更多操作”和三个点按钮。

### Task 2: 将名称改为操作触发器

**Files:**
- Modify: `src/components/GearInventorySystemCard.tsx`
- Test: `scripts/gear-inventory-ui.test.mjs`

- [ ] **Step 1: 实现最小交互修改**

把名称文本和三个点按钮替换为一个名称按钮：

```tsx
<button
  type="button"
  aria-label={`操作 ${item.name}`}
  aria-expanded={openMenuId === item.id}
  onClick={() => {
    setOpenMenuId(openMenuId === item.id ? null : item.id);
    setPendingDeleteId(null);
  }}
  title={item.name}
  className="gear-pressable min-h-11 min-w-0 flex-1 truncate rounded-lg px-0 text-left text-sm text-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-100 sm:min-h-0"
>
  {item.name}
</button>
```

待购买条目继续在名称按钮后显示“已买到”；操作层继续由 `openMenuId` 渲染。

- [ ] **Step 2: 运行定向测试确认通过**

Run: `node --test scripts/gear-inventory-ui.test.mjs scripts/gear-inventory.test.mjs`

Expected: 22 tests PASS。

### Task 3: 回归与交付

**Files:**
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/STATUS.md`
- Modify: `/Users/jon/Documents/Obliviate/10_User/Preferences.md`

- [ ] **Step 1: 运行自动化回归**

Run:

```bash
node --test scripts/*.test.mjs
npx vite build
npm run build
git diff --check
```

Expected: 全量 Node 测试、Vite build 和 diff check 通过；若 `npm run build` 仍失败，只允许出现既有的 `GearAdvisorModal` 与 `ImportMeta.env` 诊断。

- [ ] **Step 2: 浏览器验证**

在 1440×900 和 390×844 下验证：

- 页面没有三个点按钮。
- 点击装备名称能打开和关闭操作层。
- 编辑、更改系统、状态移动和删除确认正常。
- 移动端名称按钮高度至少 44px且无横向溢出。
- 桌面端 19 件装备仍在一屏内。

- [ ] **Step 3: 合规检查与独立审查**

确认仅使用 forest/sand 色板、中文 UI、默认组件导出且未新增依赖；完成独立代码审查并修复所有 Critical/Important。

- [ ] **Step 4: 更新记忆并刷新索引**

记录 UI 精简结果和 QA，然后运行：

```bash
python3 .index/scripts/memory_index.py --scan
```
