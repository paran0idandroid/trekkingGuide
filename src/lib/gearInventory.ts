import type { GearInventoryItem, GearInventoryStatus, GearSystemSlug } from '../types';

const GEAR_API_URL = '/api/gear';

export interface GearInventorySnapshot {
  items: GearInventoryItem[];
  revision: number;
}

interface GearApiResponse {
  items?: GearInventoryItem[];
  revision?: number;
  error?: string;
}

async function requestGearInventory(init?: RequestInit): Promise<GearInventorySnapshot> {
  let response: Response;
  try {
    response = await fetch(GEAR_API_URL, init);
  } catch {
    throw new Error('无法连接本地装备数据库，请确认项目已启动');
  }

  let body: GearApiResponse;
  try {
    body = await response.json() as GearApiResponse;
  } catch {
    throw new Error('本地装备数据库返回格式无效');
  }

  if (!response.ok) throw new Error(body.error ?? '本地装备数据库请求失败');
  if (!Array.isArray(body.items)) throw new Error('本地装备数据库返回格式无效');
  if (!Number.isInteger(body.revision) || body.revision! < 0) {
    throw new Error('本地装备数据库返回格式无效');
  }
  return { items: body.items, revision: body.revision! };
}

function normalizeGearName(name: string): string {
  return name.trim().toLowerCase();
}

const GEAR_SYSTEM_KEYWORDS: { systemSlug: GearSystemSlug; keywords: string[] }[] = [
  {
    systemSlug: 'sleep',
    keywords: ['睡袋', '睡垫', '气垫', '屁垫', '蛋巢', '枕', 'sleeping bag', 'sleeping pad'],
  },
  {
    systemSlug: 'shelter',
    keywords: ['帐篷', '天幕', '地布', '风绳', '地钉', 'tent', 'tarp'],
  },
  {
    systemSlug: 'food-hydration',
    keywords: [
      '饮水袋', '水袋', '水壶', '保温杯', '钛杯', '净水', '炉头', '炉具',
      '套锅', '餐具', '气罐', '补给', 'water bladder',
    ],
  },
  {
    systemSlug: 'navigation-safety',
    keywords: [
      '头灯', '手机', '支架', '高驰', 'pace', 'gps', '手表', '充电宝', '电源',
      '指南针', '地图', '急救', '药物', '北斗', '营地灯', '湿纸巾', '现金',
      '哨', '卫星', '救生',
    ],
  },
  {
    systemSlug: 'carry-storage',
    keywords: [
      '重装包', '背包', '收纳袋', '防水袋', '防水pe袋', '压缩袋', '托运袋',
      'deuter', 'osprey', 'aircontact',
    ],
  },
  {
    systemSlug: 'wear-movement',
    keywords: [
      '徒步鞋', '登山鞋', 'moab', 'gtx', '墨镜', '太阳镜', '袜', '裤', '上衣',
      '抓绒', '冲锋衣', '速干', '登山杖', '手套', '冷帽', '帽', '雪套', '雨衣',
      '髌骨带', '羽绒', '营地鞋', '保暖', '鞋', '衣',
    ],
  },
];

export function inferGearSystem(name: string): GearSystemSlug | null {
  const normalizedName = normalizeGearName(name);
  return GEAR_SYSTEM_KEYWORDS.find(({ keywords }) => (
    keywords.some(keyword => normalizedName.includes(keyword))
  ))?.systemSlug ?? null;
}

export function validateGearName(
  items: GearInventoryItem[],
  name: string,
  excludeId?: string,
): string | null {
  const normalizedName = normalizeGearName(name);
  if (!normalizedName) return '请输入装备名称';

  const isDuplicate = items.some(item => (
    item.id !== excludeId && normalizeGearName(item.name) === normalizedName
  ));
  return isDuplicate ? '清单中已有该装备' : null;
}

export function addGearItem(
  items: GearInventoryItem[],
  item: GearInventoryItem,
): GearInventoryItem[] {
  return [{ ...item, name: item.name.trim() }, ...items];
}

export function updateGearItem(
  items: GearInventoryItem[],
  id: string,
  name: string,
): GearInventoryItem[] {
  return items.map(item => (
    item.id === id ? { ...item, name: name.trim() } : item
  ));
}

export function updateGearItemStatus(
  items: GearInventoryItem[],
  id: string,
  status: GearInventoryStatus,
): GearInventoryItem[] {
  return items.map(item => (
    item.id === id ? { ...item, status } : item
  ));
}

export function updateGearItemSystem(
  items: GearInventoryItem[],
  id: string,
  systemSlug: GearSystemSlug,
): GearInventoryItem[] {
  return items.map(item => (
    item.id === id ? { ...item, systemSlug } : item
  ));
}

export function removeGearItem(items: GearInventoryItem[], id: string): GearInventoryItem[] {
  return items.filter(item => item.id !== id);
}

export async function getGearInventory(): Promise<GearInventorySnapshot> {
  return requestGearInventory();
}

export async function saveGearInventory(
  items: GearInventoryItem[],
  revision: number,
): Promise<GearInventorySnapshot> {
  return requestGearInventory({
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items, revision }),
  });
}
