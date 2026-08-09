# 本地 SQLite 装备后端实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use test-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用本机 Node API 和 SQLite 文件替换浏览器 IndexedDB，让“我的装备”通过接口持久化单机单用户清单。

**Architecture:** 一个 Node 进程在 `localhost:58514` 同时运行装备 API 和 Vite middleware。SQLite 模块独立负责建表、验证和事务替换；前端继续保留现有纯函数与 UI，只把存储读写改为 `GET /api/gear` 和 `PUT /api/gear`。

**Tech Stack:** Node.js 26、内置 `node:sqlite`、Node HTTP、Vite 5 middleware、React 18、TypeScript 5、Node 内置测试。

**Review hardening:** 独立审查后为整表 PUT 增加递增 `revision`；旧快照返回 409，避免多标签页静默覆盖。输入校验同时补充重复 ID 与严格 ISO 时间。

---

## 文件职责

- Create `server/gearDatabase.mjs`：SQLite schema、输入验证、查询和整表事务保存。
- Create `server/gearApi.mjs`：HTTP 路由、JSON 解析、状态码和中文错误响应。
- Create `server/dev.mjs`：同端口组合 API 与 Vite middleware。
- Create `scripts/gear-database.test.mjs`：真实临时 SQLite 文件行为测试。
- Create `scripts/gear-api.test.mjs`：真实 HTTP API 测试。
- Modify `src/lib/gearInventory.ts`：保留纯逻辑，存储实现改为 fetch API。
- Modify `src/components/GearInventory.tsx`：移除 owner/phone 与 IndexedDB 切换逻辑。
- Modify `src/pages/MyGearPage.tsx`：改为单机单用户页面。
- Modify `scripts/gear-inventory.test.mjs`：移除 IndexedDB stub，增加 fetch 契约测试。
- Modify `scripts/gear-inventory-ui.test.mjs`：断言单用户 API 数据流、不再依赖 IndexedDB。
- Modify `package.json`：统一 `npm run dev` 启动命令和后端测试命令。
- Modify `.gitignore`：忽略 `.local-data/`。

### Task 1: SQLite 数据库模块

**Files:**
- Create: `scripts/gear-database.test.mjs`
- Create: `server/gearDatabase.mjs`

- [x] **Step 1: 写数据库失败测试**

测试使用真实临时 SQLite 文件，不 mock 数据库：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createGearDatabase } from '../server/gearDatabase.mjs';

const sampleItems = [
  {
    id: 'owned-1',
    name: '测试背包',
    status: 'owned',
    systemSlug: 'carry-storage',
    createdAt: '2026-08-08T08:00:00.000Z',
  },
  {
    id: 'wanted-1',
    name: '测试帐篷',
    status: 'wanted',
    systemSlug: 'shelter',
    createdAt: '2026-08-08T07:00:00.000Z',
  },
];

test('SQLite 首次建表并在重新打开后保留装备', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'justdemo-gear-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, 'gear.sqlite');
  const first = createGearDatabase(path);
  assert.deepEqual(first.listItems(), []);
  first.replaceItems(sampleItems);
  first.close();
  const reopened = createGearDatabase(path);
  t.after(() => reopened.close());
  assert.deepEqual(reopened.listItems(), sampleItems);
});

test('重复名称或非法状态不会覆盖原清单', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'justdemo-gear-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const database = createGearDatabase(join(directory, 'gear.sqlite'));
  t.after(() => database.close());
  database.replaceItems(sampleItems);
  assert.throws(() => database.replaceItems([
    sampleItems[0],
    { ...sampleItems[1], name: '  测试背包  ' },
  ]), /装备名称重复/);
  assert.throws(() => database.replaceItems([
    { ...sampleItems[0], status: 'archived' },
  ]), /装备状态无效/);
  assert.deepEqual(database.listItems(), sampleItems);
});
```

- [x] **Step 2: 运行测试确认失败**

Run: `node --test scripts/gear-database.test.mjs`  
Expected: FAIL，提示找不到 `server/gearDatabase.mjs`。

- [x] **Step 3: 实现最小 SQLite 模块**

`createGearDatabase(databasePath)` 返回：

```js
{
  listItems(),
  replaceItems(items),
  close(),
}
```

使用 Node 内置 `DatabaseSync`，创建严格表 `gear_items`，字段为 `id`、`name`、`normalized_name`、`status`、`system_slug`、`created_at`。先完整验证和标准化数组，再执行 `BEGIN IMMEDIATE`、`DELETE`、逐条 `INSERT`、`COMMIT`；写入异常时 `ROLLBACK` 并重新抛出。`listItems()` 使用 `ORDER BY created_at DESC` 并映射为 camelCase。

- [x] **Step 4: 运行数据库测试**

Run: `node --test scripts/gear-database.test.mjs`  
Expected: PASS。

### Task 2: 装备 HTTP API

**Files:**
- Create: `scripts/gear-api.test.mjs`
- Create: `server/gearApi.mjs`

- [x] **Step 1: 写真实 HTTP 失败测试**

使用临时数据库和随机端口创建 Node HTTP server，测试：

```js
const server = createServer((request, response) => {
  void handleGearApi(request, response, database);
});

