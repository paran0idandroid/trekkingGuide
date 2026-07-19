import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RouteData } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface Props { route: RouteData }

const riskIcons = [
  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  'M3 15a4 4 0 004 4h9a4 4 0 004-4M3 15V7a4 4 0 014-4h9a4 4 0 014 4v8',
  'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622',
];

export default function Risks({ route }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundImage = route.highlights[0]?.image;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.risk-row').forEach((el, i) => {
        gsap.fromTo(el, { x: -20, opacity: 0 }, {
          x: 0, opacity: 1, duration: 0.5, delay: i * 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="risks" ref={sectionRef} className="relative py-20 md:py-28 overflow-hidden">
      <div
        className={`absolute inset-0 bg-cover bg-center ${backgroundImage ? '' : 'bg-forest-950'}`}
        style={backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundAttachment: 'fixed',
        } : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/95 to-forest-950/92" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white/90 mb-2 tracking-wide">风险提示</h2>
        <p className="text-white/30 text-sm mb-10">安全第一，敬畏自然</p>

        <div className="grid gap-3">
          {route.risks.map((risk, idx) => (
            <div key={risk.title} className="risk-row liquid-glass flex items-start gap-4 !p-4 !rounded-xl">
              <svg className="w-5 h-5 flex-shrink-0 text-amber-400/70 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={riskIcons[idx % riskIcons.length]} />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-white/80 mb-1">{risk.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{risk.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
