import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { gearKnowledgeData, GearKnowledgeItem } from '../data/gearKnowledge';
import GearCard from '../components/GearCard';
import GearDetailPanel from '../components/GearDetailPanel';
import GearAdvisorModal from '../components/GearAdvisorModal';
import { getRouteBySlug } from '../data/routes';

export default function GearKnowledgePage() {
  const [selected, setSelected] = useState<GearKnowledgeItem | null>(null);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [filter, setFilter] = useState<'all' | 'core' | 'other'>('all');

  const location = useLocation();
  const routeSlug = location.state?.routeSlug as string | undefined;
  const linkedRoute = routeSlug ? getRouteBySlug(routeSlug) : undefined;

  const coreItems = gearKnowledgeData.filter(i => i.importance >= 5);
  const otherItems = gearKnowledgeData.filter(i => i.importance < 5);

  const filteredItems = filter === 'all' 
    ? gearKnowledgeData 
    : filter === 'core' 
      ? coreItems 
      : otherItems;

  return (
    <div className="min-h-screen py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header - more prominent */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-forest-500 text-xs tracking-wider uppercase mb-3">
            <span className="w-6 h-px bg-forest-300" />
            装备指南
            <span className="w-6 h-px bg-forest-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-forest-800 tracking-wide mb-2">装备知识</h1>
          <p className="text-forest-600 text-sm max-w-xl leading-relaxed">
            了解每件装备的作用和选购要点，做有准备的选择
          </p>
        </div>

        {/* Route linkage badge */}
        {linkedRoute && (
          <div className="bg-forest-50/80 rounded-xl p-4 md:p-5 mb-8 border-l-2 border-forest-400/40">
            <div className="flex items-start gap-3">
              <span className="text-cyan-400/60 text-sm mt-0.5">📌</span>
              <div>
                <p className="text-sm text-forest-700 font-medium">
                  {linkedRoute.name} 装备建议
                </p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-forest-500">
                  <span>🎒 背包：55L+</span>
                  <span>🥾 鞋类：高帮防水</span>
                  <span>🛌 睡袋：-5°C左右</span>
                  <span>🏑 登山杖：建议携带</span>
                  <span>🧥 冲锋衣：必须</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'all', label: '全部' },
            { key: 'core', label: '核心装备' },
            { key: 'other', label: '其他装备' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-200 active:scale-95 ${
                filter === tab.key
                  ? 'bg-forest-500 text-white shadow-sm'
                  : 'bg-white text-forest-500/70 hover:text-forest-700 border border-gray-100/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Core gear section */}
        {filter !== 'other' && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-semibold text-forest-700">核心装备</h2>
              <span className="text-xs text-forest-400">{coreItems.length} 件</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {coreItems.map(item => (
                <GearCard key={item.id} item={item} onClick={() => setSelected(item)} />
              ))}
            </div>
          </div>
        )}

        {/* Other gear section */}
        {filter !== 'core' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-semibold text-forest-700">其他装备</h2>
              <span className="text-xs text-forest-400">{otherItems.length} 件</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {otherItems.map(item => (
                <GearCard key={item.id} item={item} onClick={() => setSelected(item)} />
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-forest-400 text-sm">暂无该分类的装备信息</p>
          </div>
        )}

        {/* AI Advisor button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setShowAdvisor(true)}
            className="bg-forest-500 text-white hover:bg-forest-600 px-8 py-3.5 rounded-full text-sm inline-flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            帮我判断需要什么装备
          </button>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <GearDetailPanel item={selected} onClose={() => setSelected(null)} />
      )}

      {/* AI Advisor modal */}
      {showAdvisor && (
        <GearAdvisorModal onClose={() => setShowAdvisor(false)} />
      )}
    </div>
  );
}
