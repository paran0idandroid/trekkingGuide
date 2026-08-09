import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('六大系统图标使用原创内联 SVG 且不含渐变或 Emoji', async () => {
  const source = await readFile(new URL('src/components/GearSystemIcon.tsx', root), 'utf8');

  for (const slug of [
    'carry-storage',
    'shelter',
    'sleep',
    'wear-movement',
    'food-hydration',
    'navigation-safety',
  ]) {
    assert.match(source, new RegExp(`['"]${slug}['"]`));
  }

  assert.doesNotMatch(source, /linearGradient|filter=|[🎒🥾🧥🛌⛺💡🍳💧🩹]/u);
});

test('装备首页通过系统查询入口渲染六大系统', async () => {
  const source = await readFile(new URL('src/pages/GearKnowledgePage.tsx', root), 'utf8');

  assert.match(source, /getGearSystems/);
  assert.match(source, /GearSystemCard/);
  assert.match(source, /徒步装备由六大系统组成/);
});

test('系统详情页使用 URL 恢复装备与三个固定标签', async () => {
  const [app, page] = await Promise.all([
    readFile(new URL('src/App.tsx', root), 'utf8'),
    readFile(new URL('src/pages/GearSystemPage.tsx', root), 'utf8'),
  ]);

  assert.match(app, /gear-knowledge\/:systemSlug/);
  assert.match(page, /useSearchParams/);
  assert.match(page, /onKeyDown/);
  assert.match(page, /aria-controls="gear-detail-panel"/);
  assert.match(page, /id="gear-detail-panel"/);
  assert.match(page, /role="tabpanel"/);
  assert.match(page, /tabIndex=/);
  assert.match(page, /focus-visible:ring/);
  assert.match(page, /认识装备/);
  assert.match(page, /怎么选/);
  assert.match(page, /产品参考/);
  assert.match(page, /getProductsByCategory/);
  assert.match(page, /if \(knowledgeId === selectedKnowledgeId\) return/);
  assert.match(page, /if \(tab === selectedTab\) return/);
  assert.match(page, /aria-current=\{active \? 'true' : undefined\}/);
});

test('装备详情路由保持顶部装备知识导航激活', async () => {
  const nav = await readFile(new URL('src/components/Nav.tsx', root), 'utf8');

  assert.match(nav, /pathname\.startsWith\('\/gear-knowledge'\)/);
  assert.match(nav, /const useLightNav = scrolled \|\| location\.pathname\.startsWith\('\/gear-knowledge'\)/);
});
