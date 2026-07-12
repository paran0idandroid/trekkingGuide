import { useParams, useNavigate } from 'react-router-dom';
import { getRouteBySlug } from '../data/routes';
import Hero from '../components/Hero';
import Overview from '../components/Overview';
import Highlights from '../components/Highlights';
import Timeline from '../components/Timeline';
import Risks from '../components/Risks';
import Footer from '../components/Footer';
import GearAdvisor from '../components/GearAdvisor';
import FavoriteButton from '../components/FavoriteButton';
import { useAuth } from '../contexts/AuthContext';
import RouteMapExperience from '../components/RouteMapExperience';
import { getRouteMapConfig } from '../data/routeMapData';

export default function RoutePage() {
  const { routeSlug } = useParams<{ routeSlug: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const route = routeSlug ? getRouteBySlug(routeSlug) : undefined;
  const mapConfig = route ? getRouteMapConfig(route.slug) : undefined;

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
      {mapConfig ? <RouteMapExperience route={route} config={mapConfig} /> : <Hero route={route} />}
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between border-b border-forest-100">
        <span className="text-sm text-forest-400">
          {route.overview.distance} &middot; {route.overview.duration} &middot; {route.overview.maxElevation}
        </span>
        <button
          onClick={() => !isLoggedIn && navigate('/auth')}
          className="flex items-center gap-2 text-sm text-forest-600 hover:text-forest-800 transition-colors"
        >
          <FavoriteButton routeSlug={route.slug} />
          {isLoggedIn ? '收藏路线' : '登录后收藏'}
        </button>
      </div>
      <GearAdvisor routeName={route.slug} />
      <Overview route={route} />
      <Highlights route={route} />
      <Timeline route={route} />
      <Risks route={route} />
      <Footer />
    </div>
  );
}
