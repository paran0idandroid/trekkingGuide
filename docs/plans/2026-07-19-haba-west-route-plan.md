# 哈巴西坡路线介绍实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use test-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 本项目禁止修改 `docs/superpowers/`，因此计划按项目约束保存在 `docs/plans/`。除非用户明确要求，不派发子代理。

**Goal:** 将用户实际走过的 FIT 闭环轨迹制作成独立的“哈巴西坡”路线介绍，提供三日分色动态轨迹、8 个可点击关键点和完整无图正文，同时保证现有路线不回归。

**Architecture:** 保留现有 `RoutePage → RouteMapExperience → RouteMapCanvas` 数据流，将乌孙专属地图 ID、摘要和节点文案改为由 `RouteMapConfig` 与 `RouteData` 驱动。FIT 只在离线脚本中通过 Garmin 官方 SDK 解码，输出脱敏的三段 GeoJSON；原始 FIT、KML 和运动字段不进入项目。

**Tech Stack:** Vite 5、React 18、TypeScript 5 strict、Tailwind CSS 3.4、MapLibre GL JS 5.24、Node.js 内置测试、Garmin FIT JavaScript SDK 21.208.0（仅 `/tmp` 离线转换，不加入项目依赖）

---

## 实施前基线

- `node --test scripts/*.test.mjs`：当前 16 项全部通过。
- `npm run build`：当前已被本任务之外的 Three.js 类型声明、`GearAdvisorModal` 空值类型和 `ImportMeta.env` 类型错误阻断。
- 实施中不得修改这些无关模块。验收时以“没有新增 TypeScript 错误”加 `npx vite build` 通过为准，并在交付中如实保留基线说明。
- 设计依据：`docs/designs/2026-07-19-haba-west-route-design.md`。

## 文件结构与职责

### 新建

- `scripts/convert-haba-fit.mjs`：使用外部临时 Garmin SDK 解码 FIT、按确认边界分成三日、吸附关键点、简化并输出脱敏 GeoJSON。
- `scripts/convert-haba-fit.test.mjs`：验证分段、吸附、闭环和隐私字段剥离的纯函数行为。
- `scripts/haba-geojson.test.mjs`：直接验证最终发布 GeoJSON 的要素数量、关键点、海拔、连续性和隐私。
- `public/routes/haba-west.geojson`：三条 LineString 与 8 个 Point 的公开地图数据。

### 修改

- `src/types.ts`：允许路线和节点无图片；为地图增加分日轨迹、摘要、图例与动态 layer 配置。
- `src/lib/routeMapState.ts`：按 route slug 生成稳定且互不冲突的 MapLibre source/layer ID。
- `scripts/route-map-state.test.mjs`：先锁定通用 layer ID、标签规则和现有聚焦行为。
- `src/data/routeData.ts`：定义完整 `habaWestRoute`。
- `src/data/routes.ts`：通过唯一入口注册 `haba-west`。
- `src/data/regions.ts`：将 `haba-west` 登记到云南。
- `src/data/routeProfiles.ts`：新增哈巴西坡装备环境画像。
- `src/data/routeMapData.ts`：增加独立哈巴西坡地图配置，并补齐乌孙通用配置字段。
- `src/components/RouteMapCanvas.tsx`：使用动态 source/layer ID，按日绘制三组轨迹与动态方向层。
- `src/components/RouteMapExperience.tsx`：向节点列表和移动端传递路线配置及图例。
- `src/components/RouteNodeList.tsx`：移除乌孙硬编码并支持无图节点卡片。
- `src/components/RouteDetailPanel.tsx`：摘要统计数据化并支持无图详情。
- `src/components/RouteMobileSheet.tsx`：摘要、路径和节点数据化并支持无图详情。
- `src/components/Overview.tsx`：统计数据化；无图时使用森林色背景。
- `src/components/Timeline.tsx`：移除固定 7 天文案；无图时使用森林色背景。
- `src/components/Risks.tsx`：无图时使用森林色背景。
- `src/pages/RoutePage.tsx`：仅在有图片时渲染 Highlights，其他分支保持不变。

---

### Task 1：先把地图状态工具改为路线无关

**Files:**

- Modify: `scripts/route-map-state.test.mjs`
- Modify: `src/lib/routeMapState.ts`

- [ ] **Step 1: 写失败测试，锁定动态 layer ID 和起终点标签分类**

在 `scripts/route-map-state.test.mjs` 中先将标签规则调用改为传入 route slug，并加入：

```js
import {
  getRouteLayerIds,
  getRouteNodeLabelRules,
} from '../src/lib/routeMapState.ts';

test('route layer ids are namespaced by route slug', () => {
  assert.deepEqual(getRouteLayerIds('haba-west'), {
    source: 'haba-west',
    trackOutline: 'haba-west-track-outline',
    nodeSelection: 'haba-west-node-selection',
    nodes: 'haba-west-nodes',
    coreLabels: 'haba-west-node-labels-core',
    secondaryLabels: 'haba-west-node-labels-secondary',
  });
});

test('route label rules include the combined start/end category', () => {
  const rules = getRouteNodeLabelRules('haba-west', false);
  assert.deepEqual(
    rules.flatMap(({ categories }) => categories),
    ['起点', '终点', '起终点', '营地', '垭口', '河流', '景点'],
  );
  assert.deepEqual(
    rules.map(({ id }) => id),
    ['haba-west-node-labels-core', 'haba-west-node-labels-secondary'],
  );
});
```

