import { useState } from 'react';
import { UserProfile, FitnessLevel, GearPriority, ArchType, SleepTemp } from '../types';

interface Props {
  onSubmit: (profile: UserProfile) => void;
  onClose: () => void;
}

type PartialProfile = Partial<UserProfile>;

interface StepDef {
  title: string;
  render: (form: PartialProfile, set: (updater: PartialProfile) => void) => JSX.Element;
  validate: (form: PartialProfile) => boolean;
}

const buttonBase = 'px-5 py-2.5 text-sm rounded-full border transition-all duration-200 cursor-pointer';
const btnActive = 'bg-white/20 border-white/40 text-white';
const btnInactive = 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/70';

function PillGroup<T extends string>({ options, value, onChange, labels }: {
  options: T[];
  value: T | undefined;
  onChange: (v: T) => void;
  labels: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`${buttonBase} ${value === opt ? btnActive : btnInactive}`}
        >
          {labels[opt] || opt}
        </button>
      ))}
    </div>
  );
}

function SliderInput({ label, value, min, max, unit, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/60">{label}</span>
        <span className="text-white/90 font-medium">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 appearance-none bg-white/10 rounded-full cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/70 [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}

function CheckboxGroup({ options, selected, onChange, labels }: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  labels: Record<string, string>;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={`${buttonBase} ${selected.includes(opt) ? btnActive : btnInactive}`}
        >
          {selected.includes(opt) ? '✓ ' : ''}{labels[opt] || opt}
        </button>
      ))}
    </div>
  );
}

