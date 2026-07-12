# 乌孙古道地图体验 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 MapLibre、OpenFreeMap 和清理后的真实 KML 轨迹，为乌孙古道详情页实现桌面双抽屉、移动端三段式底部抽屉的交互地图。

**Architecture:** KML 通过离线 Node 脚本转换成项目内的精简 GeoJSON；路线页面通过数据查询函数取得地图配置，并把配置作为 props 传给地图体验组件。MapLibre 实例封装在画布组件的 ref 中，选择状态由外层体验组件统一管理，桌面抽屉和移动端抽屉共享同一节点数据。

**Tech Stack:** Vite 5、React 18、TypeScript strict、Tailwind CSS 3.4、MapLibre GL JS 5.24.0、OpenFreeMap、GeoJSON、Node.js 内置测试运行器。

---

## 文件结构

**新建：**

- `scripts/convert-wusun-kml.mjs`：读取两步路 KML，提取并简化轨迹，输出无个人信息的 GeoJSON。
- `scripts/convert-wusun-kml.test.mjs`：用 Node 内置测试运行器验证解析、简化和清理行为。
- `public/routes/wusun.geojson`：浏览器加载的乌孙古道轨迹和节点数据。
- `src/data/routeMapData.ts`：地图配置数据和唯一查询入口。
- `src/components/RouteMapCanvas.tsx`：MapLibre 生命周期、轨迹/节点图层和地图事件。
- `src/components/RouteNodeList.tsx`：桌面节点列表。
- `src/components/RouteDetailPanel.tsx`：桌面路线摘要和节点详情。
- `src/components/RouteMobileSheet.tsx`：移动端三段式底部抽屉。
- `src/components/RouteMapExperience.tsx`：组合组件与共享选择状态。

**修改：**

- `package.json`、`package-lock.json`：加入 `maplibre-gl@5.24.0`。
- `src/types.ts`：增加地图节点与地图配置共享类型。
- `src/pages/RoutePage.tsx`：仅为 `wusun` 启用地图体验，其他路线继续使用 Hero。
- `src/index.css`：增加地图容器、MapLibre 控件和移动端抽屉样式。

## Task 1：建立可验证的 KML 清理与转换流程

**Files:**

- Create: `scripts/convert-wusun-kml.mjs`
- Create: `scripts/convert-wusun-kml.test.mjs`
- Create: `public/routes/wusun.geojson`

- [ ] **Step 1：先写解析与清理测试**

在 `scripts/convert-wusun-kml.test.mjs` 写入：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTrack, simplifyTrack, buildFeatureCollection } from './convert-wusun-kml.mjs';

const fixture = `<?xml version="1.0"?>
<kml xmlns:gx="http://www.google.com/kml/ext/2.2"><Document>
  <ExtendedData><Data name="CreaterId"><value>123</value></Data></ExtendedData>
  <Placemark id="startPoint"><name><![CDATA[起点]]></name><Point><coordinates>82.1,42.9,2000</coordinates></Point></Placemark>
  <Placemark id="realPoint"><name><![CDATA[营地]]></name><description><![CDATA[<img src="https://files.2bulu.com/private.jpg">]]></description><Point><coordinates>82.2,42.8,2500</coordinates></Point></Placemark>
  <Placemark><gx:Track>
    <gx:coord>82.1 42.9 2000</gx:coord><gx:coord>82.15 42.85 2200</gx:coord><gx:coord>82.2 42.8 2500</gx:coord>
  </gx:Track></Placemark>
</Document></kml>`;

test('parseTrack extracts numeric longitude, latitude, and elevation', () => {
  assert.deepEqual(parseTrack(fixture), [
    [82.1, 42.9, 2000],
    [82.15, 42.85, 2200],
    [82.2, 42.8, 2500],
  ]);
});

test('simplifyTrack always keeps endpoints', () => {
  assert.deepEqual(simplifyTrack(parseTrack(fixture), 100_000), [
    [82.1, 42.9, 2000],
    [82.2, 42.8, 2500],
  ]);
});

