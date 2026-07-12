import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const curatedNodes = {
  '起点': {
    id: 'start',
    name: '琼库什台方向起点',
    category: '起点',
    description: '乌孙古道北端徒步起点。',
    image: '/pics/14.webp',
  },
  '商业营地': {
    id: 'north-camp',
    name: '北段商业营地',
    category: '营地',
    description: '轨迹记录中的北段补给与扎营位置。',
    image: '/pics/12.webp',
  },
  '河谷营地': {
    id: 'valley-camp',
    name: '河谷营地',
    category: '营地',
    description: '河谷中的平坦扎营区域。',
    image: '/pics/12.webp',
  },
  '过大桥': {
    id: 'bridge',
    name: '科克苏河桥段',
    category: '河流',
    description: '轨迹记录中的重要过河节点。',
    image: '/pics/9.webp',
  },
  '俯瞰天堂湖': {
    id: 'heaven-lake',
    name: '天堂湖观景点',
    category: '景点',
    description: '从高处俯瞰天堂湖的核心景观位置。',
    image: '/pics/11.webp',
  },
  '垭口': {
    id: 'akbulak-pass',
    name: '阿克布拉克达坂方向垭口',
    category: '垭口',
    description: '轨迹最高段附近的垭口节点。',
    image: '/pics/1.webp',
  },
  '游客中心': {
    id: 'visitor-center',
    name: '南段游客中心',
    category: '景点',
    description: '南段出山途中经过的游客服务节点。',
    image: '/pics/10.webp',
  },
  '终点': {
    id: 'end',
    name: '黑英山方向出口',
    category: '终点',
    description: '乌孙古道南端徒步终点。',
    image: '/pics/10.webp',
  },
};

export function parseTrack(kml) {
  return [...kml.matchAll(/<gx:coord>\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*<\/gx:coord>/g)]
    .map((match) => match.slice(1, 4).map(Number));
}

function squaredDistanceToSegment(point, start, end) {
  const x = point[0];
  const y = point[1];
  let dx = end[0] - start[0];
  let dy = end[1] - start[1];

  if (dx !== 0 || dy !== 0) {
    const t = ((x - start[0]) * dx + (y - start[1]) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      dx = x - end[0];
      dy = y - end[1];
    } else if (t > 0) {
      dx = x - (start[0] + dx * t);
      dy = y - (start[1] + dy * t);
    } else {
      dx = x - start[0];
      dy = y - start[1];
    }
  }

  return dx * dx + dy * dy;
}

export function simplifyTrack(points, toleranceMeters = 12) {
  if (points.length <= 2) return points;

  const toleranceDegrees = toleranceMeters / 111_320;
  const threshold = toleranceDegrees * toleranceDegrees;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];

  while (stack.length) {
    const [start, end] = stack.pop();
    let maxDistance = threshold;
    let index = -1;

    for (let i = start + 1; i < end; i += 1) {
      const distance = squaredDistanceToSegment(points[i], points[start], points[end]);
      if (distance > maxDistance) {
        index = i;
        maxDistance = distance;
      }
    }

    if (index !== -1) {
      keep[index] = 1;
      stack.push([start, index], [index, end]);
    }
  }

  return points.filter((_, index) => keep[index]);
}

function parsePointPlacemarks(kml) {
  const seen = new Set();

  return [...kml.matchAll(/<Placemark[^>]*>([\s\S]*?)<\/Placemark>/g)].flatMap((match) => {
    const block = match[1];
    const coordinate = block.match(/<Point>[\s\S]*?<coordinates>\s*([-\d.]+),([-\d.]+),([-\d.]+)\s*<\/coordinates>[\s\S]*?<\/Point>/);
    const sourceName = block.match(/<name><!\[CDATA\[([\s\S]*?)\]\]><\/name>/)?.[1]?.trim();
    const curated = sourceName ? curatedNodes[sourceName] : undefined;

    if (!coordinate || !curated || seen.has(curated.id)) return [];
    seen.add(curated.id);

    return [{
      type: 'Feature',
      id: curated.id,
      properties: { ...curated },
      geometry: {
        type: 'Point',
        coordinates: coordinate.slice(1, 4).map(Number),
      },
    }];
  });
}

export function buildFeatureCollection(kml) {
  const track = simplifyTrack(parseTrack(kml));
  if (track.length < 2) throw new Error('KML 中没有可用的连续轨迹');

  return {
    type: 'FeatureCollection',
    metadata: {
      source: '乌孙古道 KML',
      distanceMeters: 106869.224,
      elevationGainMeters: 6458,
      elevationLossMeters: 6553,
    },
    features: [
      {
        type: 'Feature',
        id: 'wusun-track',
        properties: { kind: 'track' },
        geometry: { type: 'LineString', coordinates: track },
      },
      ...parsePointPlacemarks(kml),
    ],
  };
}

async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) {
    throw new Error('用法：node scripts/convert-wusun-kml.mjs <input.kml> <output.geojson>');
  }

  const kml = await readFile(input, 'utf8');
  await writeFile(output, `${JSON.stringify(buildFeatureCollection(kml))}\n`, 'utf8');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
