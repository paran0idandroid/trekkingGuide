import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RouteData } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface Props { route: RouteData }

export default function Highlights({ route }: Props) {
  return (
    <>
      {route.highlights.map((item, idx) => (
        <HighlightBlock key={item.title} item={item} index={idx} total={route.highlights.length} />
      ))}
    </>
  );
}

function HighlightBlock({ item, index, total }: { item: RouteData['highlights'][0]; index: number; total: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[75vh] min-h-[500px] flex items-end overflow-hidden"
    >
      {/* Photo background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${item.image})`,
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Gradient from bottom for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/30 to-transparent" />

      {/* Counter */}
      <div className="absolute top-8 right-8 z-10 text-white/20 text-sm font-light tracking-widest">
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      {/* Content at bottom */}
      <div ref={contentRef} className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-16 md:pb-24">
        <h3 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-wide">
          {item.title}
        </h3>
        <p className="text-sm md:text-base text-white/60 max-w-2xl leading-relaxed">
          {item.description}
        </p>
        <div className="mt-4 w-12 h-0.5 bg-white/30" />
      </div>
    </section>
  );
}