test('output excludes creator metadata and remote image URLs', () => {
  const output = JSON.stringify(buildFeatureCollection(fixture));
  assert.equal(output.includes('CreaterId'), false);
  assert.equal(output.includes('2bulu.com'), false);
  assert.equal(output.includes('private.jpg'), false);
  assert.equal(output.includes('营地'), true);
});
```

- [ ] **Step 2：运行测试并确认失败**

Run:

```bash
node --test scripts/convert-wusun-kml.test.mjs
```

Expected: FAIL，提示无法找到 `convert-wusun-kml.mjs`。

- [ ] **Step 3：实现最小转换器**

在 `scripts/convert-wusun-kml.mjs` 实现并导出以下接口：

```js
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function parseTrack(kml) {
  return [...kml.matchAll(/<gx:coord>\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*<\/gx:coord>/g)]
    .map((match) => match.slice(1, 4).map(Number));
}

function squaredDistanceToSegment(point, start, end) {
  const x = point[0];
  const y = point[1];
  let dx = end[0] - start[0];
  let dy = end[1] - start[1];
  if (dx !== 0 || dy !== 0) {
    const t = ((x - start[0]) * dx + (y - start[1]) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      dx = x - end[0];
      dy = y - end[1];
    } else if (t > 0) {
      dx = x - (start[0] + dx * t);
      dy = y - (start[1] + dy * t);
    } else {
      dx = x - start[0];
      dy = y - start[1];
    }
  }
  return dx * dx + dy * dy;
}

export function simplifyTrack(points, toleranceMeters = 12) {
  if (points.length <= 2) return points;
  const toleranceDegrees = toleranceMeters / 111_320;
  const threshold = toleranceDegrees * toleranceDegrees;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop();
    let maxDistance = threshold;
    let index = -1;
    for (let i = start + 1; i < end; i += 1) {
      const distance = squaredDistanceToSegment(points[i], points[start], points[end]);
      if (distance > maxDistance) {
        index = i;
        maxDistance = distance;
      }
    }
    if (index !== -1) {
      keep[index] = 1;
      stack.push([start, index], [index, end]);
    }
  }
  return points.filter((_, index) => keep[index]);
}

function parsePointPlacemarks(kml) {
  const curatedNodes = {
    '起点': { id: 'start', name: '琼库什台方向起点', category: '起点', description: '乌孙古道北端徒步起点。', image: '/pics/14.webp' },
    '商业营地': { id: 'north-camp', name: '北段商业营地', category: '营地', description: '轨迹记录中的北段补给与扎营位置。', image: '/pics/12.webp' },
    '河谷营地': { id: 'valley-camp', name: '河谷营地', category: '营地', description: '河谷中的平坦扎营区域。', image: '/pics/12.webp' },
    '过大桥': { id: 'bridge', name: '科克苏河桥段', category: '河流', description: '轨迹记录中的重要过河节点。', image: '/pics/9.webp' },
    '俯瞰天堂湖': { id: 'heaven-lake', name: '天堂湖观景点', category: '景点', description: '从高处俯瞰天堂湖的核心景观位置。', image: '/pics/11.webp' },
    '垭口': { id: 'akbulak-pass', name: '阿克布拉克达坂方向垭口', category: '垭口', description: '轨迹最高段附近的垭口节点。', image: '/pics/1.webp' },
    '游客中心': { id: 'visitor-center', name: '南段游客中心', category: '景点', description: '南段出山途中经过的游客服务节点。', image: '/pics/10.webp' },
    '终点': { id: 'end', name: '黑英山方向出口', category: '终点', description: '乌孙古道南端徒步终点。', image: '/pics/10.webp' },
  };
  const seen = new Set();
  return [...kml.matchAll(/<Placemark[^>]*>([\s\S]*?)<\/Placemark>/g)].flatMap((match, index) => {
    const block = match[1];
    const coordinate = block.match(/<Point>[\s\S]*?<coordinates>\s*([-\d.]+),([-\d.]+),([-\d.]+)\s*<\/coordinates>[\s\S]*?<\/Point>/);
    const name = block.match(/<name><!\[CDATA\[([\s\S]*?)\]\]><\/name>/)?.[1]?.trim();
    const curated = name ? curatedNodes[name] : undefined;
    if (!coordinate || !curated || seen.has(curated.id)) return [];
    seen.add(curated.id);
    return [{
      type: 'Feature',
      id: curated.id,
      properties: curated,
      geometry: { type: 'Point', coordinates: coordinate.slice(1, 4).map(Number) },
    }];
  });
}

