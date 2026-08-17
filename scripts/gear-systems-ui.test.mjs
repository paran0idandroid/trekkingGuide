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

test('装备知识首页与系统详情共享环境背景和选择性玻璃层级', async () => {
  const [knowledgePage, systemPage, systemCard] = await Promise.all([
    readFile(new URL('src/pages/GearKnowledgePage.tsx', root), 'utf8'),
    readFile(new URL('src/pages/GearSystemPage.tsx', root), 'utf8'),
    readFile(new URL('src/components/GearSystemCard.tsx', root), 'utf8'),
  ]);

  assert.match(knowledgePage, /gear-page-environment/);
  assert.match(knowledgePage, /gear-glass-module/);
  assert.match(knowledgePage, /gear-glass-primary/);
  assert.match(systemCard, /gear-glass-module/);
  assert.match(systemCard, /gear-pressable/);

  assert.match(systemPage, /gear-page-environment/);
  assert.match(systemPage, /gear-glass-chip/);
  assert.match(systemPage, /gear-glass-module/);
  assert.match(systemPage, /gear-glass-segment/);
  assert.match(systemPage, /gear-tab-indicator/);
  assert.match(systemPage, /gear-glass-action/);
  assert.match(systemPage, /gear-pressable/);
  assert.match(systemPage, /gear-glass-module[^\"]*md:sticky/);
  assert.doesNotMatch(systemPage, /gear-glass-module sticky/);
});

test('装备顾问统一为浅色玻璃且保留四步问答逻辑', async () => {
  const advisor = await readFile(new URL('src/components/GearAdvisorModal.tsx', root), 'utf8');

  assert.match(advisor, /gear-glass-panel/);
  assert.match(advisor, /gear-glass-action/);
  assert.match(advisor, /gear-glass-primary/);
  assert.match(advisor, /gear-pressable/);
  assert.match(advisor, /bg-forest-900\/30/);
  assert.match(advisor, /role="dialog"/);
  assert.match(advisor, /aria-modal="true"/);
  assert.equal((advisor.match(/question: '/g) ?? []).length, 4);
  assert.match(advisor, /step < steps\.length - 1/);
  assert.match(advisor, /setShowResult\(true\)/);
  assert.match(advisor, /handleRestart/);
  assert.match(advisor, /setStep\(0\)/);
  assert.match(advisor, /setAnswers\(\{\}\)/);
  assert.match(advisor, /event\.key === 'Escape'/);
  assert.match(advisor, /event\.key !== 'Tab'/);
  assert.match(advisor, /previousFocus\?\.focus\(\)/);
  assert.match(advisor, /dialogRef\.current\?\.querySelector/);
  assert.doesNotMatch(advisor, /bg-black\/80|liquid-glass(?:-btn)?\b|text-white\/|bg-white\/|cyan-|amber-|rose-/);
});

test('装备知识玻璃体验保留键盘与辅助显示模式', async () => {
  const [systemPage, styles] = await Promise.all([
    readFile(new URL('src/pages/GearSystemPage.tsx', root), 'utf8'),
    readFile(new URL('src/index.css', root), 'utf8'),
  ]);

  assert.match(systemPage, /min-h-11/);
  assert.match(systemPage, /onKeyDown=\{event => handleTabKeyDown/);
  assert.match(systemPage, /focus-visible:ring/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(styles, /prefers-reduced-transparency: reduce/);
  assert.match(styles, /prefers-contrast: more/);
});
