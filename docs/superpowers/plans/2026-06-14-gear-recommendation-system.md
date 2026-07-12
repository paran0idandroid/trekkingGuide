# Gear Recommendation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive gear recommendation wizard to the hiking route page that collects user profile data and generates personalized gear recommendations with brand/model/specs/e-commerce links.

**Architecture:** Pure frontend. A rule engine (pure functions) matches user profile + route gear profile against a hardcoded product catalog. Quiz UI and results UI are separate React components orchestrated by a parent component. No external API calls or AI in v1.

**Tech Stack:** React (Vite/TypeScript), Tailwind CSS, GSAP (for entry animations)

---

## File Structure

### New files
- `src/types.ts` — Add GearProduct, GearProfile, UserProfile, GearRecommendation types
- `src/data/gearCatalog.ts` — Product database (all categories x tiers)
- `src/data/routeProfiles.ts` — Route gear profiles (extracted from routeData)
- `src/lib/gearEngine.ts` — Pure recommendation engine
- `src/components/GearQuiz.tsx` — 5-step questionnaire wizard
- `src/components/GearResults.tsx` — Recommendation card list
- `src/components/GearAdvisor.tsx` — State machine orchestrator

### Modified files
- `src/types.ts` — Add new types
- `src/data/routeData.ts` — Extend RouteData to include gearProfile reference
- `src/App.tsx` — Add GearAdvisor component

---

### Task 1: Add types

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Add gear-related types**

Append to `src/types.ts`:

```ts
// ============================================================
// Gear Recommendation Types
// ============================================================

export type GearCategory =
  | '背包' | '徒步鞋' | '睡袋' | '帐篷' | '冲锋衣'
  | '保暖层' | '登山杖' | '头灯' | '炉头套锅' | '水袋水壶'
  | '防水袋' | '涉水鞋' | '雪套' | '防晒墨镜';

export type BudgetTier = 'entry' | 'mid' | 'premium';
export type FitnessLevel = 'beginner' | 'intermediate' | 'experienced';
export type GearPriority = 'lightest' | 'value' | 'durable';
export type ArchType = 'high' | 'normal' | 'flat';
export type SleepTemp = 'cold' | 'normal' | 'hot';

export interface GearProduct {
  id: string;
  category: GearCategory;
  brand: string;
  brandZh: string;
  model: string;
  tier: BudgetTier;
  priceRange: [number, number];
  specs: Record<string, string | number>;
  gender: 'male' | 'female' | 'unisex';
  links: { taobao: string; jd: string };
  tags: string[];
}

export interface GearProfile {
  totalDays: number;
  maxAltitude: number;
  overnightLowest: number;
  terrain: string[];
  waterCrossing: boolean;
  waterSource: string;
  resupplyPoint: boolean;
  exposure: string[];
}

export interface UserProfile {
  gender: 'male' | 'female';
  height: number;
  weight: number;
  fitness: FitnessLevel;
  experience: '0' | '1-3' | '3+';
  month: number;
  budget: BudgetTier;
  priority: GearPriority;
  arch: ArchType;
  sleepTemp: SleepTemp;
  shareTent: 'solo' | 'shared';
  existing: string[];
}

export interface GearRecommendation {
  product: GearProduct;
  reason: string;
  alternatives: GearProduct[];
}
```

- [ ] **Step 2: Also extend RouteData**

Add to existing `RouteData` interface in `src/types.ts`:

```ts
export interface RouteData {
  // ... existing fields stay unchanged
  gearProfileKey?: string;
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 2: Build product catalog

**Files:**
- Create: `src/data/gearCatalog.ts`

- [ ] **Step 1: Create catalog with product data**

Create `src/data/gearCatalog.ts`. Each category needs at least one product per budget tier (entry/mid/premium). All links point to brand flagship store search results on Taobao/JD.

Products by category:

**背包：**
- entry: `titan-hiker-60` Naturehike 60L, ¥600-800, unisex
- mid: `osprey-kestrel-58` Osprey Kestrel 58, ¥1200-1500, male, 2.1kg
- mid: `osprey-kyte-46` Osprey Kyte 46, ¥1200-1500, female, 1.6kg
- mid: `gregory-stout-55` Gregory Stout 55, ¥1300-1600, male, 1.9kg
- mid: `gregory-amber-44` Gregory Amber 44, ¥1300-1600, female, 1.7kg
- premium: `osprey-aether-65` Osprey Aether 65, ¥2000-2500, male, 2.3kg
- premium: `gregory-baltoro-65` Gregory Baltoro 65, ¥2200-2700, male, 2.5kg

TaoBao link format: `https://s.taobao.com/search?q=${encodeURIComponent(brand + ' ' + model + ' 旗舰店')}`
JD link format: `https://search.jd.com/Search?keyword=${encodeURIComponent(brand + ' ' + model)}`

