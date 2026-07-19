import type { RouteMapConfig } from '../types';
import { createMapTilerOutdoorStyleUrl } from '../lib/routeMapState';

const mapTilerApiKey = (import.meta.env.VITE_MAPTILER_API_KEY || '').trim();
const mapTilerOutdoorStyleUrl = mapTilerApiKey ? createMapTilerOutdoorStyleUrl(mapTilerApiKey) : '';

const routeMapConfigMap: Record<string, RouteMapConfig> = {
  wusun: {
    routeSlug: 'wusun',
    geoJsonUrl: '/routes/wusun.geojson',
    styleUrl: mapTilerOutdoorStyleUrl,
    center: [82.35, 42.62],
    ariaLabel: '乌孙古道交互地图',
    pathLabel: '琼库什台方向起点 → 黑英山方向出口',
    // MapLibre paint API requires concrete color strings; values mirror forest-500 and white.
    colors: { track: '#1a4d3e', outline: '#ffffff', node: '#1a4d3e' },
    summaryStats: [
      { label: '距离', value: '106.9 km' },
      { label: '时间', value: '6 天' },
      { label: '爬升', value: '6458 m' },
    ],
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
  'haba-west': {
    routeSlug: 'haba-west',
    geoJsonUrl: '/routes/haba-west.geojson',
    styleUrl: mapTilerOutdoorStyleUrl,
    center: [100.066, 27.325],
    ariaLabel: '哈巴西坡交互地图',
    pathLabel: '咖啡营地 → 双湖与黑海 → 咖啡营地',
    // MapLibre paint API requires concrete color strings; values mirror the forest palette.
    colors: { track: '#1a4d3e', outline: '#ffffff', node: '#1a4d3e' },
    summaryStats: [
      { label: '距离', value: '23.3 km' },
      { label: '时间', value: '3 天 2 夜' },
      { label: '爬升', value: '1571 m' },
    ],
    days: [
      { day: 1, label: '第一天', distance: '5.7 km', from: '咖啡营地', to: '双湖营地', color: '#6f9b80' },
      { day: 2, label: '第二天', distance: '7.1 km', from: '双湖营地', to: '黑海营地', color: '#1a4d3e' },
      { day: 3, label: '第三天', distance: '10.5 km', from: '黑海营地', to: '咖啡营地', color: '#123a2f' },
    ],
    nodes: [
      { id: 'start-end', name: '咖啡营地（起点/终点）', category: '起终点', dayLabel: '第1天 / 第3天', description: '闭环路线的出发与返回位置，也是全程唯一明确有手机信号的位置。', coordinates: [100.066273, 27.286494, 3465] },
      { id: 'double-lake-camp', name: '双湖营地', category: '营地', dayLabel: '第1天', description: '第一天行程终点。抵达后应关注高海拔适应和夜间保暖。', image: '/pics/haba/double-lake-camp.webp', coordinates: [100.066454, 27.326323, 4071] },
      { id: 'double-lake-pass', name: '双湖垭口', category: '垭口', dayLabel: '第2天', description: '第二天连续垭口路段的高点之一，轨迹节点海拔4378米。', coordinates: [100.053165, 27.346224, 4378] },
      { id: 'couple-lake-pass', name: '夫妻海垭口', category: '垭口', dayLabel: '第2天', description: '第二天连续翻越路段中的高海拔垭口，应结合当季积雪谨慎通行。', image: '/pics/haba/couple-lake-pass.webp', coordinates: [100.054230, 27.358742, 4369] },
      { id: 'black-lake-pass', name: '黑海垭口', category: '垭口', dayLabel: '第2天', description: '前往黑海营地途中经过的垭口节点，轨迹节点海拔4211米。', coordinates: [100.062571, 27.357947, 4211] },
      { id: 'black-lake-camp', name: '黑海营地', category: '营地', dayLabel: '第2天', description: '第二天行程终点，也是第三天返回咖啡营地前的宿营位置。', image: '/pics/haba/black-lake-camp.webp', coordinates: [100.068445, 27.354640, 4110] },
      { id: 'long-lake', name: '长湖', category: '景点', dayLabel: '第3天', description: '第三天从黑海营地出发后经过的高山湖泊节点。', image: '/pics/haba/long-lake.webp', coordinates: [100.075398, 27.348398, 4168] },
      { id: 'chicken-toe-pass', name: '鸡趾垭口', category: '垭口', dayLabel: '第3天', description: '第三天返程中的主要高点，翻越后继续下降返回咖啡营地。', coordinates: [100.080818, 27.338659, 4318] },
    ],
  },
};

export function getRouteMapConfig(slug: string): RouteMapConfig | undefined {
  return routeMapConfigMap[slug];
}
