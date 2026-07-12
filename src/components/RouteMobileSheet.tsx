import { useRef, type PointerEvent } from 'react';
import { moveSheetLevel, type SheetLevel } from '../lib/routeMapState';
import type { RouteData, RouteMapNode } from '../types';

interface Props {
  route: RouteData;
  nodes: RouteMapNode[];
  selectedNode?: RouteMapNode;
  level: SheetLevel;
  onLevelChange: (level: SheetLevel) => void;
  onSelectNode: (nodeId: string) => void;
}

export default function RouteMobileSheet({
  route,
  nodes,
  selectedNode,
  level,
  onLevelChange,
  onSelectNode,
}: Props) {
  const dragStartY = useRef<number>();

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === undefined) return;
    const distance = event.clientY - dragStartY.current;
    dragStartY.current = undefined;
    if (Math.abs(distance) < 48) return;
    onLevelChange(moveSheetLevel(level, distance < 0 ? 1 : -1, Boolean(selectedNode)));
  };

  const selectNode = (nodeId: string) => {
    onSelectNode(nodeId);
    onLevelChange('detail');
  };

  return (
    <section className="route-map-sheet absolute inset-x-0 bottom-0 z-20 rounded-t-3xl bg-white shadow-2xl lg:hidden" data-level={level}>
      <div
        className="cursor-grab py-3 touch-none"
        onPointerDown={(event) => { dragStartY.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { dragStartY.current = undefined; }}
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-forest-100" />
      </div>

      <div className="h-[calc(100%-30px)] overflow-y-auto px-5 pb-6">
        {level === 'summary' && (
          <>
            <h2 className="text-xl font-bold text-forest-800">{route.name}</h2>
            <p className="mt-1 text-xs text-forest-500">琼库什台方向起点 → 黑英山方向出口</p>
            <div className="mt-4 flex gap-5 text-sm text-forest-700">
              <span>106.9 km</span><span>6 天</span><span>↑ 6458 m</span>
            </div>
            <button type="button" onClick={() => onLevelChange('nodes')} className="mt-4 w-full rounded-xl bg-forest-500 px-4 py-3 text-sm font-semibold text-white">
              浏览路线节点
            </button>
          </>
        )}

        {level === 'nodes' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-forest-800">路线节点</h2>
              <span className="text-xs text-forest-500">{nodes.length} 个</span>
            </div>
            <div className="mt-3 space-y-2">
              {nodes.map((node) => (
                <button key={node.id} type="button" onClick={() => selectNode(node.id)} className="flex w-full items-center gap-3 rounded-xl bg-sand-50 p-2.5 text-left">
                  <img src={node.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <span>
                    <strong className="block text-sm text-forest-800">{node.name}</strong>
                    <span className="text-xs text-forest-500">{node.category} · {Math.round(node.coordinates[2])} m</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {level === 'detail' && selectedNode && (
          <>
            <img src={selectedNode.image} alt={selectedNode.name} className="h-40 w-full rounded-2xl object-cover" />
            <span className="mt-4 inline-flex rounded-full bg-sand-100 px-2.5 py-1 text-xs text-sand-800">{selectedNode.category}</span>
            <h2 className="mt-3 text-xl font-bold text-forest-800">{selectedNode.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-forest-600">{selectedNode.description}</p>
            <p className="mt-3 text-sm font-medium text-forest-700">海拔 {Math.round(selectedNode.coordinates[2])} m</p>
            <button type="button" onClick={() => onLevelChange('nodes')} className="mt-4 w-full rounded-xl bg-forest-500 px-4 py-3 text-sm font-semibold text-white">
              返回节点列表
            </button>
          </>
        )}
      </div>
    </section>
  );
}
