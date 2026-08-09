import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createGearDatabase } from '../server/gearDatabase.mjs';
import { handleGearApi } from '../server/gearApi.mjs';

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

async function createTestServer(t) {
  const directory = await mkdtemp(join(tmpdir(), 'justdemo-gear-api-'));
  const database = createGearDatabase(join(directory, 'gear.sqlite'));
  const server = createServer((request, response) => {
    void handleGearApi(request, response, database);
  });
  t.after(async () => {
    if (server.listening) {
      server.close();
      await once(server, 'close');
    }
    database.close();
    await rm(directory, { recursive: true, force: true });
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();

  return { baseUrl: `http://127.0.0.1:${address.port}`, database };
}

test('GET 和 PUT 通过 HTTP 保存并读取装备', async t => {
  const { baseUrl } = await createTestServer(t);

  const initial = await fetch(`${baseUrl}/api/gear`);
  assert.equal(initial.status, 200);
  assert.deepEqual(await initial.json(), { items: [], revision: 0 });

  const saved = await fetch(`${baseUrl}/api/gear`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items: sampleItems, revision: 0 }),
  });
  assert.equal(saved.status, 200);
  assert.deepEqual(await saved.json(), { items: sampleItems, revision: 1 });

  const reloaded = await fetch(`${baseUrl}/api/gear`);
  assert.deepEqual(await reloaded.json(), { items: sampleItems, revision: 1 });
});

test('非法请求返回中文错误且不覆盖原清单', async t => {
  const { baseUrl, database } = await createTestServer(t);
  database.replaceItems(sampleItems, 0);

  const malformed = await fetch(`${baseUrl}/api/gear`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: '{',
  });
  assert.equal(malformed.status, 400);
  assert.deepEqual(await malformed.json(), { error: '请求 JSON 格式无效' });

  const duplicate = await fetch(`${baseUrl}/api/gear`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      items: [sampleItems[0], { ...sampleItems[1], name: ' 测试背包 ' }], revision: 1,
    }),
  });
  assert.equal(duplicate.status, 400);
  assert.deepEqual(await duplicate.json(), { error: '装备名称重复' });
  assert.deepEqual(database.getInventory(), { items: sampleItems, revision: 1 });

  const duplicateId = await fetch(`${baseUrl}/api/gear`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      items: [sampleItems[0], { ...sampleItems[1], id: sampleItems[0].id }], revision: 1,
    }),
  });
  assert.equal(duplicateId.status, 400);
  assert.deepEqual(await duplicateId.json(), { error: '装备 ID 重复' });

  const invalidDate = await fetch(`${baseUrl}/api/gear`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      items: [{ ...sampleItems[0], createdAt: '2026-08-08' }], revision: 1,
    }),
  });
  assert.equal(invalidDate.status, 400);
  assert.deepEqual(await invalidDate.json(), { error: '装备创建时间无效' });

  const impossibleDate = await fetch(`${baseUrl}/api/gear`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      items: [{ ...sampleItems[0], createdAt: '2026-99-99T99:99:99.999Z' }], revision: 1,
    }),
  });
  assert.equal(impossibleDate.status, 400);
  assert.deepEqual(await impossibleDate.json(), { error: '装备创建时间无效' });
  assert.deepEqual(database.getInventory(), { items: sampleItems, revision: 1 });
});

test('旧 revision 返回 409 且不覆盖新清单', async t => {
  const { baseUrl } = await createTestServer(t);
  const first = await fetch(`${baseUrl}/api/gear`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items: sampleItems, revision: 0 }),
  });
  assert.equal(first.status, 200);

  const stale = await fetch(`${baseUrl}/api/gear`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items: [], revision: 0 }),
  });
  assert.equal(stale.status, 409);
  assert.deepEqual(await stale.json(), { error: '装备清单已更新，请刷新后重试' });
});

test('API 拒绝未知路径、方法和超大请求', async t => {
  const { baseUrl } = await createTestServer(t);

  const missing = await fetch(`${baseUrl}/api/missing`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: '接口不存在' });

  const apiRoot = await fetch(`${baseUrl}/api`);
  assert.equal(apiRoot.status, 404);
  assert.deepEqual(await apiRoot.json(), { error: '接口不存在' });

  const method = await fetch(`${baseUrl}/api/gear`, { method: 'POST' });
  assert.equal(method.status, 405);
  assert.deepEqual(await method.json(), { error: '请求方法不支持' });

  const oversized = await fetch(`${baseUrl}/api/gear`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items: [], padding: 'x'.repeat(1024 * 1024) }),
  });
  assert.equal(oversized.status, 413);
  assert.deepEqual(await oversized.json(), { error: '请求内容过大' });
});

test('本地服务配置固定端口并忽略数据库文件', async () => {
  const [packageJsonText, gitignore, devServer] = await Promise.all([
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
    readFile(new URL('../.gitignore', import.meta.url), 'utf8'),
    readFile(new URL('../server/dev.mjs', import.meta.url), 'utf8').catch(() => ''),
  ]);
  const packageJson = JSON.parse(packageJsonText);

  assert.equal(packageJson.scripts.dev, 'node server/dev.mjs');
  assert.equal(
    packageJson.scripts['test:gear-backend'],
    'node --test scripts/gear-database.test.mjs scripts/gear-api.test.mjs',
  );
  assert.match(gitignore, /^\.local-data\/$/m);
  assert.match(devServer, /middlewareMode: true/);
  assert.match(devServer, /localhost/);
  assert.match(devServer, /58514/);
});
