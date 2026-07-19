import type { RouteData, RouteMapConfig, RouteMapNode } from '../types';

interface Props {
  route: RouteData;
  config: RouteMapConfig;
  node?: RouteMapNode;
}

export default function RouteDetailPanel({ route, config, node }: Props) {
  const image = node?.image ?? route.heroImage;

  return (
    <aside className="absolute left-[340px] top-20 bottom-6 z-10 w-[330px] overflow-hidden rounded-2xl bg-white shadow-xl border border-forest-100">
      {image && (
        <img
          src={image}
          alt={node?.name || route.name}
          className="h-[42%] w-full object-cover"
        />
      )}
      <div className="p-5">
        <span className="inline-flex rounded-full bg-sand-100 px-2.5 py-1 text-xs font-medium text-sand-800">
          {node?.category || '高难度徒步'}
        </span>
        <h2 className="mt-3 text-xl font-bold leading-tight text-forest-800">
          {node?.name || route.name}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-forest-600">
          {node?.description || route.subtitle}
        </p>
        {node ? (
          <div className="mt-4 rounded-xl bg-forest-50 p-3 text-sm text-forest-700">
            海拔 {Math.round(node.coordinates[2])} m
          </div>
        ) : (
          <div className={`mt-4 grid gap-2 text-center ${config.summaryStats.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {config.summaryStats.map((stat) => (
              <RouteStat key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function RouteStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-forest-50 px-2 py-3">
      <span className="block text-xs text-forest-500">{label}</span>
      <strong className="mt-1 block text-sm text-forest-800">{value}</strong>
    </div>
  );
}
