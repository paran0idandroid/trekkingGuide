export interface RegionDef {
  id: string;
  name: string;
  slug: string;
  routes: string[];
  path: string;
  labelX: number;
  labelY: number;
  color: string;
  glowColor: string;
}

export const regions: RegionDef[] = [
  {
    id: 'xinjiang',
    name: '新疆',
    slug: 'xinjiang',
    routes: ['wusun'],
    path: 'M 45,55 C 65,28 100,18 145,15 C 190,12 230,20 255,38 L 270,55 C 280,72 285,95 278,120 C 270,148 252,170 228,185 C 205,198 178,205 150,205 C 120,205 92,195 70,178 C 48,160 33,135 25,110 C 18,85 22,65 45,55 Z',
    labelX: 155,
    labelY: 110,
    color: '#f472b6',
    glowColor: 'rgba(244,114,182,0.3)',
  },
  {
    id: 'xizang',
    name: '西藏',
    slug: 'xizang',
    routes: ['everest-east'],
    path: 'M 140,210 C 160,195 190,185 220,182 C 250,180 280,190 305,205 C 325,220 338,245 340,270 C 342,295 330,320 310,340 C 288,360 260,370 230,375 C 200,380 170,370 148,355 C 125,338 110,312 102,285 C 95,258 105,228 140,210 Z',
    labelX: 220,
    labelY: 280,
    color: '#a78bfa',
    glowColor: 'rgba(167,139,250,0.3)',
  },
  {
    id: 'yunnan',
    name: '云南',
    slug: 'yunnan',
    routes: [],
    path: 'M 300,345 C 318,330 345,325 370,328 C 395,332 415,348 425,370 C 432,392 425,418 408,435 C 388,452 360,460 335,458 C 308,456 285,440 270,418 C 258,396 258,370 270,350 C 280,340 290,340 300,345 Z',
    labelX: 350,
    labelY: 398,
    color: '#34d399',
    glowColor: 'rgba(52,211,153,0.3)',
  },
  {
    id: 'sichuan',
    name: '四川',
    slug: 'sichuan',
    routes: [],
    path: 'M 265,195 C 285,180 315,172 345,175 C 375,178 400,192 420,212 C 435,232 442,258 438,282 C 430,308 412,325 390,332 C 365,340 335,335 310,322 C 288,310 270,290 258,268 C 248,248 245,222 255,205 C 260,196 262,195 265,195 Z',
    labelX: 340,
    labelY: 260,
    color: '#fbbf24',
    glowColor: 'rgba(251,191,36,0.3)',
  },
  {
    id: 'qinghai',
    name: '青海',
    slug: 'qinghai',
    routes: [],
    path: 'M 205,185 C 220,170 248,162 278,165 C 308,168 335,180 352,198 C 365,215 368,235 358,255 C 342,272 318,282 290,278 C 262,274 238,260 220,240 C 205,222 198,200 205,185 Z',
    labelX: 280,
    labelY: 225,
    color: '#60a5fa',
    glowColor: 'rgba(96,165,250,0.3)',
  },
  {
    id: 'gansu',
    name: '甘肃',
    slug: 'gansu',
    routes: [],
    path: 'M 195,30 C 220,22 248,20 275,22 C 305,25 330,35 348,55 C 362,75 368,98 362,120 C 355,142 338,158 318,165 C 295,172 268,168 245,158 C 222,148 202,130 190,108 C 180,88 178,62 185,42 C 188,34 191,32 195,30 Z',
    labelX: 275,
    labelY: 95,
    color: '#2dd4bf',
    glowColor: 'rgba(45,212,191,0.3)',
  },
];

export function getRegionBySlug(slug: string): RegionDef | undefined {
  return regions.find(r => r.slug === slug);
}
