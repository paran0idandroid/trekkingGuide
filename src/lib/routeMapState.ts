export type SheetLevel = 'summary' | 'nodes' | 'detail';

interface RouteNodeLabelRule {
  id: string;
  categories: string[];
  minZoom: number;
}

type RouteNodeSelectionFilter = [
  'all',
  ['==', ['geometry-type'], 'Point'],
  ['==', ['get', 'id'], string],
];

export const routeNodeSelectionStyle = {
  ringRadius: 13,
  ringBlur: 0.12,
  labelHaloWidth: 2,
} as const;

const sheetLevels: SheetLevel[] = ['summary', 'nodes', 'detail'];
const routeDashArrays = [
  [0, 4, 3],
  [0.5, 3.5, 3],
  [1, 3, 3],
  [1.5, 2.5, 3],
  [2, 2, 3],
  [2.5, 1.5, 3],
  [3, 1, 3],
  [3.5, 0.5, 3],
] as const;

export function createMapTilerOutdoorStyleUrl(apiKey: string): string {
  if (!apiKey.trim()) throw new Error('缺少 MapTiler API Key');
  return `https://api.maptiler.com/maps/outdoor-v4/style.json?key=${encodeURIComponent(apiKey)}`;
}

export function getRouteDashArray(frame: number): number[] {
  return [...routeDashArrays[Math.abs(Math.trunc(frame)) % routeDashArrays.length]];
}

export function getRouteLayerIds(routeSlug: string) {
  return {
    source: routeSlug,
    trackOutline: `${routeSlug}-track-outline`,
    nodeSelection: `${routeSlug}-node-selection`,
    nodes: `${routeSlug}-nodes`,
    coreLabels: `${routeSlug}-node-labels-core`,
    secondaryLabels: `${routeSlug}-node-labels-secondary`,
  } as const;
}

export function getRouteNodeLabelRules(routeSlug: string, isMobile: boolean): RouteNodeLabelRule[] {
  const ids = getRouteLayerIds(routeSlug);
  return [
    {
      id: ids.coreLabels,
      categories: ['起点', '终点', '起终点', '营地', '垭口'],
      minZoom: 0,
    },
    {
      id: ids.secondaryLabels,
      categories: ['河流', '景点'],
      minZoom: isMobile ? 11 : 0,
    },
  ];
}

export function getRouteNodeSelectionFilter(nodeId: string): RouteNodeSelectionFilter {
  return [
    'all',
    ['==', ['geometry-type'], 'Point'],
    ['==', ['get', 'id'], nodeId],
  ];
}

export function getRouteNodeFocusOffset(viewportWidth: number, viewportHeight: number): [number, number] {
  if (viewportWidth >= 1024) return [335, 0];
  return [0, Math.round(viewportHeight * -0.39)];
}

export function moveSheetLevel(current: SheetLevel, direction: -1 | 1, hasSelectedNode = true): SheetLevel {
  const index = sheetLevels.indexOf(current);
  const nextIndex = Math.max(0, Math.min(sheetLevels.length - 1, index + direction));
  if (sheetLevels[nextIndex] === 'detail' && !hasSelectedNode) return 'nodes';
  return sheetLevels[nextIndex];
}

export function selectRouteNode(nodeId: string): { selectedNodeId: string; sheetLevel: SheetLevel } {
  return { selectedNodeId: nodeId, sheetLevel: 'detail' };
}