同步把既有测试中的 `getRouteNodeLabelRules(false)` 改为 `getRouteNodeLabelRules('wusun', false)`，移动端调用同理。既有预期 ID 仍是 `wusun-*`。

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test scripts/route-map-state.test.mjs`

Expected: FAIL，提示 `getRouteLayerIds` 尚未导出或 `getRouteNodeLabelRules` 参数/结果不匹配。

- [ ] **Step 3: 写最小实现**

在 `src/lib/routeMapState.ts` 中把固定 union ID 改为 string，并加入：

```ts
interface RouteNodeLabelRule {
  id: string;
  categories: string[];
  minZoom: number;
}

export function getRouteLayerIds(routeSlug: string) {
  return {
    source: routeSlug,
    trackOutline: `${routeSlug}-track-outline`,
    nodeSelection: `${routeSlug}-node-selection`,
    nodes: `${routeSlug}-nodes`,
    coreLabels: `${routeSlug}-node-labels-core`,
    secondaryLabels: `${routeSlug}-node-labels-secondary`,
  } as const;
}

export function getRouteNodeLabelRules(routeSlug: string, isMobile: boolean): RouteNodeLabelRule[] {
  const ids = getRouteLayerIds(routeSlug);
  return [
    {
      id: ids.coreLabels,
      categories: ['起点', '终点', '起终点', '营地', '垭口'],
      minZoom: 0,
    },
    {
      id: ids.secondaryLabels,
      categories: ['河流', '景点'],
      minZoom: isMobile ? 11 : 0,
    },
  ];
}
```

保留 `getRouteDashArray`、双环样式、桌面 `[335, 0]` 偏移、移动端 `-39%` 偏移和抽屉状态逻辑原样。

- [ ] **Step 4: 运行状态测试**

Run: `node --test scripts/route-map-state.test.mjs`

Expected: PASS，既有乌孙断言与新增哈巴断言全部通过。

- [ ] **Step 5: 提交这一独立逻辑改动**

```bash
git add src/lib/routeMapState.ts scripts/route-map-state.test.mjs
git commit -m "refactor: namespace route map layers"
```

---

### Task 2：定义最小的数据模型扩展

**Files:**

- Modify: `src/types.ts`
- Modify: `src/data/routeData.ts`
- Modify: `src/data/routeMapData.ts`

- [ ] **Step 1: 修改共享类型**

将现有相关类型调整为：

```ts
export interface RouteData {
  slug: string;
  regionSlug: string;
  name: string;
  subtitle: string;
  tags: string[];
  intro?: string;
  heroImage?: string;
  overview: {
    distance: string;
    duration: string;
    elevationGain?: string;
    maxElevation: string;
    bestSeason: string;
    difficulty: string;
    suitableFor: string;
  };
  highlights: {
    title: string;
    description: string;
    image: string;
  }[];
  itinerary: DayDetail[];
  risks: { title: string; description: string }[];
  gear: string[];
  gearProfileKey?: string;
}

export type RouteMapNodeCategory =
  | '起点' | '终点' | '起终点' | '营地' | '垭口' | '河流' | '景点';

export interface RouteMapNode {
  id: string;
  name: string;
  category: RouteMapNodeCategory;
  dayLabel?: string;
  description: string;
  image?: string;
  coordinates: [number, number, number];
}

export interface RouteMapDay {
  day: 1 | 2 | 3;
  label: string;
  distance: string;
  from: string;
  to: string;
  color: string;
}

