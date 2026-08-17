import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('应用注册我的装备路由并在顶部导航提供浅色入口', async () => {
  const [app, nav] = await Promise.all([
    readFile(new URL('src/App.tsx', root), 'utf8'),
    readFile(new URL('src/components/Nav.tsx', root), 'utf8'),
  ]);

  assert.match(app, /MyGearPage/);
  assert.match(app, /path="\/my-gear"/);
  assert.match(nav, /label: '我的装备', href: '\/my-gear'/);
  assert.match(nav, /pathname === '\/my-gear'/);
  assert.match(nav, /location\.pathname\.startsWith\('\/gear-knowledge'\) \|\| location\.pathname === '\/my-gear'/);
});

test('我的装备页面使用单机单用户清单', async () => {
  const page = await readFile(new URL('src/pages/MyGearPage.tsx', root), 'utf8');

  assert.match(page, /export default function MyGearPage/);
  assert.doesNotMatch(page, /useAuth|user\?\.phone|guest/);
  assert.doesNotMatch(page, /Navigate|to="\/auth"/);
  assert.match(page, /<GearInventory \/>/);
});

test('装备清单显示已有与待购买标签并提供统一添加面板', async () => {
  const component = await readFile(new URL('src/components/GearInventory.tsx', root), 'utf8');

  assert.match(component, /export default function GearInventory/);
  assert.match(component, /我的装备/);
  assert.match(component, /已有装备/);
  assert.match(component, /待购买/);
  assert.match(component, /已有 \{ownedItems\.length\} · 待购买 \{wantedItems\.length\}/);
  assert.match(component, /activeStatus === 'owned'/);
  assert.match(component, /WantedGearList/);
  assert.match(component, /添加到\{activeStatus === 'owned' \? '已有装备' : '待购买'\}/);
  assert.match(component, /addItem\(newName, inferGearSystem\(newName\)\)/);
  assert.match(component, /gear-add-surface/);
  assert.match(component, /gear-scrim/);
});

