import { useRef, type PointerEvent } from 'react';
import { moveSheetLevel, type SheetLevel } from '../lib/routeMapState';
import type { RouteData, RouteMapConfig, RouteMapNode } from '../types';

interface Props {
  route: RouteData;
  config: RouteMapConfig;
  nodes: RouteMapNode[];
  selectedNode?: RouteMapNode;
  level: SheetLevel;
  onLevelChange: (level: SheetLevel) => void;
  onSelectNode: (nodeId: string) => void;
  onFitRoute: () => void;
}

export default function RouteMobileSheet({
  route,
  config,
  nodes,
  selectedNode,
  level,
  onLevelChange,
  onSelectNode,
  onFitRoute,
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
            <p className="mt-1 text-xs text-forest-500">{config.pathLabel}</p>
            <div className="mt-4 flex gap-5 text-sm text-forest-700">
              {config.summaryStats.map((stat) => (
                <span key={stat.label}>{stat.label === '爬升' && '↑ '}{stat.value}</span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={onFitRoute} className="rounded-xl bg-sand-100 px-4 py-3 text-sm font-semibold text-sand-800">适应路线</button>
              <button type="button" onClick={() => onLevelChange('nodes')} className="rounded-xl bg-forest-500 px-4 py-3 text-sm font-semibold text-white">浏览路线节点</button>
            </div>
          </>
        )}

        {level === 'nodes' && (
          <>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-forest-800">路线节点</h2>
              <button type="button" onClick={onFitRoute} className="rounded-lg bg-sand-100 px-2.5 py-1.5 text-xs font-semibold text-sand-800">适应路线</button>
            </div>
            <div className="mt-3 space-y-2">
              {nodes.map((node) => (
                <button key={node.id} type="button" onClick={() => selectNode(node.id)} className="flex w-full items-center gap-3 rounded-xl bg-sand-50 p-2.5 text-left">
                  {node.image && (
                    <img src={node.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  )}
                  <span>
                    <strong className="block text-sm text-forest-800">{node.name}</strong>
                    <span className="text-xs text-forest-500">{node.dayLabel && `${node.dayLabel} · `}{node.category} · {Math.round(node.coordinates[2])} m</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {level === 'detail' && selectedNode && (
          <>
            {selectedNode.image && (
              <img src={selectedNode.image} alt={selectedNode.name} className="h-40 w-full rounded-2xl object-cover" />
            )}
            <span className="mt-4 inline-flex rounded-full bg-sand-100 px-2.5 py-1 text-xs text-sand-800">{selectedNode.category}</span>
            <h2 className="mt-3 text-xl font-bold text-forest-800">{selectedNode.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-forest-600">{selectedNode.description}</p>
            <p className="mt-3 text-sm font-medium text-forest-700">海拔 {Math.round(selectedNode.coordinates[2])} m</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={onFitRoute} className="rounded-xl bg-sand-100 px-4 py-3 text-sm font-semibold text-sand-800">适应路线</button>
              <button type="button" onClick={() => onLevelChange('nodes')} className="rounded-xl bg-forest-500 px-4 py-3 text-sm font-semibold text-white">返回节点列表</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
