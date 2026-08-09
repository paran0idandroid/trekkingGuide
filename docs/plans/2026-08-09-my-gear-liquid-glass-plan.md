# “我的装备”iOS Liquid Glass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `test-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `/my-gear` 升级为用户确认的 C·iOS 装备柜，让模块与所有按钮具备分层 Liquid Glass 材质和移动端原生反馈。

**Architecture:** 保留现有 React 组件边界、SQLite API 和装备业务逻辑，仅为装备页面增加一组局部 CSS 材质类，并把这些类映射到现有卡片、按钮、分段控件与面板。常驻玻璃只承担模块或浮层层级；密集装备名称按钮通过交互状态临时材质化，避免玻璃表面叠加。

**Tech Stack:** React 18、TypeScript 5、Tailwind CSS 3.4、现有 CSS、Node 内置测试、Vite 5

---

### Task 1: 为 Liquid Glass 视觉契约建立失败测试

**Files:**
- Modify: `scripts/gear-inventory-ui.test.mjs`

- [ ] **Step 1: 添加模块和按钮材质测试**

在现有 Apple 风格测试之后加入断言，要求页面使用以下局部类：

```js
assert.match(inventory, /gear-inventory-stage/);
assert.match(inventory, /gear-glass-primary/);
assert.match(inventory, /gear-glass-segment/);
assert.match(card, /gear-glass-module/);
assert.match(card, /gear-glass-item/);
assert.match(wanted, /gear-glass-check/);
assert.match(actions, /gear-glass-panel/);
assert.match(actions, /gear-glass-action/);
```

并检查 CSS 中存在玻璃边缘、模糊降级和交互状态：

```js
assert.match(styles, /\.gear-glass-module/);
assert.match(styles, /backdrop-filter:/);
assert.match(styles, /\.gear-glass-item\[aria-expanded='true'\]/);
assert.match(styles, /prefers-reduced-transparency: reduce/);
assert.match(styles, /prefers-contrast: more/);
```

- [ ] **Step 2: 运行 UI 测试并确认 RED**

Run:

```bash
node --test scripts/gear-inventory-ui.test.mjs
```

Expected: 新增 Liquid Glass 类断言失败，既有功能断言继续通过。

### Task 2: 建立装备页局部 Liquid Glass 材质系统

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: 添加环境背景和四级玻璃材质**

新增仅以 `gear-` 开头的类：

```css
.gear-inventory-stage { isolation: isolate; }
.gear-glass-module {
  border: 1px solid rgba(255, 255, 255, .76);
  background: rgba(255, 255, 255, .58);
  backdrop-filter: blur(20px) saturate(150%);
}
.gear-glass-primary {
  border: 1px solid rgba(255, 255, 255, .72);
  backdrop-filter: blur(16px) saturate(160%);
}
.gear-glass-segment { backdrop-filter: blur(18px) saturate(145%); }
.gear-glass-item { border: 1px solid transparent; }
.gear-glass-panel { backdrop-filter: blur(28px) saturate(165%); }
.gear-glass-action { border: 1px solid rgba(255, 255, 255, .62); }
```

所有颜色只使用现有 forest/sand 色板对应的 CSS 变量或透明白色，不引入新品牌色。玻璃类使用单一伪元素绘制高光边缘，并保持 `pointer-events: none`。

- [ ] **Step 2: 添加可交互状态**

```css
.gear-glass-primary:active,
.gear-glass-action:active,
.gear-glass-item:active { transform: scale(.98); }

.gear-glass-item:hover,
.gear-glass-item:focus-visible,
.gear-glass-item[aria-expanded='true'] {
  border-color: rgba(255, 255, 255, .72);
  background: rgba(255, 255, 255, .5);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .86), 0 4px 12px rgba(24, 64, 43, .08);
}
```

动效仅使用 `transform`、`opacity`、背景和边框；不新增循环动画或人为等待。

- [ ] **Step 3: 扩展无障碍降级**

在现有媒体查询中覆盖全部新类：

```css
@media (prefers-reduced-motion: reduce) {
  .gear-glass-primary:active,
  .gear-glass-action:active,
  .gear-glass-item:active { transform: none; }
}
@media (prefers-reduced-transparency: reduce) {
  .gear-glass-module,
  .gear-glass-panel { background: white; backdrop-filter: none; }
}
@media (prefers-contrast: more) {
  .gear-glass-module,
  .gear-glass-panel,
  .gear-glass-action { border-width: 2px; }
}
```

### Task 3: 将材质映射到现有装备组件

**Files:**
- Modify: `src/components/GearInventory.tsx`
- Modify: `src/components/GearInventorySystemCard.tsx`
- Modify: `src/components/WantedGearList.tsx`
- Modify: `src/components/GearItemActionPanel.tsx`

- [ ] **Step 1: 更新页面舞台、添加按钮和分段控件**

在 `GearInventory` 中：

```tsx
<section className="gear-inventory-stage ...">
<button className="gear-glass-primary gear-pressable ...">＋ 添加</button>
<div className="gear-glass-segment ..." role="tablist">
```

