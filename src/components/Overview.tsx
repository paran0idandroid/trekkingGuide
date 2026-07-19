import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RouteData } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface Props { route: RouteData }

function splitStat(value: string): { value: string; unit: string } {
  const separator = value.lastIndexOf(' ');
  if (separator === -1) return { value, unit: '' };
  return { value: value.slice(0, separator), unit: value.slice(separator + 1) };
}

function splitDuration(value: string): { value: string; unit: string } {
  const separator = value.indexOf(' ');
  if (separator === -1) return { value, unit: '' };
  return { value: value.slice(0, separator), unit: value.slice(separator + 1) };
}

export default function Overview({ route }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const backgroundImage = route.highlights[1]?.image ?? route.highlights[0]?.image;
  const stats = [
    { ...splitStat(route.overview.distance), label: '全程距离' },
    { ...splitDuration(route.overview.duration), label: '徒步时间' },
    { ...splitStat(route.overview.maxElevation), label: '最高海拔' },
    { value: route.overview.difficulty, unit: '难度', label: '适合有经验者' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(textRef.current?.children ?? [], { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="overview" ref={sectionRef} className="relative py-20 md:py-28 flex items-center overflow-hidden">
      <div
        className={`absolute inset-0 bg-cover bg-center ${backgroundImage ? '' : 'bg-forest-900'}`}
        style={backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundAttachment: 'fixed',
        } : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-950/70 to-forest-950/85" />

      <div ref={textRef} className="relative z-10 w-full max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {stats.map((s) => (
          <div key={s.label} className="liquid-glass rounded-2xl py-6 md:py-8 px-4 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                {s.value}
              </span>
              <span className="text-base md:text-xl text-white/50 font-light">{s.unit}</span>
            </div>
            <div className="mt-2 text-xs md:text-sm text-white/40 tracking-wider uppercase">
              {s.label}
              {s.label === '难度' && (
                <div className="mt-2 text-[10px] text-white/30 font-light max-w-[140px] mx-auto leading-relaxed">{route.overview.suitableFor}</div>
              )}
              {s.label === '最高海拔' && (
                <div className="mt-2 text-[10px] text-white/30 font-light max-w-[140px] mx-auto leading-relaxed">{route.overview.bestSeason}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
