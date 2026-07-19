import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { RouteData } from '../types';

interface Props { route: RouteData }

export default function Hero({ route }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(titleRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 })
      .fromTo(subtitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
      .fromTo(tagsRef.current?.children ?? [], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, '-=0.3')
      .fromTo(arrowRef.current, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2');
  }, []);

  return (
    <section id="hero" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className={`absolute inset-0 bg-cover bg-center ${route.heroImage ? '' : 'bg-forest-900'}`}
        style={route.heroImage ? {
          backgroundImage: `url(${route.heroImage})`,
          backgroundAttachment: 'fixed',
        } : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-950/45 to-forest-950/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/50 via-forest-950/20 to-forest-950/35" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-4 tracking-wide leading-tight"
        >
          {route.name}
        </h1>
        <p
          ref={subtitleRef}
          className="text-base sm:text-lg md:text-xl text-white/75 mb-8 font-light tracking-wider leading-relaxed max-w-2xl mx-auto"
        >
          {route.subtitle}
        </p>
        <div ref={tagsRef} className="flex flex-wrap justify-center gap-2 md:gap-3">
          {route.tags.map((tag) => (
            <span
              key={tag}
              className="bg-white/10 backdrop-blur-sm px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm text-white/70 border border-white/15"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div ref={arrowRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