export function buildFeatureCollection(kml) {
  const track = simplifyTrack(parseTrack(kml));
  if (track.length < 2) throw new Error('KML 中没有可用的连续轨迹');
  return {
    type: 'FeatureCollection',
    metadata: { source: '乌孙古道 KML', distanceMeters: 106869.224, elevationGainMeters: 6458, elevationLossMeters: 6553 },
    features: [
      { type: 'Feature', id: 'wusun-track', properties: { kind: 'track' }, geometry: { type: 'LineString', coordinates: track } },
      ...parsePointPlacemarks(kml),
    ],
  };
}

async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('用法：node scripts/convert-wusun-kml.mjs <input.kml> <output.geojson>');
  const kml = await readFile(input, 'utf8');
  await writeFile(output, `${JSON.stringify(buildFeatureCollection(kml))}\n`, 'utf8');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
```

- [ ] **Step 4：运行转换器测试**

Run:

```bash
node --test scripts/convert-wusun-kml.test.mjs
```

Expected: 3 tests PASS。

- [ ] **Step 5：生成并检查 GeoJSON**

Run:

```bash
mkdir -p public/routes
node scripts/convert-wusun-kml.mjs /Users/jon/Downloads/乌孙古道.kml public/routes/wusun.geojson
rg -n "CreaterId|deviceName|2bulu.com|down-files" public/routes/wusun.geojson
```

Expected: 转换命令成功；`rg` 无匹配。

- [ ] **Step 6：核对转换器精选节点**

检查 `public/routes/wusun.geojson` 只包含以下 8 个公共节点：

```json
[
  { "id": "start", "coordinates": [82.198760, 42.915280, 2023] },
  { "id": "north-camp", "coordinates": [82.270730, 42.824154, 2706] },
  { "id": "valley-camp", "coordinates": [82.339833, 42.716478, 2366] },
  { "id": "bridge", "coordinates": [82.326676, 42.668209, 1987] },
  { "id": "heaven-lake", "coordinates": [82.401612, 42.593914, 3058] },
  { "id": "akbulak-pass", "coordinates": [82.391358, 42.547949, 3814] },
  { "id": "visitor-center", "coordinates": [82.410349, 42.510818, 3049] },
  { "id": "end", "coordinates": [82.510526, 42.314979, 1911] }
]
```

这些坐标均来自 KML 标注点；不得沿用 `src/data/routeGeoData.ts` 的示意坐标。

- [ ] **Step 7：提交转换流程和数据**

```bash
git add scripts/convert-wusun-kml.mjs scripts/convert-wusun-kml.test.mjs public/routes/wusun.geojson
git commit -m "feat: add sanitized Wusun trail data"
```

## Task 2：安装 MapLibre 并建立地图数据入口

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/types.ts`
- Create: `src/data/routeMapData.ts`

- [ ] **Step 1：安装已核验版本**

Run:

```bash
npm install maplibre-gl@5.24.0
```

Expected: `package.json` 和 lockfile 只新增 MapLibre 及其传递依赖。

- [ ] **Step 2：增加共享类型**

在 `src/types.ts` 的 `RouteData` 之后增加：

```ts
export type RouteMapNodeCategory = '起点' | '终点' | '营地' | '垭口' | '河流' | '景点';

export interface RouteMapNode {
  id: string;
  name: string;
  category: RouteMapNodeCategory;
  description: string;
  image: string;
  coordinates: [number, number, number];
}

export interface RouteMapConfig {
  routeSlug: string;
  geoJsonUrl: string;
  styleUrl: string;
  center: [number, number];
  nodes: RouteMapNode[];
}
```