test('装备清单支持已买到、状态移动、编辑和确认删除', async () => {
  const [inventory, card, actions] = await Promise.all([
    readFile(new URL('src/components/GearInventory.tsx', root), 'utf8'),
    readFile(new URL('src/components/GearInventorySystemCard.tsx', root), 'utf8'),
    readFile(new URL('src/components/GearItemActionPanel.tsx', root), 'utf8'),
  ]);
  const component = inventory + card + actions;

  assert.match(component, /已买到/);
  assert.match(component, /移到待购买/);
  assert.match(component, /updateGearItemStatus/);
  assert.match(component, /\.key === 'Enter'/);
  assert.match(component, /\.key === 'Escape'/);
  assert.match(component, /确认删除/);
  assert.match(component, /取消/);
  assert.match(component, /aria-label=\{`操作 \$\{item\.name\}`\}/);
  assert.match(component, /aria-expanded=\{openMenuId === item\.id\}/);
  assert.match(component, /GearItemActionPanel/);
  assert.match(inventory, /const \[openActionId, setOpenActionId\] = useState<string \| null>\(null\)/);
  assert.match(component, /onOpenItemChange\(openMenuId === item\.id \? null : item\.id\)/);
  assert.match(actions, /role="dialog"/);
  assert.match(actions, /document\.addEventListener\('keydown'/);
  assert.match(actions, /event\.key === 'Escape'/);
  assert.match(component, /min-h-11 min-w-0 flex-1 truncate/);
  assert.match(component, /focus-visible:ring-forest-500/);
  assert.ok((actions.match(/autoFocus/g) ?? []).length >= 2);
  assert.doesNotMatch(component, /aria-label="更多操作"/);
  assert.doesNotMatch(component, />\s*···\s*</);
  assert.match(component, /useEffect/);
  assert.match(component, /await getGearInventory/);
  assert.match(component, /await saveGearInventory/);
  assert.match(component, /正在加载装备清单/);
});

test('装备操作面板支持点击外部与遮罩关闭', async () => {
  const components = await Promise.all([
    readFile(new URL('src/components/GearInventorySystemCard.tsx', root), 'utf8'),
    readFile(new URL('src/components/WantedGearList.tsx', root), 'utf8'),
  ]);

  for (const component of components) {
    assert.match(component, /actionAreaRefs/);
    assert.match(component, /document\.addEventListener\('pointerdown'/);
    assert.match(component, /document\.removeEventListener\('pointerdown'/);
    assert.match(component, /\.contains\(event\.target\)/);
    assert.match(component, /onOpenItemChange\(null\)/);
  }

  const actions = await readFile(new URL('src/components/GearItemActionPanel.tsx', root), 'utf8');
  assert.match(actions, /gear-scrim/);
  assert.match(actions, /onPointerDown=\{onClose\}/);
  assert.match(actions, /gear-action-surface/);
});

test('装备清单不再依赖手机号或浏览器所有者', async () => {
  const component = await readFile(new URL('src/components/GearInventory.tsx', root), 'utf8');

  assert.match(component, /export default function GearInventory\(\)/);
  assert.doesNotMatch(component, /GearInventoryProps|ownerRef|phone/);
});

test('装备清单使用同步写锁避免重叠保存', async () => {
  const component = await readFile(new URL('src/components/GearInventory.tsx', root), 'utf8');

  assert.match(component, /const isSavingRef = useRef\(false\)/);
  assert.match(component, /if \(isSavingRef\.current\) return false/);
  assert.match(component, /isSavingRef\.current = true/);
  assert.match(component, /isSavingRef\.current = false/);
  assert.match(component, /disabled=\{isSaving\}/);
});

test('我的装备复用六大装备系统并渲染系统看板', async () => {
  const component = await readFile(new URL('src/components/GearInventory.tsx', root), 'utf8');

  assert.match(component, /getGearSystems/);
  assert.match(component, /GearInventorySystemCard/);
  assert.match(component, /grid-cols-1/);
  assert.match(component, /lg:grid-cols-3/);
  assert.doesNotMatch(component, /const inventorySystems =/);
});

test('待购买使用独立极简单列清单', async () => {
  const [inventory, wanted] = await Promise.all([
    readFile(new URL('src/components/GearInventory.tsx', root), 'utf8'),
    readFile(new URL('src/components/WantedGearList.tsx', root), 'utf8').catch(() => ''),
  ]);

  assert.match(inventory, /activeStatus === 'owned'/);
  assert.match(inventory, /WantedGearList/);
  assert.match(inventory, /inferGearSystem/);
  assert.match(wanted, /export default function WantedGearList/);
  assert.match(wanted, /已买到/);
  assert.match(wanted, /GearItemActionPanel/);
  assert.match(wanted, /gear-owned-check/);
  assert.match(wanted, /aria-label=\{`操作 \$\{item\.name\}`\}/);
  assert.match(wanted, /focus-visible:ring-forest-500/);
  assert.doesNotMatch(wanted, /添加待购买装备|representativeItems|getGearSystems\(\)\.map/);
});

test('系统卡使用原创图标、紧凑空状态和共享装备操作面板', async () => {
  const card = await readFile(
    new URL('src/components/GearInventorySystemCard.tsx', root),
    'utf8',
  ).catch(() => '');

  assert.match(card, /export default function GearInventorySystemCard/);
  assert.match(card, /GearSystemIcon/);
  assert.match(card, /暂无装备/);
  assert.match(card, /items\.length >= 6/);
  assert.match(card, /GearItemActionPanel/);
  assert.match(card, /gear-item-dot/);
  assert.doesNotMatch(card, /添加到\{system\.name\}|isAdding|newName/);
  assert.match(card, /gear-pressable/);
});

test('无法归类的旧装备显示待归类入口', async () => {
  const component = await readFile(new URL('src/components/GearInventory.tsx', root), 'utf8');

  assert.match(component, /待归类/);
  assert.match(component, /systemSlug === null/);
  assert.match(component, /updateGearItemSystem/);
});

test('装备清单通过本地 API 持久化', async () => {
  const service = await readFile(new URL('src/lib/gearInventory.ts', root), 'utf8');

  assert.match(service, /const GEAR_API_URL = '\/api\/gear'/);
  assert.match(service, /fetch\(GEAR_API_URL/);
  assert.match(service, /method: 'PUT'/);
  assert.doesNotMatch(service, /indexedDB|createObjectStore|getItem|removeItem/);
});

test('装备页面提供 Apple 式即时反馈和减少动态效果', async () => {
  const styles = await readFile(new URL('src/index.css', root), 'utf8');

  assert.match(styles, /\.gear-pressable:active/);
  assert.match(styles, /\.gear-tab-indicator/);
  assert.match(styles, /\.gear-action-surface/);
  assert.match(styles, /\.gear-sheet-enter/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(styles, /prefers-reduced-transparency: reduce/);
  assert.match(styles, /prefers-contrast: more/);
});

test('装备模块与所有按钮使用分层 Liquid Glass 材质', async () => {
  const [page, inventory, card, wanted, actions, styles] = await Promise.all([
    readFile(new URL('src/pages/MyGearPage.tsx', root), 'utf8'),
    readFile(new URL('src/components/GearInventory.tsx', root), 'utf8'),
    readFile(new URL('src/components/GearInventorySystemCard.tsx', root), 'utf8'),
    readFile(new URL('src/components/WantedGearList.tsx', root), 'utf8'),
    readFile(new URL('src/components/GearItemActionPanel.tsx', root), 'utf8'),
    readFile(new URL('src/index.css', root), 'utf8'),
  ]);

  assert.match(inventory, /gear-inventory-stage/);
  assert.match(page, /gear-page-environment/);
  assert.match(styles, /\.gear-page-environment/);
  assert.match(styles, /min-height:\s*100svh/);
  assert.doesNotMatch(inventory, /rounded-\[2rem\]/);
  assert.doesNotMatch(styles, /\.gear-inventory-stage::before/);
  assert.match(inventory, /gear-glass-primary/);
  assert.match(inventory, /gear-glass-segment/);
  assert.match(card, /gear-glass-module/);
  assert.match(card, /openMenuId \? 'z-30'/);
  assert.match(card, /gear-glass-item/);
  assert.match(wanted, /gear-glass-check/);
  assert.match(wanted, /openMenuId \? 'z-30'/);
  assert.match(actions, /gear-glass-panel/);
  assert.match(actions, /gear-glass-action/);
  assert.match(styles, /\.gear-glass-module/);
  assert.match(styles, /\.gear-glass-module::before[\s\S]*backdrop-filter:/);
  assert.match(styles, /min-height:\s*calc\(100svh - 4rem\)/);
  assert.match(styles, /\.gear-glass-module::after/);
  assert.match(styles, /mix-blend-mode:\s*screen/);
  assert.match(styles, /blur\(25px\) saturate\(190%\)/);
  assert.match(styles, /@media \(min-width:\s*1024px\)/);
  assert.match(styles, /backdrop-filter:/);
  assert.match(styles, /\.gear-glass-item\[aria-expanded='true'\]/);
  assert.match(styles, /\.gear-glass-primary:active/);
  assert.match(styles, /prefers-reduced-transparency: reduce/);
  assert.match(styles, /prefers-contrast: more/);
});
