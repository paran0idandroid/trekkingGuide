import { useEffect, useRef } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import type { FeatureCollection, LineString, Point } from 'geojson';
import type { RouteMapConfig } from '../types';

interface Props {
  config: RouteMapConfig;
  selectedNodeId?: string;
  onSelectNode: (nodeId: string) => void;
  onError: (message: string) => void;
}

export default function RouteMapCanvas({ config, selectedNodeId, onSelectNode, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map>();

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: config.styleUrl,
      center: config.center,
      zoom: 9,
      attributionControl: { compact: false },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', async () => {
      try {
        const response = await fetch(config.geoJsonUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const geoJson = await response.json() as FeatureCollection<LineString | Point>;

        map.addSource('wusun', { type: 'geojson', data: geoJson });
        map.addLayer({
          id: 'wusun-track-outline',
          type: 'line',
          source: 'wusun',
          filter: ['==', ['geometry-type'], 'LineString'],
          paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.92 },
        });
        map.addLayer({
          id: 'wusun-track',
          type: 'line',
          source: 'wusun',
          filter: ['==', ['geometry-type'], 'LineString'],
          paint: { 'line-color': '#1a4d3e', 'line-width': 4 },
        });
        map.addLayer({
          id: 'wusun-nodes',
          type: 'circle',
          source: 'wusun',
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': 7,
            'circle-color': '#1a4d3e',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 3,
          },
        });

        const track = geoJson.features.find((feature) => feature.geometry.type === 'LineString');
        if (!track || track.geometry.type !== 'LineString') throw new Error('缺少连续轨迹');
        const bounds = track.geometry.coordinates.reduce(
          (value, coordinate) => value.extend([coordinate[0], coordinate[1]]),
          new maplibregl.LngLatBounds(),
        );
        map.fitBounds(bounds, { padding: 72, duration: 0 });
      } catch (error) {
        onError(`路线轨迹暂时无法加载：${error instanceof Error ? error.message : '未知错误'}`);
      }
    });

    map.on('click', 'wusun-nodes', (event) => {
      const id = event.features?.[0]?.properties?.id;
      if (typeof id === 'string') onSelectNode(id);
    });
    map.on('mouseenter', 'wusun-nodes', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'wusun-nodes', () => { map.getCanvas().style.cursor = ''; });

    return () => {
      map.remove();
      mapRef.current = undefined;
    };
  }, [config, onError, onSelectNode]);

  useEffect(() => {
    if (!selectedNodeId) return;
    const node = config.nodes.find((candidate) => candidate.id === selectedNodeId);
    if (!node) throw new Error(`不存在的地图节点：${selectedNodeId}`);
    mapRef.current?.easeTo({
      center: [node.coordinates[0], node.coordinates[1]],
      zoom: 12,
      duration: 600,
    });
  }, [config.nodes, selectedNodeId]);

  return <div ref={containerRef} className="absolute inset-0" aria-label="乌孙古道交互地图" />;
}