- [ ] **Step 3：建立唯一查询入口**

新建 `src/data/routeMapData.ts`：

```ts
import type { RouteMapConfig } from '../types';

const routeMapConfigMap: Record<string, RouteMapConfig> = {
  wusun: {
    routeSlug: 'wusun',
    geoJsonUrl: '/routes/wusun.geojson',
    styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
    center: [82.35, 42.62],
    nodes: [
      { id: 'start', name: '琼库什台方向起点', category: '起点', description: '乌孙古道北端徒步起点。', image: '/pics/14.webp', coordinates: [82.198760, 42.915280, 2023] },
      { id: 'north-camp', name: '北段商业营地', category: '营地', description: '轨迹记录中的北段补给与扎营位置。', image: '/pics/12.webp', coordinates: [82.270730, 42.824154, 2706] },
      { id: 'valley-camp', name: '河谷营地', category: '营地', description: '河谷中的平坦扎营区域。', image: '/pics/12.webp', coordinates: [82.339833, 42.716478, 2366] },
      { id: 'bridge', name: '科克苏河桥段', category: '河流', description: '轨迹记录中的重要过河节点。', image: '/pics/9.webp', coordinates: [82.326676, 42.668209, 1987] },
      { id: 'heaven-lake', name: '天堂湖观景点', category: '景点', description: '从高处俯瞰天堂湖的核心景观位置。', image: '/pics/11.webp', coordinates: [82.401612, 42.593914, 3058] },
      { id: 'akbulak-pass', name: '阿克布拉克达坂方向垭口', category: '垭口', description: '轨迹最高段附近的垭口节点。', image: '/pics/1.webp', coordinates: [82.391358, 42.547949, 3814] },
      { id: 'visitor-center', name: '南段游客中心', category: '景点', description: '南段出山途中经过的游客服务节点。', image: '/pics/10.webp', coordinates: [82.410349, 42.510818, 3049] },
      { id: 'end', name: '黑英山方向出口', category: '终点', description: '乌孙古道南端徒步终点。', image: '/pics/10.webp', coordinates: [82.510526, 42.314979, 1911] },
    ],
  },
};

export function getRouteMapConfig(slug: string): RouteMapConfig | undefined {
  return routeMapConfigMap[slug];
}
```

不要让组件直接导入 `routeMapConfigMap`。

- [ ] **Step 4：运行类型构建**

Run:

```bash
npm run build
```

Expected: PASS；此时地图组件尚未接入页面。

- [ ] **Step 5：提交依赖与数据入口**

```bash
git add package.json package-lock.json src/types.ts src/data/routeMapData.ts
git commit -m "feat: add MapLibre route map config"
```

## Task 3：实现纯地图画布

**Files:**

- Create: `src/components/RouteMapCanvas.tsx`

- [ ] **Step 1：实现 MapLibre 生命周期和 GeoJSON 图层**

创建 `src/components/RouteMapCanvas.tsx`，接口固定为：

```ts
interface Props {
  config: RouteMapConfig;
  selectedNodeId?: string;
  onSelectNode: (nodeId: string) => void;
  onError: (message: string) => void;
}
```

实现必须包含：

