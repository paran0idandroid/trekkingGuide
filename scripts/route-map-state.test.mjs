import test from 'node:test';
import assert from 'node:assert/strict';
import { moveSheetLevel, selectRouteNode } from '../src/lib/routeMapState.ts';

test('moveSheetLevel advances one level at a time', () => {
  assert.equal(moveSheetLevel('summary', 1), 'nodes');
  assert.equal(moveSheetLevel('nodes', 1), 'detail');
});

test('moveSheetLevel retreats one level at a time', () => {
  assert.equal(moveSheetLevel('detail', -1), 'nodes');
  assert.equal(moveSheetLevel('nodes', -1), 'summary');
});

test('moveSheetLevel stays inside valid bounds', () => {
  assert.equal(moveSheetLevel('summary', -1), 'summary');
  assert.equal(moveSheetLevel('detail', 1), 'detail');
});

test('moveSheetLevel does not open detail without a selected node', () => {
  assert.equal(moveSheetLevel('nodes', 1, false), 'nodes');
});

test('selectRouteNode selects a node and opens detail', () => {
  assert.deepEqual(selectRouteNode('heaven-lake'), {
    selectedNodeId: 'heaven-lake',
    sheetLevel: 'detail',
  });
});