添加面板改用 `gear-glass-panel`；保存、取消和关闭按钮使用对应的 `gear-glass-primary` 或 `gear-glass-action`。

- [ ] **Step 2: 更新已有装备系统卡与名称按钮**

在 `GearInventorySystemCard` 中：

```tsx
<section className="gear-glass-module ...">
<button className="gear-glass-item gear-pressable ..." aria-expanded={...}>
```

图标底座与数量徽章使用轻量玻璃圆片；不改变密集双列规则和 44px 移动端命中区。

- [ ] **Step 3: 更新待购买按钮**

在 `WantedGearList` 中：

```tsx
<button className="gear-glass-check gear-glass-primary ..." aria-label={`标记 ${item.name} 为已买到`}>
<button className="gear-glass-item ..." aria-label={`操作 ${item.name}`}>
```

保持“已买到”的即时勾选反馈和保存成功后的列表移动。

- [ ] **Step 4: 更新共享操作面板**

在 `GearItemActionPanel` 中把面板根节点改为 `gear-glass-panel`，菜单、编辑、系统、状态移动、删除和关闭按钮改为 `gear-glass-action`。删除按钮继续叠加 sand 危险语义，不修改确认流程。

- [ ] **Step 5: 运行 UI 测试并确认 GREEN**

Run:

```bash
node --test scripts/gear-inventory-ui.test.mjs
```

Expected: 全部装备 UI 静态测试通过。

### Task 4: 回归验证与视觉 QA

