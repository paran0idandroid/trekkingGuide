import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { GearRecommendation, GearCategory } from '../types';
import { getGearKnowledge } from '../data/gearKnowledge';
import GearDetailPanel from './GearDetailPanel';

interface Props {
  recommendations: GearRecommendation[];
  onReset: () => void;
  onClose: () => void;
}

const categoryEmoji: Record<string, string> = {
  '背包': '🎒', '徒步鞋': '🥾', '睡袋': '🛌', '帐篷': '⛺',
  '冲锋衣': '🧥', '保暖层': '🧶', '登山杖': '🏑', '头灯': '💡',
  '炉头套锅': '🍳', '水袋水壶': '💧', '防水袋': '📦', '涉水鞋': '🩴',
  '雪套': '🦵', '防晒墨镜': '🕶️',
};

// Map GearCategory (Chinese) → gearKnowledge item ID
const categoryToKnowledge: Record<string, string> = {
  '背包': 'backpack',
  '徒步鞋': 'hiking-shoes',
  '涉水鞋': 'hiking-shoes',
  '睡袋': 'sleeping-bag',
  '帐篷': 'tent',
  '冲锋衣': 'rain-jacket',
  '保暖层': 'rain-jacket',
  '登山杖': 'trekking-poles',
  '头灯': 'headlamp',
  '炉头套锅': 'stove',
  '水袋水壶': 'water-system',
  '防水袋': 'backpack',
};

export default function GearResults({ recommendations, onReset, onClose }: Props) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const [knowledgeId, setKnowledgeId] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState<string | null>(null);
  const knowledgeItem = knowledgeId ? getGearKnowledge(knowledgeId) : null;

  useEffect(() => {
    if (cardsRef.current) {
      const items = cardsRef.current.querySelectorAll('.rec-card');
      gsap.fromTo(items, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out',
      });
    }
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        <div className="relative z-10 w-full max-w-xl mx-4 my-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white/90">你的装备清单</h2>
            <div className="flex gap-2">
              <button
                onClick={onReset}
                className="liquid-glass-btn !px-3 !py-1.5 !rounded-full text-xs text-white/50 hover:text-white/80"
              >
                重新作答
              </button>
              <button
                onClick={onClose}
                className="liquid-glass-btn !p-1.5 !rounded-full text-white/50 hover:text-white/80"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Card list */}
          <div ref={cardsRef} className="space-y-3">
            {recommendations.map((rec) => {
              const p = rec.product;
              const cat = p.category as string;
              const hasKnowledge = !!categoryToKnowledge[cat];

              return (
                <div key={p.id} className="rec-card liquid-glass rounded-2xl p-5">
                  {/* Title row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{categoryEmoji[cat] || '🔧'}</span>
                      <div>
                        <span className="text-xs text-white/40 tracking-wider uppercase">{cat}</span>
                        <h3 className="text-base font-semibold text-white/90">{p.brandZh} {p.model}</h3>
                      </div>
                    </div>
                    <span className="text-sm text-white/60 whitespace-nowrap">
                      ¥{p.priceRange[0]}-{p.priceRange[1]}
                    </span>
                  </div>

                  {/* Specs bar */}
                  {Object.keys(p.specs).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(p.specs).map(([key, val]) => (
                        <span key={key} className="text-[11px] text-white/35 bg-white/5 px-2 py-0.5 rounded-full">
                          {specLabel(key)}: {val}{specUnit(key)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reason */}
                  <p className="text-sm text-white/50 leading-relaxed mb-4 italic">
                    {rec.reason}
                  </p>

                  {/* Product intro (collapsible) */}
                  {p.intro && (
                    <div className="mb-4">
                      <button
                        onClick={() => setShowIntro(showIntro === p.id ? null : p.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
                      >
                        <span>📖 了解这款经典产品</span>
                        <svg
                          className={`w-3 h-3 transition-transform duration-200 ${
                            showIntro === p.id ? 'rotate-180' : ''
                          }`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showIntro === p.id && (
                        <div className="mt-2 p-3 bg-white/5 rounded-xl text-xs text-white/80 leading-relaxed">
                          {p.intro}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* Buy buttons */}
                    <a
                      href={p.links.taobao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="liquid-glass-btn !px-4 !py-2 !rounded-full text-xs text-white/70 hover:text-white inline-flex items-center gap-1.5"
                    >
                      🛒 淘宝旗舰店
                    </a>
                    <a
                      href={p.links.jd}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="liquid-glass-btn !px-4 !py-2 !rounded-full text-xs text-white/70 hover:text-white inline-flex items-center gap-1.5"
                    >
                      🛒 京东旗舰店
                    </a>
                    {/* Knowledge button */}
                    {hasKnowledge && (
                      <button
                        onClick={() => setKnowledgeId(categoryToKnowledge[cat])}
                        className="liquid-glass-btn !px-4 !py-2 !rounded-full text-xs text-cyan-400/70 hover:text-cyan-300 inline-flex items-center gap-1.5"
                      >
                        📖 选购要点
                      </button>
                    )}
                  </div>

                  {/* Alternatives */}
                  {rec.alternatives.length > 0 && (
                    <p className="text-xs text-white/30">
                      备选：{rec.alternatives.map(a => `${a.brandZh} ${a.model}`).join('、')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pb-8">
            <p className="text-xs text-white/20">推荐仅供参考，购买前请确认尺码和适配性</p>
          </div>
        </div>
      </div>

      {/* Knowledge detail panel overlay */}
      {knowledgeItem && (
        <GearDetailPanel item={knowledgeItem} onClose={() => setKnowledgeId(null)} />
      )}
    </>
  );
}

function specLabel(key: string): string {
  const map: Record<string, string> = {
    volume: '容积', weight: '重量', torsoFit: '背负尺码',
    comfortTemp: '舒适温标', fill: '填充物', capacity: '人数',
    goretex: 'GTX防水', height: '帮高', lumens: '亮度',
    battery: '电池', fuel: '燃料', boilTime: '烧水时间',
    material: '材质', uvProtection: 'UV防护', category: '镜片分类',
  };
  return map[key] || key;
}

function specUnit(key: string): string {
  const map: Record<string, string> = {
    volume: 'L', weight: 'kg', comfortTemp: '°C',
    lumens: 'lm', uvProtection: 'nm',
    capacity: '人',
  };
  return map[key] || '';
}
