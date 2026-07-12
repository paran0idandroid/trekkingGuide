# Gear Recommendation System — Design Spec

## Overview

为乌孙古道等徒步路线页面添加交互式装备推荐功能。用户填写个人画像问卷后，系统基于路线特征 + 硬件规则引擎 + 内置产品库，生成包含品牌型号、推荐理由、电商旗舰店购买链接的专业装备清单。

## Architecture

### Module breakdown

| Module | File | Responsibility |
|--------|------|----------------|
| Gear Catalog | `src/data/gearCatalog.ts` | 产品数据，品牌/型号/参数/旗舰店链接 |
| Route Profiles | `src/data/routeProfiles.ts` | 每条路线的 gearProfile（天数/海拔/温度/地形/涉水等） |
| Recommendation Engine | `src/lib/gearEngine.ts` | 纯函数：用户画像 + 路线 gearProfile → 排序后的推荐列表 |
| Quiz UI | `src/components/GearQuiz.tsx` | 分步问卷（5步11题），收集用户信息 |
| Results UI | `src/components/GearResults.tsx` | 展示推荐商品卡片清单 + 购买链接 |
| Advisor Entrance | `src/components/GearAdvisor.tsx` | 管理状态流转（入口按钮 → 问卷 → 结果），集成到路线页面 |
| Quiz Types | `src/types.ts` | 补充问卷数据结构和推荐结果类型定义 |

### Data flow

```
User clicks "生成装备清单" button
  → GearAdvisor mounts GearQuiz (5-step wizard)
  → User completes quiz → submit UserProfile
  → gearEngine(recommend)(route.gearProfile, userProfile, gearCatalog)
  → Returns GearRecommendation[]
  → GearAdvisor unmounts quiz, mounts GearResults
  → User sees cards with brand/model/specs/reason/links
```

## Product Database (`gearCatalog.ts`)

### Data structure

```ts
interface GearProduct {
  id: string;
  category: GearCategory;
  brand: string;
  brandZh: string;
  model: string;
  tier: 'entry' | 'mid' | 'premium';  // 入门 / 进阶 / 旗舰
  priceRange: [number, number];       // 元 (低〜高)
  specs: Record<string, string | number>;
  gender: 'male' | 'female' | 'unisex';
  links: {
    taobao: string;   // 淘宝旗舰店搜索直达链接
    jd: string;       // 京东旗舰店搜索直达链接
  };
  tags: string[];      // 关键字标签，辅助排序
}
```

### Product coverage — 乌孙古道品类

Each category covers 3 tiers with ~2-3 products per tier:

- 背包 (55-70L, 35-50L)
- 徒步鞋 (中高帮防水)
- 睡袋 (舒适温标 -5 ~ -15°C)
- 帐篷 (单人/双人)
- 冲锋衣 (GTX / 雨壳)
- 保暖层 (羽绒/抓绒)
- 登山杖
- 头灯
- 炉头+套锅
- 水袋/水壶
- 防水袋
- 涉水鞋
- 雪套
- 防晒/墨镜

### Brands included (per budget tier)

- **入门**: Decathlon / Naturehike / 挪客
- **进阶**: Osprey / Gregory / Black Diamond / Sea to Summit / Marmot / Mountain Hardwear
- **旗舰**: Arc'teryx / Patagonia / Hilleberg / Therm-a-Rest / MSR

## Route Gear Profile (`routeProfiles.ts`)

每条路线挂载一个 gearProfile，推荐引擎据此推演装备需求：

```ts
interface GearProfile {
  totalDays: number;
  maxAltitude: number;           // m
  overnightLowest: number;       // °C
  terrain: string[];
  waterCrossing: boolean;
  waterSource: 'river+lake' | 'scarce' | 'none';
  resupplyPoint: boolean;
  exposure: string[];
}
```

Example — 乌孙古道:

```ts
{
  totalDays: 7,
  maxAltitude: 3800,
  overnightLowest: -5,
  terrain: ['河谷', '碎石坡', '达坂', '草原'],
  waterCrossing: true,
  waterSource: '河流+湖泊',
  resupplyPoint: false,
  exposure: ['高海拔', '强紫外线'],
}
```

## Recommendation Engine (`gearEngine.ts`)

### Logic flow

1. **Determine required categories** — based on route gearProfile + user profile
   - totalDays → backpack volume range, food days
   - waterCrossing → waterproof shoes + wading shoes + dry bags
   - resupplyPoint → food load
2. **Filter** — for each category, filter products by:
   - gender
   - tier (matched to user budget)
   - specs that match route conditions (e.g. GTX for water crossing, insulation for altitude)
3. **Rank** — within filtered set, apply sorting criteria:
   - primary: match user's "most valued factor" (lightest / best value / most durable)
   - secondary: closest spec to ideal
