export interface DayDetail {
  day: number;
  title: string;
  description: string;
}

export interface RouteData {
  slug: string;
  regionSlug: string;
  name: string;
  subtitle: string;
  tags: string[];
  intro?: string;
  heroImage: string;
  overview: {
    distance: string;
    duration: string;
    maxElevation: string;
    bestSeason: string;
    difficulty: string;
    suitableFor: string;
  };
  highlights: {
    title: string;
    description: string;
    image: string;
  }[];
  itinerary: DayDetail[];
  risks: {
    title: string;
    description: string;
  }[];
  gear: string[];
  gearProfileKey?: string;
}

export type RouteMapNodeCategory = '起点' | '终点' | '营地' | '垭口' | '河流' | '景点';

export interface RouteMapNode {
  id: string;
  name: string;
  category: RouteMapNodeCategory;
  description: string;
  image: string;
  coordinates: [number, number, number];
}

export interface RouteMapConfig {
  routeSlug: string;
  geoJsonUrl: string;
  styleUrl: string;
  center: [number, number];
  nodes: RouteMapNode[];
}

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
  intro?: string;
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
