import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const geoJson = JSON.parse(await readFile(
  new URL('../public/routes/haba-west.geojson', import.meta.url),
  'utf8',
));
const tracks = geoJson.features.filter(({ geometry }) => geometry.type === 'LineString');
const nodes = geoJson.features.filter(({ geometry }) => geometry.type === 'Point');

test('Haba GeoJSON has three day tracks and eight unique nodes', () => {
  assert.deepEqual(tracks.map(({ properties }) => properties.day), [1, 2, 3]);
  assert.equal(nodes.length, 8);
  assert.equal(new Set(nodes.map(({ properties }) => properties.id)).size, 8);
});

test('Haba day tracks connect and return to the start', () => {
  assert.deepEqual(tracks[0].geometry.coordinates.at(-1), tracks[1].geometry.coordinates[0]);
  assert.deepEqual(tracks[1].geometry.coordinates.at(-1), tracks[2].geometry.coordinates[0]);
  const start = tracks[0].geometry.coordinates[0];
  const end = tracks[2].geometry.coordinates.at(-1);
  assert.ok(Math.hypot(start[0] - end[0], start[1] - end[1]) < 0.0005);
});

test('Haba nodes use approved names and elevations', () => {
  const actual = Object.fromEntries(
    nodes.map(({ properties }) => [properties.name, properties.elevation]),
  );
  assert.deepEqual(actual, {
    '咖啡营地（起点/终点）': 3465,
    '双湖营地': 4071,
    '双湖垭口': 4378,
    '夫妻海垭口': 4369,
    '黑海垭口': 4211,
    '黑海营地': 4110,
    '长湖': 4168,
    '鸡趾垭口': 4318,
  });
});

test('Haba public GeoJSON excludes private activity fields', () => {
  const serialized = JSON.stringify(geoJson).toLowerCase();
  for (const value of ['timestamp', 'heartrate', 'speed', 'device', 'userid', 'activityid', 'coros']) {
    assert.equal(serialized.includes(value), false);
  }
});
