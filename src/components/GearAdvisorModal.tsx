import { useState } from 'react';

interface Props {
  onClose: () => void;
}

interface Step {
  question: string;
  field: string;
  options: { value: string; label: string }[];
}

const steps: Step[] = [
  { question: '你计划徒步几天？', field: 'days', options: [
    { value: '1', label: '1天（当日往返）' },
    { value: '2-4', label: '2-4天（短途）' },
    { value: '5+', label: '5天以上（长线）' },
  ]},
  { question: '是否需要露营过夜？', field: 'camping', options: [
    { value: 'yes', label: '是，需要帐篷睡袋' },
    { value: 'no', label: '否，住客栈/木屋' },
  ]},
  { question: '预计负重多少？', field: 'load', options: [
    { value: 'light', label: '10kg以下（轻量化）' },
    { value: 'mid', label: '10-15kg（普通）' },
    { value: 'heavy', label: '15kg以上（重装）' },
  ]},
  { question: '什么季节出行？', field: 'season', options: [
    { value: 'spring-summer', label: '春夏（温暖/多雨）' },
    { value: 'autumn', label: '秋季（凉爽/干燥）' },
    { value: 'winter', label: '冬季（寒冷/可能有雪）' },
  ]},
];

interface Advice {
  backpackVol: string;
  shoeType: string;
  bagTemp: string;
  keyPoints: string[];
  dontOverthink: string[];
  mistakes: string[];
}

function getResult(answers: Record<string, string>): Advice {
  const days = answers.days;
  const camping = answers.camping;
  const load = answers.load;
  const season = answers.season;

  let backpackVol = '20-35L（一日徒步背包）';
  let shoeType = '低帮徒步鞋或越野跑鞋';
  let bagTemp = '无需考虑睡袋';
  const keyPoints: string[] = [];
  const dontOverthink: string[] = [];
  const mistakes: string[] = [];

  if (days === '1') {
    backpackVol = '20-35L';
    shoeType = '低帮徒步鞋';
    keyPoints.push('当日往返，不需要担心背负系统');
    dontOverthink.push('帐篷、睡袋、炉具——不需要');
    mistakes.push('不要因为只有一天就穿普通运动鞋。徒步鞋的防滑和保护仍然重要');
  } else if (days === '2-4') {
    backpackVol = '40-55L';
    shoeType = '中帮徒步鞋';
    keyPoints.push('2-4天的短途，重点在于背包的背负系统和鞋的舒适度');
    if (camping === 'yes') keyPoints.push('需要帐篷和睡袋，建议双人帐分摊重量');
    if (!camping) keyPoints.push('住客栈/木屋则不需要帐篷睡袋，背包可以选小一些');
  } else {
    backpackVol = '55-70L（长线建议偏大）';
    shoeType = '中高帮防水徒步鞋';
    keyPoints.push('长线徒步，装备的可靠性和舒适度压倒一切');
    keyPoints.push('背包背负系统是最重要的决定因素');
    keyPoints.push('睡袋和帐篷要在重量和性能之间做好平衡');
    if (camping === 'yes') keyPoints.push('所有装备自己背，轻量化每100g都值得关注');
  }

  if (load === 'heavy') {
    shoeType = shoeType.includes('高帮') ? shoeType : '高帮重装徒步鞋';
    keyPoints.push('重装状态下，鞋和背包的支撑性是最关键的');
  }

  if (season === 'winter') {
    bagTemp = '舒适温标-10°C或更低';
    keyPoints.push('冬季出行，睡袋温标是关键，推荐羽绒睡袋');
    keyPoints.push('衣物系统需要三层着装法：排汗+保暖+冲锋衣');
    mistakes.push('冬季不要使用合成棉睡袋——虽然湿了也保温但太重');
  } else if (season === 'spring-summer') {
    bagTemp = camping === 'yes' ? '舒适温标5-10°C' : '无需睡袋';
    keyPoints.push('春夏多雨，防水装备是重中之重');
    mistakes.push('春夏徒步不要忽视防水——一场雨就让你怀疑人生');
  } else {
    bagTemp = camping === 'yes' ? '舒适温标0-5°C' : '无需睡袋';
  }

  dontOverthink.push('品牌溢价——中端产品已经够用');
  dontOverthink.push('重量——只要不超过20kg，多200g少200g区别不大');
  dontOverthink.push('颜色——好看但功能不匹配的装备不如不买');

  mistakes.push('新装备到手一定要在家试过再出发，不要在山上开箱');

  return { backpackVol, shoeType, bagTemp, keyPoints, dontOverthink, mistakes };
}

