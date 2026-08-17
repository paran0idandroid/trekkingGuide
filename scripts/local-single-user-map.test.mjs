import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('本地单用户项目不再包含登录或收藏模块', async () => {
  const [app, nav, routePage, regionPage] = await Promise.all([
    readFile(new URL('src/App.tsx', root), 'utf8'),
    readFile(new URL('src/components/Nav.tsx', root), 'utf8'),
    readFile(new URL('src/pages/RoutePage.tsx', root), 'utf8'),
    readFile(new URL('src/pages/RegionPage.tsx', root), 'utf8'),
  ]);

  for (const content of [app, nav, routePage, regionPage]) {
    assert.doesNotMatch(content, /AuthProvider|useAuth|FavoriteButton|\/auth|\/favorites|登录|收藏/);
  }
  const removedFiles = [
    'src/pages/AuthPage.tsx',
    'src/pages/FavoritesPage.tsx',
    'src/components/FavoriteButton.tsx',
    'src/contexts/AuthContext.tsx',
    'src/lib/auth.ts',
    'src/lib/favorites.ts',
    'src/lib/storage.ts',
  ];
  for (const path of removedFiles) {
    await assert.rejects(access(new URL(path, root)), { code: 'ENOENT' });
  }
});

test('路线目录只保留乌孙古道与哈巴西坡', async () => {
  const [routes, routeGeoData, regions, home] = await Promise.all([
    readFile(new URL('src/data/routes.ts', root), 'utf8'),
    readFile(new URL('src/data/routeGeoData.ts', root), 'utf8'),
    readFile(new URL('src/data/regions.ts', root), 'utf8'),
    readFile(new URL('src/pages/HomePage.tsx', root), 'utf8'),
  ]);

  assert.match(routes, /'wusun': wusunRoute/);
  assert.match(routes, /'haba-west': habaWestRoute/);
  for (const content of [routes, routeGeoData, regions, home]) {
    assert.doesNotMatch(content, /everest-east|珠峰东坡|嘎玛沟/);
  }
  assert.match(home, /从乌孙古道到哈巴西坡/);
});

test('全国地图使用共享 MapLibre Outdoor 样式和路线地点标记', async () => {
  const [map, mapStyle, routeMapData, routeGeoData, packageJson] = await Promise.all([
    readFile(new URL('src/components/ChinaMap.tsx', root), 'utf8'),
    readFile(new URL('src/data/mapStyle.ts', root), 'utf8'),
    readFile(new URL('src/data/routeMapData.ts', root), 'utf8'),
    readFile(new URL('src/data/routeGeoData.ts', root), 'utf8'),
    readFile(new URL('package.json', root), 'utf8'),
  ]);

  assert.match(map, /from 'maplibre-gl'/);
  assert.match(map, /mapTilerOutdoorStyleUrl/);
  assert.match(map, /fitBounds/);
  assert.match(map, /renderWorldCopies:\s*false/);
  assert.match(map, /dragRotate:\s*false/);
  assert.match(map, /navigate\(`\/route\/\$\{slug\}`\)/);
  assert.match(mapStyle, /createMapTilerOutdoorStyleUrl/);
  assert.match(routeMapData, /mapTilerOutdoorStyleUrl/);
  assert.doesNotMatch(map, /echarts/);
  assert.doesNotMatch(packageJson, /echarts/);
  assert.doesNotMatch(routeGeoData, /linePoints|waypoints|color/);
  assert.match(routeGeoData, /coordinates:\s*\[83\.8, 42\.5\]/);
  assert.match(routeGeoData, /coordinates:\s*\[100\.066, 27\.326\]/);
});

test('哈巴西坡使用已发布的 scene1 封面', async () => {
  const [routeData, home] = await Promise.all([
    readFile(new URL('src/data/routeData.ts', root), 'utf8'),
    readFile(new URL('src/pages/HomePage.tsx', root), 'utf8'),
  ]);

  assert.match(routeData, /heroImage:\s*'\/pics\/haba\/scene-1\.webp'/);
  assert.match(home, /backgroundImage:\s*"url\(\/pics\/haba\/scene-1\.webp\)"/);
  await access(new URL('public/pics/haba/scene-1.webp', root));
});

test('首页封面文字保持清晰且层级克制', async () => {
  const home = await readFile(new URL('src/pages/HomePage.tsx', root), 'utf8');

  assert.match(home, /text-\[13px\].*tracking-\[0\.15em\].*text-white\/80.*font-medium/);
  assert.match(home, /text-\[40px\].*md:text-\[64px\].*tracking-\[0\.01em\]/);
  assert.match(home, /text-base.*md:text-lg.*text-white\/85.*font-normal.*tracking-normal/);
  assert.match(home, /从乌孙古道到哈巴西坡，获取路线与装备建议/);
  assert.doesNotMatch(home, /探索全国经典徒步路线，获取专业装备推荐/);
});