const initial = await fetch(`${baseUrl}/api/gear`);
assert.equal(initial.status, 200);
assert.deepEqual(await initial.json(), { items: [] });

const saved = await fetch(`${baseUrl}/api/gear`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ items: sampleItems }),
});
assert.equal(saved.status, 200);
assert.deepEqual(await saved.json(), { items: sampleItems });
```

同时测试非法 JSON 和重复名称返回 400、未知 `/api/*` 返回 404、非 GET/PUT 返回 405、超过 1 MiB 返回 413，且失败请求不覆盖原数据。

- [x] **Step 2: 运行测试确认失败**

Run: `node --test scripts/gear-api.test.mjs`  
Expected: FAIL，提示找不到 `server/gearApi.mjs`。

- [x] **Step 3: 实现 API handler**

导出：

```js
export async function handleGearApi(request, response, database) {
  // GET /api/gear -> database.listItems()
  // PUT /api/gear -> parseJsonBody() -> database.replaceItems(body.items)
  // API 请求处理后返回 true；非 /api 路径返回 false
}
```

JSON 响应设置 `content-type: application/json; charset=utf-8`。数据库校验错误映射为 400；未知错误只在终端记录，浏览器收到通用中文 500，不返回堆栈。

- [x] **Step 4: 运行 API 与数据库测试**

Run: `node --test scripts/gear-database.test.mjs scripts/gear-api.test.mjs`  
Expected: PASS。

### Task 3: 单进程本地开发服务器

**Files:**
- Create: `server/dev.mjs`
- Modify: `package.json`
- Modify: `.gitignore`
- Test: `scripts/gear-api.test.mjs`

- [x] **Step 1: 增加启动契约失败测试**

读取配置并断言：

```js
assert.equal(packageJson.scripts.dev, 'node server/dev.mjs');
assert.match(gitignore, /^\.local-data\/$/m);
assert.match(devServer, /middlewareMode: true/);
assert.match(devServer, /localhost/);
assert.match(devServer, /58514/);
```

- [x] **Step 2: 运行测试确认失败**

Run: `node --test scripts/gear-api.test.mjs`  
Expected: FAIL，启动脚本和配置尚不存在。

- [x] **Step 3: 创建统一启动入口**

使用 `createViteServer({ server: { middlewareMode: true }, appType: 'spa' })`，HTTP handler 先调用 `handleGearApi()`，非 API 请求交给 `vite.middlewares`。数据库固定为 `.local-data/gear.sqlite`，监听 `localhost:58514`。监听错误时关闭数据库和 Vite 后退出；收到 `SIGINT` / `SIGTERM` 时依次关闭 HTTP、Vite、SQLite。

`package.json`：

```json
{
  "scripts": {
    "dev": "node server/dev.mjs",
    "test:gear-backend": "node --test scripts/gear-database.test.mjs scripts/gear-api.test.mjs"
  }
}
```

`.gitignore` 增加 `.local-data/`。

- [x] **Step 4: 运行启动契约和后端测试**

Run: `npm run test:gear-backend`  
Expected: 数据库与 API 测试全部 PASS。

### Task 4: 前端改用 API

**Files:**
- Modify: `src/lib/gearInventory.ts`
- Modify: `src/components/GearInventory.tsx`
- Modify: `src/pages/MyGearPage.tsx`
- Modify: `scripts/gear-inventory.test.mjs`
- Modify: `scripts/gear-inventory-ui.test.mjs`

- [x] **Step 1: 将存储测试改为 fetch 契约**

删除 IndexedDB/localStorage stub 测试，增加：

```js
test('装备服务通过 API 读取和保存', async t => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ items: existingItems }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
  t.after(() => { globalThis.fetch = originalFetch; });
  assert.deepEqual(await getGearInventory(), existingItems);
  await saveGearInventory(existingItems);
  assert.equal(calls[0].url, '/api/gear');
  assert.equal(calls[1].options.method, 'PUT');
  assert.deepEqual(JSON.parse(calls[1].options.body), { items: existingItems });
});

test('API 错误返回中文信息', async t => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: '数据库暂时不可用' }),
    { status: 500, headers: { 'content-type': 'application/json' } },
  );
  t.after(() => { globalThis.fetch = originalFetch; });
  await assert.rejects(getGearInventory(), /数据库暂时不可用/);
});
```

UI 静态测试断言 `GearInventory` 无 `phone` props、`MyGearPage` 不读取 `useAuth`、存储服务无 `indexedDB`、`getItem` 或 `removeItem`。

- [x] **Step 2: 运行测试确认失败**

Run: `node --test scripts/gear-inventory.test.mjs scripts/gear-inventory-ui.test.mjs`  
Expected: FAIL，现有函数仍要求 owner 并使用 IndexedDB。

- [x] **Step 3: 替换前端存储实现**

保留名称校验、分类和数组纯函数，新增：

```ts
const GEAR_API_URL = '/api/gear';

export async function getGearInventory(): Promise<GearInventoryItem[]> {
  return parseGearResponse(await fetch(GEAR_API_URL));
}

export async function saveGearInventory(
  items: GearInventoryItem[],
): Promise<GearInventoryItem[]> {
  return parseGearResponse(await fetch(GEAR_API_URL, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items }),
  }));
}
```

`parseGearResponse` 对非 2xx 抛出后端中文 `error`，并验证成功响应包含数组。`GearInventory` 删除 `phone` prop、`ownerRef` 和 owner 切换分支；加载调用 `getGearInventory()`，提交调用 `saveGearInventory(nextItems)`。`MyGearPage` 直接渲染 `<GearInventory />`。

- [x] **Step 4: 运行前端装备测试**

Run: `node --test scripts/gear-inventory.test.mjs scripts/gear-inventory-ui.test.mjs`  
Expected: PASS。

### Task 5: 写入本机清单并验证持久化

**Files:**
- Runtime only: `.local-data/gear.sqlite`（Git ignored）
- No personal equipment names added to tracked files

- [x] **Step 1: 停止旧 Vite 进程并启动统一服务**

只终止已确认属于当前项目且监听 58514 的进程，然后运行 `npm run dev`。Expected: 终端显示页面与 API 均位于 `http://localhost:58514`，并创建 `.local-data/gear.sqlite`。

- [x] **Step 2: 通过页面写入用户清单**

使用当前会话中用户已授权的清单，通过 UI/API 写入 19 件已有装备和 25 件待购买装备。请求仅发送到本机 API，不创建包含个人清单的源码、fixture、日志文件或 seed 文件。

- [x] **Step 3: 直接核验 SQLite**

只读执行：

```js
import { DatabaseSync } from 'node:sqlite';
const database = new DatabaseSync('.local-data/gear.sqlite', { readOnly: true });
console.log(database.prepare(`
  SELECT status, COUNT(*) AS count
  FROM gear_items
  GROUP BY status
  ORDER BY status
`).all());
database.close();
```

Expected: `owned = 19`、`wanted = 25`，总数 44。

- [x] **Step 4: 重启验证**

关闭统一服务，确认 58514 不再监听；重新运行 `npm run dev` 并刷新 `/my-gear`。Expected: 页面仍显示“已有 19 · 待购买 25”，清单内容完整。

### Task 6: 全量 QA、审查与记忆收尾

**Files:**
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/DECISIONS.md`
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/STATUS.md`
- Modify: `/Users/jon/Documents/Obliviate/20_Projects/justdemo/OPEN_LOOPS.md`

- [x] **Step 1: 运行自动化验证**

```bash
node --test scripts/*.test.mjs
npx vite build
npm run build
git diff --check
```

Expected: Node 测试、Vite production build 和 diff check 通过；完整 TypeScript build 只允许项目既有的 `GearAdvisorModal` 与 `ImportMeta.env` 诊断，本次文件不得新增诊断。

- [x] **Step 2: 浏览器 QA**

在 1440×900 和 390×844 验证数量、内容、增删改、自动/手动分类、状态移动、中文错误、刷新与项目重启持久化；页面无横向溢出，触控目标保持至少 44px。

- [x] **Step 3: 合规扫描与独立审查**

确认：无新增依赖；API 只监听 localhost；`.local-data/` 已忽略；个人清单未进入 tracked 文件；UI 仍只使用 forest/sand；没有修改无关业务代码。完成独立代码审查并修复全部 Critical/Important。

- [x] **Step 4: 记忆收尾**

记录单机单用户、SQLite 文件、API 契约、QA 结果和不再使用 IndexedDB 的决策，然后运行：

```bash
python3 .index/scripts/memory_index.py --scan
```
