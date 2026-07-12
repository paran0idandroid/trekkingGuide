export interface RouteGeoPoint {
  name: string;
  coords: [number, number]; // [lng, lat]
}

export interface RouteGeoData {
  slug: string;
  markerPoint: [number, number];
  linePoints: [number, number][];
  waypoints: RouteGeoPoint[];
  color: string;
}

export const routeGeoData: Record<string, RouteGeoData> = {
  'wusun': {
    slug: 'wusun',
    markerPoint: [83.8, 42.5],
    linePoints: [
      [83.1, 43.3],  // 伊宁/琼库什台
      [83.5, 43.1],  // 进山
      [83.8, 42.8],  // 包扎墩达坂
      [84.0, 42.5],  // 科克苏河
      [84.3, 42.2],  // 天堂湖
      [84.5, 42.0],  // 阿克布拉克达坂
      [84.2, 41.8],  // 下撤
      [84.0, 41.7],  // 黑英山出山
    ],
    waypoints: [
      { name: '琼库什台', coords: [83.5, 43.2] },
      { name: '天堂湖', coords: [84.3, 42.2] },
      { name: '黑英山', coords: [84.0, 41.7] },
    ],
    color: '#f472b6',
  },
  'everest-east': {
    slug: 'everest-east',
    markerPoint: [87.4, 28.0],
    linePoints: [
      [87.2, 28.4],  // 曲当乡
      [87.3, 28.2],  // 晓乌措
      [87.4, 28.0],  // 卓湘
      [87.5, 27.9],  // 汤湘
      [87.6, 27.8],  // 俄嘎
      [87.7, 27.7],  // 珠峰东坡大本营
      [87.5, 28.0],  // 返回
      [87.2, 28.4],  // 曲当乡
    ],
    waypoints: [
      { name: '曲当乡', coords: [87.2, 28.4] },
      { name: '汤湘', coords: [87.5, 27.9] },
      { name: '珠峰大本营', coords: [87.7, 27.7] },
    ],
    color: '#a78bfa',
  },
};

export function getRouteGeoData(slug: string): RouteGeoData | undefined {
  return routeGeoData[slug];
}
