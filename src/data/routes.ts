import { RouteData } from '../types';
import { habaWestRoute, wusunRoute } from './routeData';

export const routeDataMap: Record<string, RouteData> = {
  'wusun': wusunRoute,
  'haba-west': habaWestRoute,
};

export function getRouteBySlug(slug: string): RouteData | undefined {
  return routeDataMap[slug];
}

export function getRoutesByRegion(regionSlug: string): RouteData[] {
  return Object.values(routeDataMap).filter(r => r.regionSlug === regionSlug);
}