export default function GearQuiz({ onSubmit, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PartialProfile>({
    height: 170,
    weight: 65,
    existing: [],
  });

  const update = (patch: PartialProfile) => setForm(prev => ({ ...prev, ...patch }));

  const steps: StepDef[] = [
    {
      title: '基本信息',
      render: (f, set) => (
        <div className="space-y-6">
          <div>
            <label className="block text-white/70 text-xs tracking-wider uppercase mb-3">性别</label>
            <PillGroup
              options={['male', 'female']}
              value={f.gender}
              onChange={v => set({ gender: v })}
              labels={{ male: '男', female: '女' }}
            />
          </div>
          <SliderInput label="身高" value={f.height ?? 170} min={140} max={210} unit="cm" onChange={v => set({ height: v })} />
          <SliderInput label="体重" value={f.weight ?? 65} min={35} max={130} unit="kg" onChange={v => set({ weight: v })} />
        </div>
      ),
      validate: f => !!f.gender,
    },
    {
      title: '体能 & 计划',
      render: (f, set) => (
        <div className="space-y-6">
          <div>
            <label className="block text-white/70 text-xs tracking-wider uppercase mb-3">你的体能水平</label>
            <PillGroup
              options={['beginner', 'intermediate', 'experienced'] as FitnessLevel[]}
              value={f.fitness}
              onChange={v => set({ fitness: v })}
              labels={{ beginner: '新手（偶尔锻炼）', intermediate: '中等（每周1-2次）', experienced: '有经验（经常户外）' }}
            />
          </div>
          <div>
            <label className="block text-white/70 text-xs tracking-wider uppercase mb-3">过往长线徒步经验</label>
            <PillGroup
              options={['0', '1-3', '3+']}
              value={f.experience}
              onChange={v => set({ experience: v as '0' | '1-3' | '3+' })}
              labels={{ '0': '0次', '1-3': '1-3次', '3+': '3次以上' }}
            />
          </div>
          <div>
            <label className="block text-white/70 text-xs tracking-wider uppercase mb-3">计划徒步月份</label>
            <PillGroup
              options={['6', '7', '8', '9', '10']}
              value={f.month !== undefined ? String(f.month) : undefined}
              onChange={v => set({ month: Number(v) })}
              labels={{ '6': '6月', '7': '7月', '8': '8月', '9': '9月', '10': '10月' }}
            />
          </div>
        </div>
      ),
      validate: f => !!f.fitness && !!f.experience && !!f.month,
    },
    {
      title: '预算 & 偏好',
      render: (f, set) => (
        <div className="space-y-6">
          <div>
            <label className="block text-white/70 text-xs tracking-wider uppercase mb-3">预算档位</label>
            <PillGroup
              options={['entry', 'mid', 'premium']}
              value={f.budget}
              onChange={v => set({ budget: v as 'entry' | 'mid' | 'premium' })}
              labels={{ entry: '入门（全套2-3k）', mid: '进阶（全套5-8k）', premium: '旗舰（全套1w+）' }}
            />
          </div>
          <div>
            <label className="block text-white/70 text-xs tracking-wider uppercase mb-3">你最看重什么？</label>
            <PillGroup
              options={['lightest', 'value', 'durable'] as GearPriority[]}
              value={f.priority}
              onChange={v => set({ priority: v })}
              labels={{ lightest: '重量轻', value: '性价比高', durable: '耐用皮实' }}
            />
          </div>
        </div>
      ),
      validate: f => !!f.budget && !!f.priority,
    },
    {
      title: '身体 & 习惯',
      render: (f, set) => (
        <div className="space-y-6">
          <div>
            <label className="block text-white/70 text-xs tracking-wider uppercase mb-3">你的足弓类型</label>
            <PillGroup
              options={['high', 'normal', 'flat'] as ArchType[]}
              value={f.arch}
              onChange={v => set({ arch: v })}
              labels={{ high: '高足弓', normal: '正常', flat: '扁平足' }}
            />
          </div>
          <div>
            <label className="block text-white/70 text-xs tracking-wider uppercase mb-3">睡觉怕冷怕热？</label>
            <PillGroup
              options={['cold', 'normal', 'hot'] as SleepTemp[]}
              value={f.sleepTemp}
              onChange={v => set({ sleepTemp: v })}
              labels={{ cold: '怕冷', normal: '正常', hot: '怕热' }}
            />
          </div>
          <div>
            <label className="block text-white/70 text-xs tracking-wider uppercase mb-3">帐篷</label>
            <PillGroup
              options={['solo', 'shared']}
              value={f.shareTent}
              onChange={v => set({ shareTent: v as 'solo' | 'shared' })}
              labels={{ solo: '单人帐', shared: '可混帐（双人帐分摊重量）' }}
            />
          </div>
        </div>
      ),
      validate: f => !!f.arch && !!f.sleepTemp && !!f.shareTent,
    },
    {
      title: '已有装备',
      render: (f, set) => (
        <div className="space-y-6">
          <div>
            <label className="block text-white/70 text-xs tracking-wider uppercase mb-3">你已有的装备（可选）</label>
            <p className="text-white/30 text-xs mb-4">勾选后推荐时会跳过这些品类</p>
            <CheckboxGroup
              options={['背包', '徒步鞋', '睡袋', '帐篷', '冲锋衣', '登山杖', '头灯', '炉头套锅', '水袋水壶']}
              selected={f.existing || []}
              onChange={v => set({ existing: v })}
              labels={{
                '背包': '背包', '徒步鞋': '徒步鞋', '睡袋': '睡袋', '帐篷': '帐篷',
                '冲锋衣': '冲锋衣', '登山杖': '登山杖', '头灯': '头灯',
                '炉头套锅': '炉头套锅', '水袋水壶': '水袋水壶',
              }}
            />
          </div>
          <div className="pt-4">
            <button
              onClick={() => {
                if (f.gender && f.height && f.weight && f.fitness && f.experience && f.month && f.budget && f.priority && f.arch && f.sleepTemp && f.shareTent) {
                  onSubmit(f as UserProfile);
                }
              }}
              className="liquid-glass-btn !px-8 !py-3 !rounded-full text-sm text-white/90 hover:text-white w-full"
            >
              生成推荐清单
            </button>
          </div>
        </div>
      ),
      validate: () => true, // existing gear is optional
    },
  ];

  const current = steps[step];
  const canNext = current.validate(form);
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (!canNext) return;
    if (isLast) return;
    setStep(s => s + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="liquid-glass rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <span className="text-white/70 text-xs tracking-wider">第 {step + 1} 步 / 共 {steps.length} 步</span>
            <button onClick={onClose} className="liquid-glass-btn !p-1.5 !rounded-full text-white/50 hover:text-white/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step dots */}
          <div className="flex gap-1.5 px-6 pb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i <= step ? 'bg-white/40' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Title */}
          <div className="px-6 pb-4">
            <h3 className="text-lg font-semibold text-white/90">{current.title}</h3>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 min-h-[200px] transition-opacity duration-300" key={step}>
            {current.render(form, update)}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 pb-6">
            <button
              onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              {step === 0 ? '取消' : '上一步'}
            </button>

            {!isLast && (
              <button
                onClick={handleNext}
                disabled={!canNext}
                className={`liquid-glass-btn !px-6 !py-2.5 !rounded-full text-sm transition-all ${
                  canNext
                    ? 'text-white/90 hover:text-white'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                下一步
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
