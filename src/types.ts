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
  heroImage?: string;
  overview: {
    distance: string;
    duration: string;
    elevationGain?: string;
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

export type RouteMapNodeCategory = '起点' | '终点' | '起终点' | '营地' | '垭口' | '河流' | '景点';

export interface RouteMapNode {
  id: string;
  name: string;
  category: RouteMapNodeCategory;
  dayLabel?: string;
  description: string;
  image?: string;
  coordinates: [number, number, number];
}

export interface RouteMapDay {
  day: 1 | 2 | 3;
  label: string;
  distance: string;
  from: string;
  to: string;
  color: string;
}

export interface RouteMapConfig {
  routeSlug: string;
  geoJsonUrl: string;
  styleUrl: string;
  center: [number, number];
  ariaLabel: string;
  pathLabel: string;
  colors: {
    track: string;
    outline: string;
    node: string;
  };
  summaryStats: { label: string; value: string }[];
  days?: RouteMapDay[];
  nodes: RouteMapNode[];
}

// ============================================================
// Gear Recommendation Types
// ============================================================

export type GearCategory =
  | '背包' | '徒步鞋' | '睡袋' | '帐篷' | '冲锋衣'
  | '保暖层' | '登山杖' | '头灯' | '炉头套锅' | '水袋水壶'
  | '防水袋' | '涉水鞋' | '雪套' | '防晒墨镜';

export type GearInventoryStatus = 'owned' | 'wanted';

export interface GearInventoryItem {
  id: string;
  name: string;
  createdAt: string;
  status: GearInventoryStatus;
  systemSlug: GearSystemSlug | null;
}

export type GearSystemSlug =
  | 'carry-storage'
  | 'shelter'
  | 'sleep'
  | 'wear-movement'
  | 'food-hydration'
  | 'navigation-safety';

export interface GearSystemItem {
  name: string;
  knowledgeId: string;
  productCategories: GearCategory[];
}

export interface GearSystem {
  slug: GearSystemSlug;
  name: string;
  summary: string;
  representativeItems: string;
  items: GearSystemItem[];
}

export type BudgetTier = 'entry' | 'mid' | 'premium';

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