4. **Output** — top pick + 1-2 alternatives per category

All logic is pure — no side effects, easily testable.

## User Quiz — 5 Steps, 11 Questions

### Question details

| Step | ID | Question | Type | Options | Required |
|------|----|----------|------|---------|----------|
| 1 | gender | 你的性别？ | button | 男 / 女 | yes |
| 1 | height | 你的身高(cm) | range slider | 140-210 | yes |
| 1 | weight | 你的体重(kg) | range slider | 35-130 | yes |
| 2 | fitness | 你的体能水平？ | button | 新手(偶尔锻炼) / 中等(每周1-2次) / 有经验(经常户外) | yes |
| 2 | experience | 过往长线徒步经验 | button | 0次 / 1-3次 / 3次以上 | yes |
| 2 | month | 计划徒步月份 | button | 6月 / 7月 / 8月 / 9月 / 10月 | yes |
| 3 | budget | 预算档位 | button | 入门(全套2-3k) / 进阶(全套5-8k) / 旗舰(全套1w+) | yes |
| 3 | priority | 你最看重什么？ | button | 重量轻 / 性价比高 / 耐用皮实 | yes |
| 4 | arch | 你的足弓类型？ | button | 高足弓 / 正常 / 扁平足 | yes |
| 4 | sleepTemp | 你睡觉怕冷怕热？ | button | 怕冷 / 正常 / 怕热 | yes |
| 4 | shareTent | 可以接受和人混帐吗？ | button | 单人帐 / 可混帐 | yes |
| 5 | existing | 你已有的装备（多选） | checkbox | 背包 / 徒步鞋 / 睡袋 / 帐篷 / 冲锋衣 / 登山杖 / 头灯 / 其他 | no |

### UI

每个步骤一个全屏弹窗页面，顶部有步骤进度条（Step 1/5），底部有「上一步」/「下一步」按钮。步间切换有简单过渡动画。

## Results Display (`GearResults.tsx`)

After quiz completion, show full-screen results layer with scrollable card list.

### Card design

```
┌─────────────────────────────────────────────────┐
│ 🎒 背包                              ¥1,200-1,600 │
│ Osprey Kyte 46（女款）                           │
│ ────────────────────────────────────────         │
│ 容积 46L · 自重 1.6kg · 空速背负 S/M/L可调       │
│                                                   │
│ 推荐理由：7天物资+涉水装备需要45-55L容量，你的身        │
│ 高适合S码背负系统。这款是Osprey经典女款，兼顾轻量和        │
│ 背负舒适。                                           │
│                                                   │
│ ┌───────────────────────┐ ┌───────────────────────┐ │
│ │ 🛒 淘宝旗舰店         │ │ 🛒 京东旗舰店         │ │
│ └───────────────────────┘ └───────────────────────┘ │
│                               备选：Gregory Amber 44 │
└─────────────────────────────────────────────────┘
```

### Layout

- 顶部：路线名称 + 用户画像摘要 + "重新作答" + "保存为图片" 按钮
- 中间：品类卡片列表，按类别分组
- 底部：汇总按钮（一键复制所有链接 / 打印清单）

## Integration into Existing Page

`GearAdvisor.tsx` 提供：
- 一个 `[生成装备清单]` 悬浮按钮（固定在 Nav 区域或 Hero 下方）
- 点击后通过 useState 控制弹窗显隐
- 弹窗内通过步骤状态机切换 `quiz` / `results` 视图

添加到 `App.tsx` 中 `<Hero>` 下方。

## Types — Additions to `src/types.ts`

```ts
interface GearProduct { /* 见上 */ }
interface GearProfile { /* 见上 */ }
interface UserProfile {
  gender: 'male' | 'female';
  height: number;
  weight: number;
  fitness: 'beginner' | 'intermediate' | 'experienced';
  experience: '0' | '1-3' | '3+';
  month: 6 | 7 | 8 | 9 | 10;
  budget: 'entry' | 'mid' | 'premium';
  priority: 'lightest' | 'value' | 'durable';
  arch: 'high' | 'normal' | 'flat';
  sleepTemp: 'cold' | 'normal' | 'hot';
  shareTent: 'solo' | 'shared';
  existing: string[];
}
interface GearRecommendation {
  product: GearProduct;
  reason: string;
  alternatives: GearProduct[];
}
```

## Non-goals

- 不涉及用户登录/历史记录存储
- 不涉及实时价格爬取和更新
- 不涉及多语言
- 不做打印/导出 PDF（只做纯前端展示 + 复制链接）

## Future upgrades (not in scope for v1)

- 接入在线 AI 生成个性化推荐理由
- 多条路线选择
- 用户反馈（"这个推荐有用吗"）
- 保存分享清单
