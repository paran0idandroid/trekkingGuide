import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RouteData } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface Props { route: RouteData }

export default function Timeline({ route }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundImage = route.highlights[3]?.image;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.tl-row').forEach((el, i) => {
        gsap.fromTo(el, { y: 40, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: i * 0.08,
          scrollTrigger: { trigger: el, start: 'top 80%' },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="itinerary" ref={sectionRef} className="relative py-20 md:py-28 overflow-hidden">
      {/* Subtle bg */}
      <div
        className={`absolute inset-0 bg-cover bg-center ${backgroundImage ? '' : 'bg-forest-900'}`}
        style={backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundAttachment: 'fixed',
        } : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/90 to-forest-950/92" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white/90 mb-2 tracking-wide">每日行程</h2>
        <p className="text-white/40 text-sm mb-12">{route.overview.duration}路线安排</p>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-px" />

          {route.itinerary.map((day, idx) => (
            <div
              key={day.day}
              className={`tl-row relative flex items-start gap-5 mb-8 md:mb-10 last:mb-0 ${
                idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Day dot */}
              <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border border-white/20 bg-black/50 backdrop-blur-sm text-white/80 flex items-center justify-center text-xs font-medium md:absolute md:left-1/2 md:-translate-x-1/2">
                {day.day}
              </div>

              {/* Content */}
              <div className={`flex-1 ml-2 md:ml-0 ${idx % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                <span className="text-xs text-white/30 tracking-wider">Day {day.day}</span>
                <h3 className="text-base md:text-lg font-semibold text-white/90 mt-1 mb-2">{day.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{day.description}</p>
              </div>

              <div className="hidden md:block md:w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
