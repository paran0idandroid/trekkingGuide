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
  'everest-east': {
    totalDays: 12,
    maxAltitude: 5300,
    overnightLowest: -15,
    terrain: ['冰川', '碎石坡', '河谷', '高山草甸'],
    waterCrossing: false,
    waterSource: '河流+冰川融水',
    resupplyPoint: false,
    exposure: ['极高海拔', '强紫外线', '暴风雪'],
  },
  'haba-west': {
    totalDays: 3,
    maxAltitude: 4384,
    overnightLowest: 0,
    terrain: ['高山草甸', '碎石坡', '垭口', '雪坡'],
    waterCrossing: false,
    waterSource: '可靠水源信息不明确',
    resupplyPoint: false,
    exposure: ['高海拔', '强紫外线', '失联风险'],
  },
};

export function getGearProfile(routeName: string): GearProfile | undefined {
  return routeGearProfiles[routeName];
}
