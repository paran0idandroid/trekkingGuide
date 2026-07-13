import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMapTilerOutdoorStyleUrl,
  getRouteNodeSelectionFilter,
  routeNodeSelectionStyle,
  getRouteDashArray,
  getRouteNodeLabelRules,
  getRouteNodeFocusOffset,
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

test('getRouteNodeLabelRules shows every node label on desktop', () => {
  const rules = getRouteNodeLabelRules(false);

  assert.deepEqual(
    rules.map(({ id, minZoom }) => ({ id, minZoom })),
    [
      { id: 'wusun-node-labels-core', minZoom: 0 },
      { id: 'wusun-node-labels-secondary', minZoom: 0 },
    ],
  );
  assert.deepEqual(
    rules.flatMap(({ categories }) => categories),
    ['起点', '终点', '营地', '垭口', '河流', '景点'],
  );
});

test('getRouteNodeLabelRules delays secondary labels on mobile', () => {
  const [core, secondary] = getRouteNodeLabelRules(true);

  assert.deepEqual(core.categories, ['起点', '终点', '营地', '垭口']);
  assert.equal(core.minZoom, 0);
  assert.deepEqual(secondary.categories, ['河流', '景点']);
  assert.equal(secondary.minZoom, 11);
});

test('selected route node uses a double ring without changing the label treatment', () => {
  assert.deepEqual(getRouteNodeSelectionFilter('river-camp'), [
    'all',
    ['==', ['geometry-type'], 'Point'],
    ['==', ['get', 'id'], 'river-camp'],
  ]);
  assert.deepEqual(routeNodeSelectionStyle, {
    ringRadius: 13,
    ringBlur: 0.12,
    labelHaloWidth: 2,
  });
});

test('selected route node focuses inside the unobstructed desktop map area', () => {
  assert.deepEqual(getRouteNodeFocusOffset(1440, 820), [335, 0]);
  assert.deepEqual(getRouteNodeFocusOffset(1024, 700), [335, 0]);
});

test('selected route node focuses above the mobile detail sheet', () => {
  assert.deepEqual(getRouteNodeFocusOffset(390, 800), [0, -312]);
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
