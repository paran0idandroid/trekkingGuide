export interface AnatomyPart {
  id: string;
  label: string;
  description: string;
  importance: number;
  cameraPos: [number, number, number];
  color: string;
  modelPos: [number, number, number];
}

export const backpackParts: AnatomyPart[] = [
  {
    id: 'mainBody',
    label: '主仓 / 容量区域',
    description: '背包的核心空间，用于存放主要装备。容量大小直接决定了你能携带多少物资。主仓的开口方式（顶部装载或前置拉链）影响取物便利性。',
    importance: 5,
    cameraPos: [0, 0.2, 4.5],
    color: '#f472b6',
    modelPos: [0, 0, 0],
  },
  {
    id: 'shoulderStraps',
    label: '肩带',
    description: '连接背包与身体的重要部件。好的肩带应该贴合肩部曲线，内部填充厚实，分散压力。S型肩带和J型肩带适合不同的身体结构。',
    importance: 5,
    cameraPos: [3.2, 0.5, 2.5],
    color: '#a78bfa',
    modelPos: [1, 0.8, 0.7],
  },
  {
    id: 'hipBelt',
    label: '腰带 / 腰靠',
    description: '承重核心——承担背包80%以上的重量。腰带应包裹在髂骨上沿，厚实的填充能将重量均匀分布到腰部。可调节角度的腰带能适应不同体型。',
    importance: 5,
    cameraPos: [2.5, -1.5, 3.5],
    color: '#fbbf24',
    modelPos: [0, -1.5, 0.6],
  },
  {
    id: 'backPanel',
    label: '背负系统 / 背板',
    description: '背包的"骨架"，决定负重能否有效传递到腰部。背板长度必须匹配躯干长度，透气设计（网面框架/泡沫通道）决定背部是否闷热。',
    importance: 5,
    cameraPos: [0, 0, -4.5],
    color: '#34d399',
    modelPos: [0, 0, -0.65],
  },
  {
    id: 'sidePockets',
    label: '水壶侧袋',
    description: '方便随时拿取水壶、雨伞等常用物品。弹力袋口设计更稳固，弯腰时不会掉出。部分背包的侧袋底部有排水孔。',
    importance: 2,
    cameraPos: [4, -0.5, 0.5],
    color: '#60a5fa',
    modelPos: [1.2, -0.3, 0],
  },
  {
    id: 'compressionStraps',
    label: '外挂系统 / 压缩织带',
    description: '用于固定帐篷、防潮垫、登山杖等外挂装备。压缩织带还能调节背包容积——装备少时收紧保持重心稳定。注意外挂太多会影响平衡。',
    importance: 3,
    cameraPos: [1.5, 1.5, 4],
    color: '#f472b6',
    modelPos: [0.4, 0.5, 0.65],
  },
  {
    id: 'rainCover',
    label: '防雨罩区域',
    description: '高原天气突变时保护背包和装备不被淋湿。防雨罩通常收纳在背包底部的独立仓中。建议随包配备，即使背包面料本身防水也建议使用。',
    importance: 3,
    cameraPos: [0, -2, 4],
    color: '#34d399',
    modelPos: [0, 0, 0],
  },
];

export function getAnatomyParts(gearId: string): AnatomyPart[] {
  if (gearId === 'backpack') return backpackParts;
  return [];
}
