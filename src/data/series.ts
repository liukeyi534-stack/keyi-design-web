// LOWKEY Archive Template — public content model and catalogue for KEYI.
// Replace the demo collections with your own published content. Keep private
// drafts outside this module: everything imported here is shipped to clients.

export type CollectionStatus = 'published' | 'draft' | 'archived';
export type ArtworkFit = 'cover' | 'contain';
export type ArtworkMatte = 'ivory' | 'graphite' | 'transparent';

export interface ArtworkPresentation {
  fit?: ArtworkFit;
  focus?: [number, number];
  matte?: ArtworkMatte;
  zoom?: number;
}

export type FrameThemeMode = 'auto' | 'manual';
export type FrameTrayTone = 'ivory' | 'graphite' | 'clear';
export type FrameHardwareTone = 'silver' | 'gunmetal';

export interface FrameTheme {
  mode: FrameThemeMode;
  edgeColor?: string;
  spineColor?: string;
  trayTone?: FrameTrayTone;
  hardwareTone?: FrameHardwareTone;
  colorIntensity?: number;
}

export interface ResolvedFrameTheme {
  mode: FrameThemeMode;
  edgeColor: string;
  spineColor: string;
  trayTone: FrameTrayTone;
  hardwareTone: FrameHardwareTone;
  colorIntensity: number;
}

export type MaterialPreset =
  | 'clear-acrylic'
  | 'frosted-acrylic'
  | 'smoked-glass'
  | 'amber-resin'
  | 'dichroic-film'
  | 'ice-blue-glass'
  | 'milky-translucent'
  | 'negative-film'
  | 'metal-mesh-inlay'
  | 'pearlescent-film';

export interface Work {
  id: string;
  image: string;
  titleZh: string;
  titleEn: string;
  oneLineZh: string;
  oneLineEn: string;
  storyZh: string;
  storyEn: string;
  year: number;
  medium: string;
  dimensions?: string;
  credits?: string;
  order: number;
  presentation?: ArtworkPresentation;
}

export type VinylVariant = 'archive' | 'reliquary' | 'nocturne' | 'cobalt';

export interface VinylTheme {
  variant?: VinylVariant;
  discColor?: string;
  labelColor?: string;
  labelInk?: string;
  accentColor?: string;
  jewelColor?: string;
  imprint?: string;
  rotationSeconds?: number;
}

export interface SeriesAudio {
  src: string;
  title: string;
  label?: string;
  loop?: boolean;
  volume?: number;
  vinylTheme?: VinylTheme;
}

export type ShellKey =
  | 'clear'
  | 'frosted'
  | 'smoked'
  | 'paleIce'
  | 'ice'
  | 'amber'
  | 'dichroic'
  | 'milky';

export interface Collection {
  id: string;
  slug: string;
  titleZh: string;
  titleEn: string;
  subtitleZh?: string;
  subtitleEn?: string;
  year: number;
  category: string;
  medium: string;
  shell: ShellKey;
  palette: [string, string, string];
  materialPreset: MaterialPreset;
  cover: string;
  coverWorkId?: string;
  coverFit?: ArtworkFit;
  coverFocus?: [number, number];
  coverMatte?: ArtworkMatte;
  coverZoom?: number;
  frameTheme?: FrameTheme;
  descriptionZh: string;
  descriptionEn: string;
  status: CollectionStatus;
  order: number;
  seriesStoryZh?: string[];
  seriesStoryEn?: string[];
  processZh?: string;
  processEn?: string;
  audio?: SeriesAudio;
  works: Work[];
}

const work = (
  collection: string,
  order: number,
  titleZh: string,
  titleEn: string,
  image: string,
  oneLineZh: string,
  oneLineEn: string,
  presentation: ArtworkPresentation = {},
): Work => ({
  id: `${collection}-${String(order).padStart(2, '0')}`,
  image,
  titleZh,
  titleEn,
  oneLineZh,
  oneLineEn,
  storyZh: oneLineZh,
  storyEn: oneLineEn,
  year: 2026,
  medium: 'Editorial design',
  dimensions: '1800 × 1012 px',
  order,
  presentation,
});

