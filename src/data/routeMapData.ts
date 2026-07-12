import type { RouteMapConfig } from '../types';

const routeMapConfigMap: Record<string, RouteMapConfig> = {
  wusun: {
    routeSlug: 'wusun',
    geoJsonUrl: '/routes/wusun.geojson',
    styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
    center: [82.35, 42.62],
    nodes: [
      { id: 'start', name: '琼库什台方向起点', category: '起点', description: '乌孙古道北端徒步起点。', image: '/pics/14.webp', coordinates: [82.198760, 42.915280, 2023] },
      { id: 'north-camp', name: '北段商业营地', category: '营地', description: '轨迹记录中的北段补给与扎营位置。', image: '/pics/12.webp', coordinates: [82.270730, 42.824154, 2706] },
      { id: 'valley-camp', name: '河谷营地', category: '营地', description: '河谷中的平坦扎营区域。', image: '/pics/12.webp', coordinates: [82.339833, 42.716478, 2366] },
      { id: 'bridge', name: '科克苏河桥段', category: '河流', description: '轨迹记录中的重要过河节点。', image: '/pics/9.webp', coordinates: [82.326676, 42.668209, 1987] },
      { id: 'heaven-lake', name: '天堂湖观景点', category: '景点', description: '从高处俯瞰天堂湖的核心景观位置。', image: '/pics/11.webp', coordinates: [82.401612, 42.593914, 3058] },
      { id: 'akbulak-pass', name: '阿克布拉克达坂方向垭口', category: '垭口', description: '轨迹最高段附近的垭口节点。', image: '/pics/1.webp', coordinates: [82.391358, 42.547949, 3814] },
      { id: 'visitor-center', name: '南段游客中心', category: '景点', description: '南段出山途中经过的游客服务节点。', image: '/pics/10.webp', coordinates: [82.410349, 42.510818, 3049] },
      { id: 'end', name: '黑英山方向出口', category: '终点', description: '乌孙古道南端徒步终点。', image: '/pics/10.webp', coordinates: [82.510526, 42.314979, 1911] },
    ],
  },
};

export function getRouteMapConfig(slug: string): RouteMapConfig | undefined {
  return routeMapConfigMap[slug];
}
