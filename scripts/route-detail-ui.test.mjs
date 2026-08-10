import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('路线详情切换时立即回到地图顶部', async () => {
  const routePage = await readFile(new URL('src/pages/RoutePage.tsx', root), 'utf8');

  assert.match(routePage, /useLayoutEffect/);
  assert.match(routePage, /document\.documentElement\.scrollTop\s*=\s*0/);
  assert.match(routePage, /document\.body\.scrollTop\s*=\s*0/);
  assert.match(routePage, /\[routeSlug\]/);
});

test('路线详情移除重复摘要条和路线装备清单模块', async () => {
  const [routePage, gearKnowledgePage] = await Promise.all([
    readFile(new URL('src/pages/RoutePage.tsx', root), 'utf8'),
    readFile(new URL('src/pages/GearKnowledgePage.tsx', root), 'utf8'),
  ]);

  assert.doesNotMatch(routePage, /GearAdvisor|overview\.distance.*middot|生成装备清单/);
  assert.match(gearKnowledgePage, /GearAdvisorModal/);
  assert.match(gearKnowledgePage, /帮我判断需要什么装备/);

  const removedFiles = [
    'src/components/GearAdvisor.tsx',
    'src/components/GearQuiz.tsx',
    'src/components/GearResults.tsx',
    'src/data/routeProfiles.ts',
    'src/lib/gearEngine.ts',
  ];
  for (const path of removedFiles) {
    await assert.rejects(access(new URL(path, root)), { code: 'ENOENT' });
  }
});

test('路线概况保持四卡布局并使用清晰的不换行数据层级', async () => {
  const overview = await readFile(new URL('src/components/Overview.tsx', root), 'utf8');

  assert.match(overview, /label: '路线难度'.*note: route\.overview\.suitableFor/s);
  assert.match(overview, /label: '最高海拔'.*note: route\.overview\.bestSeason/s);
  assert.match(overview, /auto-rows-fr/);
  assert.match(overview, /text-\[28px\].*md:text-\[42px\].*tabular-nums.*whitespace-nowrap/);
  assert.match(overview, /text-sm md:text-base text-white\/70 font-medium/);
  assert.match(overview, /text-sm text-white\/75/);
  assert.match(overview, /text-xs text-white\/60/);
});
