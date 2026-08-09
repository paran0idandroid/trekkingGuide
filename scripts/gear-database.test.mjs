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

async function createTestDatabase(t) {
  const directory = await mkdtemp(join(tmpdir(), 'justdemo-gear-'));
  const path = join(directory, 'gear.sqlite');
  t.after(async () => {
    await rm(directory, { recursive: true, force: true });
  });
  return { path, database: createGearDatabase(path) };
}

test('SQLite 首次建表并在重新打开后保留装备', async t => {
  const { path, database } = await createTestDatabase(t);

  assert.deepEqual(database.getInventory(), { items: [], revision: 0 });
  assert.deepEqual(database.replaceItems(sampleItems, 0), { items: sampleItems, revision: 1 });
  database.close();

  const reopened = createGearDatabase(path);
  t.after(() => reopened.close());
  assert.deepEqual(reopened.getInventory(), { items: sampleItems, revision: 1 });
});

test('重复名称不会覆盖原清单', async t => {
  const { database } = await createTestDatabase(t);
  t.after(() => database.close());
  database.replaceItems(sampleItems, 0);

  assert.throws(() => database.replaceItems([
    sampleItems[0],
    { ...sampleItems[1], name: '  测试背包  ' },
  ], 1), /装备名称重复/);
  assert.deepEqual(database.getInventory(), { items: sampleItems, revision: 1 });
});

test('非法字段不会覆盖原清单', async t => {
  const { database } = await createTestDatabase(t);
  t.after(() => database.close());
  database.replaceItems(sampleItems, 0);

  assert.throws(() => database.replaceItems([
    { ...sampleItems[0], status: 'archived' },
  ], 1), /装备状态无效/);
  assert.throws(() => database.replaceItems([
    { ...sampleItems[0], systemSlug: 'unknown-system' },
  ], 1), /装备系统无效/);
  assert.throws(() => database.replaceItems([
    { ...sampleItems[0], createdAt: '2026-08-08' },
  ], 1), /创建时间无效/);
  assert.throws(() => database.replaceItems([
    { ...sampleItems[0], createdAt: '2026-99-99T99:99:99.999Z' },
  ], 1), /创建时间无效/);
  assert.throws(() => database.replaceItems([
    sampleItems[0],
    { ...sampleItems[1], id: sampleItems[0].id },
  ], 1), /装备 ID 重复/);
  assert.deepEqual(database.getInventory(), { items: sampleItems, revision: 1 });
});

test('旧 revision 不会覆盖新清单', async t => {
  const { database } = await createTestDatabase(t);
  t.after(() => database.close());
  database.replaceItems(sampleItems, 0);

  assert.throws(() => database.replaceItems([], 0), /装备清单已更新/);
  assert.deepEqual(database.getInventory(), { items: sampleItems, revision: 1 });
});
