import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFeatureCollection,
  parseTrack,
  simplifyTrack,
} from './convert-wusun-kml.mjs';

const fixture = `<?xml version="1.0"?>
<kml xmlns:gx="http://www.google.com/kml/ext/2.2"><Document>
  <ExtendedData><Data name="CreaterId"><value>123</value></Data></ExtendedData>
  <Placemark id="startPoint"><name><![CDATA[起点]]></name><Point><coordinates>82.1,42.9,2000</coordinates></Point></Placemark>
  <Placemark id="realPoint"><name><![CDATA[商业营地]]></name><description><![CDATA[<img src="https://files.2bulu.com/private.jpg">]]></description><Point><coordinates>82.2,42.8,2500</coordinates></Point></Placemark>
  <Placemark><gx:Track>
    <gx:coord>82.1 42.9 2000</gx:coord><gx:coord>82.15 42.85 2200</gx:coord><gx:coord>82.2 42.8 2500</gx:coord>
  </gx:Track></Placemark>
</Document></kml>`;

test('parseTrack extracts numeric longitude, latitude, and elevation', () => {
  assert.deepEqual(parseTrack(fixture), [
    [82.1, 42.9, 2000],
    [82.15, 42.85, 2200],
    [82.2, 42.8, 2500],
  ]);
});

test('simplifyTrack always keeps endpoints', () => {
  assert.deepEqual(simplifyTrack(parseTrack(fixture), 100_000), [
    [82.1, 42.9, 2000],
    [82.2, 42.8, 2500],
  ]);
});

test('output excludes personal metadata and remote image URLs', () => {
  const output = JSON.stringify(buildFeatureCollection(fixture));

  assert.equal(output.includes('CreaterId'), false);
  assert.equal(output.includes('2bulu.com'), false);
  assert.equal(output.includes('private.jpg'), false);
  assert.equal(output.includes('北段商业营地'), true);
});
