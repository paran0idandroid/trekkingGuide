import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const allowedProperties = new Set([
  'kind',
  'day',
  'id',
  'name',
  'category',
  'dayLabel',
  'elevation',
]);

const dayOneEndReference = [100.066454, 27.326323];
const dayTwoEndReference = [100.068445, 27.354640];

export function nearestPointIndex(track, reference, start = 0, end = track.length) {
  let bestIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = start; index < end; index += 1) {
    const dx = track[index][0] - reference[0];
    const dy = track[index][1] - reference[1];
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  if (bestIndex < 0) throw new Error('无法将关键点吸附到 FIT 轨迹');
  return bestIndex;
}

export function splitTrack(track, dayOneEndIndex, dayTwoEndIndex) {
  if (!(0 < dayOneEndIndex && dayOneEndIndex < dayTwoEndIndex && dayTwoEndIndex < track.length - 1)) {
    throw new Error('三日轨迹边界无效');
  }

  return [
    track.slice(0, dayOneEndIndex + 1),
    track.slice(dayOneEndIndex, dayTwoEndIndex + 1),
    track.slice(dayTwoEndIndex),
  ];
}

function squaredDistanceToSegment(point, start, end) {
  const latitude = (start[1] + end[1]) / 2 * Math.PI / 180;
  const x = point[0] * Math.cos(latitude);
  const y = point[1];
  const startX = start[0] * Math.cos(latitude);
  const endX = end[0] * Math.cos(latitude);
  let dx = endX - startX;
  let dy = end[1] - start[1];

  if (dx !== 0 || dy !== 0) {
    const t = ((x - startX) * dx + (y - start[1]) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      dx = x - endX;
      dy = y - end[1];
    } else if (t > 0) {
      dx = x - (startX + dx * t);
      dy = y - (start[1] + dy * t);
    } else {
      dx = x - startX;
      dy = y - start[1];
    }
  }

  return dx * dx + dy * dy;
}

export function simplifyTrack(points, toleranceMeters) {
  if (toleranceMeters <= 0 || points.length <= 2) return points;

  const toleranceDegrees = toleranceMeters / 111_320;
  const threshold = toleranceDegrees * toleranceDegrees;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];

  while (stack.length > 0) {
    const [start, end] = stack.pop();
    let maxDistance = threshold;
    let selectedIndex = -1;

    for (let index = start + 1; index < end; index += 1) {
      const distance = squaredDistanceToSegment(points[index], points[start], points[end]);
      if (distance > maxDistance) {
        maxDistance = distance;
        selectedIndex = index;
      }
    }

    if (selectedIndex !== -1) {
      keep[selectedIndex] = 1;
      stack.push([start, selectedIndex], [selectedIndex, end]);
    }
  }

  return points.filter((_, index) => keep[index]);
}

export function buildFeatureCollection({
  track,
  dayOneEndIndex,
  dayTwoEndIndex,
  nodes,
  toleranceMeters = 0,
}) {
  const segments = splitTrack(track, dayOneEndIndex, dayTwoEndIndex)
    .map((segment) => simplifyTrack(segment, toleranceMeters));

  return {
    type: 'FeatureCollection',
    features: [
      ...segments.map((coordinates, index) => ({
        type: 'Feature',
        id: `haba-west-day-${index + 1}`,
        properties: { kind: 'track', day: index + 1 },
        geometry: { type: 'LineString', coordinates },
      })),
      ...nodes.map((node) => ({
        type: 'Feature',
        id: node.id,
        properties: {
          kind: 'node',
          id: node.id,
          name: node.name,
          category: node.category,
          dayLabel: node.dayLabel,
          elevation: Math.round(node.coordinates[2]),
        },
        geometry: { type: 'Point', coordinates: node.coordinates },
      })),
    ],
  };
}

export function assertPublicGeoJson(collection) {
  if (collection.type !== 'FeatureCollection' || !Array.isArray(collection.features)) {
    throw new Error('GeoJSON 不是有效的 FeatureCollection');
  }

  for (const key of Object.keys(collection)) {
    if (!['type', 'features'].includes(key)) throw new Error(`GeoJSON 含非公开顶层字段：${key}`);
  }

  for (const feature of collection.features) {
    for (const key of Object.keys(feature)) {
      if (!['type', 'id', 'properties', 'geometry'].includes(key)) {
        throw new Error(`GeoJSON 要素含非公开字段：${key}`);
      }
    }
    for (const key of Object.keys(feature.properties ?? {})) {
      if (!allowedProperties.has(key)) throw new Error(`GeoJSON 含非公开字段：${key}`);
    }
    for (const key of Object.keys(feature.geometry ?? {})) {
      if (!['type', 'coordinates'].includes(key)) throw new Error(`GeoJSON 几何含非公开字段：${key}`);
    }
  }
}

function fitCoordinateToDegrees(value, limit) {
  return Math.abs(value) <= limit ? value : value * 180 / 2 ** 31;
}

function extractTrack(recordMessages) {
  return recordMessages.flatMap((record) => {
    const altitude = record.enhancedAltitude ?? record.altitude;
    if (!Number.isFinite(record.positionLong)
      || !Number.isFinite(record.positionLat)
      || !Number.isFinite(altitude)) return [];

    return [[
      fitCoordinateToDegrees(record.positionLong, 180),
      fitCoordinateToDegrees(record.positionLat, 90),
      altitude,
    ]];
  });
}

