import { useEffect, useRef } from 'react';
import maplibregl, { LngLatBounds, Map, type FilterSpecification } from 'maplibre-gl';
import type { FeatureCollection, LineString, Point } from 'geojson';
import type { RouteMapConfig } from '../types';
import {
  getRouteDashArray,
  getRouteLayerIds,
  getRouteNodeFocusOffset,
  getRouteNodeLabelRules,
  getRouteNodeSelectionFilter,
  routeNodeSelectionStyle,
} from '../lib/routeMapState';

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
  const selectedNodeIdRef = useRef(selectedNodeId);
  selectedNodeIdRef.current = selectedNodeId;

  useEffect(() => {
    if (!containerRef.current) return;

    const abortController = new AbortController();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const layerIds = getRouteLayerIds(config.routeSlug);
    const labelRules = getRouteNodeLabelRules(config.routeSlug, window.innerWidth < 1024);
    let motionLayerIds: string[] = [];
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
      if (step !== lastAnimationStep && motionLayerIds.length > 0) {
        lastAnimationStep = step;
        motionLayerIds.forEach((layerId) => {
          if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, 'line-dasharray', getRouteDashArray(step));
          }
        });
      }
      animationFrame = requestAnimationFrame(animateTrack);
    };

    const syncTrackAnimation = () => {
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
      animationStart = 0;
      lastAnimationStep = -1;
      if (motionLayerIds.length === 0) return;
      motionLayerIds.forEach((layerId) => {
        if (!map.getLayer(layerId)) return;
        map.setPaintProperty(layerId, 'line-opacity', reducedMotion.matches ? 0.65 : 0.9);
        if (reducedMotion.matches) {
          map.setPaintProperty(layerId, 'line-dasharray', getRouteDashArray(0));
        }
      });
      if (!reducedMotion.matches && !document.hidden) {
        animationFrame = requestAnimationFrame(animateTrack);
      }
    };

    const syncNodeLabels = () => {
      const isMobile = window.innerWidth < 1024;
      getRouteNodeLabelRules(config.routeSlug, isMobile).forEach(({ id, minZoom }) => {
        if (!map.getLayer(id)) return;
        map.setLayerZoomRange(id, minZoom, 24);
        map.setLayoutProperty(id, 'text-size', isMobile ? 12 : 13);
      });
    };

    const highlightSelectedNode = (nodeId: string) => {
      if (!map.getLayer(layerIds.nodeSelection)) return;
      map.setFilter(layerIds.nodeSelection, getRouteNodeSelectionFilter(nodeId));
    };

    map.on('load', async () => {
      try {
        const response = await fetch(config.geoJsonUrl, { signal: abortController.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const geoJson = await response.json() as FeatureCollection<LineString | Point>;

        map.addSource(layerIds.source, { type: 'geojson', data: geoJson });

        if (config.days?.length) {
          motionLayerIds = config.days.map((day) => `${config.routeSlug}-day-${day.day}-motion`);
          config.days.forEach((day) => {
            const filter: FilterSpecification = [
              'all',
              ['==', ['geometry-type'], 'LineString'],
              ['==', ['get', 'day'], day.day],
            ];
            map.addLayer({
              id: `${config.routeSlug}-day-${day.day}-outline`,
              type: 'line',
              source: layerIds.source,
              filter,
              paint: { 'line-color': config.colors.outline, 'line-width': 8, 'line-opacity': 0.92 },
            });
            map.addLayer({
              id: `${config.routeSlug}-day-${day.day}-track`,
              type: 'line',
              source: layerIds.source,
              filter,
              paint: { 'line-color': day.color, 'line-width': 4 },
            });
            map.addLayer({
              id: `${config.routeSlug}-day-${day.day}-motion`,
              type: 'line',
              source: layerIds.source,
              filter,
              paint: {
                'line-color': config.colors.outline,
                'line-width': 2,
                'line-opacity': reducedMotion.matches ? 0.65 : 0.9,
                'line-dasharray': getRouteDashArray(0),
              },
            });
          });
        } else {
          const trackId = `${config.routeSlug}-track`;
          const motionId = `${config.routeSlug}-track-motion`;
          motionLayerIds = [motionId];
          map.addLayer({
            id: layerIds.trackOutline,
            type: 'line',
            source: layerIds.source,
            filter: ['==', ['geometry-type'], 'LineString'],
            paint: { 'line-color': config.colors.outline, 'line-width': 8, 'line-opacity': 0.92 },
          });
          map.addLayer({
            id: trackId,
            type: 'line',
            source: layerIds.source,
            filter: ['==', ['geometry-type'], 'LineString'],
            paint: { 'line-color': config.colors.track, 'line-width': 4 },
          });
          map.addLayer({
            id: motionId,
            type: 'line',
            source: layerIds.source,
            filter: ['==', ['geometry-type'], 'LineString'],
            paint: {
              'line-color': config.colors.outline,
              'line-width': 2,
              'line-opacity': reducedMotion.matches ? 0.65 : 0.9,
              'line-dasharray': getRouteDashArray(0),
            },
          });
        }
        map.addLayer({
          id: layerIds.nodeSelection,
          type: 'circle',
          source: layerIds.source,
          filter: getRouteNodeSelectionFilter(selectedNodeIdRef.current ?? ''),
          paint: {
            'circle-radius': routeNodeSelectionStyle.ringRadius,
            'circle-color': config.colors.node,
            'circle-blur': routeNodeSelectionStyle.ringBlur,
          },
        });
        map.addLayer({
          id: layerIds.nodes,
          type: 'circle',
          source: layerIds.source,
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': 7,
            'circle-color': config.colors.node,
            'circle-stroke-color': config.colors.outline,
            'circle-stroke-width': 3,
          },
        });
        labelRules.forEach((rule) => {
          map.addLayer({
            id: rule.id,
            type: 'symbol',
            source: layerIds.source,
            minzoom: rule.minZoom,
            filter: [
              'all',
              ['==', ['geometry-type'], 'Point'],
              ['in', ['get', 'category'], ['literal', rule.categories]],
            ],
            layout: {
              'text-field': ['get', 'name'],
              'text-size': window.innerWidth < 1024 ? 12 : 13,
              'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
              'text-radial-offset': 0.9,
              'text-max-width': 9,
              'text-padding': 4,
              'text-allow-overlap': true,
              'text-ignore-placement': false,
            },
            paint: {
              'text-color': config.colors.node,
              'text-halo-color': config.colors.outline,
              'text-halo-width': routeNodeSelectionStyle.labelHaloWidth,
              'text-halo-blur': 0.5,
            },
          });
        });
        if (selectedNodeIdRef.current) highlightSelectedNode(selectedNodeIdRef.current);

        const coordinates = geoJson.features.flatMap((feature) => (
          feature.geometry.type === 'LineString' ? feature.geometry.coordinates : []
        ));
        if (coordinates.length < 2) throw new Error('缺少连续轨迹');
        const bounds = coordinates.reduce(
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

    [layerIds.nodes, ...labelRules.map((rule) => rule.id)].forEach((interactiveLayerId) => {
      map.on('click', interactiveLayerId, (event) => {
        const id = event.features?.[0]?.properties?.id;
        if (typeof id === 'string') onSelectNode(id);
      });
      map.on('mouseenter', interactiveLayerId, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', interactiveLayerId, () => { map.getCanvas().style.cursor = ''; });
    });

    document.addEventListener('visibilitychange', syncTrackAnimation);
    reducedMotion.addEventListener('change', syncTrackAnimation);
    window.addEventListener('resize', syncNodeLabels);

    return () => {
      abortController.abort();
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      document.removeEventListener('visibilitychange', syncTrackAnimation);
      reducedMotion.removeEventListener('change', syncTrackAnimation);
      window.removeEventListener('resize', syncNodeLabels);
      map.remove();
      mapRef.current = undefined;
      boundsRef.current = undefined;
    };
  }, [config, onError, onSelectNode]);

  useEffect(() => {
    if (!selectedNodeId) return;
    const node = config.nodes.find((candidate) => candidate.id === selectedNodeId);
    if (!node) throw new Error(`不存在的地图节点：${selectedNodeId}`);
    const map = mapRef.current;
    const layerIds = getRouteLayerIds(config.routeSlug);
    if (map?.getLayer(layerIds.nodeSelection)) {
      map.setFilter(layerIds.nodeSelection, getRouteNodeSelectionFilter(selectedNodeId));
    }
    const container = map?.getContainer();
    mapRef.current?.easeTo({
      center: [node.coordinates[0], node.coordinates[1]],
      zoom: 12,
      offset: container ? getRouteNodeFocusOffset(container.clientWidth, container.clientHeight) : [0, 0],
      duration: 600,
    });
  }, [config.nodes, config.routeSlug, selectedNodeId]);

  useEffect(() => {
    if (fitRequestKey === 0 || !boundsRef.current) return;
    mapRef.current?.fitBounds(boundsRef.current, { padding: 72, duration: 600 });
  }, [fitRequestKey]);

  return <div ref={containerRef} className="absolute inset-0" aria-label={config.ariaLabel} />;
}
