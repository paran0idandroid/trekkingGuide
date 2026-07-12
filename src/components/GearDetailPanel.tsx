import { useState } from 'react';
import { GearKnowledgeItem } from '../data/gearKnowledge';
import GearAnatomyViewer from './GearAnatomyViewer';

interface Props {
  item: GearKnowledgeItem;
  onClose: () => void;
}

type Tab = 'purpose' | 'indicators' | 'comparison' | 'mistakes';

const tabs: { id: Tab; label: string }[] = [
  { id: 'purpose', label: '装备作用' },
  { id: 'indicators', label: '选购指标' },
  { id: 'comparison', label: '参数对比' },
  { id: 'mistakes', label: '新手避坑' },
];

const importanceColors: Record<number, { strip: string; label: string }> = {
  5: { strip: 'from-forest-500 to-forest-400', label: '核心装备' },
  4: { strip: 'from-amber-500 to-amber-400', label: '重要装备' },
  3: { strip: 'from-blue-500 to-blue-400', label: '建议装备' },
};

export default function GearDetailPanel({ item, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('purpose');
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [showAnatomy, setShowAnatomy] = useState(false);

  if (showAnatomy && item.id === 'backpack') {
    return <GearAnatomyViewer item={item} onClose={onClose} />;
  }

  const impColor = importanceColors[item.importance] || importanceColors[3];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8" onClick={onClose}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-3xl mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-3">
          {/* Colored accent strip */}
          <div className={`h-1 bg-gradient-to-r ${impColor.strip}`} />

          <div className="px-5 md:px-6 pt-4 pb-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{item.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-xl md:text-2xl font-bold text-forest-800">{item.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-forest-50 text-forest-700 border-forest-200">
                      {impColor.label}
                    </span>
                  </div>
                  <p className="text-sm text-forest-600">{item.summary}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-5 overflow-x-auto pb-1 border-b border-gray-100">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 text-xs font-medium rounded-t-lg whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${
                    tab === t.id
                      ? 'text-forest-700 border-forest-500 bg-forest-50/50'
                      : 'text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
              {/* 3D Anatomy button */}
              {item.id === 'backpack' && (
                <button
                  onClick={() => setShowAnatomy(true)}
                  className="ml-auto px-3 py-2 text-xs text-forest-500 hover:text-forest-700 hover:bg-forest-50 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  3D结构图
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 min-h-[200px]">

              {tab === 'purpose' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-forest-700 tracking-wider">它的作用</h4>
                  <p className="text-sm text-forest-600 leading-relaxed leading-7">{item.purpose}</p>
                </div>
              )}

              {tab === 'indicators' && (
                <div className="space-y-5">
                  <h4 className="text-sm font-semibold text-forest-700 tracking-wider">关键选购指标</h4>
                  {item.indicators.map((ind) => (
                    <div key={ind.name} className="border-l-2 border-forest-200 pl-4 py-1 space-y-1.5">
                      <h5 className="text-sm font-medium text-forest-800">{ind.name}</h5>
                      <p className="text-xs text-forest-600 leading-relaxed">
                        <span className="text-forest-400">是什么：</span>{ind.what}
                      </p>
                      <p className="text-xs text-forest-600 leading-relaxed">
                        <span className="text-amber-600/70">为什么重要：</span>{ind.why}
                      </p>
                      <p className="text-xs text-forest-600 leading-relaxed">
                        <span className="text-forest-500">新手怎么看：</span>{ind.tip}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'comparison' && (
                <div className="space-y-6">
                  <h4 className="text-sm font-semibold text-forest-700 tracking-wider">参数对比</h4>
                  {item.comparisons.map((comp) => (
                    <div key={comp.label}>
                      <h5 className="text-xs text-forest-500 mb-3 tracking-wide">{comp.label}</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {comp.items.map((c) => (
                          <div key={c.value} className="bg-forest-50/40 rounded-xl p-3 border border-forest-100/60">
                            <div className="text-sm font-medium text-forest-800 mb-1">{c.value}</div>
                            <div className="text-[11px] text-forest-600 leading-relaxed">{c.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'mistakes' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-forest-700 tracking-wider">常见错误</h4>
                  {item.mistakes.map((m, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-rose-50/40 rounded-xl">
                      <span className="text-rose-400 text-sm flex-shrink-0 mt-0.5">✕</span>
                      <p className="text-sm text-forest-600 leading-relaxed">{m}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side panel */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
              <h4 className="text-[11px] text-forest-500 tracking-wider uppercase font-medium mb-4">选购权重</h4>
              <div className="space-y-3">
                {item.weights.map(w => (
                  <div key={w.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-forest-600">{w.name}</span>
                      <span className="text-forest-400">{w.score}/5</span>
                    </div>
                    <div className="h-1.5 bg-forest-100/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(w.score / 5) * 100}%`,
                          background: w.score >= 4
                            ? 'linear-gradient(90deg, #6fad85, #4d9066)'
                            : w.score >= 3
                              ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                              : 'linear-gradient(90deg, #60a5fa, #3b82f6)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
              <h4 className="text-[11px] text-forest-500 tracking-wider uppercase font-medium mb-3">知识节点</h4>
              <div className="flex flex-wrap gap-1.5">
                {item.nodes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setActiveNode(activeNode === n.id ? null : n.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-full transition-all duration-200 ${
                      activeNode === n.id
                        ? 'bg-forest-500 text-white shadow-sm'
                        : 'bg-forest-50/60 text-forest-600 hover:text-forest-700 border border-forest-100/80 hover:border-forest-200'
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
              {activeNode && (
                <div className="mt-3 pt-3 border-t border-gray-100 animate-fadeIn">
                  <p className="text-xs text-forest-600 leading-relaxed">
                    {item.nodes.find(n => n.id === activeNode)?.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