```tsx
import { useEffect, useRef } from 'react';
import maplibregl, { GeoJSONSource, Map } from 'maplibre-gl';
import type { FeatureCollection, LineString, Point } from 'geojson';
import type { RouteMapConfig } from '../types';

export default function RouteMapCanvas({ config, selectedNodeId, onSelectNode, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map>();

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: config.styleUrl,
      center: config.center,
      zoom: 9,
      attributionControl: true,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', async () => {
      try {
        const response = await fetch(config.geoJsonUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const geoJson = await response.json() as FeatureCollection<LineString | Point>;
        map.addSource('wusun', { type: 'geojson', data: geoJson });
        map.addLayer({ id: 'wusun-track-outline', type: 'line', source: 'wusun', filter: ['==', ['geometry-type'], 'LineString'], paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.92 } });
        map.addLayer({ id: 'wusun-track', type: 'line', source: 'wusun', filter: ['==', ['geometry-type'], 'LineString'], paint: { 'line-color': '#50723a', 'line-width': 4 } });
        map.addLayer({ id: 'wusun-nodes', type: 'circle', source: 'wusun', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-radius': 7, 'circle-color': '#50723a', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 3 } });
        const track = geoJson.features.find((feature) => feature.geometry.type === 'LineString');
        if (!track || track.geometry.type !== 'LineString') throw new Error('缺少 LineString');
        const bounds = track.geometry.coordinates.reduce(
          (value, coordinate) => value.extend([coordinate[0], coordinate[1]]),
          new maplibregl.LngLatBounds(),
        );
        map.fitBounds(bounds, { padding: 64, duration: 0 });
      } catch (error) {
        onError(`路线轨迹暂时无法加载：${error instanceof Error ? error.message : '未知错误'}`);
      }
    });

    map.on('click', 'wusun-nodes', (event) => {
      const id = event.features?.[0]?.properties?.id;
      if (typeof id === 'string') onSelectNode(id);
    });
    map.on('error', (event) => onError(`地图加载失败：${event.error.message}`));
    return () => { map.remove(); mapRef.current = undefined; };
  }, [config, onError, onSelectNode]);

  useEffect(() => {
    if (!selectedNodeId) return;
    const node = config.nodes.find((candidate) => candidate.id === selectedNodeId);
    if (!node) throw new Error(`不存在的地图节点：${selectedNodeId}`);
    mapRef.current?.easeTo({ center: [node.coordinates[0], node.coordinates[1]], zoom: 12, duration: 600 });
  }, [config.nodes, selectedNodeId]);

  return <div ref={containerRef} className="absolute inset-0" aria-label="乌孙古道交互地图" />;
}
```

不得在该组件中查询 `RouteData` 或导入乌孙常量。

- [ ] **Step 2：运行构建**

```bash
npm run build
```

Expected: PASS，无未使用变量和类型错误。

- [ ] **Step 3：提交地图画布**

```bash
git add src/components/RouteMapCanvas.tsx
git commit -m "feat: render Wusun trail with MapLibre"
```

## Task 4：实现桌面双抽屉组件

**Files:**

- Create: `src/components/RouteNodeList.tsx`
- Create: `src/components/RouteDetailPanel.tsx`

- [ ] **Step 1：实现节点列表**

`RouteNodeList.tsx` 使用以下 Props：

```ts
interface Props {
  nodes: RouteMapNode[];
  selectedNodeId?: string;
  onSelect: (nodeId: string) => void;
}
```

每个节点使用 `<button type="button">`，显示本地 WebP 缩略图、节点名称、分类和海拔；选中态使用 `forest-500` 边框。组件必须默认导出。

- [ ] **Step 2：实现详情面板**

`RouteDetailPanel.tsx` 使用以下 Props：

```ts
interface Props {
  route: RouteData;
  node?: RouteMapNode;
}
```

无节点时显示路线摘要：路线名、subtitle、`106.9 km`、`6 天`、`累计爬升 6458 m` 和收藏入口；有节点时显示节点图片、分类、海拔和描述。不要实现 GPX 下载按钮，因为它不属于第一阶段。

- [ ] **Step 3：运行构建并提交**

```bash
npm run build
git add src/components/RouteNodeList.tsx src/components/RouteDetailPanel.tsx
git commit -m "feat: add Wusun desktop map panels"
```

Expected: build PASS，提交成功。

## Task 5：实现移动端三段式底部抽屉

**Files:**

- Create: `src/components/RouteMobileSheet.tsx`

- [ ] **Step 1：定义离散状态与 Props**

```ts
export type SheetLevel = 'summary' | 'nodes' | 'detail';

interface Props {
  route: RouteData;
  nodes: RouteMapNode[];
  selectedNode?: RouteMapNode;
  level: SheetLevel;
  onLevelChange: (level: SheetLevel) => void;
  onSelectNode: (nodeId: string) => void;
}
```

- [ ] **Step 2：实现拖动状态转换**

