export interface RouteGeoData {
  slug: string;
  coordinates: [number, number];
}

export const routeGeoData: RouteGeoData[] = [
  { slug: 'wusun', coordinates: [83.8, 42.5] },
  { slug: 'haba-west', coordinates: [100.066, 27.326] },
];

export function getRouteGeoData(slug: string): RouteGeoData | undefined {
  return routeGeoData.find(route => route.slug === slug);
}
