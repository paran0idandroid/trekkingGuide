import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import GearAdvisorModal from '../components/GearAdvisorModal';
import GearSystemCard from '../components/GearSystemCard';
import { getGearSystems } from '../data/gearSystems';
import { getRouteBySlug } from '../data/routes';

export default function GearKnowledgePage() {
  const [showAdvisor, setShowAdvisor] = useState(false);
  const location = useLocation();
  const routeSlug = location.state?.routeSlug as string | undefined;
  const linkedRoute = routeSlug ? getRouteBySlug(routeSlug) : undefined;
  const systems = getGearSystems();

  return (
    <main className="gear-page-environment min-h-screen py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <header className="mb-8 max-w-2xl md:mb-10">
          <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-forest-500">
            <span className="h-px w-6 bg-forest-300" />
            装备指南
            <span className="h-px w-6 bg-forest-300" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-forest-800 md:text-4xl">
            徒步装备由六大系统组成
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-forest-600 md:text-base">
            先认识一套完整装备的结构，再进入具体系统了解每件装备的作用和选购方法。
          </p>
        </header>

        <section aria-label="六大装备系统" className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 xl:grid-cols-6">
          {systems.map(system => (
            <GearSystemCard key={system.slug} system={system} routeSlug={routeSlug} />
          ))}
        </section>

        {linkedRoute && (
          <section className="gear-glass-module mt-10 rounded-2xl p-5 md:mt-14 md:p-6">
            <p className="text-sm font-semibold text-forest-800">{linkedRoute.name} 装备提示</p>
            <p className="mt-2 text-sm leading-6 text-forest-600">
              建议重点检查大容量背包、高帮防水徒步鞋、低温睡袋、登山杖和防风雨外层。
            </p>
          </section>
        )}

        <section className="gear-glass-module mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl px-5 py-6 md:mt-10 md:flex-row md:items-center md:px-7">
          <div>
            <h2 className="text-lg font-semibold text-forest-800">还不确定自己需要什么？</h2>
            <p className="mt-1 text-sm leading-6 text-forest-600">
              根据路线天数、海拔、温度和负重方式，生成一份适合你的装备建议。
            </p>
          </div>
          <button
            onClick={() => setShowAdvisor(true)}
            className="gear-glass-primary gear-pressable inline-flex min-h-11 shrink-0 items-center rounded-full px-6 py-3 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-300"
          >
            帮我判断需要什么装备
          </button>
        </section>
      </div>

      {showAdvisor && <GearAdvisorModal onClose={() => setShowAdvisor(false)} />}
    </main>
  );
}