const _ALL_COLLECTIONS_RAW: Collection[] = [
  // ---- 19 published portfolio works (真实作品 + 详情页) ----
  {
    id: 'cider-hello-kitty', slug: 'cider-hello-kitty',
    titleZh: 'CIDER', titleEn: 'CIDER',
    subtitleZh: 'Hello Kitty联名', subtitleEn: '× Hello Kitty',
    year: 2024, category: '实习项目', medium: 'Co-branded apparel campaign',
    shell: 'dichroic', palette: ['#f6c8d8', '#e96a8a', '#5a1428'], materialPreset: 'dichroic-film',
    cover: '/archive/works/cider-hello-kitty-01.jpg', coverWorkId: 'cider-hello-kitty-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#e96a8a', spineColor: '#5a1428', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.7 },
    descriptionZh: '把 Hello Kitty 的可爱宇宙，重新装进一个长大后的娃娃衣橱。',
    descriptionEn: 'Hello Kitty\'s kawaii universe, re-stitched into a grown-up doll closet.',
    seriesStoryZh: [
      '这不是再穿成小孩，而是以大人的方式重新拿回那份可爱——把童年与 Sanrio 的老朋友们，转译成现在 Cider girls 还愿意挂在身上的衣橱。',
    ],
    seriesStoryEn: [],
    processZh: '联名视觉 · 单品牌 cap 系列',
    processEn: 'Co-branded apparel capsule',
    status: 'published', order: 1,
    works: [
      work('cider-hello-kitty', 1, '', '', '/archive/works/cider-hello-kitty-01.jpg', 'Hello Kitty 的可爱宇宙被重新装进一个长大后的娃娃衣橱。Y2K 怀旧遇上当下审美：拼贴、可收藏的小物、玩心——把童年与 Sanrio 老朋友一起穿进当下的衣橱。', ''),
      work('cider-hello-kitty', 2, '品牌分析', 'BRAND', '/archive/works/cider-hello-kitty-02.jpg', 'Y2K 怀旧、可收集小物与拼贴美学，被重新引入衣橱。', 'Y2K nostalgia, collectibles and scrapbook aesthetics, re-introduced into the wardrobe.'),
      work('cider-hello-kitty', 3, '色彩与面料', 'CMF', '/archive/works/cider-hello-kitty-03.jpg', 'CIPR Carnation / Prism Marshmallow / Yellow Cream 等 16 种 PANTONE 标定。', 'Sixteen PANTONE standards from Pink Carnation to Frosted Fudge.'),
      work('cider-hello-kitty', 4, '印花细节', 'PRINTS', '/archive/works/cider-hello-kitty-04.jpg', '一组可印花复刻的 Hello Kitty 主题纹样。', 'A series of printable reinterpretations of Hello Kitty.'),
      work('cider-hello-kitty', 5, '造型 1', 'LOOK 1', '/archive/works/cider-hello-kitty-05.jpg', '白色印花短袖与半裙，致敬 Y2K 女孩剪贴簿。', 'White printed tee with half skirt, Y2K scrapbook homage.'),
      work('cider-hello-kitty', 6, '造型 2', 'LOOK 2', '/archive/works/cider-hello-kitty-06.jpg', '粉色波点连衣裙搭配蝴蝶结小物。', 'Pink polka-dot dress paired with bow accessories.'),
      work('cider-hello-kitty', 7, '造型 3', 'LOOK 3', '/archive/works/cider-hello-kitty-07.jpg', '叠穿造型，把玩心放进大人尺码里。', 'Layered look that puts playfulness into adult sizing.'),
      work('cider-hello-kitty', 8, '造型 4', 'LOOK 4', '/archive/works/cider-hello-kitty-08.jpg', '黑白抽象印花裙，一份克制过的拼贴。', 'Black-and-white abstract print dress, restrained collage.'),
    ],
  },
  {
    id: 'city-vinewalk', slug: 'city-vinewalk',
    titleZh: 'CITY Vinwalk', titleEn: 'City VineWalk',
    subtitleZh: '智慧养老的种植设计', subtitleEn: 'Planting design for smart aging',
    year: 2024, category: '服务设计', medium: 'Seeding cane for the elderly',
    shell: 'paleIce', palette: ['#dbe5c8', '#6a8a48', '#1e2a14'], materialPreset: 'frosted-acrylic',
    cover: '/archive/works/city-vinewalk-01.jpg', coverWorkId: 'city-vinewalk-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#6a8a48', spineColor: '#1e2a14', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.55 },
    descriptionZh: '一支能边走边播的"手杖式"种植装置，让长辈的散步变成游击园艺。',
    descriptionEn: 'A cane-shaped seeder that turns an elder\'s daily walk into guerrilla gardening.',
    seriesStoryZh: [
      '汲取"社会正义"与"游击园艺"理念，把老年人的日常散步编进城市生态修复的版图——让"老有所为"的愿景落在一段可被走出的路上。',
    ],
    seriesStoryEn: [],
    processZh: '服务设计 · 手杖式种植装置',
    processEn: 'Service design · seeding cane',
    status: 'published', order: 2,
    works: [
      work('city-vinewalk', 1, '', '', '/archive/works/city-vinewalk-01.jpg', '一支能边走边播的"手杖式"种植装置，把日常散步编进城市生态修复的版图。把老年人重新定义为"城市生态修复者"，让他们的步行轨迹都在种下种子——每一段路都有意义。', ''),
      work('city-vinewalk', 2, '使用流程', 'FLOW', '/archive/works/city-vinewalk-02.jpg', '散步 → 发现荒地 → 用拐杖播种 → 看见花开的六步流程。', 'A six-step flow: walk → spot a wasteland → seed with the cane → see it bloom.'),
      work('city-vinewalk', 3, 'APP 端', 'APP', '/archive/works/city-vinewalk-03.jpg', 'Guerrilla Gardening / Community Discovery / Urban Jungle 三屏界面。', 'Three screens: Guerrilla Gardening, Community Discovery, Urban Jungle.'),
    ],
  },
  {
    id: 'emosphere', slug: 'emosphere',
    titleZh: 'Emosphere', titleEn: 'Emosphere',
    subtitleZh: '基于情感三层次理论的模块化职场空间', subtitleEn: 'Modular workplace based on emotional three-layer theory',
    year: 2025, category: '服务设计', medium: 'Modular workplace system',
    shell: 'frosted', palette: ['#e2d8c8', '#8a6a48', '#2a1c12'], materialPreset: 'frosted-acrylic',
    cover: '/archive/works/emosphere-01.jpg', coverWorkId: 'emosphere-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#8a6a48', spineColor: '#2a1c12', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.55 },
    descriptionZh: '把情感三层次（低/中/高）转译成三段可切换的模块化职场空间。',
    descriptionEn: 'Translates an emotional three-layer theory into three switchable modular workplace states.',
    seriesStoryZh: [
      '以情感三层次为底层框架，把办公空间拆成三段可切换模块。低情绪区用茧状包裹座椅模拟被拥抱的感觉，深压与配色帮助使用者回到身体本身的感受。',
    ],
    seriesStoryEn: [],
    processZh: '空间设计 · 模块化情绪舱',
    processEn: 'Spatial design · modular mood pod',
    status: 'published', order: 3,
    works: [
      work('emosphere', 1, '', '', '/archive/works/emosphere-01.jpg', '基于情感三层次理论的模块化职场空间，三段模块对应低中高情绪区。低情绪区用茧状包裹座椅模拟被拥抱的感觉，深压与配色帮助使用者回到身体本身的感受。', ''),
      work('emosphere', 2, '深度压力疗法', 'DEEP PRESSURE', '/archive/works/emosphere-02.jpg', '茧状包裹座椅通过充气模块模拟被拥抱的感觉。', 'A cocoon chair that simulates being held through an inflatable module.'),
      work('emosphere', 3, '情感仪表盘', 'DASHBOARD', '/archive/works/emosphere-03.jpg', '情绪趋势、周报和情绪调节建议的 UI 仪表盘。', 'A dashboard of mood trends, weekly reports and gentle suggestions.'),
      work('emosphere', 4, '空间布置', 'LAYOUT', '/archive/works/emosphere-04.jpg', '三段模块在真实办公楼层中的布置示意。', 'Layout of the three modules within a real office floor.'),
    ],
  },
  {
    id: 'hearloom', slug: 'hearloom',
    titleZh: 'Hearloom', titleEn: 'Hearloom',
    subtitleZh: '智慧养老产品服务系统设计', subtitleEn: 'Smart aging product service system',
    year: 2025, category: '产品设计', medium: 'Eldercare memory keeper',
    shell: 'milky', palette: ['#f5e8d2', '#a87538', '#3a1f0a'], materialPreset: 'milky-translucent',
    cover: '/archive/works/hearloom-01.jpg', coverWorkId: 'hearloom-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#a87538', spineColor: '#3a1f0a', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.6 },
    descriptionZh: '一台智能留声机 + APP，让家中的声音被留住、被回忆、被分享。',
    descriptionEn: 'A smart voice-loom and companion app that keeps, recalls and shares a family\'s voices.',
    seriesStoryZh: [
      '由一台实木留声机硬件、配套 APP、AI 语音通话与一组记忆卡片组成，作为代际之间的情感桥梁——把家庭记忆集中到同一张桌面。',
    ],
    seriesStoryEn: [],
    processZh: '产品服务系统 · 智能留声机',
    processEn: 'Product service system · voice-loom',
    status: 'published', order: 4,
    works: [
      work('hearloom', 1, '', '', '/archive/works/hearloom-01.jpg', '一台智能留声机搭配 APP、AI 语音通话与记忆卡片，作为代际之间的情感桥梁。让家中声音被留住、被回忆、被分享——为 1.6 亿独居老人搭一条通往家的小路。', ''),
      work('hearloom', 2, '发现问题', 'PROBLEM', '/archive/works/hearloom-02.jpg', '1.6 亿独居老人：超过半数日常照顾靠自己。', '160 million seniors living alone — more than half care for themselves daily.'),
      work('hearloom', 3, '用户研究', 'RESEARCH', '/archive/works/hearloom-03.jpg', '面向老人与子女两端的访谈洞察。', 'Insight from interviews with both elders and adult children.'),
      work('hearloom', 4, '系统蓝图', 'BLUEPRINT', '/archive/works/hearloom-04.jpg', '硬件 + APP + AI + 记忆卡片的服务蓝图。', 'Service blueprint: hardware, app, AI and memory cards.'),
      work('hearloom', 5, '硬件造型', 'OBJECT', '/archive/works/hearloom-05.jpg', '实木与皮革质感的留声机主机。', 'Wood-and-leather voice-loom main unit.'),
      work('hearloom', 6, 'APP 界面', 'APP', '/archive/works/hearloom-06.jpg', '家声、电台、画廊三大主界面。', 'Three main screens: Voices, Radio, Gallery.'),
      work('hearloom', 7, '记忆卡片', 'CARDS', '/archive/works/hearloom-07.jpg', '可拍照的小卡片，让一段声音被看见。', 'Pocket-size cards that turn a voice into something visible.'),
      work('hearloom', 8, '收音流程', 'RECORD', '/archive/works/hearloom-08.jpg', '一键录音与云端同步流程示意。', 'One-tap recording and cloud sync flow.'),
      work('hearloom', 9, '聆听场景', 'SCENE', '/archive/works/hearloom-09.jpg', '老人独自收听与家庭共听场景。', 'Solo listening and shared family listening scenes.'),
      work('hearloom', 10, '情感桥梁', 'BRIDGE', '/archive/works/hearloom-10.jpg', '把相隔两地的声音拉到同一张桌面。', 'Pulling distant voices onto the same tabletop.'),
    ],
  },
  {
    id: 'kol-rain', slug: 'kol-rain',
    titleZh: 'KOL运营项目', titleEn: 'The Sound of Rain',
    subtitleZh: '听下雨的声音', subtitleEn: 'KOL social direction',
    year: 2024, category: '品牌设计', medium: 'Rainy-day KOL campaign',
    shell: 'ice', palette: ['#cad6e2', '#3e6a8a', '#0e2238'], materialPreset: 'ice-blue-glass',
    cover: '/archive/works/kol-rain-01.jpg', coverWorkId: 'kol-rain-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'graphite', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#3e6a8a', spineColor: '#0e2238', trayTone: 'graphite', hardwareTone: 'silver', colorIntensity: 0.55 },
    descriptionZh: '把雨天、伞、咖啡馆和一座城，串成一段 KOL 的步行直播。',
    descriptionEn: 'A KOL direction that strings rain, umbrellas, a café and one city into a single walk.',
    seriesStoryZh: [
      '以"听下雨的声音"为线索，把模特的步态、店铺玻璃上的雾气、雨滴在伞面上的节奏，串成一条 KOL 直播式的步行片。',
    ],
    seriesStoryEn: [],
    processZh: '运营内容 · 步行直播',
    processEn: 'Editorial · walking live',
    status: 'published', order: 5,
    works: [
      work('kol-rain', 1, '', '', '/archive/works/kol-rain-01.jpg', '一组雨天氛围感的 KOL 方向：从咖啡馆玻璃上的水珠、河岸撑起的透明伞，到街尾的一座桥。把模特的步态与雨滴节奏串成一段可游走的视觉故事。', ''),
      work('kol-rain', 2, '雨天切片', 'RAIN MOMENTS', '/archive/works/kol-rain-02.jpg', '从咖啡馆到桥的另一头，一组雨天切片。', 'A series of rain moments from the café to the bridge.'),
      work('kol-rain', 3, '店铺细节', 'CAFÉ', '/archive/works/kol-rain-03.jpg', '水珠沿玻璃滑落、菜单牌与一杯热饮。', 'Droplets on glass, a menu card and a hot drink.'),
      work('kol-rain', 4, '河岸结尾', 'RIVER', '/archive/works/kol-rain-04.jpg', '镜头回到伞下，把雨收成一句结尾。', 'Camera returns under the umbrella — the rain closes the reel.'),
    ],
  },
  {
    id: 'lvmh-mu', slug: 'lvmh-mu',
    titleZh: 'LVMH', titleEn: 'LVMH',
    subtitleZh: 'Makeup forever', subtitleEn: '× MAKE UP FOR EVER',
    year: 2024, category: '实习项目', medium: 'Co-branded cosmetic visual',
    shell: 'amber', palette: ['#f5d2c2', '#c25a4e', '#3a0c0a'], materialPreset: 'amber-resin',
    cover: '/archive/works/lvmh-mu-01.jpg', coverWorkId: 'lvmh-mu-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#c25a4e', spineColor: '#3a0c0a', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.7 },
    descriptionZh: '把哑光、闪片、金属三种质地放进同一支口红礼盒。',
    descriptionEn: 'A matte / shimmer / metallic trio inside one co-branded lip kit.',
    seriesStoryZh: [
      '为联名礼盒做一组产品级广告视觉，集合哑光、闪片、金属三种质地；定制铰链机构保证耐用与一致性使用感受。',
    ],
    seriesStoryEn: [],
    processZh: '美妆广告 · 联名礼盒',
    processEn: 'Beauty campaign · co-branded kit',
    status: 'published', order: 6,
    works: [
      work('lvmh-mu', 1, '', '', '/archive/works/lvmh-mu-01.jpg', '联名礼盒广告级视觉，哑光 / 闪片 / 金属三质地同框。黑色 ABS 标定外壳与烫金金属牌由定制铰链联接——让每一支礼盒既可佩戴也可赠送。', ''),
      work('lvmh-mu', 2, 'CMF 与材质', 'CMF', '/archive/works/lvmh-mu-02.jpg', '黑色 ABS、烫金金属与高显色眼影的 CMF 拆解。', 'A breakdown of black ABS, gold metal and high-pigment shadow.'),
      work('lvmh-mu', 3, '产品结构', 'STRUCTURE', '/archive/works/lvmh-mu-03.jpg', '礼盒分层结构与铰链细节展示。', 'Layered structure and hinge detail of the kit.'),
    ],
  },
  {
    id: 'nike-converse', slug: 'nike-converse',
    titleZh: 'NIKE', titleEn: 'NIKE',
    subtitleZh: 'CONVERSE CHUNK 70', subtitleEn: '× CONVERSE CHUNK 70',
    year: 2024, category: '实习项目', medium: 'Sneaker collaboration visual',
    shell: 'clear', palette: ['#e8e4d8', '#3a3a3a', '#080808'], materialPreset: 'clear-acrylic',
    cover: '/archive/works/nike-converse-01.jpg', coverWorkId: 'nike-converse-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'graphite', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#3a3a3a', spineColor: '#080808', trayTone: 'graphite', hardwareTone: 'silver', colorIntensity: 0.6 },
    descriptionZh: 'HO26 CONS × MATSUI 联名鞋型，一双鞋做成的 2026 春夏 Social Plan。',
    descriptionEn: 'HO26 CONS × MATSUI sneaker visual, used as the SS26 social plan.',
    seriesStoryZh: [
      '一双联名鞋型承担起 NIKE 2026 春夏 Social Plan 的主视觉；鞋面同时压制三种视觉故事——图章 / 涂鸦 / 撕裂，串成一条贯穿春夏的 campaign 线索。',
    ],
    seriesStoryEn: [],
    processZh: '鞋类 campaign · 社交计划',
    processEn: 'Footwear campaign · social plan',
    status: 'published', order: 7,
    works: [
      work('nike-converse', 1, '', '', '/archive/works/nike-converse-01.jpg', 'CONS × MATSUI 联名鞋型承担 NIKE 2026 春夏 Social Plan 主视觉。三种鞋面故事——图章、涂鸦、撕裂——把复古球鞋磨损与地域涂鸦串成一条贯穿 campaign 的视觉线索。', ''),
      work('nike-converse', 2, '社交计划', 'SOCIAL PLAN', '/archive/works/nike-converse-02.jpg', '围绕复古磨损、二次拼贴、地域涂鸦展开。', 'Worn sneakers, collage and regional graffiti.'),
      work('nike-converse', 3, '细节', 'DETAIL', '/archive/works/nike-converse-03.jpg', '鞋面三种视觉故事的细节图。', 'Detail shots of the three visual stories.'),
      work('nike-converse', 4, '造型 1', 'LOOK 1', '/archive/works/nike-converse-04.jpg', '街头造型一：图章版鞋型搭配。', 'Street look 1: stamp edition pair.'),
      work('nike-converse', 5, '造型 2', 'LOOK 2', '/archive/works/nike-converse-05.jpg', '街头造型二：涂鸦版鞋型搭配。', 'Street look 2: graffiti edition pair.'),
      work('nike-converse', 6, '造型 3', 'LOOK 3', '/archive/works/nike-converse-06.jpg', '街头造型三：撕裂版鞋型搭配。', 'Street look 3: tear edition pair.'),
      work('nike-converse', 7, 'campaign 视觉', 'CAMPAIGN', '/archive/works/nike-converse-07.jpg', 'campaign 衍生海报与社媒头图。', 'Campaign posters and social headers.'),
      work('nike-converse', 8, '结案', 'RECAP', '/archive/works/nike-converse-08.jpg', 'campaign 完结回顾与数据卡。', 'Campaign recap and metrics card.'),
    ],
  },
  {
    id: 'ripple-vase', slug: 'ripple-vase',
    titleZh: 'Rotating rotary rippling', titleEn: 'Rotary Ripple',
    subtitleZh: '大报恩寺文创', subtitleEn: 'Dabao\'en Temple cultural creation',
    year: 2025, category: '文创设计', medium: 'Rotary ceramic diffuser',
    shell: 'amber', palette: ['#f0d4a2', '#a8642a', '#2e1408'], materialPreset: 'amber-resin',
    cover: '/archive/works/ripple-vase-01.jpg', coverWorkId: 'ripple-vase-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#a8642a', spineColor: '#2e1408', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.7 },
    descriptionZh: '一只会"旋转"的玻璃精油扩香器，把水波、蜻蜓与木托盘同步到桌面。',
    descriptionEn: 'A glass rotary diffuser that turns dragonfly, water-ripple and a wood tray into one tabletop.',
    seriesStoryZh: [
      '取大报恩寺琉璃塔、风铃与蜻蜓纹样，做成一台可旋转的桌面精油扩香器——一只会"旋出涟漪"的玻璃器。',
    ],
    seriesStoryEn: [],
    processZh: '文创 · 旋转精油扩香器',
    processEn: 'Cultural creation · rotary diffuser',
    status: 'published', order: 8,
    works: [
      work('ripple-vase', 1, '', '', '/archive/works/ripple-vase-01.jpg', '一只可旋转的玻璃精油扩香器，取大报恩寺琉璃塔、风铃与蜻蜓意象，做成会旋出涟漪的桌面物件。五步使用：取件、安装、加精油、按旋转、看涟漪。', ''),
      work('ripple-vase', 2, '使用五步', 'USAGE', '/archive/works/ripple-vase-02.jpg', '取件 → 安装 → 精油 → 旋转 → 看涟漪。', 'Five steps from unboxing to ripple.'),
      work('ripple-vase', 3, '拆件结构', 'PARTS', '/archive/works/ripple-vase-03.jpg', '玻璃 + 实木 + 金属三件结构的拆解图。', 'An exploded view of glass, wood and metal parts.'),
      work('ripple-vase', 4, '场景 1', 'SCENE 1', '/archive/works/ripple-vase-04.jpg', '单人茶席中的使用场景。', 'Use scene at a single-person tea table.'),
      work('ripple-vase', 5, '场景 2', 'SCENE 2', '/archive/works/ripple-vase-05.jpg', '双人茶席中的使用场景。', 'Use scene at a two-person tea table.'),
      work('ripple-vase', 6, '场景 3', 'SCENE 3', '/archive/works/ripple-vase-06.jpg', '侧光下的空状态静物。', 'Static object under side light, at rest.'),
      work('ripple-vase', 7, '细节', 'DETAIL', '/archive/works/ripple-vase-07.jpg', '玻璃外壁纹理与木托盘细节。', 'Glass wall texture and wood tray detail.'),
    ],
  },
  {
    id: 'star-chasing', slug: 'star-chasing',
    titleZh: 'Star chasing', titleEn: 'Star chasing',
    subtitleZh: '基于五感的自闭症儿童玩具设计', subtitleEn: 'A five-sense toy for autistic children',
    year: 2025, category: '产品设计', medium: 'Multi-sense toy',
    shell: 'dichroic', palette: ['#cad4e2', '#5a6a8a', '#0e1830'], materialPreset: 'dichroic-film',
    cover: '/archive/works/star-chasing-01.jpg', coverWorkId: 'star-chasing-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#5a6a8a', spineColor: '#0e1830', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.65 },
    descriptionZh: '一份面向 4–9 岁轻度自闭症儿童的玩具设计，把视、听、触、嗅、动都收进一颗"行星"。',
    descriptionEn: '',
    seriesStoryZh: [
      '面向 4–9 岁的轻度自闭症儿童，设计通过合理 CMF 把视、听、触、嗅、动都收进一颗"行星"玩具——底座为迷宫星球，上层为可移动的轨迹星图。',
    ],
    seriesStoryEn: [],
    processZh: '玩具设计 · 五感综合',
    processEn: 'Toy design · multi-sense',
    status: 'published', order: 9,
    works: [
      work('star-chasing', 1, '', '', '/archive/works/star-chasing-01.jpg', '面向 4–9 岁轻度自闭症儿童的玩具设计：把视、听、触、嗅、动收进一颗"行星"。底座迷宫 + 上层轨迹星图，玩中完成对空间、逻辑、认知的小练习——安全、耐用、易清洁。', ''),
      work('star-chasing', 2, '用户画像与 CMF', 'PERSONA & CMF', '/archive/works/star-chasing-02.jpg', '面向 4–9 岁儿童的人群定位与 CMF 分析。', 'Persona (4–9 year-olds) and CMF analysis.'),
      work('star-chasing', 3, '玩具结构', 'STRUCTURE', '/archive/works/star-chasing-03.jpg', '底座星球 + 上层轨迹星图的双层结构。', 'Two-layer structure: planet base + track sky-chart.'),
      work('star-chasing', 4, '玩程', 'PLAY FLOW', '/archive/works/star-chasing-04.jpg', '儿童玩耍时的几个关键动线。', 'Key play traces when a child uses the toy.'),
      work('star-chasing', 5, '收尾', 'TAKEAWAY', '/archive/works/star-chasing-05.jpg', '一份关于"玩即练习"的小结论。', 'A short close: play as practice.'),
    ],
  },
  {
    id: 'your-puppy', slug: 'your-puppy',
    titleZh: 'Your Puppy', titleEn: 'Your Puppy',
    subtitleZh: '上海凡爱宠物用品合作', subtitleEn: 'Pet product · award-winning',
    year: 2024, category: '宠物设计', medium: 'Award-winning puppy toy',
    shell: 'amber', palette: ['#f6dcac', '#d28238', '#5a2c14'], materialPreset: 'amber-resin',
    cover: '/archive/works/your-puppy-01.jpg', coverWorkId: 'your-puppy-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#d28238', spineColor: '#5a2c14', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.7 },
    descriptionZh: '一只甜甜圈形的狗食环，让小狗的餐桌成为家里的"小甜品工厂"。',
    descriptionEn: '',
    seriesStoryZh: [
      '一只甜甜圈形的狗食环，由"果酱"和"面包圈"两部分组成——面包圈分成四仓格分装不同口味的狗粮，不规则波浪"果酱"通过滑动控制流量，整体营造 Z 世代小狗与主人的"甜品制造"桌面场景。',
    ],
    seriesStoryEn: [],
    processZh: '宠物产品 · 获奖作品',
    processEn: 'Pet product · award-winning',
    status: 'published', order: 10,
    works: [
      work('your-puppy', 1, '', '', '/archive/works/your-puppy-01.jpg', '一只甜甜圈形的狗食环，由"果酱"和"面包圈"两件组成。面包圈分成四仓格分装不同口味的狗粮，不规则波浪"果酱"滑动控制流量——为 Z 世代小狗与主人营造"甜品制造"的桌面场景。', ''),
      work('your-puppy', 2, '品牌分析', 'BRAND', '/archive/works/your-puppy-02.jpg', 'Casual / Natural / Cool / Classic 四象限色彩定位。', 'Colour positioning across Casual, Natural, Cool and Classic.'),
      work('your-puppy', 3, '造型', 'FORM', '/archive/works/your-puppy-03.jpg', '"果酱 + 面包圈"两件结构与材质选择。', '"Jam + bread-ring" two-piece structure and material choices.'),
      work('your-puppy', 4, '场景', 'SCENE', '/archive/works/your-puppy-04.jpg', '家中场景、生活方式模拟。', 'In-home usage scenes and lifestyle stills.'),
      work('your-puppy', 5, '成品', 'FINAL', '/archive/works/your-puppy-05.jpg', '4 种口味仓格与不规则果酱最终成片。', 'Final shots of the four-compartment ring with irregular jam.'),
    ],
  },
  {
    id: 'one-flower', slug: 'one-flower',
    titleZh: '一花一世界', titleEn: '一花一世界',
    subtitleZh: '大报恩寺文创', subtitleEn: 'Dabao\'en Temple cultural creation',
    year: 2025, category: '文创设计', medium: 'Plum-blossom scent set',
    shell: 'smoked', palette: ['#dcc4a8', '#7a4a28', '#1e1208'], materialPreset: 'smoked-glass',
    cover: '/archive/works/one-flower-01.jpg', coverWorkId: 'one-flower-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#7a4a28', spineColor: '#1e1208', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.55 },
    descriptionZh: '一朵梅花对应春夏秋冬——一支香薰礼盒，把南京一年的气味放在一块。',
    descriptionEn: '',
    seriesStoryZh: [
      '梅花五瓣寓意"五福"：快乐、幸运、长寿、和谐、平安。一只梅花金烛台 + 四枚季节香薰蜡片组成礼盒——春(莲花) / 夏(莫愁女) / 秋(银杏) / 冬(大报恩寺塔)。蜡片可独立放置。',
    ],
    seriesStoryEn: [],
    processZh: '文创 · 城市之花香薰礼盒',
    processEn: 'Cultural creation · city-flower scent set',
    status: 'published', order: 11,
    works: [
      work('one-flower', 1, '', '', '/archive/works/one-flower-01.jpg', '一朵梅花对应春夏秋冬：一只梅花金烛台 + 四枚季节香薰蜡片组成金陵四季礼盒。梅花五瓣寓意"五福"——蜡片可入烛台点燃，也可独立放在床头，把一年的气味打包到一只抽屉。', ''),
      work('one-flower', 2, '礼盒展开', 'UNBOX', '/archive/works/one-flower-02.jpg', '礼盒展开后的全组合结构。', 'Full assembly once the box is opened.'),
      work('one-flower', 3, '品牌分析', 'BRAND', '/archive/works/one-flower-03.jpg', '梅花五瓣 + 春/夏/秋/冬意象提取。', 'Plum five-petal motif across the four seasons.'),
      work('one-flower', 4, '单品 1', 'SINGLE 1', '/archive/works/one-flower-04.jpg', '梅花烛台单独使用示意。', 'Plum candleholder, used on its own.'),
      work('one-flower', 5, '单品 2', 'SINGLE 2', '/archive/works/one-flower-05.jpg', '单枚香薰蜡片的使用场景。', 'A single wax melt in use.'),
      work('one-flower', 6, '陈列', 'DISPLAY', '/archive/works/one-flower-06.jpg', '礼盒在三段店面陈列中的姿态。', 'Three store-display positions.'),
      work('one-flower', 7, '获奖', 'AWARDS', '/archive/works/one-flower-07.jpg', '东方设计奖国赛获奖作品卡。', 'Award card — Oriental Design Award national finalist.'),
    ],
  },
  {
    id: 'cactus-bite', slug: 'cactus-bite',
    titleZh: '仙人掌啃咬套装', titleEn: '仙人掌啃咬套装',
    subtitleZh: '上海凡爱宠物用品合作', subtitleEn: 'Pet product · outdoor dispenser',
    year: 2024, category: '宠物设计', medium: 'Cactus-shaped chew toy',
    shell: 'paleIce', palette: ['#d8e8c8', '#5a8a3c', '#143210'], materialPreset: 'frosted-acrylic',
    cover: '/archive/works/cactus-bite-01.jpg', coverWorkId: 'cactus-bite-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#5a8a3c', spineColor: '#143210', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.6 },
    descriptionZh: '户外随行宠物饮水三件套：橙子、草莓、梨——瓶壁的纹路取自三只水果的剖面。',
    descriptionEn: '',
    seriesStoryZh: [
      '仙人掌啃咬套装：户外随行宠物饮水三件套——造型为橙、草莓、梨三种水果。瓶壁纹理取自对应水果的剖面，瓶口配密封胶圈不漏，挂绳挂背包或腰间。',
    ],
    seriesStoryEn: [],
    processZh: '宠物产品 · 户外饮水器',
    processEn: 'Pet product · outdoor dispenser',
    status: 'published', order: 12,
    works: [
      work('cactus-bite', 1, '', '', '/archive/works/cactus-bite-01.jpg', '仙人掌啃咬套装：户外随行宠物饮水三件套——橙、草莓、梨三种水果造型。瓶壁纹理取自水果剖面，瓶口配密封胶圈不漏，挂绳挂背包腰间，憨厚轻便。', ''),
      work('cactus-bite', 2, '说明与用途', 'USAGE', '/archive/works/cactus-bite-02.jpg', '杯壁纹理灵感说明 + 户外随行使用示意。', 'Texture rationale plus outdoor in-use shots.'),
      work('cactus-bite', 3, '细节 1', 'DETAIL 1', '/archive/works/cactus-bite-03.jpg', '瓶壁剖面纹理近景。', 'Close-up of the cross-section texture.'),
      work('cactus-bite', 4, '细节 2', 'DETAIL 2', '/archive/works/cactus-bite-04.jpg', '密封胶圈与挂绳细节。', 'Sealed gasket and lanyard detail.'),
      work('cactus-bite', 5, '场景', 'SCENE', '/archive/works/cactus-bite-05.jpg', '草地、客厅、户外三种使用场景。', 'Three use scenes: lawn, living room, outdoors.'),
      work('cactus-bite', 6, '配色', 'COLOUR', '/archive/works/cactus-bite-06.jpg', '橙 / 桃粉 / 柠檬黄三种主色卡。', 'Orange / peach-pink / lemon-yellow colour cards.'),
    ],
  },
  {
    id: 'millennia-cup', slug: 'millennia-cup',
    titleZh: '千年对望快客杯', titleEn: '千年对望快客杯',
    subtitleZh: '大报恩寺文创', subtitleEn: 'Dabao\'en Temple cultural creation',
    year: 2025, category: '文创设计', medium: 'Portable quick-cup tea set',
    shell: 'amber', palette: ['#f0d2a2', '#a86a28', '#2e1408'], materialPreset: 'amber-resin',
    cover: '/archive/works/millennia-cup-01.jpg', coverWorkId: 'millennia-cup-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#a86a28', spineColor: '#2e1408', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.7 },
    descriptionZh: '基于大报恩寺琉璃塔的快客杯，让玻璃与陶瓷在一杯里对望千年。',
    descriptionEn: '',
    seriesStoryZh: [
      '基于大报恩寺设计的便携式户外茶套装：茶盖与茶壶提炼自琉璃塔形态，茶漏为莲花盛开，盖钮模仿塔上风铃。玻璃与陶瓷结合，热水注入后茶汤由透明渐变为琉璃琥珀——像新旧两塔的千年对望。',
    ],
    seriesStoryEn: [],
    processZh: '文创 · 便携快客杯',
    processEn: 'Cultural creation · portable quick-cup',
    status: 'published', order: 13,
    works: [
      work('millennia-cup', 1, '', '', '/archive/works/millennia-cup-01.jpg', '基于大报恩寺设计的便携式户外茶套装：茶盖与茶壶提炼自琉璃塔形态，茶漏为莲花盛开，盖钮模仿塔上风铃。玻璃与陶瓷结合，热水注入后茶汤由透明渐变为琉璃琥珀——像新旧两塔的千年对望。', ''),
      work('millennia-cup', 2, '设计说明', 'DESCRIPTION', '/archive/works/millennia-cup-02.jpg', '茶盖、茶壶、茶漏三件元素的提取说明。', 'Extraction note for the three-piece form.'),
      work('millennia-cup', 3, '沙漏古今', 'SANDGLASS', '/archive/works/millennia-cup-03.jpg', '随热水注入，颜色渐变为琉璃琥珀。', 'Brew colour shifts into glazed amber.'),
      work('millennia-cup', 4, '场景 1', 'SCENE 1', '/archive/works/millennia-cup-04.jpg', '露营场景下的快客杯使用。', 'Use at a campsite.'),
      work('millennia-cup', 5, '场景 2', 'SCENE 2', '/archive/works/millennia-cup-05.jpg', '办公桌上的快客杯单人茶席。', 'Single-person tea at a desk.'),
      work('millennia-cup', 6, '材质', 'MATERIAL', '/archive/works/millennia-cup-06.jpg', '玻璃与陶瓷结合处的材质细节。', 'Material detail where glass meets porcelain.'),
    ],
  },
  {
    id: 'paulownia-roots', slug: 'paulownia-roots',
    titleZh: '桐心同源', titleEn: '桐心同源',
    subtitleZh: '东方设计奖国家级获奖作品', subtitleEn: 'National Oriental Design Award winner',
    year: 2024, category: '文创设计', medium: 'National Oriental Design Award winner',
    shell: 'amber', palette: ['#f5e0bc', '#a87a32', '#2e1a08'], materialPreset: 'amber-resin',
    cover: '/archive/works/paulownia-roots-01.jpg', coverWorkId: 'paulownia-roots-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#a87a32', spineColor: '#2e1a08', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.7 },
    descriptionZh: '基于客家文化，桐花 + 围龙屋 + 温感变色釉——倒热水，杯色从米变粉。',
    descriptionEn: '',
    seriesStoryZh: [
      '基于客家文化的温感变色桐花茶具套装：茶盘提炼围龙屋屋顶形态，茶壶与茶杯取自客家代表花"桐花"。注入热水时陶瓷由暖米渐变为桐花淡粉色——东方设计奖国家级获奖作品。',
    ],
    seriesStoryEn: [],
    processZh: '文创 · 温感变色茶具',
    processEn: 'Cultural creation · thermochromic tea set',
    status: 'published', order: 14,
    works: [
      work('paulownia-roots', 1, '', '', '/archive/works/paulownia-roots-01.jpg', '基于客家文化的温感变色桐花茶具套装：茶盘提炼围龙屋屋顶形态，茶壶与茶杯取自客家代表花"桐花"。注入热水时陶瓷由暖米渐变为桐花淡粉色——东方设计奖国家级获奖作品。', ''),
      work('paulownia-roots', 2, '元素提取', 'ELEMENTS', '/archive/works/paulownia-roots-02.jpg', '桐花 + 围龙屋元素提取说明。', 'Extraction note: paulownia + Weilong house.'),
      work('paulownia-roots', 3, '设计说明', 'DESCRIPTION', '/archive/works/paulownia-roots-03.jpg', '温感变色釉的产品设计说明。', 'Product description of the thermochromic glaze.'),
      work('paulownia-roots', 4, '三视图', 'VIEWS', '/archive/works/paulownia-roots-04.jpg', '茶盘 / 茶壶 / 茶杯三视图与尺寸图。', 'Orthographic views and dimensions.'),
    ],
  },
  {
    id: 'fruit-set', slug: 'fruit-set',
    titleZh: '水果系列', titleEn: '水果系列',
    subtitleZh: '上海凡爱宠物用品合作', subtitleEn: 'Pet product · chew toy',
    year: 2024, category: '宠物设计', medium: 'Fruit-shape chew toy set',
    shell: 'amber', palette: ['#f6e4b4', '#d68a3a', '#5a2010'], materialPreset: 'amber-resin',
    cover: '/archive/works/fruit-set-01.jpg', coverWorkId: 'fruit-set-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#d68a3a', spineColor: '#5a2010', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.7 },
    descriptionZh: '水果切面纹理做的宠物啃咬玩具——橙、莓、梨三种口味分别对应三种啃法。',
    descriptionEn: '',
    seriesStoryZh: [
      '水果系列宠物啃咬玩具：橙、莓、梨三种基本形。每件咬面做了对应水果剖面纹理，材质为食品级硅胶与天然橡胶，可水洗。',
    ],
    seriesStoryEn: [],
    processZh: '宠物产品 · 啃咬玩具',
    processEn: 'Pet product · chew toy',
    status: 'published', order: 15,
    works: [
      work('fruit-set', 1, '', '', '/archive/works/fruit-set-01.jpg', '水果系列宠物啃咬玩具：橙、莓、梨三种基本形。每件咬面做了对应水果剖面纹理——既能刺激狗的抓握，也让啃咬这件事不再无聊。食品级硅胶与天然橡胶，可水洗。', ''),
      work('fruit-set', 2, '橙', 'ORANGE', '/archive/works/fruit-set-02.jpg', '橙味啃咬玩具：柑橘剖面纹理。', 'Orange chew toy with citrus-section texture.'),
      work('fruit-set', 3, '莓', 'BERRY', '/archive/works/fruit-set-03.jpg', '莓味啃咬玩具：草莓剖面纹理。', 'Berry chew toy with strawberry cross-section.'),
      work('fruit-set', 4, '梨', 'PEAR', '/archive/works/fruit-set-04.jpg', '梨味啃咬玩具：梨剖面纹理。', 'Pear chew toy with pear cross-section.'),
      work('fruit-set', 5, '陈列', 'DISPLAY', '/archive/works/fruit-set-05.jpg', '店面陈列与色彩组合卡。', 'Store display and colour combination card.'),
    ],
  },
  {
    id: 'lantern-cat-toy', slug: 'lantern-cat-toy',
    titleZh: '灯笼开口喵喵笑', titleEn: '灯笼开口喵喵笑',
    subtitleZh: '上海凡爱宠物用品合作', subtitleEn: 'Pet product · transformable toy',
    year: 2024, category: '宠物设计', medium: 'Lantern cat toy set',
    shell: 'amber', palette: ['#f6d6a8', '#e8663c', '#5a1410'], materialPreset: 'amber-resin',
    cover: '/archive/works/lantern-cat-toy-01.jpg', coverWorkId: 'lantern-cat-toy-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#e8663c', spineColor: '#5a1410', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.72 },
    descriptionZh: '灯笼造型的猫玩具，可上下变形为逗猫棒、可打开做漏食球。',
    descriptionEn: '',
    seriesStoryZh: [
      '灯笼造型的猫玩具：上下两端可分别脱开形成不同弧形曲线作逗猫棒；也可取下棒头、打开活塞倒入猫粮，中间圆筒变漏食球，侧面拨杆和圆孔调整出粮节奏——NCDA 与东方设计奖获奖作品。',
    ],
    seriesStoryEn: [],
    processZh: '宠物产品 · 变形玩具',
    processEn: 'Pet product · transformable toy',
    status: 'published', order: 16,
    works: [
      work('lantern-cat-toy', 1, '', '', '/archive/works/lantern-cat-toy-01.jpg', '灯笼造型的猫玩具：上下两端可脱开形成不同弧形曲线作逗猫棒；也可取下棒头、打开活塞倒入猫粮，中间圆筒变漏食球，侧面拨杆调整出粮节奏——NCDA 与东方设计奖获奖作品。', ''),
      work('lantern-cat-toy', 2, '用法 1', 'USE 1', '/archive/works/lantern-cat-toy-02.jpg', '上下两端脱开 → 弧线变化 → 逗猫。', 'Detach ends → curve variations → teaser.'),
      work('lantern-cat-toy', 3, '用法 2', 'USE 2', '/archive/works/lantern-cat-toy-03.jpg', '打开活塞 → 倒入猫粮 → 漏食滚动。', 'Open piston → add treats → roll and dispense.'),
      work('lantern-cat-toy', 4, '获奖', 'AWARDS', '/archive/works/lantern-cat-toy-04.jpg', 'NCDA / 东方设计奖获奖作品卡。', 'NCDA / Oriental Design Award card.'),
    ],
  },
  {
    id: 'liuli-scent', slug: 'liuli-scent',
    titleZh: '琉璃香', titleEn: '琉璃香',
    subtitleZh: '大报恩寺文创', subtitleEn: 'Dabao\'en Temple cultural creation',
    year: 2025, category: '文创设计', medium: 'Glass aroma diffuser series',
    shell: 'frosted', palette: ['#dde6e8', '#5a8aa8', '#0e2638'], materialPreset: 'frosted-acrylic',
    cover: '/archive/works/liuli-scent-01.jpg', coverWorkId: 'liuli-scent-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#5a8aa8', spineColor: '#0e2638', trayTone: 'graphite', hardwareTone: 'silver', colorIntensity: 0.6 },
    descriptionZh: '蓝、黄、粉三只玻璃小瓶，做成一只台式小香薰。',
    descriptionEn: '',
    seriesStoryZh: [
      '南京大报恩寺文创落地项目：蓝、黄、粉三只玻璃小瓶做一只台式香薰。瓶身取琉璃塔造型语言：宝蓝、琥珀、粉彩三色对应三种复合香气；白色瓷质顶盖可滴精油，让香气自上而下慢溢。',
    ],
    seriesStoryEn: [],
    processZh: '文创 · 玻璃香薰三件',
    processEn: 'Cultural creation · glass aroma trio',
    status: 'published', order: 17,
    works: [
      work('liuli-scent', 1, '', '', '/archive/works/liuli-scent-01.jpg', '南京大报恩寺文创落地项目：蓝、黄、粉三只玻璃小瓶做一只台式香薰。瓶身取琉璃塔造型语言——宝蓝、琥珀、粉彩三色对应三种复合香气；白色瓷质顶盖可滴精油，让香气自上而下慢溢。', ''),
      work('liuli-scent', 2, '色彩语言', 'PALETTE', '/archive/works/liuli-scent-02.jpg', '琉璃蓝 / 琉璃琥珀 / 琉璃粉彩三色对照。', 'Glazed blue / amber / powder colour study.'),
      work('liuli-scent', 3, '瓶身细节', 'BOTTLE', '/archive/works/liuli-scent-03.jpg', '塔纹瓶身与顶盖瓷球细节。', 'Pagoda-textured wall and porcelain cap detail.'),
      work('liuli-scent', 4, '使用 1', 'USE 1', '/archive/works/liuli-scent-04.jpg', '单人桌面使用场景。', 'Single-bottle use on a desk.'),
      work('liuli-scent', 5, '使用 2', 'USE 2', '/archive/works/liuli-scent-05.jpg', '三只并排的陈列场景。', 'Three bottles lined up in display.'),
      work('liuli-scent', 6, '香气层次', 'NOTES', '/archive/works/liuli-scent-06.jpg', '三种复合香气的层次说明。', 'Layered notes for the three blends.'),
      work('liuli-scent', 7, '落地', 'PROGRAM', '/archive/works/liuli-scent-07.jpg', '南京大报恩寺文创落地卡。', 'Programme card — Nanjing Dabao\'en Temple.'),
    ],
  },
  {
    id: 'campus-recycle', slug: 'campus-recycle',
    titleZh: '青葱校园', titleEn: '青葱校园',
    subtitleZh: '服务设计', subtitleEn: 'Campus recycling service system',
    year: 2025, category: '服务设计', medium: 'Campus recycling service',
    shell: 'paleIce', palette: ['#cfe8d4', '#3c8a5a', '#0e2e1e'], materialPreset: 'frosted-acrylic',
    cover: '/archive/works/campus-recycle-01.jpg', coverWorkId: 'campus-recycle-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'ivory', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#3c8a5a', spineColor: '#0e2e1e', trayTone: 'ivory', hardwareTone: 'silver', colorIntensity: 0.6 },
    descriptionZh: '把分类投放、智能奖励、月度排名装进一只校园 APP。',
    descriptionEn: '',
    seriesStoryZh: [
      '为高校宿舍区设计的校园垃圾回收服务系统：智能回收箱 + 校园 APP + 积分商城 + 月度青葱侠榜单。系统强调"便捷、智能分类、奖励机制、进程可视"，配"今天你分类了吗"日常提示与附近回收点导航。',
    ],
    seriesStoryEn: [],
    processZh: '服务设计 · 校园智能回收',
    processEn: 'Service design · campus recycling',
    status: 'published', order: 18,
    works: [
      work('campus-recycle', 1, '', '', '/archive/works/campus-recycle-01.jpg', '为高校宿舍区设计的校园垃圾回收服务系统：智能回收箱 + 校园 APP + 积分商城 + 月度青葱侠榜单。强调"便捷、智能分类、奖励机制、进程可视"，配"今天你分类了吗"日常提示与附近回收点导航。', ''),
      work('campus-recycle', 2, '设计流程与调研', 'FLOW & RESEARCH', '/archive/works/campus-recycle-02.jpg', '问题阐述 / 设计研究 / 设计分析 / 设计定位 / 概念发想 / 设计表达 / 产品呈现。', 'Problem framing, research, design, positioning, concept and delivery.'),
      work('campus-recycle', 3, '问卷调研结果', 'SURVEY', '/archive/works/campus-recycle-03.jpg', '期待更环保整洁 / 定期使用 / 注方便与智能。', 'Survey result — clean, frequent, smart.'),
      work('campus-recycle', 4, '用户画像', 'PERSONA', '/archive/works/campus-recycle-04.jpg', '小李 / 小花：宿舍场景与垃圾分类痛点。', 'Persona snapshots: dorm-life sorting.'),
      work('campus-recycle', 5, 'APP 主页', 'APP HOME', '/archive/works/campus-recycle-05.jpg', '"今天你分类了吗"主页与附近回收点。', '"Did you sort today?" home screen and nearby bins.'),
      work('campus-recycle', 6, '积分商城', 'SHOP', '/archive/works/campus-recycle-06.jpg', '积分兑换与月度青葱侠榜单。', 'Points shop and monthly Green Hero leaderboard.'),
      work('campus-recycle', 7, '硬件', 'HARDWARE', '/archive/works/campus-recycle-07.jpg', '西校区一号楼智能回收箱硬件图。', 'Hardware render for Building 1 west campus.'),
      work('campus-recycle', 8, '场景', 'SCENE', '/archive/works/campus-recycle-08.jpg', '宿舍投放、积分提醒、宿舍共享使用场景。', 'Drop, prompt, shared-usage scenes.'),
    ],
  },
  {
    id: 'leaf-bodhi', slug: 'leaf-bodhi',
    titleZh: '香薰蜡烛', titleEn: '香薰蜡烛',
    subtitleZh: '大报恩寺文创', subtitleEn: 'Dabao\'en Temple cultural creation',
    year: 2025, category: '文创设计', medium: 'Scented candle design',
    shell: 'amber', palette: ['#e8c890', '#9c6020', '#281408'], materialPreset: 'amber-resin',
    cover: '/archive/works/leaf-bodhi-01.jpg', coverWorkId: 'leaf-bodhi-01',
    coverFit: 'cover', coverFocus: [0.5, 0.5], coverMatte: 'graphite', coverZoom: 1,
    frameTheme: { mode: 'manual', edgeColor: '#9c6020', spineColor: '#281408', trayTone: 'graphite', hardwareTone: 'gunmetal', colorIntensity: 0.65 },
    descriptionZh: '一盏香薰蜡烛的屏风，提炼菩提叶与菩提形，点燃后烛光投影到墙上。',
    descriptionEn: '',
    seriesStoryZh: [
      '释迦于菩提树下修行得道——一叶一菩提，从一片叶子里领悟生死。设计提炼为香薰蜡烛屏风：浓重线勾菩提叶与菩提形，细线勾叶脉与佛意微缩景观；点燃后烛光穿过屏风，将景致映在墙上。',
    ],
    seriesStoryEn: [],
    processZh: '文创 · 香薰蜡烛屏风',
    processEn: 'Cultural creation · candle screen',
    status: 'published', order: 19,
    works: [
      work('leaf-bodhi', 1, '', '', '/archive/works/leaf-bodhi-01.jpg', '一盏香薰蜡烛的屏风：释迦于菩提树下修行得道——提炼为屏风。以浓重线勾出菩提叶与菩提形，细线勾叶脉与佛意微缩景观；点燃后烛光穿过屏风，将景致映在墙上。', ''),
      work('leaf-bodhi', 2, '设计灵感', 'INSPIRATION', '/archive/works/leaf-bodhi-02.jpg', '山花蕉叶内浮雕佛像的灵感来源。', 'Inspiration: relief Buddhas on banana leaves.'),
      work('leaf-bodhi', 3, '屏风局部', 'DETAIL 1', '/archive/works/leaf-bodhi-03.jpg', '屏风表面的浓重线与叶脉细节。', 'Heavy lines and leaf veins on the screen.'),
      work('leaf-bodhi', 4, '屏风局部 2', 'DETAIL 2', '/archive/works/leaf-bodhi-04.jpg', '微缩景观与佛意细节。', 'Miniature landscape and Buddhist details.'),
      work('leaf-bodhi', 5, '熄灭态', 'OFF', '/archive/works/leaf-bodhi-05.jpg', '未点燃状态的静物。', 'Unlit still life.'),
      work('leaf-bodhi', 6, '点燃态', 'LIT', '/archive/works/leaf-bodhi-06.jpg', '点燃后墙上的菩提叶投影。', 'Bodhi leaf projection when lit.'),
      work('leaf-bodhi', 7, '包装', 'PACKAGE', '/archive/works/leaf-bodhi-07.jpg', '礼盒包装与场景使用。', 'Box packaging and scene use.'),
    ],
  },
];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const relativeLuminance = (hex: string): number => {
  const normalized = hex.replace('#', '');
  if (!/^[\da-f]{6}$/i.test(normalized)) return 0.5;
  const channels = [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
};

export function resolveFrameTheme(collection: Collection): ResolvedFrameTheme {
  const theme = collection.frameTheme;
  const edgeColor = theme?.edgeColor ?? collection.palette[1];
  const spineColor = theme?.spineColor ?? collection.palette[2];
  const paletteIsDark = relativeLuminance(collection.palette[1]) < 0.34;
  return {
    mode: theme?.mode ?? 'auto',
    edgeColor,
    spineColor,
    trayTone: theme?.trayTone ?? (paletteIsDark ? 'graphite' : 'ivory'),
    hardwareTone: theme?.hardwareTone ?? (paletteIsDark ? 'gunmetal' : 'silver'),
    colorIntensity: clamp01(theme?.colorIntensity ?? 0.72),
  };
}

export function getCollectionCoverWork(collection: Collection): Work | null {
  const orderedWorks = collection.works.slice().sort((a, b) => a.order - b.order);
  return orderedWorks.find((item) => item.id === collection.coverWorkId) ?? orderedWorks[0] ?? null;
}

export interface ResolvedCollectionCover {
  image: string;
  workId: string | null;
  fit: ArtworkFit;
  focus: [number, number];
  matte: ArtworkMatte;
  zoom: number;
}

export function resolveCollectionCover(collection: Collection): ResolvedCollectionCover {
  const selectedWork = getCollectionCoverWork(collection);
  const promoteSelectedWork = Boolean(collection.coverWorkId && selectedWork);
  return {
    image: (promoteSelectedWork ? selectedWork?.image : collection.cover) || selectedWork?.image || '',
    workId: promoteSelectedWork ? selectedWork?.id ?? null : null,
    fit: collection.coverFit ?? selectedWork?.presentation?.fit ?? 'cover',
    focus: collection.coverFocus ?? selectedWork?.presentation?.focus ?? [0.5, 0.5],
    matte: collection.coverMatte ?? selectedWork?.presentation?.matte ?? 'transparent',
    zoom: Math.min(3, Math.max(0.65, collection.coverZoom ?? 1)),
  };
}

export const ALL_COLLECTIONS: Collection[] = _ALL_COLLECTIONS_RAW;
export const PUBLISHED_COLLECTIONS_RAW: Collection[] = ALL_COLLECTIONS;
export const PUBLISHED_COLLECTIONS: Collection[] = ALL_COLLECTIONS
  .filter((collection) => collection.status === 'published')
  .slice()
  .sort((a, b) => a.order - b.order);
export const DRAFT_COLLECTIONS: Collection[] = ALL_COLLECTIONS
  .filter((collection) => collection.status === 'draft')
  .slice()
  .sort((a, b) => a.order - b.order);
export const SERIES: Collection[] = PUBLISHED_COLLECTIONS;

export function getCollectionById(id: string): Collection | null {
  return ALL_COLLECTIONS.find((collection) => collection.id === id || collection.slug === id) ?? null;
}

export type Series = Collection;
export type Artwork = Work;

export const SITE = {
  name: 'KEYI',
  tagline: 'a industrial designer',
  taglineZh: '一份设计档案',
  author: 'Keyi',
  authorZh: 'KEYI',
  city: 'China',
  years: '2026 —',
  contact: '2981233226@qq.com',
  social: {
    label: 'GitHub',
    url: 'https://github.com/liukeyi534-stack',
  },
  wechat: '15802334997',
  portrait: '/archive/portrait.jpg',
  resumeUrl: '/downloads/product-research.pdf',
  about: {
    en: 'A personal archive of design units. Each entry is a single self-contained frame: a direction, a styling, a still life, a frame.',
    zh: '一份个人设计档案。每一个单元都是一张独立的画面：一次视觉指导、一次静物、一次布景、一帧。',
  },
} as const;