function parseKmlPoint(kml, sourceName) {
  for (const match of kml.matchAll(/<Placemark[^>]*>([\s\S]*?)<\/Placemark>/g)) {
    const block = match[1];
    const name = (
      block.match(/<name><!\[CDATA\[([\s\S]*?)\]\]><\/name>/)?.[1]
      ?? block.match(/<name>([\s\S]*?)<\/name>/)?.[1]
    )?.trim();
    if (name !== sourceName) continue;

    const coordinate = block.match(
      /<Point>[\s\S]*?<coordinates>\s*([-\d.]+),([-\d.]+),([-\d.]+)/,
    );
    if (!coordinate) break;
    return coordinate.slice(1, 4).map(Number);
  }

  throw new Error(`KML 中缺少关键点：${sourceName}`);
}

function createNode(track, reference, range, node) {
  const index = nearestPointIndex(track, reference, range[0], range[1]);
  const coordinates = track[index];
  if (Math.round(coordinates[2]) !== node.elevation) {
    throw new Error(`${node.name} 的 FIT 海拔校验失败：${Math.round(coordinates[2])} m`);
  }
  return { ...node, coordinates };
}

function buildNodes(track, kml, dayOneEndIndex, dayTwoEndIndex) {
  const end = track.length;
  const nodes = [
    {
      id: 'start-end', name: '咖啡营地（起点/终点）', category: '起终点',
      dayLabel: '第1天 / 第3天', elevation: 3465, coordinates: track[0],
    },
    {
      id: 'double-lake-camp', name: '双湖营地', category: '营地',
      dayLabel: '第1天', elevation: 4071, coordinates: track[dayOneEndIndex],
    },
    createNode(track, parseKmlPoint(kml, '双湖垭口'), [dayOneEndIndex, dayTwoEndIndex + 1], {
      id: 'double-lake-pass', name: '双湖垭口', category: '垭口', dayLabel: '第2天', elevation: 4378,
    }),
    createNode(track, parseKmlPoint(kml, '夫妻湖垭口'), [dayOneEndIndex, dayTwoEndIndex + 1], {
      id: 'couple-lake-pass', name: '夫妻海垭口', category: '垭口', dayLabel: '第2天', elevation: 4369,
    }),
    createNode(track, [100.062571, 27.357947], [dayOneEndIndex, dayTwoEndIndex + 1], {
      id: 'black-lake-pass', name: '黑海垭口', category: '垭口', dayLabel: '第2天', elevation: 4211,
    }),
    {
      id: 'black-lake-camp', name: '黑海营地', category: '营地',
      dayLabel: '第2天', elevation: 4110, coordinates: track[dayTwoEndIndex],
    },
    createNode(track, parseKmlPoint(kml, '小黄海'), [dayTwoEndIndex, end], {
      id: 'long-lake', name: '长湖', category: '景点', dayLabel: '第3天', elevation: 4168,
    }),
    createNode(track, parseKmlPoint(kml, '吉支垭口'), [dayTwoEndIndex, end], {
      id: 'chicken-toe-pass', name: '鸡趾垭口', category: '垭口', dayLabel: '第3天', elevation: 4318,
    }),
  ];

  for (const node of nodes) {
    if (Math.round(node.coordinates[2]) !== node.elevation) {
      throw new Error(`${node.name} 的 FIT 海拔校验失败`);
    }
    delete node.elevation;
  }
  return nodes;
}

async function main() {
  const [sdkEntry, fitInput, kmlInput, output] = process.argv.slice(2);
  if (!sdkEntry || !fitInput || !kmlInput || !output) {
    throw new Error('用法：node scripts/convert-haba-fit.mjs <garmin-sdk-entry.js> <input.fit> <reference.kml> <output.geojson>');
  }

  const [{ Decoder, Stream }, fitBuffer, kml] = await Promise.all([
    import(pathToFileURL(sdkEntry).href),
    readFile(fitInput),
    readFile(kmlInput, 'utf8'),
  ]);

  if (!Decoder.isFIT(Stream.fromBuffer(fitBuffer))) throw new Error('输入文件不是有效 FIT');
  if (!new Decoder(Stream.fromBuffer(fitBuffer)).checkIntegrity()) throw new Error('FIT CRC 校验失败');

  const { messages, errors } = new Decoder(Stream.fromBuffer(fitBuffer)).read();
  if (errors.length > 0) throw new Error(`FIT 解码失败：${errors.join('; ')}`);

  const track = extractTrack(messages.recordMesgs ?? []);
  if (track.length < 2) throw new Error('FIT 中没有可用 GPS 轨迹');

  const dayOneEndIndex = nearestPointIndex(track, dayOneEndReference);
  const dayTwoEndIndex = nearestPointIndex(track, dayTwoEndReference, dayOneEndIndex + 1);
  const nodes = buildNodes(track, kml, dayOneEndIndex, dayTwoEndIndex);
  const collection = buildFeatureCollection({
    track,
    dayOneEndIndex,
    dayTwoEndIndex,
    nodes,
    toleranceMeters: 8,
  });
  assertPublicGeoJson(collection);

  await writeFile(output, `${JSON.stringify(collection)}\n`, 'utf8');
  console.log('FIT CRC 通过；输出 3 段轨迹、8 个关键点');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