**Files:**
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/STATUS.md`
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/DECISIONS.md`
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/OPEN_LOOPS.md`

- [ ] **Step 1: 运行装备相关测试**

```bash
node --test scripts/gear-inventory-ui.test.mjs scripts/gear-inventory.test.mjs scripts/gear-system-state.test.mjs
```

Expected: 30 项及新增 UI 测试全部通过。

- [ ] **Step 2: 运行全量测试与构建**

```bash
node --test scripts/*.test.mjs
npx vite build
git diff --check
```

Expected: 77 项及新增测试全部通过；Vite production build 和差异检查通过。`npm run build` 若仍失败，只允许出现既有 Three.js、GearAdvisorModal 和 `ImportMeta.env` 诊断。

- [ ] **Step 3: 执行浏览器 QA**

- 390×844：确认无横向溢出、所有触控区至少 44px、玻璃按钮反馈清楚、底部操作面板未被安全区域遮挡。
- 1440×900：确认 19 件已有装备仍一屏可见、长名称可读、锚定浮层不被卡片裁切。
- 操作回归：统一添加、切换标签、编辑、改系统、已买到、反向移动、删除确认、点外部和 Esc 关闭、刷新持久化。
- 无障碍回归：键盘焦点、减少动态、减少透明度和高对比模式。

- [ ] **Step 4: 合规与记忆收尾**

确认无新依赖、无数据库/API/类型改动、所有组件保持默认导出、用户文案为中文、颜色仅使用 forest/sand。记录视觉决策和 QA 结果后运行：

```bash
python3 .index/scripts/memory_index.py --scan
```

### Task 5: C·光学透镜二次增强与桌面满高舞台

**Files:**
- Modify: `scripts/gear-inventory-ui.test.mjs`
- Modify: `src/index.css`

- [ ] **Step 1: 添加光学透镜与桌面舞台失败测试**

在 Liquid Glass 测试中加入：

```js
assert.match(styles, /\.gear-inventory-stage::before/);
assert.match(styles, /min-height: calc\(100svh - 4rem\)/);
assert.match(styles, /\.gear-glass-module::after/);
assert.match(styles, /mix-blend-mode: screen/);
assert.match(styles, /blur\(25px\) saturate\(190%\)/);
assert.match(styles, /@media \(min-width: 1024px\)/);
```

- [ ] **Step 2: 运行测试并确认 RED**

```bash
node --test scripts/gear-inventory-ui.test.mjs
```

Expected: 光学透镜和桌面满高舞台断言失败，原有 15 项测试保持通过。

- [ ] **Step 3: 增强舞台环境光与桌面高度**

将舞台设置为导航下方的完整视口高度，并用伪元素增加可被玻璃采样的环境光带：

```css
.gear-inventory-stage {
  position: relative;
  min-height: calc(100svh - 4rem);
}

.gear-inventory-stage::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(circle at 88% 10%, rgba(77, 144, 102, .5), transparent 30%),
    radial-gradient(circle at 6% 88%, rgba(226, 191, 135, .4), transparent 28%),
    linear-gradient(145deg, rgba(200, 224, 209, .7), rgba(253, 248, 240, .76));
}
```

- [ ] **Step 4: 增强模块的双层亮边和色散**

降低模块白色遮盖率，把模糊提高到 25px / 190%，并新增不会接收指针事件的光学高光层：

```css
.gear-glass-module::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, .5), rgba(237, 245, 240, .22));
  backdrop-filter: blur(25px) saturate(190%);
}

.gear-glass-module::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(118deg, rgba(255, 255, 255, .7), transparent 22%, transparent 64%, rgba(111, 173, 133, .2), rgba(247, 237, 217, .3));
  mix-blend-mode: screen;
}
```

- [ ] **Step 5: 同步增强按钮、分段控件和浮层**

主按钮和选中指示器使用更亮边缘、更低不透明度和更深投影；面板保持较厚玻璃，不改变位置、尺寸或关闭规则：

```css
.gear-glass-primary {
  border-color: rgba(255, 255, 255, .9);
  background: linear-gradient(145deg, rgba(111, 173, 133, .84), rgba(26, 77, 62, .76));
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, .58), inset -1px -1px 0 rgba(8, 18, 14, .16), 0 12px 28px rgba(17, 47, 38, .26);
}

.gear-tab-indicator {
  border-color: rgba(255, 255, 255, .94);
  background: linear-gradient(135deg, rgba(255, 255, 255, .8), rgba(200, 224, 209, .34));
  box-shadow: inset 0 1px 0 white, 0 7px 18px rgba(17, 47, 38, .14);
}
```

所有增强继续受现有 reduced-motion、reduced-transparency 和 prefers-contrast 媒体查询覆盖。

- [ ] **Step 6: 添加桌面材质尺度**

```css
@media (min-width: 1024px) {
  .gear-inventory-stage { min-height: calc(100svh - 4rem); }
  .gear-glass-module { box-shadow: inset 1px 1px 0 rgba(255, 255, 255, .98), inset -1px -1px 0 rgba(26, 77, 62, .12), 0 16px 38px rgba(17, 47, 38, .15); }
}
```

- [ ] **Step 7: 运行测试、构建与桌面/移动端 QA**

```bash
node --test scripts/*.test.mjs
npx vite build
git diff --check
```

Expected: 全量测试、Vite production build 和差异检查通过；390×844 操作面板继续正确贴底，1440×900 的玻璃舞台延伸到视口底部且 19 件装备仍一屏可见。

### Task 6: 统一桌面内容区配色（已完成）

**Files:**
- Modify: `src/pages/MyGearPage.tsx`
- Modify: `src/components/GearInventory.tsx`
- Modify: `src/index.css`
- Test: `scripts/gear-inventory-ui.test.mjs`

- [x] **Step 1: 写入失败的页面结构测试**

在装备 UI 测试中读取 `MyGearPage.tsx`、`GearInventory.tsx` 和 `index.css`，加入以下断言：

```js
assert.match(page, /gear-page-environment/);
assert.match(styles, /\.gear-page-environment/);
assert.match(styles, /min-height:\s*100svh/);
assert.doesNotMatch(inventory, /rounded-\[2rem\]/);
assert.doesNotMatch(styles, /\.gear-inventory-stage::before/);
```

- [x] **Step 2: 运行测试并确认 RED**

```bash
node --test scripts/gear-inventory-ui.test.mjs
```

Expected: FAIL，缺少 `gear-page-environment`。

- [x] **Step 3: 将环境背景移到页面层**

`MyGearPage.tsx` 的 `main` 使用页面级环境背景：

```tsx
<main className="gear-page-environment min-h-screen">
  <GearInventory />
</main>
```

`GearInventory.tsx` 保留 `max-w-7xl` 内容宽度和内边距，删除 `rounded-[2rem]`：

```tsx
<section className="gear-inventory-stage mx-auto w-full max-w-7xl px-4 pb-12 pt-20 md:px-6 md:pt-24">
```

- [x] **Step 4: 使用现有色板创建全宽环境背景**

在 `index.css` 中删除 `.gear-inventory-stage::before`，让舞台只负责布局；新增页面级静态背景：

```css
.gear-page-environment {
  min-height: 100svh;
  background:
    radial-gradient(circle at 88% 7%, rgba(77, 144, 102, 0.52), transparent 30%),
    radial-gradient(circle at 12% 78%, rgba(226, 191, 135, 0.46), transparent 32%),
    linear-gradient(118deg, transparent 18%, rgba(162, 203, 175, 0.36) 38%, transparent 60%),
    linear-gradient(145deg, rgba(237, 245, 240, 0.96), rgba(247, 237, 217, 0.78));
}

.gear-inventory-stage {
  position: relative;
  isolation: isolate;
  min-height: calc(100svh - 4rem);
}
```

在 `prefers-reduced-transparency` 中将 `.gear-page-environment` 设置为实体 `rgb(237, 245, 240)`。

- [x] **Step 5: 验证测试与构建**

```bash
node --test scripts/gear-inventory-ui.test.mjs
node --test scripts/gear-inventory.test.mjs scripts/gear-inventory-ui.test.mjs scripts/gear-system-state.test.mjs
npx vite build
git diff --check
```

Expected: 装备 UI 15/15、相关测试 31/31、Vite production build 和差异检查通过。

- [x] **Step 6: 验证响应式视觉并收尾**

在 1440×900 检查导航仍为白色，内容背景铺满左右与底部，19 件已有装备仍在首屏；在 390×844 检查无横向溢出且底部面板保持可用。随后更新 Obliviate 的 `DECISIONS.md`、`STATUS.md` 并刷新索引。
