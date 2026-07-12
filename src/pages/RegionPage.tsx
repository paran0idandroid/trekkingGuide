import { useParams, useNavigate } from 'react-router-dom';
import { getRegionBySlug } from '../data/regions';
import { getRoutesByRegion } from '../data/routes';
import FavoriteButton from '../components/FavoriteButton';

export default function RegionPage() {
  const { regionSlug } = useParams<{ regionSlug: string }>();
  const navigate = useNavigate();
  const region = regionSlug ? getRegionBySlug(regionSlug) : undefined;
  const routes = regionSlug ? getRoutesByRegion(regionSlug) : [];

  if (!region) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-forest-600 text-lg mb-4">区域不存在</p>
          <button
            onClick={() => navigate('/')}
            className="bg-forest-500 text-white hover:bg-forest-600 px-6 py-2.5 rounded-full text-sm transition-all duration-300"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-20">
      <div className="w-full max-w-3xl mx-auto px-6">
        <button
          onClick={() => navigate('/')}
          className="text-forest-400 text-sm hover:text-forest-600 transition-colors mb-8 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          返回地图
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-forest-800 mb-2">{region.name}</h1>
        <p className="text-forest-600 text-sm mb-10">
          {routes.length > 0 ? routes.length + ' 条徒步路线' : '暂无路线数据'}
        </p>

        {routes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-forest-300 text-sm">该区域的路线正在准备中，敬请期待</p>
          </div>
        )}

        <div className="grid gap-4">
          {routes.map((route) => (
            <div
              key={route.slug}
              className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5 md:p-6"
            >
              <button
                onClick={() => navigate('/route/' + route.slug)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold text-forest-800 mb-1">{route.name}</h3>
                    <p className="text-sm text-forest-600 mb-3 line-clamp-2">{route.subtitle}</p>
                    <div className="flex flex-wrap gap-2">
                      {route.tags.map(tag => (
                        <span key={tag} className="text-[11px] text-forest-500/95 bg-forest-100/60 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs text-forest-400">{route.overview.duration}</div>
                    <div className="text-xs text-forest-400 mt-1">{route.overview.difficulty}</div>
                  </div>
                </div>
              </button>
              <div className="flex justify-end mt-2">
                <FavoriteButton routeSlug={route.slug} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
