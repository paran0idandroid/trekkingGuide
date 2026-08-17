import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const current = steps[step]!;

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [current.field]: value };
    setAnswers(newAnswers);

    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      // 最后一步完成后显示建议
      setAnswers(newAnswers);
      setShowResult(true);
    }
  };

  const result = getResult(answers);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('button')?.focus());

    return () => previousFocus?.focus();
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('button')?.focus());
  }, [showResult, step]);

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? [],
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const handleRestart = () => {
    setStep(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="gear-scrim fixed inset-0 bg-forest-900/30 backdrop-blur-sm" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={showResult ? '你的装备建议' : '装备顾问'}
        onKeyDown={handleDialogKeyDown}
        className="gear-glass-panel gear-sheet-enter relative z-10 max-h-[calc(100svh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl p-6 md:p-8"
        onClick={e => e.stopPropagation()}
      >
          {!showResult ? (
            <>
              {/* 进度 */}
              <div className="mb-5 flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= step ? 'bg-forest-500' : 'bg-forest-100'
                    }`}
                  />
                ))}
              </div>

              {/* 问题 */}
              <h3 className="mb-1 text-lg font-semibold text-forest-800">{current.question}</h3>
              <p className="mb-5 text-xs text-forest-600">第 {step + 1} / {steps.length} 步</p>

              {/* 选项 */}
              <div className="space-y-2">
                {current.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className="gear-glass-action gear-pressable min-h-11 w-full rounded-xl px-4 py-3 text-left text-sm text-forest-700 hover:text-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-300"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* 建议结果 */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-forest-800">你的装备建议</h3>
                  <p className="text-xs leading-5 text-forest-600">
                    {getDayEmoji(answers.days)} {steps[0].options.find(o => o.value === answers.days)?.label} &middot;
                    {getLoadEmoji(answers.load)} {steps[2].options.find(o => o.value === answers.load)?.label} &middot;
                    {getSeasonEmoji(answers.season)} {steps[3].options.find(o => o.value === answers.season)?.label}
                  </p>
                </div>
                <button onClick={onClose} aria-label="关闭装备顾问" className="gear-glass-action gear-pressable grid min-h-11 min-w-11 shrink-0 place-items-center rounded-full text-forest-600 hover:text-forest-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* 核心规格 */}
                <div className="gear-glass-module space-y-2 rounded-2xl p-4">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-forest-600">建议背包</span>
                    <span className="text-right font-medium text-forest-800">{result.backpackVol}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-forest-600">建议鞋类</span>
                    <span className="text-right font-medium text-forest-800">{result.shoeType}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-forest-600">建议睡袋</span>
                    <span className="text-right font-medium text-forest-800">{result.bagTemp}</span>
                  </div>
                </div>

                {/* 重点关注 */}
                <div className="pt-2">
                  <h4 className="mb-2 text-[11px] uppercase tracking-wider text-forest-600">重点关注</h4>
                  <div className="space-y-1.5">
                    {result.keyPoints.map((p, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="mt-0.5 shrink-0 text-forest-500">•</span>
                        <span className="text-forest-700">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 不必过度关注 */}
                <div>
                  <h4 className="mb-2 text-[11px] uppercase tracking-wider text-forest-600">不必过度关注</h4>
                  <div className="space-y-1">
                    {result.dontOverthink.map((p, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="mt-0.5 shrink-0 text-sand-700">—</span>
                        <span className="text-forest-600">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 避坑提醒 */}
                <div>
                  <h4 className="mb-2 text-[11px] uppercase tracking-wider text-sand-800">避坑提醒</h4>
                  <div className="space-y-1">
                    {result.mistakes.map((p, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="mt-0.5 shrink-0 text-sand-800">×</span>
                        <span className="text-forest-700">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2 border-t border-forest-100 pt-4">
                <button
                  onClick={handleRestart}
                  className="gear-glass-action gear-pressable min-h-11 rounded-full px-4 text-xs text-forest-700"
                >
                  重新判断
                </button>
                <button
                  onClick={onClose}
                  className="gear-glass-primary gear-pressable min-h-11 flex-1 rounded-full px-4 text-xs font-medium text-white"
                >
                  知道了
                </button>
              </div>
            </>
          )}
      </div>
    </div>
  );
}
