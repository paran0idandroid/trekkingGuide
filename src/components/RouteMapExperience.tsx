import { useCallback, useState } from 'react';
import { selectRouteNode, type SheetLevel } from '../lib/routeMapState';
import type { RouteData, RouteMapConfig } from '../types';
import RouteDetailPanel from './RouteDetailPanel';
import RouteMapCanvas from './RouteMapCanvas';
import RouteMobileSheet from './RouteMobileSheet';
import RouteNodeList from './RouteNodeList';

interface Props {
  route: RouteData;
  config: RouteMapConfig;
}

export default function RouteMapExperience({ route, config }: Props) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [sheetLevel, setSheetLevel] = useState<SheetLevel>('summary');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [fitRequestKey, setFitRequestKey] = useState(0);
  const selectedNode = config.nodes.find((node) => node.id === selectedNodeId);
  const selectNode = useCallback((nodeId: string) => {
    const nextState = selectRouteNode(nodeId);
    setSelectedNodeId(nextState.selectedNodeId);
    setSheetLevel(nextState.sheetLevel);
  }, []);
  const reportError = useCallback((message: string) => setErrorMessage(message), []);

  return (
    <section className="route-map-shell relative overflow-hidden bg-forest-50 pt-16">
      <RouteMapCanvas
        config={config}
        selectedNodeId={selectedNodeId}
        fitRequestKey={fitRequestKey}
        onSelectNode={selectNode}
        onError={reportError}
      />

      <button
        type="button"
        onClick={() => setFitRequestKey((value) => value + 1)}
        className="absolute right-3 top-52 z-10 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-forest-700 shadow-lg border border-forest-100"
      >
        适应路线
      </button>

      <div className="hidden lg:block">
        <RouteNodeList nodes={config.nodes} selectedNodeId={selectedNodeId} onSelect={selectNode} />
        <RouteDetailPanel route={route} node={selectedNode} />
      </div>

      <RouteMobileSheet
        route={route}
        nodes={config.nodes}
        selectedNode={selectedNode}
        level={sheetLevel}
        onLevelChange={setSheetLevel}
        onSelectNode={selectNode}
      />

      {errorMessage && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-forest-900/60 px-6">
          <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <h2 className="text-lg font-bold text-forest-800">地图暂时无法显示</h2>
            <p className="mt-2 text-sm leading-relaxed text-forest-600">{errorMessage}</p>
          </div>
        </div>
      )}
    </section>
  );
}