export interface RouteMapConfig {
  routeSlug: string;
  geoJsonUrl: string;
  styleUrl: string;
  center: [number, number];
  ariaLabel: string;
  pathLabel: string;
  colors: {
    track: string;
    outline: string;
    node: string;
  };
  summaryStats: { label: string; value: string }[];
  days?: RouteMapDay[];
  nodes: RouteMapNode[];
}
```

`days` 可选是为了让乌孙继续以单条轨迹绘制；哈巴存在 `days` 时才启用分日图层。`dayLabel` 只用于能够确认分日边界的路线。

- [ ] **Step 2: 补齐乌孙配置的新必填字段**

在 `src/data/routeMapData.ts` 的乌孙配置中加入：

```ts
ariaLabel: '乌孙古道交互地图',
pathLabel: '琼库什台方向起点 → 黑英山方向出口',
summaryStats: [
  { label: '距离', value: '106.9 km' },
  { label: '时间', value: '6 天' },
  { label: '爬升', value: '6458 m' },
],
```

乌孙节点不补推测性的 `dayLabel`，通用卡片仅在字段存在时显示日序；这样哈巴可以展示精确分日信息，同时乌孙既有节点文案和视觉保持不变。

在 `src/data/routeData.ts` 的乌孙概览中加入 `elevationGain: '6458 m'`；珠峰东坡不虚构累计爬升，保持该字段缺省。

- [ ] **Step 3: 做一次 TypeScript 定向检查**

Run: `npx tsc --noEmit --pretty false 2>&1 | rg "src/(types|data/routeMapData|data/routeData)"`

Expected: 无本任务相关文件错误。命令整体仍可能因已知无关基线错误返回非零。

---

### Task 3：以测试先行生成和验证脱敏 GeoJSON

**Files:**

- Create: `scripts/convert-haba-fit.mjs`
- Create: `scripts/convert-haba-fit.test.mjs`
- Create: `scripts/haba-geojson.test.mjs`
- Create: `public/routes/haba-west.geojson`

- [ ] **Step 1: 为分段、吸附和隐私写失败测试**

创建 `scripts/convert-haba-fit.test.mjs`：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  nearestPointIndex,
  splitTrack,
  buildFeatureCollection,
  assertPublicGeoJson,
} from './convert-haba-fit.mjs';

const track = [
  [100, 27, 3465],
  [100.01, 27.01, 4071],
  [100.02, 27.02, 4378],
  [100.03, 27.03, 4110],
  [100.04, 27.04, 4318],
  [100.00001, 27.00001, 3454],
];

test('nearestPointIndex snaps a reference to the FIT track', () => {
  assert.equal(nearestPointIndex(track, [100.0201, 27.0201]), 2);
});

test('splitTrack preserves shared day boundaries and closes the loop', () => {
  const segments = splitTrack(track, 1, 3);
  assert.deepEqual(segments.map((segment) => segment.length), [2, 3, 3]);
  assert.deepEqual(segments[0].at(-1), segments[1][0]);
  assert.deepEqual(segments[1].at(-1), segments[2][0]);
  assert.ok(Math.abs(segments[2].at(-1)[0] - segments[0][0][0]) < 0.0001);
});

test('public GeoJSON contains only map-safe properties', () => {
  const output = buildFeatureCollection({
    track,
    dayOneEndIndex: 1,
    dayTwoEndIndex: 3,
    nodes: [{
      id: 'start-end', name: '咖啡营地（起点/终点）', category: '起终点',
      dayLabel: '第1天 / 第3天', coordinates: track[0],
    }],
  });
  assert.doesNotThrow(() => assertPublicGeoJson(output));
  const serialized = JSON.stringify(output);
  for (const forbidden of ['timestamp', 'heartRate', 'speed', 'device', 'userId', 'activityId']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test scripts/convert-haba-fit.test.mjs`

Expected: FAIL，提示转换模块或导出函数不存在。

- [ ] **Step 3: 实现纯转换函数和严格公开字段检查**

在 `scripts/convert-haba-fit.mjs` 中实现以下公开边界；几何简化复用 `convert-wusun-kml.mjs` 的 Douglas–Peucker 思路，但代码保留在本文件，避免让哈巴转换依赖乌孙专属脚本：

```js
const allowedProperties = new Set(['kind', 'day', 'id', 'name', 'category', 'dayLabel', 'elevation']);

export function nearestPointIndex(track, reference, start = 0, end = track.length) {
  let bestIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = start; index < end; index += 1) {
    const dx = track[index][0] - reference[0];
    const dy = track[index][1] - reference[1];
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }
  if (bestIndex < 0) throw new Error('无法将关键点吸附到 FIT 轨迹');
  return bestIndex;
}

export function splitTrack(track, dayOneEndIndex, dayTwoEndIndex) {
  if (!(0 < dayOneEndIndex && dayOneEndIndex < dayTwoEndIndex && dayTwoEndIndex < track.length - 1)) {
    throw new Error('三日轨迹边界无效');
  }
  return [
    track.slice(0, dayOneEndIndex + 1),
    track.slice(dayOneEndIndex, dayTwoEndIndex + 1),
    track.slice(dayTwoEndIndex),
  ];
}

export function buildFeatureCollection({ track, dayOneEndIndex, dayTwoEndIndex, nodes }) {
  const segments = splitTrack(track, dayOneEndIndex, dayTwoEndIndex);
  return {
    type: 'FeatureCollection',
    features: [
      ...segments.map((coordinates, index) => ({
        type: 'Feature',
        id: `haba-west-day-${index + 1}`,
        properties: { kind: 'track', day: index + 1 },
        geometry: { type: 'LineString', coordinates },
      })),
      ...nodes.map((node) => ({
        type: 'Feature',
        id: node.id,
        properties: {
          kind: 'node', id: node.id, name: node.name, category: node.category,
          dayLabel: node.dayLabel, elevation: Math.round(node.coordinates[2]),
        },
        geometry: { type: 'Point', coordinates: node.coordinates },
      })),
    ],
  };
}

export function assertPublicGeoJson(collection) {
  for (const feature of collection.features) {
    for (const key of Object.keys(feature.properties ?? {})) {
      if (!allowedProperties.has(key)) throw new Error(`GeoJSON 含非公开字段：${key}`);
    }
  }
}
```

同文件继续实现：

- 从 CLI 第一个参数动态导入 `/tmp` Garmin SDK 的 `src/index.js`，不在 `package.json` 添加依赖。
- 使用 `Decoder.isFIT()`、`decoder.checkIntegrity()` 和 `decoder.read()`；任一失败都终止转换。
- 只从 record messages 取 `positionLong`、`positionLat`、`enhancedAltitude ?? altitude`。
- 当坐标绝对值大于经纬度合法范围时才按 FIT semicircle 公式 `value * 180 / 2 ** 31` 转为角度。
- 第一天结束点吸附到 `[100.066454, 27.326323]`，第二天结束点吸附到 `[100.068445, 27.354640]`。
- 起终点取 FIT 首点；双湖营地和黑海营地分别取两个日界点。
- 双湖垭口、夫妻海垭口、长湖、鸡趾垭口分别从 KML 的 `双湖垭口`、`夫妻湖垭口`、`小黄海`、`吉支垭口` 取得参考坐标后吸附到 FIT。
- 黑海垭口使用已校准参考坐标 `[100.062571, 27.357947]` 后吸附到 FIT。
- 简化每一日轨迹时保留日界点，并以 8 米为误差上限。
- 输出前调用 `assertPublicGeoJson()`，输出中不包含 metadata 对象。

