import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGearDetailSearch,
  resolveGearDetailState,
  toggleSelectionSection,
} from '../src/lib/gearSystemState.ts';

const knowledgeIds = ['hiking-shoes', 'rain-jacket', 'trekking-poles'];

test('URL 参数恢复当前装备和标签', () => {
  const state = resolveGearDetailState(
    new URLSearchParams('gear=trekking-poles&tab=products'),
    knowledgeIds,
  );

  assert.deepEqual(state, { gear: 'trekking-poles', tab: 'products', needsNormalization: false });
});

test('无效装备参数回到系统首项并重置标签', () => {
  const state = resolveGearDetailState(
    new URLSearchParams('gear=unknown&tab=products'),
    knowledgeIds,
  );

  assert.deepEqual(state, { gear: 'hiking-shoes', tab: 'overview', needsNormalization: true });
});

test('显式 overview 标签会归一化为简洁 URL', () => {
  const state = resolveGearDetailState(
    new URLSearchParams('gear=rain-jacket&tab=overview'),
    knowledgeIds,
  );

  assert.deepEqual(state, { gear: 'rain-jacket', tab: 'overview', needsNormalization: true });
});

test('切换装备会清除旧标签，切换标签会保留装备', () => {
  const changedGear = createGearDetailSearch(
    new URLSearchParams('gear=hiking-shoes&tab=selection'),
    'rain-jacket',
    'overview',
  );
  const changedTab = createGearDetailSearch(changedGear, 'rain-jacket', 'products');

  assert.equal(changedGear.toString(), 'gear=rain-jacket');
  assert.equal(changedTab.toString(), 'gear=rain-jacket&tab=products');
});

test('再次点击已展开的选购分组会将其收起', () => {
  assert.equal(toggleSelectionSection('indicators', 'indicators'), null);
  assert.equal(toggleSelectionSection(null, 'mistakes'), 'mistakes');
});
