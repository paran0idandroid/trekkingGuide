import { GearProduct, GearProfile, UserProfile, GearRecommendation, GearCategory } from '../types';
import { gearCatalog } from '../data/gearCatalog';

/** Determine which categories are required for a given route profile */
export function requiredCategories(profile: GearProfile): GearCategory[] {
  const base: GearCategory[] = [
    '背包', '徒步鞋', '睡袋', '冲锋衣', '保暖层', '登山杖',
    '头灯', '炉头套锅', '水袋水壶', '防水袋',
  ];
  if (profile.waterCrossing) base.push('涉水鞋');
  if (profile.terrain.some(t => t === '碎石坡' || t === '雪地')) base.push('雪套');
  if (profile.exposure.some(e => e === '强紫外线' || e === '高海拔')) base.push('防晒墨镜');
  if (profile.totalDays > 1) {
    if (!base.includes('帐篷')) base.unshift('帐篷');
  }
  return [...new Set(base)];
}

/** Compute ideal backpack volume based on trip length and user factors */
export function idealBackpackVolume(profile: GearProfile, user: UserProfile): number {
  let volume = profile.totalDays * 9;
  if (profile.waterCrossing) volume += 5;
  if (user.shareTent === 'shared') volume -= 5;
  if (user.gender === 'female') volume -= 3;
  return Math.round(volume / 5) * 5;
}

/** Compute ideal sleeping bag comfort temp */
export function idealComfortTemp(profile: GearProfile, user: UserProfile): number {
  let base = profile.overnightLowest;
  if (user.sleepTemp === 'cold') base -= 8;
  else if (user.sleepTemp === 'hot') base -= 2;
  else base -= 5;
  return Math.round(base / 5) * 5;
}

/** Score a product against the user's stated priority */
export function scoreByPriority(product: GearProduct, priority: string): number {
  const weight = typeof product.specs.weight === 'number' ? product.specs.weight : 999;
  switch (priority) {
    case 'lightest': return -weight;
    case 'value': return product.tier === 'entry' ? 10 : product.tier === 'mid' ? 5 : 0;
    case 'durable': return product.tier === 'premium' ? 10 : product.tier === 'mid' ? 5 : 0;
    default: return 0;
  }
}

/** Map UserProfile's `existing` string labels to GearCategory values */
const existingCategoryMap: Record<string, GearCategory> = {
  '背包': '背包', '徒步鞋': '徒步鞋', '睡袋': '睡袋', '帐篷': '帐篷',
  '冲锋衣': '冲锋衣', '登山杖': '登山杖', '头灯': '头灯',
  '炉头套锅': '炉头套锅', '水袋水壶': '水袋水壶',
};

/** Generate human-readable recommendation reason */
export function generateReason(
  product: GearProduct, category: GearCategory,
  profile: GearProfile, user: UserProfile,
): string {
  const parts: string[] = [];
  if (category === '背包') {
    const vol = idealBackpackVolume(profile, user);
    parts.push(`${profile.totalDays}天物资需要${vol - 5}-${vol + 5}L容量背包`);
    if (user.gender === 'female') parts.push('女款背负系统更适合你的身材');
    const torsoFit = product.specs.torsoFit;
    if (typeof torsoFit === 'string') parts.push(`背负尺码${torsoFit}可调`);
  } else if (category === '睡袋') {
    const temp = idealComfortTemp(profile, user);
    parts.push(`路线夜间最低约${profile.overnightLowest}°C`);
    if (user.sleepTemp === 'cold') parts.push('你怕冷，推荐舒适温标偏低的睡袋');
    else if (user.sleepTemp === 'hot') parts.push('你怕热，温标可适当放宽');
    parts.push(`推荐舒适温标${temp}°C左右`);
  } else if (category === '徒步鞋') {
    parts.push(`${profile.terrain.join('、')}地形需要中高帮防水鞋保护脚踝`);
    if (profile.waterCrossing) parts.push('涉水路段较多，注意GTX防水性能');
    if (user.arch !== 'normal') {
      parts.push(user.arch === 'flat' ? '扁平足可选宽楦或支撑型鞋垫' : '高足弓注意鞋仓空间');
    }
  } else if (category === '帐篷') {
    parts.push(user.shareTent === 'shared' ? '可混帐则双人帐分摊重量' : '单人帐更自由');
  } else if (category === '冲锋衣') {
    parts.push(`${profile.exposure.join('、')}环境需要防风防水透气外壳`);
  } else if (category === '登山杖') {
    if (profile.terrain.includes('碎石坡')) parts.push('碎石坡路段需要登山杖保持平衡');
    if (profile.waterCrossing) parts.push('涉水时登山杖可探测水深和水流');
  } else if (category === '涉水鞋') {
    parts.push('路线需要多次涉水过河，专用涉水鞋比徒步鞋涉水更舒适、干得更快');
  }

  parts.push(`${product.brandZh} ${product.model}`);
  parts.push(product.tier === 'entry' ? '高性价比入门款' : product.tier === 'mid' ? '进阶品质款' : '旗舰性能款');
  return parts.join('，');
}

/** Main recommendation entry point */
export function recommend(profile: GearProfile, user: UserProfile): GearRecommendation[] {
  const cats = requiredCategories(profile);

  // Remove categories the user already owns
  const ownedCats = (user.existing || [])
    .map(label => existingCategoryMap[label])
    .filter(Boolean) as GearCategory[];

  const needed = cats.filter(c => !ownedCats.includes(c));
  const results: GearRecommendation[] = [];

  for (const cat of needed) {
    const all = gearCatalog[cat] || [];

    let filtered = all.filter(p => {
      if (p.gender !== 'unisex' && p.gender !== user.gender) return false;
      if (p.tier !== user.budget) return false;
      return true;
    });

    // For backpack, filter by volume proximity
    if (cat === '背包') {
      const idealVol = idealBackpackVolume(profile, user);
      filtered = filtered.filter(p => {
        const vol = typeof p.specs.volume === 'number' ? p.specs.volume : 0;
        return Math.abs(vol - idealVol) <= 15;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      return scoreByPriority(b, user.priority) - scoreByPriority(a, user.priority);
    });

    if (sorted.length === 0) continue;

    const top = sorted[0];
    const alternatives = sorted.slice(1, 3);

    results.push({
      product: top,
      reason: generateReason(top, cat, profile, user),
      alternatives,
    });
  }

  return results;
}