Include realistic spec objects:
- 背包: weight(kg), volume(L), torsoFit(string)
- 徒步鞋: weight(g), goretex(boolean), height(string)
- 睡袋: comfortTemp(C), weight(g), fill(string)
- 帐篷: weight(kg), capacity(int)

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 3: Create route gear profiles

**Files:**
- Create: `src/data/routeProfiles.ts`
- Modify: `src/data/routeData.ts`

- [ ] **Step 1: Create routeProfiles.ts**

Create `src/data/routeProfiles.ts`:

```ts
import { GearProfile } from '../types';

const routeGearProfiles: Record<string, GearProfile> = {
  'wusun': {
    totalDays: 7,
    maxAltitude: 3800,
    overnightLowest: -5,
    terrain: ['河谷', '碎石坡', '达坂', '草原'],
    waterCrossing: true,
    waterSource: '河流+湖泊',
    resupplyPoint: false,
    exposure: ['高海拔', '强紫外线'],
  },
};

export function getGearProfile(routeName: string): GearProfile | undefined {
  return routeGearProfiles[routeName];
}

export { routeGearProfiles };
```

- [ ] **Step 2: Add gearProfileKey to wusunRoute**

In `src/data/routeData.ts`, append to the `wusunRoute` object:

```ts
  gearProfileKey: 'wusun',
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 4: Build recommendation engine

**Files:**
- Create: `src/lib/gearEngine.ts`

- [ ] **Step 1: Create gearEngine.ts**

Create `src/lib/gearEngine.ts` with these functions:

- `requiredCategories(profile: GearProfile): GearCategory[]` — determine which gear categories a route needs
- `idealBackpackVolume(profile: GearProfile, user: UserProfile): number` — compute target backpack L
- `idealComfortTemp(profile: GearProfile, user: UserProfile): number` — compute target sleeping bag temp
- `scoreByPriority(product: GearProduct, priority: GearPriority): number` — rank products
- `generateReason(product, category, profile, user): string` — natural language recommendation reason
- `recommend(profile: GearProfile, user: UserProfile): GearRecommendation[]` — main entry point

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 5: Build GearQuiz component

**Files:**
- Create: `src/components/GearQuiz.tsx`

- [ ] **Step 1: Create GearQuiz.tsx**

5-step full-screen modal wizard with:

- Props: `onSubmit: (profile: UserProfile) => void, onClose: () => void`
- Internal state: `currentStep` (1-5) and `form: Partial<UserProfile>`
- Step indicator dots at top
- Each step rendered from a `steps` array

Steps:
1. 性别（按钮组）+ 身高（滑块）+ 体重（滑块）
2. 体能水平（按钮组）+ 长线经验（按钮组）+ 徒步月份（按钮组）
3. 预算档位（按钮组）+ 最看重因素（按钮组）
4. 足弓类型（按钮组）+ 睡眠体感（按钮组）+ 是否混帐（按钮组）
5. 已有装备（多选checkbox）+ "生成推荐清单" submit button

Validation: Steps 1-4 require at least all visible fields to be non-null/undefined. Show validation message if user tries to proceed with incomplete fields.

Style: Use `liquid-glass`/`liquid-glass-btn` classes. Dark overlay backdrop. Steps transition with opacity/transform.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 6: Build GearResults component

**Files:**
- Create: `src/components/GearResults.tsx`

- [ ] **Step 1: Create GearResults.tsx**

Props: `recommendations: GearRecommendation[]`, `onReset: () => void`, `onClose: () => void`

Layout:
- Full screen overlay with dark backdrop
- Header: "你的装备清单" + user summary + reset button
- Scrollable card list
- Each card shows: category icon/emoji, brand+model, specs bar, recommendation reason, buy buttons
- GSAP stagger entry animation
- All buy buttons use `liquid-glass-btn !rounded-full` classes

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 7: Build GearAdvisor orchestrator

**Files:**
- Create: `src/components/GearAdvisor.tsx`

- [ ] **Step 1: Create GearAdvisor.tsx**

State machine with 3 views: `closed | quiz | results`

Renders:
- Floating "生成装备清单" button (visible when closed)
- GearQuiz when view==='quiz'
- GearResults when view==='results', passing recommend() output

On quiz submit: call `recommend(gearProfile, formData)` -> set results -> switch to results view.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 8: Wire into App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Import and add GearAdvisor**

```tsx
import GearAdvisor from './components/GearAdvisor';

function App() {
  return (
    <div className="min-h-screen bg-black">
      <Nav />
      <Hero route={wusunRoute} />
      <GearAdvisor routeName="wusun" />
      <Overview />
      { /* ... rest unchanged */ }
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx vite build`
Expected: Build succeeds with no errors
