import test from 'node:test';
import assert from 'node:assert/strict';
import {
  gearSystems,
  getGearSystemBySlug,
  getGearSystems,
} from '../src/data/gearSystems.ts';
import { gearKnowledgeData } from '../src/data/gearKnowledge.ts';

const expectedSlugs = [
  'carry-storage',
  'shelter',
  'sleep',
  'wear-movement',
  'food-hydration',
  'navigation-safety',
];

test('注册六大装备系统并保持展示顺序', () => {
  assert.deepEqual(getGearSystems().map(system => system.slug), expectedSlugs);
  assert.equal(new Set(gearSystems.map(system => system.slug)).size, 6);
});

test('每个系统引用的装备知识都存在', () => {
  const knowledgeIds = new Set(gearKnowledgeData.map(item => item.id));

  for (const system of gearSystems) {
    for (const item of system.items) {
      assert.ok(knowledgeIds.has(item.knowledgeId), `${system.slug}: ${item.knowledgeId}`);
    }
  }
});

test('系统查询只返回明确注册的数据', () => {
  assert.equal(getGearSystemBySlug('sleep')?.name, '睡眠系统');
  assert.equal(getGearSystemBySlug('unknown'), undefined);
});

test('六大系统包含计划中的产品品类', () => {
  assert.deepEqual(
    gearSystems.map(system => system.items.flatMap(item => item.productCategories).sort()),
    [
      ['背包', '防水袋'].sort(),
      ['帐篷'],
      ['睡袋'],
      ['徒步鞋', '冲锋衣', '保暖层', '登山杖', '涉水鞋', '雪套', '防晒墨镜'].sort(),
      ['炉头套锅', '水袋水壶'].sort(),
      ['头灯'],
    ],
  );
});