组件使用 `useRef<number>()` 保存 `pointerdown` 的起始 Y；`pointerup` 时按 48px 阈值转换：

```ts
const levels: SheetLevel[] = ['summary', 'nodes', 'detail'];

function moveLevel(current: SheetLevel, direction: -1 | 1): SheetLevel {
  const index = levels.indexOf(current);
  return levels[Math.max(0, Math.min(levels.length - 1, index + direction))];
}

function handlePointerUp(event: React.PointerEvent) {
  if (dragStartY.current === undefined) return;
  const distance = event.clientY - dragStartY.current;
  dragStartY.current = undefined;
  if (Math.abs(distance) < 48) return;
  onLevelChange(moveLevel(level, distance < 0 ? 1 : -1));
}
```

抽屉根元素必须使用 `touch-action: none`，仅抽屉把手区域捕获拖动；节点列表内部保持纵向滚动。

- [ ] **Step 3：实现三种内容**

- `summary`：路线名、106.9 km、6 天、累计爬升和“浏览节点”按钮。
- `nodes`：节点列表，点击后选择节点并进入 `detail`。
- `detail`：节点图片、名称、分类、海拔、描述和返回节点列表按钮。

- [ ] **Step 4：构建并提交**

```bash
npm run build
git add src/components/RouteMobileSheet.tsx
git commit -m "feat: add Wusun mobile map sheet"
```

Expected: build PASS。

## Task 6：组合地图体验并接入乌孙路线页

**Files:**

- Create: `src/components/RouteMapExperience.tsx`
- Modify: `src/pages/RoutePage.tsx:1-58`

- [ ] **Step 1：实现组合组件**

`RouteMapExperience.tsx` 的 Props：

```ts
interface Props {
  route: RouteData;
  config: RouteMapConfig;
}
```

从 `RouteMobileSheet` 同时导入组件和 `SheetLevel` 类型：

```ts
import RouteMobileSheet, { type SheetLevel } from './RouteMobileSheet';
```

组件状态固定为：

```ts
const [selectedNodeId, setSelectedNodeId] = useState<string>();
const [sheetLevel, setSheetLevel] = useState<SheetLevel>('summary');
const [errorMessage, setErrorMessage] = useState<string>();
const selectedNode = config.nodes.find((node) => node.id === selectedNodeId);
```

桌面端 `lg:flex` 显示 `RouteNodeList` 与 `RouteDetailPanel` 两个绝对定位抽屉；移动端 `lg:hidden` 显示 `RouteMobileSheet`。错误状态覆盖地图中央但不遮挡路线正文。

- [ ] **Step 2：只在乌孙页面启用**

修改 `RoutePage.tsx`：

```tsx
import RouteMapExperience from '../components/RouteMapExperience';
import { getRouteMapConfig } from '../data/routeMapData';
```

在取得 route 后查询：

```ts
const mapConfig = route ? getRouteMapConfig(route.slug) : undefined;
```

替换 Hero 渲染：

```tsx
{mapConfig ? <RouteMapExperience route={route} config={mapConfig} /> : <Hero route={route} />}
```

不得修改 `Overview`、`Highlights`、`Timeline`、`Risks`、`GearAdvisor` 或其他路线数据入口。

- [ ] **Step 3：构建并提交**

```bash
npm run build
git add src/components/RouteMapExperience.tsx src/pages/RoutePage.tsx
git commit -m "feat: integrate Wusun map experience"
```

Expected: build PASS；珠峰东坡继续显示原 Hero。

## Task 7：完成视觉样式、合规扫描和浏览器 QA

**Files:**

- Modify: `src/index.css`
- Verify: `src/pages/RoutePage.tsx`
- Verify: `src/data/routeMapData.ts`
- Verify: `public/routes/wusun.geojson`

- [ ] **Step 1：导入 MapLibre CSS**

在 `src/index.css` 顶部、Tailwind 指令之前增加：

```css
@import 'maplibre-gl/dist/maplibre-gl.css';
```

- [ ] **Step 2：增加必要的地图样式**

