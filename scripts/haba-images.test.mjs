import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const routeData = await readFile(new URL('../src/data/routeData.ts', import.meta.url), 'utf8');
const routeMapData = await readFile(new URL('../src/data/routeMapData.ts', import.meta.url), 'utf8');

const sceneImages = Array.from({ length: 5 }, (_, index) => `/pics/haba/scene-${index + 1}.webp`);
const nodeImages = {
  'double-lake-camp': '/pics/haba/double-lake-camp.webp',
  'couple-lake-pass': '/pics/haba/couple-lake-pass.webp',
  'black-lake-camp': '/pics/haba/black-lake-camp.webp',
  'long-lake': '/pics/haba/long-lake.webp',
};
const publishedImages = [...sceneImages, ...Object.values(nodeImages)];

test('Haba West publishes five ordered scene images', () => {
  let previousIndex = -1;
  for (const image of sceneImages) {
    const index = routeData.indexOf(`image: '${image}'`);
    assert.ok(index > previousIndex, `${image} should appear in order`);
    previousIndex = index;
  }
});

test('Haba West named nodes reference matching images', () => {
  for (const [nodeId, image] of Object.entries(nodeImages)) {
    assert.match(
      routeMapData,
      new RegExp(`id: '${nodeId}'[^\\n]*image: '${image.replaceAll('/', '\\/')}'`),
    );
  }
});

test('Haba West published images are WebP without embedded EXIF or XMP', async () => {
  for (const image of publishedImages) {
    const file = await readFile(new URL(`../public${image}`, import.meta.url));
    assert.equal(file.subarray(0, 4).toString('ascii'), 'RIFF', image);
    assert.equal(file.subarray(8, 12).toString('ascii'), 'WEBP', image);
    assert.equal(file.includes(Buffer.from('EXIF')), false, image);
    assert.equal(file.includes(Buffer.from('XMP ')), false, image);
  }
});