CLI 用法固定为：

```text
node scripts/convert-haba-fit.mjs <garmin-sdk-entry.js> <input.fit> <reference.kml> <output.geojson>
```

- [ ] **Step 4: 运行纯函数测试**

Run: `node --test scripts/convert-haba-fit.test.mjs`

Expected: PASS。

- [ ] **Step 5: 用官方 SDK 生成正式 GeoJSON**

Run:

```bash
node scripts/convert-haba-fit.mjs \
  /tmp/haba-fit-parser/node_modules/@garmin/fitsdk/src/index.js \
  "$PRIVATE_HABA_FIT" \
  "$PRIVATE_HABA_KML" \
  public/routes/haba-west.geojson
```

Expected: 打印 `FIT CRC 通过；输出 3 段轨迹、8 个关键点`。项目 `package.json` 和 lockfile 无变化。

- [ ] **Step 6: 写最终产物集成测试**

创建 `scripts/haba-geojson.test.mjs`，直接读取 `public/routes/haba-west.geojson` 并断言：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const geoJson = JSON.parse(await readFile(new URL('../public/routes/haba-west.geojson', import.meta.url), 'utf8'));
const tracks = geoJson.features.filter(({ geometry }) => geometry.type === 'LineString');
const nodes = geoJson.features.filter(({ geometry }) => geometry.type === 'Point');

test('Haba GeoJSON has three day tracks and eight unique nodes', () => {
  assert.deepEqual(tracks.map(({ properties }) => properties.day), [1, 2, 3]);
  assert.equal(nodes.length, 8);
  assert.equal(new Set(nodes.map(({ properties }) => properties.id)).size, 8);
});

test('Haba day tracks connect and return to the start', () => {
  assert.deepEqual(tracks[0].geometry.coordinates.at(-1), tracks[1].geometry.coordinates[0]);
  assert.deepEqual(tracks[1].geometry.coordinates.at(-1), tracks[2].geometry.coordinates[0]);
  const start = tracks[0].geometry.coordinates[0];
  const end = tracks[2].geometry.coordinates.at(-1);
  assert.ok(Math.hypot(start[0] - end[0], start[1] - end[1]) < 0.0005);
});

test('Haba nodes use approved names and elevations', () => {
  const actual = Object.fromEntries(nodes.map(({ properties }) => [properties.name, properties.elevation]));
  assert.deepEqual(actual, {
    '咖啡营地（起点/终点）': 3465,
    '双湖营地': 4071,
    '双湖垭口': 4378,
    '夫妻海垭口': 4369,
    '黑海垭口': 4211,
    '黑海营地': 4110,
    '长湖': 4168,
    '鸡趾垭口': 4318,
  });
});

