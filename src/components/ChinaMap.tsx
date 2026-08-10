import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl, { Map } from 'maplibre-gl';
import type { FeatureCollection, Point } from 'geojson';
import { mapTilerOutdoorStyleUrl } from '../data/mapStyle';
import { routeGeoData } from '../data/routeGeoData';
import { getRouteBySlug } from '../data/routes';

const CHINA_BOUNDS: [[number, number], [number, number]] = [
  [73.5, 18],
  [135.2, 53.8],
];
const ROUTE_SOURCE_ID = 'china-route-points';
const ROUTE_MARKER_LAYER_ID = 'china-route-markers';
const ROUTE_LABEL_LAYER_ID = 'china-route-labels';

export default function ChinaMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;
    if (!mapTilerOutdoorStyleUrl) {
      setIsLoading(false);
      setError('地图暂时无法显示，请配置 MapTiler API Key');
      return;
    }

    const geoJson: FeatureCollection<Point> = {
      type: 'FeatureCollection',
      features: routeGeoData.map(routePoint => {
        const route = getRouteBySlug(routePoint.slug);
        if (!route) throw new Error(`不存在的路线：${routePoint.slug}`);
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: routePoint.coordinates },
          properties: { slug: route.slug, name: route.name },
        };
      }),
    };

    let map: Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: mapTilerOutdoorStyleUrl,
        center: [104, 35],
        zoom: 3,
        minZoom: 2.5,
        maxZoom: 9,
        maxPitch: 0,
        dragRotate: false,
        touchPitch: false,
        renderWorldCopies: false,
        attributionControl: { compact: true },
      });
    } catch {
      setIsLoading(false);
      setError('地图初始化失败，请检查 MapTiler Key 和浏览器兼容性');
      return;
    }

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    let reportedMapError = false;
    map.on('error', () => {
      if (reportedMapError) return;
      reportedMapError = true;
      setIsLoading(false);
      setError('地图底图加载失败，请检查 MapTiler Key 和网络连接');
    });

    map.on('load', () => {
      map.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data: geoJson });
      map.addLayer({
        id: ROUTE_MARKER_LAYER_ID,
        type: 'circle',
        source: ROUTE_SOURCE_ID,
        paint: {
          'circle-radius': 8,
          'circle-color': '#1a4d3e',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3,
        },
      });
      map.addLayer({
        id: ROUTE_LABEL_LAYER_ID,
        type: 'symbol',
        source: ROUTE_SOURCE_ID,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 13,
          'text-font': ['Noto Sans Regular'],
          'text-offset': [1.1, 0],
          'text-anchor': 'left',
          'text-padding': 8,
        },
        paint: {
          'text-color': '#1a4d3e',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      });

      const openRoute = (event: maplibregl.MapLayerMouseEvent) => {
        const slug = event.features?.[0]?.properties?.slug;
        if (typeof slug === 'string') navigate(`/route/${slug}`);
      };
      [ROUTE_MARKER_LAYER_ID, ROUTE_LABEL_LAYER_ID].forEach(layerId => {
        map.on('click', layerId, openRoute);
        map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
      });

      map.fitBounds(CHINA_BOUNDS, {
        padding: window.innerWidth < 640 ? 24 : 48,
        duration: 0,
      });
      setError('');
      setIsLoading(false);
    });

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
    };
  }, [navigate]);

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4">
      <div className="relative h-[420px] overflow-hidden rounded-2xl border border-forest-100 bg-forest-50 md:h-[620px]">
        <div ref={containerRef} className="absolute inset-0" aria-label="中国徒步路线地图" />

        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-forest-50">
            <div className="text-center">
              <div className="mx-auto mb-2.5 h-7 w-7 animate-spin rounded-full border-2 border-forest-300/40 border-t-forest-500" />
              <p className="text-xs text-forest-600">正在加载中国地图</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-forest-50 px-6 text-center">
            <p className="max-w-sm text-sm text-forest-700" role="alert">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
