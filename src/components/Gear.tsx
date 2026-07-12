import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RouteData } from '../types';
import { getGearGuide } from '../data/gearGuideData';

gsap.registerPlugin(ScrollTrigger);

interface Props { route: RouteData }

const gearIcons: Record<string, string> = {
  '背包': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  '徒步鞋': 'M3 11h3l2-2h8l2 2h3a2 2 0 012 2v4a2 2 0 01-2 2H3a2 2 0 01-2-2v-4a2 2 0 012-2z',
  '帐篷': 'M12 3l9 7-3 1v8H6v-8L3 10l9-7zm0 4.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
  '冲锋衣': 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h10a2 2 0 012 2v12a4 4 0 01-4 4H7z',
  '保暖层': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0',
  '登山杖': 'M7 13l-1 4 4-1 7-7a2 2 0 000-3l-1-1a2 2 0 00-3 0L7 13z',
  '头灯': 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 7a5 5 0 015 5',
  '睡袋': 'M5 13h14a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 012-2zm6-5v7m-7-7a4 4 0 014-4h8a4 4 0 014 4',
  '涉水鞋': 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13',
  '防晒用品': 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  '急救包': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622',
  '防水袋': 'M5 5h14v14H5zm2 2v10h10V7zm2 2h6v6H9z',
  '炉头套锅': 'M12 6V2m0 4a8 8 0 00-8 8h16a8 8 0 00-8-8zM2 18h20v2H2v-2z',
};

export default function Gear({ route }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.gear-item').forEach((el, i) => {
        gsap.fromTo(el, { y: 20, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.4, delay: i * 0.03, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const guide = selected ? getGearGuide(selected) : null;

  return (
    <>
      <section id="gear" ref={sectionRef} className="relative py-20 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${route.highlights[4].image})`,
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/85" />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white/90 mb-2 tracking-wide">装备清单</h2>
          <p className="text-white/30 text-sm mb-10">合理准备，从容出发</p>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
            {route.gear.map((item) => (
              <div
                key={item}
                onClick={() => setSelected(item)}
                className="gear-item liquid-glass-btn flex flex-col items-center gap-2 !p-3 !rounded-xl cursor-pointer"
              >
                {gearIcons[item] && (
                  <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={gearIcons[item]} />
                  </svg>
                )}
                <span className="text-xs text-white/50 text-center">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guide popup */}
      {guide && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
          onClick={() => setSelected(null)}
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-lg mx-4 my-12"
            onClick={e => e.stopPropagation()}
          >
            <div className="liquid-glass rounded-2xl p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{guide.emoji}</span>
                  <h3 className="text-lg font-bold text-white/90">{guide.name}</h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="liquid-glass-btn !p-1.5 !rounded-full text-white/50 hover:text-white/80 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-white/60 leading-relaxed mb-5">{guide.description}</p>

              {/* Tips */}
              <div className="space-y-3">
                <h4 className="text-xs text-white/40 tracking-wider uppercase">选购要点</h4>
                {guide.tips.map((tip, idx) => {
                  const colonIdx = tip.indexOf('：');
                  const bold = colonIdx > 0 ? tip.slice(0, colonIdx) : '';
                  const rest = colonIdx > 0 ? tip.slice(colonIdx) : tip;
                  return (
                    <div key={idx} className="flex gap-2 text-sm leading-relaxed">
                      <span className="text-amber-400/60 flex-shrink-0 mt-0.5">•</span>
                      <span className="text-white/50">
                        {bold && <strong className="text-white/80 font-medium">{bold}</strong>}{rest}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
