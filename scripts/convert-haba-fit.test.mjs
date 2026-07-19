import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertPublicGeoJson,
  buildFeatureCollection,
  nearestPointIndex,
  splitTrack,
} from './convert-haba-fit.mjs';

const track = [
  [100, 27, 3465],
  [100.01, 27.01, 4071],
  [100.02, 27.02, 4378],
  [100.03, 27.03, 4110],
  [100.04, 27.04, 4318],
  [100.00001, 27.00001, 3454],
];

test('nearestPointIndex snaps a reference to the FIT track', () => {
  assert.equal(nearestPointIndex(track, [100.0201, 27.0201]), 2);
});

test('splitTrack preserves shared day boundaries and closes the loop', () => {
  const segments = splitTrack(track, 1, 3);

  assert.deepEqual(segments.map((segment) => segment.length), [2, 3, 3]);
  assert.deepEqual(segments[0].at(-1), segments[1][0]);
  assert.deepEqual(segments[1].at(-1), segments[2][0]);
  assert.ok(Math.abs(segments[2].at(-1)[0] - segments[0][0][0]) < 0.0001);
});

test('public GeoJSON contains only map-safe properties', () => {
  const output = buildFeatureCollection({
    track,
    dayOneEndIndex: 1,
    dayTwoEndIndex: 3,
    nodes: [{
      id: 'start-end',
      name: '咖啡营地（起点/终点）',
      category: '起终点',
      dayLabel: '第1天 / 第3天',
      coordinates: track[0],
    }],
  });

  assert.doesNotThrow(() => assertPublicGeoJson(output));
  const serialized = JSON.stringify(output);
  for (const forbidden of ['timestamp', 'heartRate', 'speed', 'device', 'userId', 'activityId']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('public GeoJSON rejects unexpected properties', () => {
  const output = buildFeatureCollection({
    track,
    dayOneEndIndex: 1,
    dayTwoEndIndex: 3,
    nodes: [],
  });
  output.features[0].properties.timestamp = 'private';

  assert.throws(() => assertPublicGeoJson(output), /非公开字段：timestamp/);
});

test('public GeoJSON rejects unexpected top-level metadata', () => {
  const output = buildFeatureCollection({
    track,
    dayOneEndIndex: 1,
    dayTwoEndIndex: 3,
    nodes: [],
  });
  output.metadata = { activityId: 'private' };

  assert.throws(() => assertPublicGeoJson(output), /非公开顶层字段：metadata/);
});
