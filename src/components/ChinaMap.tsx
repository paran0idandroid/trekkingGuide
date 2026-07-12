import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as echarts from 'echarts/core';
import { GeoComponent, TooltipComponent } from 'echarts/components';
import { ScatterChart, LinesChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { routeGeoData } from '../data/routeGeoData';
import { getRouteBySlug } from '../data/routes';

echarts.use([GeoComponent, ScatterChart, LinesChart, TooltipComponent, CanvasRenderer]);

export default function ChinaMap() {
  const chartRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [mapReady, setMapReady] = useState(false);

  // Load GeoJSON
  useEffect(() => {
    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then(r => r.json())
      .then(geo => { echarts.registerMap('china', geo as any); setMapReady(true); })
      .catch(() => {
        fetch('https://cdn.jsdelivr.net/npm/echarts@5/map/json/china.json')
          .then(r => r.json())
          .then(geo => { echarts.registerMap('china', geo as any); setMapReady(true); })
          .catch(() => setMapReady(false));
      });
  }, []);

  // Init & render chart
  useEffect(() => {
    if (!mapReady || !chartRef.current) return;
    let ec = echarts.getInstanceByDom(chartRef.current);
    if (!ec) ec = echarts.init(chartRef.current);

    // Build data
    const tipMap: Record<string, any> = {};
    const lineData: any[] = [];
    const startMarkers: any[] = [];
    const endMarkers: any[] = [];

    Object.entries(routeGeoData).forEach(([slug, rd]) => {
      const route = getRouteBySlug(slug);
      tipMap[slug] = {
        name: route?.name || slug,
        desc: route?.subtitle || '',
        diff: route?.overview.difficulty || '',
        days: route?.overview.duration || '',
        distance: route?.overview.distance || '',
        season: route?.overview.bestSeason || '',
      };

      const color = rd.color || '#6fad85';

      // Route line with hover data
      lineData.push({
        coords: rd.linePoints,
        slug,
        lineStyle: { color, width: 3, curveness: 0.15 },
      });

      // Start marker
      startMarkers.push({
        value: rd.markerPoint,
        slug,
        name: route?.name,
        itemStyle: { color: '#fff', borderColor: color, borderWidth: 3 },
        symbol: 'circle',
        symbolSize: 14,
      });

      // End marker (last waypoint or a slight offset)
      const lastWp = rd.waypoints[rd.waypoints.length - 1];
      if (lastWp) {
        endMarkers.push({
          value: lastWp.coords,
          slug,
          itemStyle: { color },
          symbol: 'diamond',
          symbolSize: 10,
        });
      }
    });

    const series: any[] = [];

    // Route lines with hover emphasis
    series.push({
      type: 'lines', coordinateSystem: 'geo',
      data: lineData, polyline: true,
      lineStyle: { width: 3, curveness: 0.15, opacity: 0.7 },
      emphasis: {
        scale: true,
        lineStyle: { width: 5, opacity: 1 },
      },
      z: 2,
    });

    // Start markers with hover emphasis
    series.push({
      type: 'scatter', coordinateSystem: 'geo',
      data: startMarkers,
      z: 4,
      label: {
        show: true,
        position: 'right',
        distance: 8,
        color: '#1a4d3e',
        fontSize: 12,
        fontWeight: 500,
        formatter: (p: any) => p?.data?.name || '',
      },
      emphasis: {
        scale: 1.5,
        itemStyle: {
          borderWidth: 4,
        },
      },
    });

    // End markers
    series.push({
      type: 'scatter', coordinateSystem: 'geo',
      data: endMarkers,
      z: 3,
    });

    const option: any = {
      backgroundColor: 'transparent',
      geo: {
        map: 'china', roam: false, zoom: 1.08, center: [104, 35],
        label: { show: false },
        itemStyle: {
          areaColor: '#f0f4f2',
          borderColor: '#d4dbd7',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: '#e0e8e4',
            borderColor: '#6fad85',
            borderWidth: 1.5,
          },
        },
        z: 0,
      },
      series,
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: [14, 18],
        textStyle: { color: '#333', fontSize: 12 },
        formatter: (p: any) => {
          const slug = p?.data?.slug;
          if (!slug || !tipMap[slug]) return '';
          const d = tipMap[slug];
          const lines: string[] = [];
          lines.push(`<div style="font-size:15px;font-weight:600;color:#1a4d3e;margin-bottom:3px">${d.name}</div>`);
          if (d.desc) lines.push(`<div style="font-size:11px;color:#6b7280;margin-bottom:6px">${d.desc}</div>`);
          const tags: string[] = [];
          if (d.distance) tags.push(`<span style="color:#9ca3af">距离</span> <span style="color:#374151;font-weight:500">${d.distance}</span>`);
          if (d.days) tags.push(`<span style="color:#9ca3af">天数</span> <span style="color:#374151;font-weight:500">${d.days}</span>`);
          if (d.diff) tags.push(`<span style="color:#9ca3af">难度</span> <span style="color:#374151;font-weight:500">${d.diff}</span>`);
          if (d.season) tags.push(`<span style="color:#9ca3af">最佳</span> <span style="color:#374151;font-weight:500">${d.season}</span>`);
          if (tags.length) lines.push(`<div style="display:flex;gap:12px;font-size:11px;margin-bottom:4px">${tags.join('<span style="color:#d1d5db">|</span>')}</div>`);
          lines.push(`<div style="color:#6fad85;font-size:10px;margin-top:6px">点击查看路线详情 →</div>`);
          return lines.join('\n');
        },
      },
    };

    ec.setOption(option, true);
    ec.off('click');
    ec.on('click', (params: any) => {
      const slug = params?.data?.slug;
      if (slug) navigate(`/route/${slug}`);
    });

    const onResize = () => ec?.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      ec?.dispose();
    };
  }, [mapReady, navigate]);

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4">
      <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-forest-50/10" style={{ aspectRatio: '700/500' }}>
        {/* ECharts canvas */}
        <div ref={chartRef} className="w-full h-full" />

        {/* Legend */}
        <div className="absolute bottom-4 right-4 pointer-events-none">
          <div className="flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3.5 py-2.5 border border-gray-100 shadow-sm">
            {Object.entries(routeGeoData).map(([slug, rd]) => (
              <div key={slug} className="flex items-center gap-2.5">
                <div className="w-8 h-[3px] rounded-full" style={{ background: rd.color }} />
                <span className="text-xs text-forest-700">{getRouteBySlug(slug)?.name || slug}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Loading */}
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-forest-50/30 z-10">
            <div className="text-center">
              <div className="w-7 h-7 border-2 border-forest-300/40 border-t-forest-500 rounded-full animate-spin mx-auto mb-2.5" />
              <p className="text-forest-400 text-xs">加载中国地图...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