只增加 MapLibre 覆盖和底部抽屉状态样式；颜色使用项目色板对应值，不新增任意品牌色。必须包含：

```css
.route-map-shell { height: min(820px, calc(100vh - 64px)); min-height: 620px; }
.route-map-sheet { transition: height 240ms ease; touch-action: none; }
.route-map-sheet[data-level='summary'] { height: 190px; }
.route-map-sheet[data-level='nodes'] { height: 52vh; }
.route-map-sheet[data-level='detail'] { height: 78vh; }
.maplibregl-ctrl-attrib { font-size: 10px; }

@media (max-width: 1023px) {
  .route-map-shell { height: calc(100svh - 56px); min-height: 560px; }
}
```

- [ ] **Step 3：执行 AGENTS.md 合规扫描**

逐项确认：

- 路线内容通过 `getRouteBySlug()` 获取。
- 地图配置通过 `getRouteMapConfig()` 获取。
- 组件没有导入 `routeDataMap`、`wusunRoute` 或 KML 原文件。
- 所有本地图片使用 `/pics/*.webp`。
- 用户文案为中文，变量和类型为英文。
- 所有组件默认导出，Props 接口位于文件顶部。
- UI 未写新的 hex 值；如 MapLibre paint API 必须使用颜色字符串，将其集中到 `routeMapData.ts` 的地图样式配置并记录为地图渲染例外，不散落在 JSX。
- `public/routes/wusun.geojson` 不含个人信息与远程图片链接。
- 地图署名清晰可见且未被抽屉遮挡。

- [ ] **Step 4：运行自动验证**

```bash
node --test scripts/convert-wusun-kml.test.mjs
npm run build
rg -n "CreaterId|deviceName|2bulu.com|down-files" public/routes/wusun.geojson
```

Expected: tests PASS；build PASS；`rg` 无匹配。

- [ ] **Step 5：启动开发服务器**

```bash
npm run dev
```

Expected: Vite 输出本地访问地址。

- [ ] **Step 6：桌面浏览器 QA**

在 1440×900 视口验证：

- `/route/wusun` 首屏为真实地形地图和完整轨迹。
- 两个白色抽屉同时可见，文字和按钮清晰。
- 点击节点列表会聚焦地图并更新详情。
- 点击地图节点会同步选中列表节点。
- 缩放、拖动、适应轨迹正常。
- OSM/OpenFreeMap 署名没有被覆盖。
- 地图下方原有路线内容完整存在。
- `/route/everest-east` 仍使用原 Hero，没有地图回归。

- [ ] **Step 7：移动端浏览器 QA**

在 390×844 视口验证：

- 默认显示摘要抽屉并保留主要轨迹视野。
- 上滑依次进入节点列表和节点详情。
- 下滑依次返回节点列表和摘要。
- 拖动抽屉把手不会拖动地图。
- 拖动地图不会误改变抽屉状态。
- 节点列表可纵向滚动。
- 地图控件和署名未被导航或抽屉遮挡。

- [ ] **Step 8：修复 QA 发现并重新验证**

每个问题先记录复现路径，再做最小修改；重复 Task 7 Step 4、6、7，直到全部验收项通过。

- [ ] **Step 9：最终提交**

```bash
git add src/index.css src/components src/data/routeMapData.ts src/pages/RoutePage.tsx public/routes/wusun.geojson scripts package.json package-lock.json
git commit -m "feat: complete Wusun map experience"
```

Expected: 工作树仅保留与本任务无关的用户修改。

## Memory Closeout

实现与 QA 完成后：

- 在 `DECISIONS.md` 记录 MapLibre 依赖例外、OpenFreeMap 底图选择和 Komoot 仅作视觉参考的边界。
- 在 `OPEN_LOOPS.md` 将“乌孙古道地图样板”标记完成，并记录首页地图与其他路线推广仍未开始。
- 在 `STATUS.md` 写入构建结果、桌面/移动端 QA 结果。
- 如发现 KML 转换或 MapLibre 生命周期的可复用经验，写入 `40_Agent/Cases/`。
- 运行 `python3 .index/scripts/memory_index.py --scan`。
