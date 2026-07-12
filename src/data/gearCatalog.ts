import { GearProduct, GearCategory } from '../types';

function searchTaobao(q: string) {
  return `https://s.taobao.com/search?q=${encodeURIComponent(q + ' 旗舰店')}`;
}
function searchJD(q: string) {
  return `https://search.jd.com/Search?keyword=${encodeURIComponent(q)}`;
}

function p(id: string, category: GearCategory, brand: string, brandZh: string, model: string,
         tier: 'entry' | 'mid' | 'premium', priceRange: [number, number],
         gender: 'male' | 'female' | 'unisex', specs: Record<string, string | number>,
         tags: string[], intro?: string): GearProduct {
  const fullName = `${brand} ${model}`;
  return {
    id, category, brand, brandZh, model, tier, priceRange, gender, specs,
    links: { taobao: searchTaobao(fullName), jd: searchJD(fullName) },
    tags, intro,
  };
}

export const gearCatalog: Record<GearCategory, GearProduct[]> = {

  // ==================== 背包 ====================
  '背包': [
    p('naturehike-60', '背包', 'Naturehike', '挪客', '60L 登山包', 'entry', [600, 800], 'unisex',
      { volume: 60, weight: 2.0, torsoFit: 'S/M/L' }, ['large-volume', 'value'], '挪客60L登山包是国产背包中的性价比标杆。采用铝合金框架背负系统，可调节背板长度，承重能力在15kg内表现均衡。60L的容量完美覆盖2-5天重装徒步需求。虽然面料细节和腰带舒适度与Osprey等国际品牌有差距，但仅1/3的价格让它成为入门重装的首选。适合预算有限但需要大容量背包的新手。'),
    p('osprey-kestrel-58', '背包', 'Osprey', 'Osprey', 'Kestrel 58', 'mid', [1200, 1500], 'male',
      { volume: 58, weight: 2.1, torsoFit: 'S/M/L' }, ['lightweight', 'ventilated'], 'Kestrel 58是Osprey长线徒步系列的经典中坚型号，连续多年稳居中端背包销量冠军。AirScape空景背板+可旋转腰带是其核心亮点：背板透气性在同级中出类拔萃，腰带可根据身形自然转动，贴合度极高。自重仅2.1kg，在58L级别中非常出色。乌孙、洛克、雨崩等经典长线路上随处可见它的身影。注意躯干长度可选S/M/L，务必试背后购买。'),
    p('osprey-kyte-46', '背包', 'Osprey', 'Osprey', 'Kyte 46 (女款)', 'mid', [1200, 1500], 'female',
      { volume: 46, weight: 1.6, torsoFit: 'XS/S/M' }, ['lightweight', 'female-fit'], 'Kyte 46是Osprey专为女性设计的经典背包，与Kestrel男款对应。专有女性背板弧度+窄肩带设计，贴合女性身形曲线，不会出现肩带滑落或腰带压迫髂骨的常见问题。46L容量适合3-5天徒步，对于乌孙这类需要全程自重的路线也是合理选择。XS/S/M三个尺码可选。'),
    p('gregory-stout-55', '背包', 'Gregory', 'Gregory', 'Stout 55', 'mid', [1300, 1600], 'male',
      { volume: 55, weight: 1.9, torsoFit: 'S/M/L' }, ['durable', 'comfort']),
    p('gregory-amber-44', '背包', 'Gregory', 'Gregory', 'Amber 44 (女款)', 'mid', [1300, 1600], 'female',
      { volume: 44, weight: 1.7, torsoFit: 'XS/S/M' }, ['durable', 'female-fit']),
    p('osprey-aether-65', '背包', 'Osprey', 'Osprey', 'Aether 65', 'premium', [2000, 2500], 'male',
      { volume: 65, weight: 2.3, torsoFit: 'S/M/L' }, ['heavy-load', 'premium-comfort'], 'Aether 65是Osprey家族的重装旗舰，专为20kg以上负重设计。搭载Osprey最顶级的Airspeed悬挂式网面背板，背部完全悬空透气，在重装负重下仍保持优秀通风。CustomFit可热塑腰带是最大亮点——加热后可完美贴合你的髂骨形状，将大重量均匀分布。自重2.3kg虽不算轻，但换来的是同类最佳的承重舒适度。适合高海拔长线和需要背负大量物资的场景。'),
    p('gregory-baltoro-65', '背包', 'Gregory', 'Gregory', 'Baltoro 65', 'premium', [2200, 2700], 'male',
      { volume: 65, weight: 2.5, torsoFit: 'S/M/L' }, ['heavy-load', 'max-carry'], 'Baltoro 65是Gregory对抗Osprey Aether的旗舰之作，以极致舒适著称。Response A3背负系统拥有业界最复杂的腰带结构——3层不同密度泡沫叠加，配合可随身体前倾而自动调节角度的腰带，将重装舒适度推向极致。同样是2.5kg的自重换来的是极度可靠的重装支撑。如果你计划走7天以上的长线或者需要背负20kg+的物资，Baltoro是值得认真考虑的选择。'),
  ],

  // ==================== 徒步鞋 ====================
  '徒步鞋': [
    p('decathlon-mh100-mid', '徒步鞋', 'Decathlon', '迪卡侬', 'MH100 中帮', 'entry', [300, 450], 'unisex',
      { weight: 420, goretex: 0, height: '中帮' }, ['value', 'beginner'], '迪卡侬MH100是入门徒步鞋的王者，300-450元的价格在同类产品中几乎没有对手。中帮设计提供基础脚踝保护，PVC鞋底防滑性在普通土路和碎石路上表现扎实。虽然不是Gore-Tex面料，但加厚鞋舌和鞋帮能应对小雨和露水。如果你不确定自己是否会持续徒步这项运动，MH100是最低成本的试水选择。不适合重装或复杂地形。'),
    p('merrell-moab-3-mid', '徒步鞋', 'Merrell', 'Merrell', 'Moab 3 Mid GTX', 'mid', [800, 1100], 'unisex',
      { weight: 480, goretex: 1, height: '中帮' }, ['goretex', 'versatile'], 'Moab系列是全球最畅销的徒步鞋之一，累计销量超过2000万双。Moab 3采用Gore-Tex防水内衬和Vibram MegaGrip鞋底两大黄金组合。上脚几乎不需要磨合期，透气性和舒适度在同等价位中数一数二。中规中矩的鞋底刚性和480g的重量算不上突出，但胜在全面均衡、几乎没有短板。适合中短距离徒步和轻装路线。'),
    p('salomon-x-ultra-4-mid', '徒步鞋', 'Salomon', 'Salomon', 'X Ultra 4 Mid GTX', 'mid', [900, 1200], 'unisex',
      { weight: 440, goretex: 1, height: '中帮' }, ['goretex', 'lightweight'], 'X Ultra 4是Salomon在中帮徒步鞋领域的技术力作。核心亮点是Advanced Chassis底盘技术——在鞋底嵌入了一块半刚性框架，在崎岖地形上提供精准的足部控制。实际体验就是在乱石坡和横切路段上，脚步有多余晃动明显减少。440g的重量加上Gore-Tex防水，让它在轻量化和保护性之间取得了很好的平衡。适合技术地形较多的徒步路线。'),
    p('arcteryx-aerios-fl-mid', '徒步鞋', 'Arc\'teryx', '始祖鸟', 'Aerios FL Mid GTX', 'premium', [1600, 2000], 'unisex',
      { weight: 390, goretex: 1, height: '中帮' }, ['goretex', 'ultralight', 'premium'], 'Aerios FL Mid是始祖鸟在轻量化中帮徒步鞋上的极致表达。390g的重量让它接近越野跑鞋的轻盈，却保留了中帮徒步鞋的脚踝保护。采用单层TPU薄膜而非传统Gore-Tex内衬，防水性能足够应对中雨但透气性更好。鞋面极简，几乎没有多余结构。缺点是支撑性偏弱、大底耐磨性一般，不适合重装。适合追求轻量化的越野徒步风格。'),
    p('lowa-renegade-gtx-mid', '徒步鞋', 'Lowa', 'Lowa', 'Renegade GTX Mid', 'premium', [1800, 2300], 'unisex',
      { weight: 520, goretex: 1, height: '中帮' }, ['goretex', 'durable', 'premium'], 'Renegade GTX Mid是德系徒步鞋的标杆之作，连续多年被户外媒体评为最佳中帮徒步鞋。全皮鞋面+Monowrap框架带来同类最佳的支撑性和保护性，走在碎石坡上信心十足。520g的重量在徒步鞋中偏重，但换来的是极高的耐用性——很多用户的Renegade能穿5年以上。鞋楦偏宽，对亚洲宽脚用户非常友好。适合需要强支撑的重装徒步和长时间户外作业。'),
  ],

  // ==================== 睡袋 ====================
  '睡袋': [
    p('naturehike-r300', '睡袋', 'Naturehike', '挪客', 'R300 羽绒睡袋', 'entry', [400, 600], 'unisex',
      { comfortTemp: -5, weight: 1.0, fill: '鹅绒 700FP' }, ['down', 'value']),
    p('decathlon-mt100', '睡袋', 'Decathlon', '迪卡侬', 'MT100 -5°C', 'entry', [350, 500], 'unisex',
      { comfortTemp: -5, weight: 1.2, fill: '中空棉' }, ['synthetic', 'value']),
    p('sea-to-summit-spark-5', '睡袋', 'Sea to Summit', 'Sea to Summit', 'Spark -5°C', 'mid', [1500, 1800], 'unisex',
      { comfortTemp: -5, weight: 0.7, fill: '鹅绒 850FP' }, ['down', 'ultralight']),
    p('marmot-hydrogen', '睡袋', 'Marmot', 'Marmot', 'Hydrogen -7°C', 'mid', [1600, 2000], 'unisex',
      { comfortTemp: -7, weight: 0.8, fill: '鹅绒 850FP' }, ['down', 'lightweight']),
    p('rab-neutrino-400', '睡袋', 'Rab', 'Rab', 'Neutrino 400', 'premium', [2200, 2800], 'unisex',
      { comfortTemp: -5, weight: 0.65, fill: '鹅绒 800FP' }, ['down', 'ultralight', 'premium']),
  ],

  // ==================== 帐篷 ====================
  '帐篷': [
    p('naturehike-cloud-up-2', '帐篷', 'Naturehike', '挪客', 'Cloud Up 2', 'entry', [600, 900], 'unisex',
      { weight: 2.0, capacity: 2 }, ['double-wall', 'value'], 'Cloud Up 2是国产帐篷的市场标杆，凭一己之力拉低了入门双人帐的门槛。2kg的自重、双门厅设计、不到千元的价格，在入门价位几乎没有竞争对手。虽然面料D数偏低长期使用容易磨损、帐杆在强风下表现一般，但对于偶尔露营的周末徒步者来说完全够用。强烈建议搭配同品牌地布使用以延长寿命。适合偶尔露营、预算有限的徒步入门者。'),
    p('msr-hubba-hubba-2', '帐篷', 'MSR', 'MSR', 'Hubba Hubba 2', 'mid', [2600, 3200], 'unisex',
      { weight: 1.7, capacity: 2 }, ['double-wall', 'freestanding', 'lightweight'], 'Hubba Hubba 2是现代双人徒步帐篷的经典之选，几乎每个装备测评榜单上都能看到它的名字。1.7kg的自重、快速搭建的Hubbed结构、出色的通风设计让它成为全能型选手。两个门厅空间充裕，可以放背包和登山鞋。面料耐水压表现远超同级，在大雨中依然可靠。国行版定价偏高，海淘或二手市场更划算。适合从周末到长线的各种徒步露营场景。'),
    p('big-agnes-copper-spur-2', '帐篷', 'Big Agnes', 'Big Agnes', 'Copper Spur HV UL2', 'mid', [2800, 3500], 'unisex',
      { weight: 1.4, capacity: 2 }, ['double-wall', 'freestanding', 'ultralight'], 'Copper Spur HV UL2是超轻双人帐的标杆产品，Big Agnes凭借这款帐篷在轻量化领域确立了领导地位。仅1.4kg的自重（含地布）让它比同级对手轻了300-500g。High Volume结构使帐内空间利用率极高，侧壁近乎垂直，人在里面不会感觉压抑。超轻面料需要小心使用，适合对每克重量都敏感的轻量化徒步者。如果寻找最轻量但又不牺牲舒适度的双人帐，深度推荐这顶。'),
    p('hilleberg-enan', '帐篷', 'Hilleberg', 'Hilleberg', 'Enan', 'premium', [5000, 6000], 'unisex',
      { weight: 1.3, capacity: 1 }, ['single-wall', 'expedition', 'premium'], 'Hilleberg Enan是瑞典顶级帐篷品牌的最轻型号，代表了单层帐的最高水准。1.3kg的超轻自重却拥有在高海拔和恶劣天气下依然可靠的防护力——这正是Hilleberg的品牌基因。采用Kerlon 1200面料（Hilleberg自家研发），抗撕裂强度远超同重量友商。单层结构意味着内壁容易结露，在潮湿环境需要通风管理技巧。6000元左右的价格和单人空间让它成为少数人的选择：适合高海拔路线和追求极致可靠性的单人行家。'),
  ],

  // ==================== 冲锋衣 ====================
  '冲锋衣': [
    p('decathlon-mh500', '冲锋衣', 'Decathlon', '迪卡侬', 'MH500 冲锋衣', 'entry', [400, 600], 'unisex',
      { weight: 480, goretex: 0 }, ['waterproof', 'value']),
    p('marmot-precip-eco', '冲锋衣', 'Marmot', 'Marmot', 'PreCip Eco', 'mid', [700, 900], 'unisex',
      { weight: 340, goretex: 0 }, ['waterproof', 'lightweight']),
    p('patagonia-torrentshell', '冲锋衣', 'Patagonia', 'Patagonia', 'Torrentshell 3L', 'mid', [1200, 1500], 'unisex',
      { weight: 410, goretex: 0 }, ['waterproof', 'durable']),
    p('arcteryx-beta-ar', '冲锋衣', 'Arc\'teryx', '始祖鸟', 'Beta AR', 'premium', [4500, 5500], 'unisex',
      { weight: 475, goretex: 1 }, ['goretex', 'premium', 'durable']),
  ],

  // ==================== 保暖层 ====================
  '保暖层': [
    p('decathlon-mt100-down', '保暖层', 'Decathlon', '迪卡侬', 'MT100 羽绒服', 'entry', [300, 450], 'unisex',
      { weight: 350, fill: '鸭绒 600FP' }, ['down', 'value']),
    p('patagonia-micro-puff', '保暖层', 'Patagonia', 'Patagonia', 'Micro Puff Hoody', 'mid', [1800, 2200], 'unisex',
      { weight: 280, fill: 'PlumaFill合成' }, ['synthetic', 'lightweight', 'packable']),
    p('arcteryx-atom-lt', '保暖层', 'Arc\'teryx', '始祖鸟', 'Atom LT Hoody', 'mid', [2000, 2500], 'unisex',
      { weight: 365, fill: 'Coreloft合成' }, ['synthetic', 'breathable', 'versatile']),
    p('arcteryx-cerium-hoody', '保暖层', 'Arc\'teryx', '始祖鸟', 'Cerium Hoody', 'premium', [2800, 3500], 'unisex',
      { weight: 315, fill: '鹅绒 850FP' }, ['down', 'ultralight', 'premium']),
  ],

  // ==================== 登山杖 ====================
  '登山杖': [
    p('decathlon-mt500', '登山杖', 'Decathlon', '迪卡侬', 'MT500 铝杖', 'entry', [150, 250], 'unisex',
      { weight: 0.56, material: '铝' }, ['value', 'adjustable']),
    p('bd-trail-pro', '登山杖', 'Black Diamond', 'Black Diamond', 'Trail Pro', 'mid', [500, 700], 'unisex',
      { weight: 0.52, material: '铝' }, ['adjustable', 'comfort-grip']),
    p('komperdell-carbon', '登山杖', 'Komperdell', 'Komperdell', 'Carbon Expedition', 'mid', [600, 800], 'unisex',
      { weight: 0.38, material: '碳纤维' }, ['carbon', 'lightweight']),
    p('bd-alpine-carbon-cork', '登山杖', 'Black Diamond', 'Black Diamond', 'Alpine Carbon Cork', 'premium', [1000, 1300], 'unisex',
      { weight: 0.35, material: '碳纤维' }, ['carbon', 'cork-grip', 'premium']),
  ],

  // ==================== 头灯 ====================
  '头灯': [
    p('decathlon-mh100-headlamp', '头灯', 'Decathlon', '迪卡侬', 'MH100 头灯', 'entry', [60, 100], 'unisex',
      { lumens: 150, weight: 80, battery: 'AAA' }, ['value', 'beginner']),
    p('bd-spot-400', '头灯', 'Black Diamond', 'Black Diamond', 'Spot 400', 'mid', [250, 350], 'unisex',
      { lumens: 400, weight: 85, battery: 'AAA' }, ['reliable', 'waterproof']),
    p('petzl-actik-core', '头灯', 'Petzl', 'Petzl', 'Actik Core', 'mid', [300, 400], 'unisex',
      { lumens: 450, weight: 95, battery: '可充电' }, ['rechargeable', 'bright']),
    p('petzl-swift-rl', '头灯', 'Petzl', 'Petzl', 'Swift RL', 'premium', [500, 700], 'unisex',
      { lumens: 900, weight: 110, battery: '可充电' }, ['rechargeable', 'ultra-bright', 'premium']),
  ],

  // ==================== 炉头套锅 ====================
  '炉头套锅': [
    p('decathlon-camping-stove', '炉头套锅', 'Decathlon', '迪卡侬', '露营炉头+套锅套装', 'entry', [150, 250], 'unisex',
      { weight: 0.6, fuel: '气罐' }, ['value', 'complete-set']),
    p('msr-pocketrocket-2', '炉头套锅', 'MSR', 'MSR', 'PocketRocket 2 + 1.4L套锅', 'mid', [500, 700], 'unisex',
      { weight: 0.33, fuel: '气罐', boilTime: '3.5min/1L' }, ['lightweight', 'fast']),
    p('jetboil-flash', '炉头套锅', 'Jetboil', 'Jetboil', 'Flash 一体化炉头+杯', 'mid', [700, 900], 'unisex',
      { weight: 0.55, fuel: '气罐', boilTime: '2.5min/0.5L' }, ['integrated', 'efficient']),
    p('msr-reactor', '炉头套锅', 'MSR', 'MSR', 'Reactor 2.5L 系统', 'premium', [1200, 1500], 'unisex',
      { weight: 0.85, fuel: '气罐', boilTime: '3min/1L' }, ['integrated', 'windproof', 'premium']),
  ],

  // ==================== 水袋水壶 ====================
  '水袋水壶': [
    p('decathlon-2l-bladder', '水袋水壶', 'Decathlon', '迪卡侬', '2L 水袋', 'entry', [60, 100], 'unisex',
      { volume: 2, weight: 0.12 }, ['value', 'hydration']),
    p('camelbak-crux-3l', '水袋水壶', 'CamelBak', 'CamelBak', 'Crux 3L 水袋', 'mid', [200, 300], 'unisex',
      { volume: 3, weight: 0.18 }, ['durable', 'high-flow']),
    p('platypus-big-zip-3l', '水袋水壶', 'Platypus', 'Platypus', 'Big Zip 3L 水袋', 'premium', [250, 350], 'unisex',
      { volume: 3, weight: 0.16 }, ['lightweight', 'easy-clean', 'premium']),
  ],

  // ==================== 防水袋 ====================
  '防水袋': [
    p('decathlon-dry-bag-set', '防水袋', 'Decathlon', '迪卡侬', '防水袋套装 3件', 'entry', [60, 100], 'unisex',
      { volume: '5/10/15L', weight: 0.15 }, ['value', 'set']),
    p('sea-to-summit-evac', '防水袋', 'Sea to Summit', 'Sea to Summit', 'eVac 压缩防水袋 13L', 'mid', [150, 220], 'unisex',
      { volume: 13, weight: 0.11 }, ['compression', 'waterproof']),
    p('sea-to-summit-big-river', '防水袋', 'Sea to Summit', 'Sea to Summit', 'Big River 防水袋 20L', 'premium', [200, 300], 'unisex',
      { volume: 20, weight: 0.18 }, ['heavy-duty', 'heavy-wateproof', 'premium']),
  ],

  // ==================== 涉水鞋 ====================
  '涉水鞋': [
    p('decathlon-mh100-low', '涉水鞋', 'Decathlon', '迪卡侬', 'MH100 低帮溯溪鞋', 'entry', [150, 250], 'unisex',
      { weight: 280, goretex: 0 }, ['value', 'quick-dry']),
    p('keen-newport-h2', '涉水鞋', 'Keen', 'Keen', 'Newport H2', 'mid', [500, 700], 'unisex',
      { weight: 380, goretex: 0 }, ['toe-protection', 'quick-dry', 'durable']),
    p('astral-loyak', '涉水鞋', 'Astral', 'Astral', 'Loyak', 'premium', [600, 800], 'unisex',
      { weight: 280, goretex: 0 }, ['lightweight', 'quick-dry', 'premium']),
  ],

  // ==================== 雪套 ====================
  '雪套': [
    p('decathlon-gaiters', '雪套', 'Decathlon', '迪卡侬', '徒步雪套', 'entry', [50, 80], 'unisex',
      { weight: 0.15, height: '中帮' }, ['value', 'waterproof']),
    p('bd-talus', '雪套', 'Black Diamond', 'Black Diamond', 'Talus 雪套', 'mid', [250, 350], 'unisex',
      { weight: 0.2, height: '中帮' }, ['durable', 'waterproof']),
    p('or-rocky-mountain', '雪套', 'Outdoor Research', 'Outdoor Research', 'Rocky Mountain 雪套', 'premium', [350, 500], 'unisex',
      { weight: 0.22, height: '高帮' }, ['expedition', 'durable', 'premium']),
  ],

  // ==================== 防晒墨镜 ====================
  '防晒墨镜': [
    p('decathlon-sunglasses', '防晒墨镜', 'Decathlon', '迪卡侬', '徒步太阳镜 + 防晒霜SPF50', 'entry', [80, 150], 'unisex',
      { uvProtection: 400, category: 3 }, ['value', 'uv400']),
    p('julbo-explorer', '防晒墨镜', 'Julbo', 'Julbo', 'Explorer 徒步墨镜', 'mid', [600, 900], 'unisex',
      { uvProtection: 400, category: 4 }, ['photochromic', 'high-protection']),
    p('julbo-inter', '防晒墨镜', 'Julbo', 'Julbo', 'Inter 专业登山墨镜', 'premium', [800, 1200], 'unisex',
      { uvProtection: 400, category: 4 }, ['photochromic', 'expedition', 'premium']),
  ],
};

export function getProductsByCategory(category: GearCategory): GearProduct[] {
  return gearCatalog[category] || [];
}

export function getProductById(id: string): GearProduct | undefined {
  for (const cat of Object.values(gearCatalog)) {
    const found = cat.find(p => p.id === id);
    if (found) return found;
  }
  return undefined;
}
