import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRouteBySlug } from '../data/routes';
import { useAuth } from '../contexts/AuthContext';

const routeMatch = /^\/route\/([^/]+)/;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const useLightNav = scrolled || location.pathname.startsWith('/gear-knowledge') || location.pathname === '/my-gear';

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);
      setShowTop(y > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const m = location.pathname.match(routeMatch);
  const route = m ? getRouteBySlug(m[1]) : undefined;

  const navItems = route
    ? [
        { label: '路线', href: '#overview' },
        { label: '行程', href: '#itinerary' },
        { label: '风险', href: '#risks' },
      ]
    : [];

  const pageLinks = [
    { label: '地图', href: '/', isActive: location.pathname === '/' },
    { label: '装备知识', href: '/gear-knowledge', isActive: location.pathname.startsWith('/gear-knowledge') },
    { label: '我的装备', href: '/my-gear', isActive: location.pathname === '/my-gear' },
    { label: '收藏', href: '/favorites', isActive: location.pathname === '/favorites' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          useLightNav
            ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14 md:h-16">
          {/* Left: page links */}
          <div className="flex items-center gap-2">
            {pageLinks.map((link) => (
              <div key={link.href} className="relative">
                <button
                  onClick={() => navigate(link.href)}
                  className={`text-[13px] tracking-wider uppercase py-1.5 px-3 transition-all duration-200 active:scale-95 ${
                    link.isActive
                        ? (useLightNav ? 'text-forest-700 font-medium' : 'text-white font-medium')
                        : (useLightNav ? 'text-forest-500/75 hover:text-forest-700' : 'text-white/70 hover:text-white')
                  }`}
                >
                  {link.label}
                </button>
                {link.isActive && (
                  <div className={`absolute -bottom-[1px] left-3 right-3 h-0.5 rounded-full transition-colors duration-500 ${useLightNav ? 'bg-forest-500' : 'bg-white/70'}`} />
                )}
              </div>
            ))}
            {route && (
              <span className="hidden md:block text-forest-400 text-xs ml-1">/ {route.name}</span>
            )}
          </div>

          {/* Right: route section links + auth (desktop) */}
          <div className="hidden md:flex gap-2 items-center">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-[13px] tracking-wider uppercase transition-all duration-200 active:scale-95 ${useLightNav ? 'text-forest-500/75 hover:text-forest-700' : 'text-white/75 hover:text-white'}`}
              >
                {item.label}
              </a>
            ))}
              {isLoggedIn && (
                <span className={`text-[13px] ml-1 ${useLightNav ? 'text-forest-400' : 'text-white/50'}`}>{user?.phone}</span>
              )}
            <button
              onClick={() => (isLoggedIn ? logout() : navigate('/auth'))}
              className={`text-[13px] tracking-wider uppercase transition-all duration-200 active:scale-95 flex items-center gap-1 ${useLightNav ? 'text-forest-500/75 hover:text-forest-700' : 'text-white/75 hover:text-white'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {isLoggedIn ? '退出' : '登录'}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 transition-colors ${useLightNav ? 'text-forest-500' : 'text-white/80'}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="菜单"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100">
            <div className="flex flex-col gap-1 px-6 pb-4 pt-2">
              {pageLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => { navigate(link.href); setMenuOpen(false); }}
                  className={`text-sm py-2 text-left active:scale-95 ${
                    link.isActive ? 'text-forest-800' : 'text-forest-500 hover:text-forest-700'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {route && <div className="text-forest-400 text-xs py-1">── {route.name} ──</div>}
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-forest-500 py-1 hover:text-forest-700"
                >
                  {item.label}
                </a>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <div className="text-xs text-forest-400 py-1">{isLoggedIn ? user?.phone : '未登录'}</div>
                {isLoggedIn && (
                  <button
                    onClick={() => { navigate('/favorites'); setMenuOpen(false); }}
                    className="text-sm text-forest-500 py-1 hover:text-forest-700 w-full text-left flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    我的收藏
                  </button>
                )}
                <button
                  onClick={() => { isLoggedIn ? logout() : navigate('/auth'); setMenuOpen(false); }}
                  className="text-sm text-forest-500 py-1 hover:text-forest-700 w-full text-left"
                >
                  {isLoggedIn ? '退出登录' : '登录'}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        aria-label="回到顶部"
        className={`
          fixed bottom-8 right-6 z-50
          bg-forest-800/70 hover:bg-forest-700 backdrop-blur-md p-3.5 rounded-full shadow-lg
          transition-all duration-500 ease-out active:scale-90
          ${showTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}
