import { GearKnowledgeItem } from '../data/gearKnowledge';

interface Props {
  item: GearKnowledgeItem;
  onClick: () => void;
}

const importanceConfig: Record<number, { label: string; stripClass: string; badgeClass: string; borderHover: string }> = {
  5: {
    label: '核心装备',
    stripClass: 'bg-gradient-to-r from-forest-500 to-forest-400',
    badgeClass: 'bg-forest-50 text-forest-700 border-forest-200',
    borderHover: 'hover:border-forest-300',
  },
  4: {
    label: '重要装备',
    stripClass: 'bg-gradient-to-r from-amber-500 to-amber-400',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    borderHover: 'hover:border-amber-300',
  },
  3: {
    label: '建议装备',
    stripClass: 'bg-gradient-to-r from-blue-500 to-blue-400',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    borderHover: 'hover:border-blue-300',
  },
};

export default function GearCard({ item, onClick }: Props) {
  const cfg = importanceConfig[item.importance] || importanceConfig[3];

  return (
    <button
      onClick={onClick}
      className={`group bg-white rounded-2xl shadow-sm border border-gray-100/80 text-left cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden w-full ${cfg.borderHover}`}
    >
      {/* Top colored strip with emoji */}
      <div className={`${cfg.stripClass} h-20 flex items-center justify-center relative overflow-hidden`}>
        <span className="text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          {item.icon}
        </span>
        {/* Subtle decorative overlay */}
        <div className="absolute inset-0 bg-white/[0.06]" />
      </div>

      {/* Card body */}
      <div className="p-4 md:p-5">
        {/* Importance badge */}
        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.badgeClass} mb-2`}>
          {cfg.label}
        </span>

        {/* Name */}
        <h3 className="text-base md:text-lg font-semibold text-forest-800 mb-1.5 leading-tight">{item.name}</h3>

        {/* Summary */}
        <p className="text-xs md:text-sm text-forest-600 leading-relaxed line-clamp-2">{item.summary}</p>

        {/* Scenarios */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
          {item.scenarios.slice(0, 3).map(s => (
            <span key={s} className="text-[10px] text-forest-500/90 bg-forest-50/80 px-2 py-0.5 rounded-full">{s}</span>
          ))}
          {item.scenarios.length > 3 && (
            <span className="text-[10px] text-forest-400">{'+' + (item.scenarios.length - 3)}</span>
          )}
        </div>
      </div>
    </button>
  );
}
