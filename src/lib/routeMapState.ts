export type SheetLevel = 'summary' | 'nodes' | 'detail';

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

export function moveSheetLevel(current: SheetLevel, direction: -1 | 1, hasSelectedNode = true): SheetLevel {
  const index = sheetLevels.indexOf(current);
  const nextIndex = Math.max(0, Math.min(sheetLevels.length - 1, index + direction));
  if (sheetLevels[nextIndex] === 'detail' && !hasSelectedNode) return 'nodes';
  return sheetLevels[nextIndex];
}

export function selectRouteNode(nodeId: string): { selectedNodeId: string; sheetLevel: SheetLevel } {
  return { selectedNodeId: nodeId, sheetLevel: 'detail' };
}
