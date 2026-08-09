import type { GearSystem, GearSystemSlug } from '../types';

export const gearSystems: GearSystem[] = [
  {
    slug: 'carry-storage',
    name: '背负与收纳系统',
    summary: '把负重稳定地交给身体，并让重要装备保持有序和干燥。',
    representativeItems: '背包 · 防水袋',
    items: [
      { name: '背包与收纳', knowledgeId: 'backpack', productCategories: ['背包', '防水袋'] },
    ],
  },
  {
    slug: 'shelter',
    name: '庇护系统',
    summary: '在风、雨和低温环境中建立可靠的营地保护空间。',
    representativeItems: '帐篷 · 地布 · 风绳',
    items: [
      { name: '帐篷与庇护', knowledgeId: 'tent', productCategories: ['帐篷'] },
    ],
  },
  {
    slug: 'sleep',
    name: '睡眠系统',
    summary: '隔绝地面寒气并保存身体热量，保证连续多日的恢复。',
    representativeItems: '睡袋 · 睡垫',
    items: [
      { name: '睡袋与保暖', knowledgeId: 'sleeping-bag', productCategories: ['睡袋'] },
    ],
  },
  {
    slug: 'wear-movement',
    name: '穿着与行进防护系统',
    summary: '保护双脚和身体，应对温差、风雨、日晒与复杂路面。',
    representativeItems: '徒步鞋 · 冲锋衣 · 登山杖',
    items: [
      { name: '徒步鞋与足部防护', knowledgeId: 'hiking-shoes', productCategories: ['徒步鞋', '涉水鞋'] },
      { name: '分层穿着与天气防护', knowledgeId: 'rain-jacket', productCategories: ['冲锋衣', '保暖层', '雪套', '防晒墨镜'] },
      { name: '登山杖与行进保护', knowledgeId: 'trekking-poles', productCategories: ['登山杖'] },
    ],
  },
  {
    slug: 'food-hydration',
    name: '饮食与补水系统',
    summary: '稳定补充能量和水分，并保证野外饮水处理与炊事效率。',
    representativeItems: '炉具 · 锅具 · 饮水袋',
    items: [
      { name: '炉具与炊事', knowledgeId: 'stove', productCategories: ['炉头套锅'] },
      { name: '饮水与净水', knowledgeId: 'water-system', productCategories: ['水袋水壶'] },
    ],
  },
  {
    slug: 'navigation-safety',
    name: '导航与安全系统',
    summary: '维持方向判断、夜间照明和意外发生后的基本应急能力。',
    representativeItems: '指南针 · 头灯 · 急救包',
    items: [
      { name: '照明与夜间行动', knowledgeId: 'headlamp', productCategories: ['头灯'] },
      { name: '急救与应急处理', knowledgeId: 'first-aid', productCategories: [] },
    ],
  },
];

export function getGearSystems(): GearSystem[] {
  return gearSystems;
}
export function getGearSystemBySlug(slug: string): GearSystem | undefined {
  return gearSystems.find(system => system.slug === slug);
}

export function isGearSystemSlug(slug: string): slug is GearSystemSlug {
  return gearSystems.some(system => system.slug === slug);
}