test('Haba public GeoJSON excludes private activity fields', () => {
  const serialized = JSON.stringify(geoJson);
  for (const value of ['timestamp', 'heartRate', 'speed', 'device', 'userId', 'activityId', 'coros']) {
    assert.equal(serialized.toLowerCase().includes(value.toLowerCase()), false);
  }
});
```

- [ ] **Step 7: 运行全部 GeoJSON 测试**

Run: `node --test scripts/convert-haba-fit.test.mjs scripts/haba-geojson.test.mjs`

Expected: PASS；最终文件为 3 条轨迹、8 个点、闭环且不含个人运动字段。

- [ ] **Step 8: 提交转换工具和公开数据**

```bash
git add scripts/convert-haba-fit.mjs scripts/convert-haba-fit.test.mjs scripts/haba-geojson.test.mjs public/routes/haba-west.geojson
git commit -m "feat: add sanitized Haba West route geometry"
```

---

### Task 4：注册独立路线数据与地图配置

**Files:**

- Modify: `src/data/routeData.ts`
- Modify: `src/data/routes.ts`
- Modify: `src/data/regions.ts`
- Modify: `src/data/routeProfiles.ts`
- Modify: `src/data/routeMapData.ts`

- [ ] **Step 1: 在 routeData 定义完整路线**

在 `src/data/routeData.ts` 导出 `habaWestRoute`。关键字段必须严格使用：

```ts
export const habaWestRoute: RouteData = {
  slug: 'haba-west',
  regionSlug: 'yunnan',
  name: '哈巴西坡',
  subtitle: '穿越双湖、黑海与连续高山垭口的三天两夜环线',
  tags: ['云南', '哈巴雪山', '高山湖泊', '3天2夜', '中高难度'],
  intro: '从咖啡营地出发，连续翻越双湖、夫妻海、黑海与鸡趾一带的高山垭口，最终返回起点。',
  overview: {
    distance: '23.3 km',
    duration: '3 天 2 夜',
    elevationGain: '1571 m',
    maxElevation: '4384 m',
    bestSeason: '5–9 月',
    difficulty: '中高',
    suitableFor: '有高海拔徒步和露营经验的人',
  },
  highlights: [],
  itinerary: [
    { day: 1, title: '咖啡营地 — 双湖营地｜5.7 km', description: '从海拔约3465米的咖啡营地出发，逐步爬升至双湖营地。第一天以适应海拔和建立稳定节奏为主。' },
    { day: 2, title: '双湖营地 — 黑海营地｜7.1 km', description: '依次经过双湖垭口、夫妻海垭口和黑海垭口后抵达黑海营地，是全程连续翻越高海拔垭口的核心路段。' },
    { day: 3, title: '黑海营地 — 咖啡营地｜10.5 km', description: '经过长湖和鸡趾垭口后下降，最终回到咖啡营地，完成三天两夜闭环。' },
  ],
  risks: [
    { title: '高海拔与连续垭口', description: '路线最高记录海拔4384米，第二天连续翻越多个高山垭口，需要合理控制节奏并关注高原反应。' },
    { title: '陡峭雪坡', description: '部分路段可能存在陡峭雪坡，应根据当季积雪判断通行条件，并准备相应防滑与安全装备。' },
    { title: '无可靠补给', description: '全程无可靠补给。重装徒步需自备露营、食物和燃料；轻装方式需要提前联系当地马帮运输装备。' },
    { title: '通信中断', description: '除起点外全程基本没有手机信号，应提前下载离线地图，并准备离线通信或应急方案。' },
    { title: '水源信息不明确', description: '沿途可靠饮用水源信息不明确，不应把湖水或溪流视为稳定补给。出发前需向当地向导或马帮确认当季水源，并携带足够饮水及净水设备。' },
  ],
  gearProfileKey: 'haba-west',
  gear: ['背包', '帐篷', '徒步鞋', '冲锋衣', '保暖层', '登山杖', '头灯', '睡袋', '防晒用品', '急救包', '防水袋', '炉头套锅', '保温水壶', '手套', '遮阳帽', '墨镜', '充电宝'],
};
```

不要添加 `heroImage`，不要添加占位 highlight。

- [ ] **Step 2: 通过唯一入口注册路线**

在 `src/data/routes.ts`：

```ts
import { habaWestRoute, wusunRoute } from './routeData';

