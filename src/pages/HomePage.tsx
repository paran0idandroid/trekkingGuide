import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ChinaMap from '../components/ChinaMap';
import Footer from '../components/Footer';
import { routeDataMap } from '../data/routes';
import type { RouteData } from '../types';

gsap.registerPlugin(ScrollTrigger);

function HomeHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(titleRef.current, { y: 60, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 1.2 })
      .fromTo(subtitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
      .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3')
      .fromTo(arrowRef.current, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2');
  }, []);

  const scrollToMap = () => {
    const el = document.getElementById('map-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={heroRef} className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/pics/haba/scene-1.webp)",
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center 58%',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/75 via-forest-950/55 to-forest-950/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/55 via-forest-950/35 to-forest-950/45" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="mb-4">
          <span className="inline-block text-[13px] tracking-[0.15em] uppercase text-white/80 font-medium">
            户外徒步路线指南
          </span>
        </div>
        <h1
          ref={titleRef}
          className="text-[40px] sm:text-5xl md:text-[64px] font-bold text-white mb-5 tracking-[0.01em] leading-[1.12]"
        >
          中国徒步路线
        </h1>
        <p
          ref={subtitleRef}
          className="text-base md:text-lg text-white/85 mb-10 font-normal tracking-normal max-w-[34rem] mx-auto leading-relaxed text-pretty"
        >
          从乌孙古道到哈巴西坡，获取路线与装备建议
        </p>
        <div ref={ctaRef} className="flex flex-wrap justify-center gap-4">
          <button
            onClick={scrollToMap}
            className="bg-forest-500 hover:bg-forest-400 text-white px-10 py-3.5 rounded-full text-sm tracking-wider transition-all duration-300 shadow-lg shadow-forest-500/25 hover:shadow-xl hover:shadow-forest-500/30 active:scale-95"
          >
            探索路线
          </button>
          <button
            onClick={() => window.open('/gear-knowledge', '_self')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-8 py-3.5 rounded-full text-sm text-white/80 hover:text-white tracking-wider transition-all duration-300 border border-white/20 active:scale-95"
          >
            装备知识
          </button>
        </div>
      </div>

      <div ref={arrowRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}

function RouteCard({ route }: { route: RouteData }) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    gsap.fromTo(el, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/route/${route.slug}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
    >
      {route.heroImage && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={route.heroImage}
            alt={route.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-forest-800 mb-1.5">{route.name}</h3>
        <p className="text-sm text-forest-600 mb-3 line-clamp-2 leading-relaxed">{route.subtitle}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {route.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-[11px] text-forest-500/95 bg-forest-100/60 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-forest-400">
          <span>{route.overview.duration}</span>
          <span className="w-px h-3 bg-forest-200" />
          <span>{route.overview.difficulty}</span>
          <span className="w-px h-3 bg-forest-200" />
          <span>{route.overview.distance}</span>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    gsap.fromTo(el.querySelector('.section-title'), { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' },
    });
  }, []);

  const allRoutes = Object.values(routeDataMap);

  return (
    <div className="min-h-screen">
      <HomeHero />

      {/* Map Section */}
      <section id="map-section" className="py-16 md:py-24">
        <div className="text-center mb-10 px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-forest-800 mb-3">探索路线</h2>
          <p className="text-sm text-forest-600 max-w-xl mx-auto">
            地图上标注了已收录的徒步路线，点击任意路线可查看详情
          </p>
        </div>
        <ChinaMap />
      </section>

      {/* Featured Routes */}
      <section ref={sectionRef} className="pb-20 md:pb-28">
        <div className="text-center mb-10 px-6 section-title">
          <h2 className="text-2xl md:text-3xl font-bold text-forest-800 mb-3">精选路线</h2>
          <p className="text-sm text-forest-600 max-w-xl mx-auto">
            从新疆到云南，每一条路线都是一段独特的旅程
          </p>
        </div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {allRoutes.map(route => (
              <RouteCard key={route.slug} route={route} />
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => window.location.href = '/'}
              className="border border-forest-500/40 text-forest-600 hover:bg-forest-500 hover:text-white px-8 py-2.5 rounded-full text-sm transition-all duration-300 active:scale-95"
            >
              查看更多路线
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
