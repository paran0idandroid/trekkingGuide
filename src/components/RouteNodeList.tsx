import type { RouteData, RouteMapConfig, RouteMapNode } from '../types';

interface Props {
  route: RouteData;
  config: RouteMapConfig;
  nodes: RouteMapNode[];
  selectedNodeId?: string;
  onSelect: (nodeId: string) => void;
}

export default function RouteNodeList({ route, config, nodes, selectedNodeId, onSelect }: Props) {
  return (
    <aside className="absolute left-6 top-20 bottom-6 z-10 w-[300px] overflow-hidden rounded-2xl bg-white shadow-xl border border-forest-100">
      <div className="px-5 pt-5 pb-3 border-b border-forest-100">
        <h2 className="text-xl font-bold text-forest-800">{route.name}</h2>
        <p className="mt-1 text-xs text-forest-500">{config.pathLabel}</p>
      </div>
      <div className="h-[calc(100%-76px)] overflow-y-auto p-3 space-y-2">
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelect(node.id)}
            className={`w-full flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
              selectedNodeId === node.id
                ? 'border-forest-500 bg-forest-50'
                : 'border-transparent bg-sand-50 hover:border-forest-200'
            }`}
          >
            {node.image && (
              <img src={node.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-forest-800">{node.name}</span>
              <span className="mt-1 block text-xs text-forest-500">
                {node.dayLabel && `${node.dayLabel} · `}{node.category} · 海拔 {Math.round(node.coordinates[2])} m
              </span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