function getSeasonEmoji(s: string): string {
  if (s === 'spring-summer') return '🌿';
  if (s === 'autumn') return '🍂';
  return '❄️';
}
function getDayEmoji(d: string): string {
  if (d === '1') return '☀️';
  if (d === '2-4') return '🌤️';
  return '⛰️';
}
function getLoadEmoji(l: string): string {
  if (l === 'light') return '🪶';
  if (l === 'mid') return '🎒';
  return '🏋️';
}

export default function GearAdvisorModal({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const current = steps[step];
  const selected = answers[current?.field] || '';

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [current.field]: value };
    setAnswers(newAnswers);

    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      // Last step - show result
      setAnswers(newAnswers);
      setShowResult(true);
    }
  };

  const result = showResult ? getResult(answers) : null;

  const handleRestart = () => {
    setStep(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="liquid-glass rounded-2xl p-6 md:p-8">
          {!showResult ? (
            <>
              {/* Progress bar */}
              <div className="flex gap-1.5 mb-5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= step ? 'bg-cyan-400/50' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Question */}
              <h3 className="text-lg font-semibold text-white/90 mb-1">{current.question}</h3>
              <p className="text-xs text-white/30 mb-5">第 {step + 1} / {steps.length} 步</p>

              {/* Options */}
              <div className="space-y-2">
                {current.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className="w-full text-left liquid-glass-btn !py-3 !px-4 !rounded-xl text-sm text-white/70 hover:text-white transition-all"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Result */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-white/90 mb-1">你的装备建议</h3>
                  <p className="text-xs text-white/30">
                    {getDayEmoji(answers.days)} {steps[0].options.find(o => o.value === answers.days)?.label} &middot;
                    {getLoadEmoji(answers.load)} {steps[2].options.find(o => o.value === answers.load)?.label} &middot;
                    {getSeasonEmoji(answers.season)} {steps[3].options.find(o => o.value === answers.season)?.label}
                  </p>
                </div>
                <button onClick={onClose} className="liquid-glass-btn !p-1.5 !rounded-full text-white/40 hover:text-white/70">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Key specs */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">建议背包</span>
                    <span className="text-white/80 font-medium">{result.backpackVol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">建议鞋类</span>
                    <span className="text-white/80 font-medium">{result.shoeType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">建议睡袋</span>
                    <span className="text-white/80 font-medium">{result.bagTemp}</span>
                  </div>
                </div>

                {/* Key points */}
                <div className="pt-2">
                  <h4 className="text-[11px] text-white/40 tracking-wider uppercase mb-2">重点关注</h4>
                  <div className="space-y-1.5">
                    {result.keyPoints.map((p, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-cyan-400/60 flex-shrink-0 mt-0.5">•</span>
                        <span className="text-white/55">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Don't overthink */}
                <div>
                  <h4 className="text-[11px] text-white/40 tracking-wider uppercase mb-2">不必过度关注</h4>
                  <div className="space-y-1">
                    {result.dontOverthink.map((p, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-amber-400/50 flex-shrink-0 mt-0.5">—</span>
                        <span className="text-white/40">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mistakes */}
                <div>
                  <h4 className="text-[11px] text-white/40 tracking-wider uppercase mb-2">避坑提醒</h4>
                  <div className="space-y-1">
                    {result.mistakes.map((p, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-rose-400/60 flex-shrink-0 mt-0.5">✕</span>
                        <span className="text-white/50">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={handleRestart}
                  className="liquid-glass-btn !px-4 !py-2 !rounded-full text-xs text-white/50 hover:text-white/80"
                >
                  重新判断
                </button>
                <button
                  onClick={onClose}
                  className="liquid-glass-btn !px-4 !py-2 !rounded-full text-xs text-white/70 hover:text-white flex-1"
                >
                  知道了
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
