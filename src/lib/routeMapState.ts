export type SheetLevel = 'summary' | 'nodes' | 'detail';

const sheetLevels: SheetLevel[] = ['summary', 'nodes', 'detail'];

export function moveSheetLevel(current: SheetLevel, direction: -1 | 1, hasSelectedNode = true): SheetLevel {
  const index = sheetLevels.indexOf(current);
  const nextIndex = Math.max(0, Math.min(sheetLevels.length - 1, index + direction));
  if (sheetLevels[nextIndex] === 'detail' && !hasSelectedNode) return 'nodes';
  return sheetLevels[nextIndex];
}

export function selectRouteNode(nodeId: string): { selectedNodeId: string; sheetLevel: SheetLevel } {
  return { selectedNodeId: nodeId, sheetLevel: 'detail' };
}
