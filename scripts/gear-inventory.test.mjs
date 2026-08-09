import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addGearItem,
  getGearInventory,
  inferGearSystem,
  removeGearItem,
  saveGearInventory,
  updateGearItem,
  updateGearItemSystem,
  updateGearItemStatus,
  validateGearName,
} from '../src/lib/gearInventory.ts';

const existingItems = [
  {
    id: 'older',
    name: 'Petzl Actik Core',
    createdAt: '2026-07-19T10:00:00.000Z',
    status: 'owned',
    systemSlug: 'navigation-safety',
  },
];

test('装备名称不能为空或与其他条目重复', () => {
  assert.equal(validateGearName(existingItems, '   '), '请输入装备名称');
  assert.equal(validateGearName(existingItems, '  petzl actik core  '), '清单中已有该装备');
  assert.equal(validateGearName(existingItems, 'Petzl Actik Core', 'older'), null);
  assert.equal(validateGearName(existingItems, 'Osprey Aether 65'), null);
});

test('新增装备置顶且不修改原清单', () => {
  const newItem = {
    id: 'newer',
    name: 'Osprey Aether 65',
    createdAt: '2026-07-20T10:00:00.000Z',
    status: 'wanted',
    systemSlug: 'carry-storage',
  };
  const result = addGearItem(existingItems, newItem);

  assert.deepEqual(result, [newItem, ...existingItems]);
  assert.deepEqual(existingItems, [
    {
      id: 'older',
      name: 'Petzl Actik Core',
      createdAt: '2026-07-19T10:00:00.000Z',
      status: 'owned',
      systemSlug: 'navigation-safety',
    },
  ]);
});

test('编辑装备修剪名称并保留标识与创建时间', () => {
  const result = updateGearItem(existingItems, 'older', '  Petzl Swift RL  ');

  assert.deepEqual(result, [
    {
      id: 'older',
      name: 'Petzl Swift RL',
      createdAt: '2026-07-19T10:00:00.000Z',
      status: 'owned',
      systemSlug: 'navigation-safety',
    },
  ]);
});

test('删除装备只移除目标条目', () => {
  const items = [
    ...existingItems,
    {
      id: 'second',
      name: 'MSR Hubba Hubba 2',
      createdAt: '2026-07-18T10:00:00.000Z',
      status: 'wanted',
      systemSlug: 'shelter',
    },
  ];

  assert.deepEqual(removeGearItem(items, 'older'), [items[1]]);
});

test('装备状态可双向更新且保留其他字段', () => {
  const movedToWanted = updateGearItemStatus(existingItems, 'older', 'wanted');
  const movedBackToOwned = updateGearItemStatus(movedToWanted, 'older', 'owned');

  assert.deepEqual(movedToWanted, [{ ...existingItems[0], status: 'wanted' }]);
  assert.deepEqual(movedBackToOwned, existingItems);
  assert.notEqual(movedToWanted, existingItems);
  assert.deepEqual(existingItems[0], {
    id: 'older',
    name: 'Petzl Actik Core',
    createdAt: '2026-07-19T10:00:00.000Z',
    status: 'owned',
    systemSlug: 'navigation-safety',
  });
});

test('不同状态的装备仍执行全局重名校验', () => {
  const items = [
    ...existingItems,
    {
      id: 'wanted',
      name: 'MSR Hubba Hubba 2',
      createdAt: '2026-07-21T10:00:00.000Z',
      status: 'wanted',
      systemSlug: 'shelter',
    },
  ];

  assert.equal(validateGearName(items, ' msr hubba hubba 2 '), '清单中已有该装备');
});

test('现有装备名称映射到六大系统', () => {
  const cases = [
    ['测试 Osprey 背包', 'carry-storage'],
    ['测试徒步鞋 GTX', 'wear-movement'],
    ['测试睡袋 -10度', 'sleep'],
    ['测试四季帐篷', 'shelter'],
    ['测试饮水袋 2L', 'food-hydration'],
    ['测试头灯', 'navigation-safety'],
  ];

  for (const [name, systemSlug] of cases) {
    assert.equal(inferGearSystem(name), systemSlug, name);
  }
  assert.equal(inferGearSystem('自制小物件'), null);
});

test('待购买装备名称自动映射到六大系统', () => {
  const cases = [
    ['测试四季帐篷', 'shelter'],
    ['备用充电宝', 'navigation-safety'],
    ['运动髌骨带', 'wear-movement'],
    ['轻量气垫', 'sleep'],
    ['旅行托运袋', 'carry-storage'],
    ['露营钛餐具', 'food-hydration'],
    ['防水压缩袋', 'carry-storage'],
    ['户外净水器', 'food-hydration'],
    ['随身急救包', 'navigation-safety'],
    ['充气枕', 'sleep'],
    ['轻量羽绒服', 'wear-movement'],
    ['三日补给包', 'food-hydration'],
  ];

  for (const [name, systemSlug] of cases) {
    assert.equal(inferGearSystem(name), systemSlug, name);
  }
  assert.equal(inferGearSystem('测试未知配件'), null);
});

test('装备服务通过 API 读取和保存', async t => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ items: existingItems, revision: 3 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  assert.deepEqual(await getGearInventory(), { items: existingItems, revision: 3 });
  assert.deepEqual(await saveGearInventory(existingItems, 3), { items: existingItems, revision: 3 });
  assert.equal(calls[0].url, '/api/gear');
  assert.equal(calls[0].options.method, undefined);
  assert.equal(calls[1].url, '/api/gear');
  assert.equal(calls[1].options.method, 'PUT');
  assert.deepEqual(JSON.parse(calls[1].options.body), { items: existingItems, revision: 3 });
});

test('装备服务透传 API 的中文错误', async t => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: '数据库暂时不可用' }),
    { status: 500, headers: { 'content-type': 'application/json' } },
  );
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  await assert.rejects(getGearInventory(), /数据库暂时不可用/);
});

test('更改装备系统保留名称、状态和创建时间', () => {
  const result = updateGearItemSystem(existingItems, 'older', 'wear-movement');

  assert.deepEqual(result, [{ ...existingItems[0], systemSlug: 'wear-movement' }]);
  assert.deepEqual(existingItems[0].systemSlug, 'navigation-safety');
});
