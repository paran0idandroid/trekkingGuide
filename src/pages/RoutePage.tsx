import { lazy, Suspense, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRouteBySlug } from '../data/routes';
import Hero from '../components/Hero';
import Overview from '../components/Overview';
import Highlights from '../components/Highlights';
import Timeline from '../components/Timeline';
import Risks from '../components/Risks';
import Footer from '../components/Footer';
import { getRouteMapConfig } from '../data/routeMapData';

const RouteMapExperience = lazy(() => import('../components/RouteMapExperience'));

export default function RoutePage() {
  const { routeSlug } = useParams<{ routeSlug: string }>();
  const navigate = useNavigate();
  const route = routeSlug ? getRouteBySlug(routeSlug) : undefined;
  const mapConfig = route ? getRouteMapConfig(route.slug) : undefined;

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [routeSlug]);

  if (!route) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-forest-600 text-lg mb-4">路线不存在</p>
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
    <div className="min-h-screen">
      {mapConfig ? (
        <Suspense fallback={<div className="route-map-shell flex items-center justify-center bg-forest-50 text-sm text-forest-600">正在加载路线地图...</div>}>
          <RouteMapExperience route={route} config={mapConfig} />
        </Suspense>
      ) : <Hero route={route} />}
      <Overview route={route} />
      {route.highlights.length > 0 && <Highlights route={route} />}
      <Timeline route={route} />
      <Risks route={route} />
      <Footer />
    </div>
  );
}
