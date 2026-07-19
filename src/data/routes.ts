import { RouteData } from '../types';
import { habaWestRoute, wusunRoute } from './routeData';

export const routeDataMap: Record<string, RouteData> = {
  'wusun': wusunRoute,
  'haba-west': habaWestRoute,
  'everest-east': {
    slug: 'everest-east',
    regionSlug: 'xizang',
    name: '珠峰东坡 / 嘎玛沟',
    subtitle: '世界最高峰的东坡秘境，雪山盛宴与高山杜鹃的天堂',
    tags: ['西藏', '珠峰', '嘎玛沟', '10-14天', '高难度'],
    heroImage: '/pics/7.webp',
    overview: {
      distance: '80-100 km',
      duration: '10-14 天',
      maxElevation: '约 5300 m',
      bestSeason: '4-5月杜鹃花季、9-10月秋景',
      difficulty: '极高',
      suitableFor: '有丰富高海拔徒步经验的人',
    },
    highlights: [
      {
        title: '珠穆朗玛东坡全景',
        description: '从嘎玛沟仰望珠穆朗玛峰、洛子峰、马卡鲁峰三座8000米级雪山，雪山盛宴无与伦比。',
        image: '/pics/7.webp',
      },
      {
        title: '高山杜鹃林',
        description: '4-5月沟谷中的高山杜鹃盛开，雪山背景下的杜鹃花海是徒步途中最大的视觉犒赏。',
        image: '/pics/8.webp',
      },
      {
        title: '嘎玛沟穿越',
        description: '嘎玛沟被誉为"世界最美峡谷"，从海拔2000m到5300m，垂直气候带极其丰富，一日之内经历四季。',
        image: '/pics/4.webp',
      },
      {
        title: '汤湘观景台',
        description: '汤湘平台是珠峰东坡徒步的经典观景点，正对珠峰和洛子峰，尤其适合拍摄日落金山。',
        image: '/pics/5.webp',
      },
      {
        title: '措学仁玛',
        description: '措学仁玛是东坡徒步的终点湖，湖面倒映珠峰和洛子峰，是徒步者最期待的收官画面。',
        image: '/pics/6.webp',
      },
    ],
    itinerary: [
      { day: 1, title: '拉萨集合 / 前往曲当乡', description: '从拉萨集合，沿318国道前往定日县，远眺珠峰。抵达曲当乡后办理进山手续。' },
      { day: 2, title: '曲当 — 优帕村 — 晓乌措', description: '从曲当乡出发，经优帕村进入嘎玛沟。沿河谷上升约5小时抵达晓乌措营地，第一天适应海拔。' },
      { day: 3, title: '晓乌措 — 卓湘', description: '上午翻越晓乌拉垭口（4900m），可以看到马卡鲁峰和珠峰。下午下降至卓湘河谷营地，进入杜鹃林地带。' },
      { day: 4, title: '卓湘 — 汤湘', description: '沿嘎玛沟深入，穿过茂密森林和高山草甸。抵达汤湘观景台营地，直面珠峰东坡和洛子峰。' },
      { day: 5, title: '汤湘 — 巴当 — 俄嘎', description: '继续沿沟谷前行，经过巴当牧场。沿途多次横切碎石坡，需谨慎通过。抵达俄嘎营地。' },
      { day: 6, title: '俄嘎 — 珠峰东坡大本营', description: '从俄嘎出发，沿冰川侧碛上行至珠峰东坡大本营（5300m），近距离感受珠峰压迫感。原路返回俄嘎营地。' },
      { day: 7, title: '俄嘎 — 措学仁玛', description: '告别珠峰，翻越最后一个垭口后抵达措学仁玛湖。在湖畔扎营，拍摄珠峰倒影。' },
      { day: 8, title: '措学仁玛 — 曲当 — 返回日喀则', description: '从措学仁玛出发，沿河谷下行出山。乘车返回日喀则，结束徒步之旅。' },
    ],
    risks: [
      { title: '极高海拔', description: '全程最高5300m，高原反应风险极高。建议提前在拉萨（3650m）适应3天以上。' },
      { title: '天气严酷', description: '高海拔山区天气瞬息万变，暴风雪随时可能。4-5月仍有积雪，10月开始降雪。' },
      { title: '路线漫长', description: '10-14天的长线徒步，体力消耗巨大。建议做充分体能准备。' },
      { title: '无人区无补给', description: '嘎玛沟全程无补给点，需携带10天以上的全部食物和燃料。' },
      { title: '必须请向导', description: '珠峰东坡路况复杂，部分路段不明显且有冰川风险。强烈建议聘请当地向导或跟商业队。' },
    ],
    gear: [
      '背包', '帐篷', '徒步鞋', '冲锋衣', '保暖层', '登山杖', '头灯', '睡袋', '涉水鞋',
      '防晒用品', '急救包', '防水袋', '炉头套锅', '保温水壶', '手套', '遮阳帽', '墨镜', '充电宝',
    ],
    gearProfileKey: 'everest-east',
  },
};

export function getRouteBySlug(slug: string): RouteData | undefined {
  return routeDataMap[slug];
}

export function getRoutesByRegion(regionSlug: string): RouteData[] {
  return Object.values(routeDataMap).filter(r => r.regionSlug === regionSlug);
}
