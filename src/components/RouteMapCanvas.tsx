import { useEffect, useRef } from 'react';
import maplibregl, { LngLatBounds, Map } from 'maplibre-gl';
import type { FeatureCollection, LineString, Point } from 'geojson';
import type { RouteMapConfig } from '../types';
import { getRouteDashArray } from '../lib/routeMapState';

interface Props {
  config: RouteMapConfig;
  selectedNodeId?: string;
  fitRequestKey: number;
  onSelectNode: (nodeId: string) => void;
  onError: (message: string) => void;
}

export default function RouteMapCanvas({ config, selectedNodeId, fitRequestKey, onSelectNode, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map>();
  const boundsRef = useRef<LngLatBounds>();

  useEffect(() => {
    if (!containerRef.current) return;

    const abortController = new AbortController();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame: number | undefined;
    let animationStart = 0;
    let lastAnimationStep = -1;
    let map: Map;
    try {
      if (!config.styleUrl) throw new Error('缺少 MapTiler API Key');
      map = new maplibregl.Map({
        container: containerRef.current,
        style: config.styleUrl,
        center: config.center,
        zoom: 9,
        attributionControl: { compact: false },
      });
    } catch {
      onError('地图初始化失败，请检查 MapTiler Key 和浏览器兼容性');
      return;
    }

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false }), 'top-right');
    let reportedMapError = false;
    map.on('error', () => {
      if (reportedMapError) return;
      reportedMapError = true;
      onError('地图底图加载失败，请检查 MapTiler Key 和网络连接');
    });

    const animateTrack = (timestamp: number) => {
      if (!animationStart) animationStart = timestamp;
      const step = Math.floor((timestamp - animationStart) / 120);
      if (step !== lastAnimationStep && map.getLayer('wusun-track-motion')) {
        lastAnimationStep = step;
        map.setPaintProperty('wusun-track-motion', 'line-dasharray', getRouteDashArray(step));
      }
      animationFrame = requestAnimationFrame(animateTrack);
    };

    const syncTrackAnimation = () => {
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
      animationStart = 0;
      lastAnimationStep = -1;
      if (!map.getLayer('wusun-track-motion')) return;
      map.setPaintProperty('wusun-track-motion', 'line-opacity', reducedMotion.matches ? 0.65 : 0.9);
      if (reducedMotion.matches) {
        map.setPaintProperty('wusun-track-motion', 'line-dasharray', getRouteDashArray(0));
      } else if (!document.hidden) {
        animationFrame = requestAnimationFrame(animateTrack);
      }
    };

    map.on('load', async () => {
      try {
        const response = await fetch(config.geoJsonUrl, { signal: abortController.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const geoJson = await response.json() as FeatureCollection<LineString | Point>;

        map.addSource('wusun', { type: 'geojson', data: geoJson });
        map.addLayer({
          id: 'wusun-track-outline',
          type: 'line',
          source: 'wusun',
          filter: ['==', ['geometry-type'], 'LineString'],
          paint: { 'line-color': config.colors.outline, 'line-width': 8, 'line-opacity': 0.92 },
        });
        map.addLayer({
          id: 'wusun-track',
          type: 'line',
          source: 'wusun',
          filter: ['==', ['geometry-type'], 'LineString'],
          paint: { 'line-color': config.colors.track, 'line-width': 4 },
        });
        map.addLayer({
          id: 'wusun-track-motion',
          type: 'line',
          source: 'wusun',
          filter: ['==', ['geometry-type'], 'LineString'],
          paint: {
            'line-color': config.colors.outline,
            'line-width': 2,
            'line-opacity': reducedMotion.matches ? 0.65 : 0.9,
            'line-dasharray': getRouteDashArray(0),
          },
        });
        map.addLayer({
          id: 'wusun-nodes',
          type: 'circle',
          source: 'wusun',
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': 7,
            'circle-color': config.colors.node,
            'circle-stroke-color': config.colors.outline,
            'circle-stroke-width': 3,
          },
        });

        const track = geoJson.features.find((feature) => feature.geometry.type === 'LineString');
        if (!track || track.geometry.type !== 'LineString') throw new Error('缺少连续轨迹');
        const bounds = track.geometry.coordinates.reduce(
          (value, coordinate) => value.extend([coordinate[0], coordinate[1]]),
          new maplibregl.LngLatBounds(),
        );
        boundsRef.current = bounds;
        map.fitBounds(bounds, { padding: 72, duration: 0 });

        syncTrackAnimation();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        onError(`路线轨迹暂时无法加载：${error instanceof Error ? error.message : '未知错误'}`);
      }
    });

    map.on('click', 'wusun-nodes', (event) => {
      const id = event.features?.[0]?.properties?.id;
      if (typeof id === 'string') onSelectNode(id);
    });
    map.on('mouseenter', 'wusun-nodes', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'wusun-nodes', () => { map.getCanvas().style.cursor = ''; });

    document.addEventListener('visibilitychange', syncTrackAnimation);
    reducedMotion.addEventListener('change', syncTrackAnimation);

    return () => {
      abortController.abort();
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      document.removeEventListener('visibilitychange', syncTrackAnimation);
      reducedMotion.removeEventListener('change', syncTrackAnimation);
      map.remove();
      mapRef.current = undefined;
      boundsRef.current = undefined;
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

  useEffect(() => {
    if (fitRequestKey === 0 || !boundsRef.current) return;
    mapRef.current?.fitBounds(boundsRef.current, { padding: 72, duration: 600 });
  }, [fitRequestKey]);

  return <div ref={containerRef} className="absolute inset-0" aria-label="乌孙古道交互地图" />;
}