export const routeDataMap: Record<string, RouteData> = {
  wusun: wusunRoute,
  'haba-west': habaWestRoute,
  // existing everest-east remains unchanged
};
```

在 `src/data/regions.ts` 的云南定义中只把 `routes: []` 改为：

```ts
routes: ['haba-west'],
```

- [ ] **Step 3: 新增装备环境画像**

在 `src/data/routeProfiles.ts` 增加：

```ts
'haba-west': {
  totalDays: 3,
  maxAltitude: 4384,
  overnightLowest: 0,
  terrain: ['高山草甸', '碎石坡', '垭口', '雪坡'],
  waterCrossing: false,
  waterSource: '可靠水源信息不明确',
  resupplyPoint: false,
  exposure: ['高海拔', '强紫外线', '失联风险'],
},
```

`overnightLowest: 0` 只作为 5–9 月装备推荐的保守输入，不在路线正文中宣称实测最低温。

- [ ] **Step 4: 新增完全独立的地图配置**

在 `src/data/routeMapData.ts` 加入 `haba-west` 配置。节点坐标使用已经校准到 FIT 的坐标，并由 GeoJSON 集成测试保证两边一致：

```ts
'haba-west': {
  routeSlug: 'haba-west',
  geoJsonUrl: '/routes/haba-west.geojson',
  styleUrl: mapTilerOutdoorStyleUrl,
  center: [100.066, 27.325],
  ariaLabel: '哈巴西坡交互地图',
  pathLabel: '咖啡营地 → 双湖与黑海 → 咖啡营地',
  colors: { track: '#1a4d3e', outline: '#ffffff', node: '#1a4d3e' },
  summaryStats: [
    { label: '距离', value: '23.3 km' },
    { label: '时间', value: '3 天 2 夜' },
    { label: '爬升', value: '1571 m' },
  ],
  days: [
    { day: 1, label: '第一天', distance: '5.7 km', from: '咖啡营地', to: '双湖营地', color: '#6f9b80' },
    { day: 2, label: '第二天', distance: '7.1 km', from: '双湖营地', to: '黑海营地', color: '#1a4d3e' },
    { day: 3, label: '第三天', distance: '10.5 km', from: '黑海营地', to: '咖啡营地', color: '#123a2f' },
  ],
  nodes: [
    { id: 'start-end', name: '咖啡营地（起点/终点）', category: '起终点', dayLabel: '第1天 / 第3天', description: '闭环路线的出发与返回位置，也是全程唯一明确有手机信号的位置。', coordinates: [100.066273, 27.286494, 3465] },
    { id: 'double-lake-camp', name: '双湖营地', category: '营地', dayLabel: '第1天', description: '第一天行程终点。抵达后应关注高海拔适应和夜间保暖。', coordinates: [100.066454, 27.326323, 4071] },
    { id: 'double-lake-pass', name: '双湖垭口', category: '垭口', dayLabel: '第2天', description: '第二天连续垭口路段的高点之一，轨迹节点海拔4378米。', coordinates: [100.053165, 27.346224, 4378] },
    { id: 'couple-lake-pass', name: '夫妻海垭口', category: '垭口', dayLabel: '第2天', description: '第二天连续翻越路段中的高海拔垭口，应结合当季积雪谨慎通行。', coordinates: [100.054230, 27.358742, 4369] },
    { id: 'black-lake-pass', name: '黑海垭口', category: '垭口', dayLabel: '第2天', description: '前往黑海营地途中经过的垭口节点，轨迹节点海拔4211米。', coordinates: [100.062571, 27.357947, 4211] },
    { id: 'black-lake-camp', name: '黑海营地', category: '营地', dayLabel: '第2天', description: '第二天行程终点，也是第三天返回咖啡营地前的宿营位置。', coordinates: [100.068445, 27.354640, 4110] },
    { id: 'long-lake', name: '长湖', category: '景点', dayLabel: '第3天', description: '第三天从黑海营地出发后经过的高山湖泊节点。', coordinates: [100.075398, 27.348398, 4168] },
    { id: 'chicken-toe-pass', name: '鸡趾垭口', category: '垭口', dayLabel: '第3天', description: '第三天返程中的主要高点，翻越后继续下降返回咖啡营地。', coordinates: [100.080818, 27.338659, 4318] },
  ],
},
```

MapLibre paint API 需要具体颜色字符串；这些值只用于 WebGL 地图图层，并与现有 `forest` 视觉色保持一致。普通 DOM 标签、背景和边框仍只使用 Tailwind `forest-*` / `sand-*`。

8 个节点顺序固定为：咖啡营地（起点/终点）、双湖营地、双湖垭口、夫妻海垭口、黑海垭口、黑海营地、长湖、鸡趾垭口。所有节点不设置 `image`，并设置对应 `dayLabel`。

- [ ] **Step 5: 验证数据入口和地区查询**

Run:

```bash
rg -n "haba-west|habaWestRoute" src/data
rg -n "import .*habaWestRoute|import .*routeDataMap" src/components src/pages
```

Expected: 第一条显示定义、注册、云南、画像和地图配置；第二条无输出，证明组件未直接导入路线常量或数据表。

---

### Task 5：让 MapLibre 画布支持单路线与三日路线

**Files:**

- Modify: `src/components/RouteMapCanvas.tsx`

- [ ] **Step 1: 用 Task 1 的动态 ID 替换所有 `wusun-*` 硬编码**

在组件 effect 内创建：

```ts
const layerIds = getRouteLayerIds(config.routeSlug);
const labelRules = getRouteNodeLabelRules(config.routeSlug, window.innerWidth < 1024);
const trackDays = config.days ?? [];
```

所有 source、selection、nodes、labels、click handler、resize、cleanup 和选中 effect 都使用 `layerIds` 或 `labelRules`。返回节点改为：

```tsx
return <div ref={containerRef} className="absolute inset-0" aria-label={config.ariaLabel} />;
```

- [ ] **Step 2: 最小化分日图层逻辑**

加载 GeoJSON 后：

- 若 `config.days` 不存在，添加现有单组 outline/track/motion，过滤全部 LineString，乌孙表现不变。
- 若 `config.days` 存在，为每天添加 outline/track/motion 三层，过滤条件固定为：

```ts
const dayFilter = [
  'all',
  ['==', ['geometry-type'], 'LineString'],
  ['==', ['get', 'day'], day.day],
] as const;
```

每日 layer ID 使用：

```ts
const outlineId = `${config.routeSlug}-day-${day.day}-outline`;
const trackId = `${config.routeSlug}-day-${day.day}-track`;
const motionId = `${config.routeSlug}-day-${day.day}-motion`;
```

轨迹颜色取 `day.color`，outline 与 motion 继续取 `config.colors.outline`。动画维护 `motionLayerIds: string[]`，每帧遍历这些 ID 更新 `line-dasharray`，不要复制三份动画循环。

- [ ] **Step 3: 修正完整轨迹 bounds 计算**

不要只找第一条 LineString。改为：

```ts
const coordinates = geoJson.features.flatMap((feature) =>
  feature.geometry.type === 'LineString' ? feature.geometry.coordinates : [],
);
if (coordinates.length < 2) throw new Error('缺少连续轨迹');
const bounds = coordinates.reduce(
  (value, coordinate) => value.extend([coordinate[0], coordinate[1]]),
  new maplibregl.LngLatBounds(),
);
```

- [ ] **Step 4: 运行逻辑测试和 Vite 构建**

Run:

```bash
node --test scripts/route-map-state.test.mjs scripts/haba-geojson.test.mjs
npx vite build
```

Expected: 测试全部通过；Vite production bundle 成功。

---

### Task 6：数据化卡片、加入图例并实现显式无图布局

**Files:**

- Modify: `src/components/RouteMapExperience.tsx`
- Modify: `src/components/RouteNodeList.tsx`
- Modify: `src/components/RouteDetailPanel.tsx`
- Modify: `src/components/RouteMobileSheet.tsx`
- Modify: `src/components/Overview.tsx`
- Modify: `src/components/Timeline.tsx`
- Modify: `src/components/Risks.tsx`
- Modify: `src/pages/RoutePage.tsx`

- [ ] **Step 1: 节点列表使用 route/config 文案并条件渲染图片**

`RouteNodeList` Props 改为接收 `route` 与 `config`。标题和路径分别使用 `route.name`、`config.pathLabel`。节点内容采用：

```tsx
{node.image && (
  <img src={node.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
)}
<span className="min-w-0">
  <span className="block truncate text-sm font-semibold text-forest-800">{node.name}</span>
  <span className="mt-1 block text-xs text-forest-500">
    {node.dayLabel} · {node.category} · 海拔 {Math.round(node.coordinates[2])} m
  </span>
</span>
```

无图时不保留 56px 空白列。

- [ ] **Step 2: 详情面板数据化摘要并条件渲染图片**

`RouteDetailPanel` 顶部只在 `const image = node?.image ?? route.heroImage` 存在时渲染 `<img>`。内容区高度不写死依赖图片比例。默认统计改为：

```tsx
<RouteStat label="距离" value={route.overview.distance} />
<RouteStat label="时间" value={route.overview.duration} />
{route.overview.elevationGain && (
  <RouteStat label="爬升" value={route.overview.elevationGain} />
)}
```

乌孙仍显示 `106.9 km / 6 天 / 6458 m`。使用 Task 2 已加入的 `RouteMapConfig.summaryStats`，不改乌孙正文数据：

```ts
summaryStats: [
  { label: '距离', value: '106.9 km' },
  { label: '时间', value: '6 天' },
  { label: '爬升', value: '6458 m' },
],
```

哈巴对应 `23.3 km / 3 天 2 夜 / 1571 m`。`RouteDetailPanel` 接收 `config` 并渲染该数组。

- [ ] **Step 3: 移动端摘要、路径、节点和图片全部数据化**

`RouteMobileSheet` 接收 `config`：

- 路径用 `config.pathLabel`。
- 摘要用 `config.summaryStats`。
- 节点图只在 `node.image` 存在时渲染。
- 详情图只在 `selectedNode.image` 存在时渲染。
- 选择节点后仍调用 `onSelectNode` 并进入 `detail`。
- 保留现有抽屉手势、适应路线按钮和返回列表行为。

- [ ] **Step 4: 在地图右下方加入仅哈巴显示的紧凑图例**

在 `RouteMapExperience` 中仅当 `config.days?.length` 存在时渲染：

```tsx
<div className="absolute bottom-6 right-3 z-10 hidden w-56 rounded-2xl border border-forest-100 bg-white p-3 shadow-xl lg:block">
  {config.days.map((day) => (
    <div key={day.day} className="flex items-start gap-2 py-1.5 text-xs text-forest-700">
      <span className="mt-1.5 h-1 w-6 shrink-0 rounded-full" style={{ backgroundColor: day.color }} />
      <span><strong>{day.label} · {day.distance}</strong><br />{day.from} → {day.to}</span>
    </div>
  ))}
</div>
```

这里的行内颜色只来自 MapLibre 分日配置。其余 DOM 背景、标签和边框继续使用 forest/sand 类。

- [ ] **Step 5: 让正文组件显式支持无图路线**

三个组件都先取安全的图片：

```ts
const backgroundImage = route.highlights[1]?.image ?? route.highlights[0]?.image;
```

只有存在时才传入由 `backgroundImage` 生成的背景 style，并保留 `backgroundAttachment: 'fixed'`；不存在时使用 `bg-forest-900` 或 `bg-forest-950`。不得生成 `url(undefined)`。

同时：

- `Overview` 的四项统计从 `route.overview` 派生，不继续使用文件顶部乌孙固定 `stats`。
- `Timeline` 背景取 `route.highlights[3]?.image`，副标题改为 `${route.overview.duration}路线安排`。
- `Risks` 背景取 `route.highlights[0]?.image`。
- `RoutePage` 用 `{route.highlights.length > 0 && <Highlights route={route} />}` 明确隐藏空亮点区。
- 不修改有图时的渐变、间距、动画和字体层级。

- [ ] **Step 6: 连接新的 Props**

在 `RouteMapExperience` 中使用：

```tsx
<RouteNodeList route={route} config={config} nodes={config.nodes} selectedNodeId={selectedNodeId} onSelect={selectNode} />
<RouteDetailPanel route={route} config={config} node={selectedNode} />
<RouteMobileSheet
  route={route}
  config={config}
  nodes={config.nodes}
  selectedNode={selectedNode}
  level={sheetLevel}
  onLevelChange={setSheetLevel}
  onSelectNode={selectNode}
  onFitRoute={() => setFitRequestKey((value) => value + 1)}
/>
```

- [ ] **Step 7: 定向检查无图安全性**

Run:

```bash
rg -n "highlights\[[0-9]+\]\.image|src=\{node\.image\}|src=\{selectedNode\.image\}|url\(undefined\)" src/components src/pages
npx vite build
```

Expected: 第一条无危险的无条件图片读取；Vite build 成功。

- [ ] **Step 8: 提交数据和 UI 功能**

```bash
git add src/types.ts src/data src/components/RouteMapCanvas.tsx src/components/RouteMapExperience.tsx src/components/RouteNodeList.tsx src/components/RouteDetailPanel.tsx src/components/RouteMobileSheet.tsx src/components/Overview.tsx src/components/Timeline.tsx src/components/Risks.tsx src/pages/RoutePage.tsx
git commit -m "feat: add interactive Haba West route guide"
```

---

### Task 7：自动验证、浏览器 QA、审查和记忆收尾

**Files:**

- Modify outside repo: `$OBLIVIATE_ROOT/20_Projects/justdemo/DECISIONS.md`
- Modify outside repo: `$OBLIVIATE_ROOT/20_Projects/justdemo/OPEN_LOOPS.md`
- Modify outside repo: `$OBLIVIATE_ROOT/20_Projects/justdemo/STATUS.md`
- Modify only if reusable learning exists: `$OBLIVIATE_ROOT/40_Agent/Cases/`

- [ ] **Step 1: 运行全部自动测试**

Run: `node --test scripts/*.test.mjs`

Expected: 既有 16 项和新增哈巴测试全部通过。

- [ ] **Step 2: 运行构建与基线对比**

Run:

```bash
npx vite build
npm run build
```

Expected: `npx vite build` 成功。`npm run build` 若仍失败，只允许出现实施前记录的 Three.js、`GearAdvisorModal` 和 `ImportMeta.env` 基线错误；若出现任何哈巴或本次所改地图/正文组件错误，必须修复后重跑。

- [ ] **Step 3: 启动项目并完成桌面 QA**

Run: `npm run dev -- --host 127.0.0.1`

在桌面浏览器验证：

- `/route/haba-west` 可直接访问。
- 地图显示三段不同深浅的轨迹、白色描边和动态方向效果。
- 图例正确显示 5.7 / 7.1 / 10.5 km 与三段起止点。
- 8 个关键点名称可见。
- 点击左侧每个点，详情与地图同步，双环高亮出现。
- 聚焦点落在双卡片右侧，不被遮挡。
- 起终点只有一个标记。
- 页面无破图、空图片框或 `url(undefined)` 请求。
- 概览、3 日行程、5 条风险和装备推荐入口可见。

- [ ] **Step 4: 完成 390 × 844 移动端 QA**

验证：

- 摘要、节点、详情三段抽屉均可操作。
- 点击节点后详情打开，地图目标点位于抽屉上方。
- 抽屉拖动不误拖地图。
- 无图节点列表和详情间距自然。
- 地图缩放、定位、适应路线控件不被遮挡。

- [ ] **Step 5: 回归乌孙古道和珠峰东坡**

验证 `/route/wusun`：

- 原轨迹颜色、方向动画、8 个标签与节点图片不变。
- 双环选中态不变。
- 桌面与移动端聚焦避让不变。
- 摘要仍为 106.9 km / 6 天 / 6458 m。

验证 `/route/everest-east`：

- 仍显示原 Hero 和全部图片内容。
- Highlights、Timeline 和 Risks 的有图背景不变。

- [ ] **Step 6: 使用 requesting-code-review skill 做代码审查**

审查重点：

- 哈巴组件是否仍通过 `getRouteBySlug()` 数据入口。
- 是否误提交原始 FIT、KML、时间戳、心率、配速、设备信息或用户 ID。
- 是否触碰无关装备模块。
- 是否在普通 DOM CSS 中新增了非 forest/sand 色值。
- 是否引入新 npm 依赖或修改 lockfile。
- 所有新增/修改组件是否保持默认导出。

发现问题后只做与本功能直接相关的修复，并重跑 Step 1–5 的相应检查。

- [ ] **Step 7: 更新项目文档和 Obliviate**

记录：

- `DECISIONS.md`：FIT 几何优先、KML 仅作关键点参考；哈巴使用共享地图组件和独立配置；原始运动数据不发布。
- `OPEN_LOOPS.md`：照片待用户提供；水源待当季向导/马帮确认；生产 MapTiler Key 仍待部署前配置。
- `STATUS.md`：新增哈巴路线、测试数量、构建结果、桌面/移动端 QA 和回归结果。
- 只有形成可复用经验时才写 `40_Agent/Cases/`，不为一次性事实创建案例。

Run: `cd "$OBLIVIATE_ROOT" && python3 .index/scripts/memory_index.py --scan`

Expected: 索引扫描成功。

- [ ] **Step 8: 做最终 diff 合规扫描**

Run:

```bash
git status --short
git diff --check
git diff --stat
git diff -- package.json package-lock.json
git status --short | rg "\.fit$|\.kml$|\.kmz$"
```

Expected: 无空白错误；依赖文件无变化；没有原始轨迹文件进入 Git；每个修改文件都能对应本设计范围。

- [ ] **Step 9: 提交 QA 与文档收尾**

```bash
git add docs scripts src public/routes/haba-west.geojson
git commit -m "docs: record Haba West route validation"
```

如果前一步没有新的 repo 内文档或修复，不创建空提交。

---

## 完成定义

- `/route/haba-west` 是独立可访问路线，不影响其他路线。
- 页面显示用户确认的 23.3 km、3 天 2 夜、1571 m 累计爬升、4384 m 最高海拔、中高难度和 5–9 月。
- FIT 实际几何被划成三日分色动态闭环轨迹。
- 8 个关键点均可从列表或地图点击并正确聚焦，点位不被卡片/抽屉遮挡。
- 无图片时全页没有破图、空图框或错误网络请求。
- 最终 GeoJSON 不包含个人运动字段或原始文件元数据。
- 自动测试通过，Vite build 通过，完整 TypeScript 结果没有新增错误。
- 桌面、390 × 844 移动端、乌孙古道与珠峰东坡回归均通过。
- Obliviate 决策、开环、状态及索引已完成收尾。
