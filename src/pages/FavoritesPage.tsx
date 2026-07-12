import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFavorites } from '../lib/favorites';
import { getRouteBySlug } from '../data/routes';
import type { RouteData } from '../types';
import FavoriteButton from '../components/FavoriteButton';

export default function FavoritesPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [favoriteRoutes, setFavoriteRoutes] = useState<RouteData[]>([]);

  const loadFavorites = () => {
    const slugs = getFavorites();
    const routes = slugs
      .map(slug => getRouteBySlug(slug))
      .filter((r): r is RouteData => r !== undefined);
    setFavoriteRoutes(routes);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }
    loadFavorites();
  }, [isLoggedIn, navigate]);

  // Re-fetch on every render so toggles update immediately
  useEffect(() => {
    loadFavorites();
  }, []);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen flex flex-col items-center py-20">
      <div className="w-full max-w-3xl mx-auto px-6">
        <button
          onClick={() => navigate('/')}
          className="text-forest-400 text-sm hover:text-forest-600 transition-colors mb-8 inline-flex items-center gap-1 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-forest-800 mb-2">我的收藏</h1>
        <p className="text-forest-600 text-sm mb-10">
          {favoriteRoutes.length > 0
            ? `已收藏 ${favoriteRoutes.length} 条路线`
            : '还没有收藏的路线'}
        </p>

        {favoriteRoutes.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6 flex justify-center">
              <svg className="w-20 h-20 text-forest-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-forest-300 text-sm mb-6 max-w-xs mx-auto leading-relaxed">收藏你喜欢的徒步路线，方便随时查看</p>
            <button
              onClick={() => navigate('/')}
              className="bg-forest-500 text-white hover:bg-forest-600 px-7 py-3 rounded-full text-sm transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
            >
              去发现路线
            </button>
          </div>
        )}

        <div className="grid gap-4">
          {favoriteRoutes.map((route) => (
            <div
              key={route.slug}
              className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5 md:p-6 flex items-start justify-between gap-4"
            >
              <button
                onClick={() => navigate(`/route/${route.slug}`)}
                className="text-left flex-1 min-w-0"
              >
                <h3 className="text-lg md:text-xl font-semibold text-forest-800 mb-1">{route.name}</h3>
                <p className="text-sm text-forest-600 mb-3 line-clamp-2">{route.subtitle}</p>
                <div className="flex flex-wrap gap-2">
                  {route.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] text-forest-500/95 bg-forest-100/60 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
              <div className="flex-shrink-0 pt-1">
                <FavoriteButton routeSlug={route.slug} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
