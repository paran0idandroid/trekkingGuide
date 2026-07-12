import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMapTilerOutdoorStyleUrl,
  getRouteDashArray,
  moveSheetLevel,
  selectRouteNode,
} from '../src/lib/routeMapState.ts';

test('createMapTilerOutdoorStyleUrl requires an API key', () => {
  assert.throws(
    () => createMapTilerOutdoorStyleUrl(''),
    /缺少 MapTiler API Key/,
  );
});

test('createMapTilerOutdoorStyleUrl builds the outdoor style URL', () => {
  assert.equal(
    createMapTilerOutdoorStyleUrl('demo-key'),
    'https://api.maptiler.com/maps/outdoor-v4/style.json?key=demo-key',
  );
});

test('getRouteDashArray cycles through a stable animation sequence', () => {
  assert.deepEqual(getRouteDashArray(0), [0, 4, 3]);
  assert.deepEqual(getRouteDashArray(8), [0, 4, 3]);
  assert.equal(getRouteDashArray(3).length, 3);
});

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
