// Resize real portfolio works into public/archive/works/<slug>-NN.jpg.
// Source root: F:/minimaxcode/个人网站2/作品/<作品名 x 副标题>/1.jpg|2.jpg|...
// Output:      public/archive/works/<slug>-01.jpg, <slug>-02.jpg, ...
// Each page is resized to 1800px wide, mozjpeg q82.

const path = require('node:path');
const fs = require('node:fs');

const SOURCE_ROOT = 'F:\\minimaxcode\\个人网站2\\作品';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'archive', 'works');

const naturalCompare = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

// 19 real works. For each we declare the folder name (verbatim from the source root),
// the slug, a category, a curated title pair (作品名 + 副标题),
// the 3D shell/palette/frame triple (mirror series.ts shape).
// `coverIndex` lets us pick which page is the CD-wall cover (defaults to 1).
const WORKS = [
  { folder: 'CIDER x Hello Kitty联名',                slug: 'cider-hello-kitty',   coverIndex: 1, year: 2024, category: 'Fashion collaboration',  medium: 'Co-branded apparel campaign', shell: 'dichroic', palette: ['#f6c8d8', '#e96a8a', '#5a1428'], edge: '#e96a8a', spine: '#5a1428', tone: 'ivory', hardware: 'silver', titleZh: 'CIDER × Hello Kitty 联名',          subtitleZh: 'FROM THE HEART 出自内心',   titleEn: 'CIDER × Hello Kitty',          subtitleEn: 'A fall co-branded apparel capsule' },
  { folder: 'CITY Vinwalk x 智慧养老的种植设计',        slug: 'city-vinewalk',       coverIndex: 1, year: 2024, category: 'Service design',         medium: 'Planting design for smart aging', shell: 'paleIce', palette: ['#dbe5c8', '#6a8a48', '#1e2a14'], edge: '#6a8a48', spine: '#1e2a14', tone: 'ivory', hardware: 'silver', titleZh: '城市"蔓"步',                    subtitleZh: '智慧养老的种植设计',         titleEn: 'City VineWalk',                  subtitleEn: 'Planting design for smart aging' },
  { folder: 'Emosphere x 基于情感三层次理论的模块化职场空间设计', slug: 'emosphere', coverIndex: 1, year: 2025, category: 'Spatial design',         medium: 'Modular workplace system',       shell: 'frosted', palette: ['#e2d8c8', '#8a6a48', '#2a1c12'], edge: '#8a6a48', spine: '#2a1c12', tone: 'ivory', hardware: 'silver', titleZh: 'Emosphere',                  subtitleZh: '基于情感三层次理论的模块化职场空间设计', titleEn: 'Emosphere', subtitleEn: 'A modular workplace based on emotional three-layer theory' },
  { folder: 'Hearloom x 智慧养老产品服务系统设计',      slug: 'hearloom',            coverIndex: 1, year: 2025, category: 'Service & product system', medium: 'Smart aging product service system', shell: 'milky', palette: ['#f5e8d2', '#a87538', '#3a1f0a'], edge: '#a87538', spine: '#3a1f0a', tone: 'ivory', hardware: 'silver', titleZh: 'Hearloom 听 见',                subtitleZh: '智慧养老产品服务系统设计',     titleEn: 'Hearloom',                  subtitleEn: 'An intelligent voice-loom bridging family memories' },
  { folder: 'KOL运营项目',                              slug: 'kol-rain',            coverIndex: 1, year: 2024, category: 'Editorial direction',    medium: 'KOL campaign – The Sound of Rain', shell: 'ice', palette: ['#cad6e2', '#3e6a8a', '#0e2238'], edge: '#3e6a8a', spine: '#0e2238', tone: 'graphite', hardware: 'silver', titleZh: '听下雨的声音',                  subtitleZh: 'KOL 运营项目',                  titleEn: 'The Sound of Rain',          subtitleEn: 'A KOL social-content direction' },
  { folder: 'LVMH x Makeup forever',                    slug: 'lvmh-mu',             coverIndex: 1, year: 2024, category: 'Beauty campaign',        medium: 'Co-branded cosmetic campaign',    shell: 'amber',   palette: ['#f5d2c2', '#c25a4e', '#3a0c0a'], edge: '#c25a4e', spine: '#3a0c0a', tone: 'ivory', hardware: 'gold',   titleZh: 'LVMH × MAKE UP FOR EVER',       subtitleZh: '美妆广告视觉',                 titleEn: 'LVMH × MAKE UP FOR EVER',     subtitleEn: 'A co-branded beauty visual' },
  { folder: 'NIKE x CONVERSE CHUNK 70',                 slug: 'nike-converse',       coverIndex: 1, year: 2024, category: 'Footwear campaign',      medium: 'Sneaker collaboration visual',   shell: 'clear',   palette: ['#e8e4d8', '#3a3a3a', '#080808'], edge: '#3a3a3a', spine: '#080808', tone: 'graphite', hardware: 'silver', titleZh: '履 路',                          subtitleZh: 'NIKE × CONVERSE CHUNK 70',     titleEn: 'NIKE × CONVERSE CHUNK 70',     subtitleEn: 'A footwear collaboration visual' },
  { folder: 'Rotating rotary rippling x 大报恩寺文创',   slug: 'ripple-vase',         coverIndex: 1, year: 2025, category: 'Cultural creation',      medium: 'Dabao\'en Temple souvenir design', shell: 'amber',  palette: ['#f0d4a2', '#a8642a', '#2e1408'], edge: '#a8642a', spine: '#2e1408', tone: 'ivory', hardware: 'silver', titleZh: '龙 旋',                          subtitleZh: '大报恩寺文创',                  titleEn: 'Ripple Vase',                  subtitleEn: 'A Dabao\'en Temple souvenir' },
  { folder: 'Star chasing x 基于五感的自闭症儿童玩具设计', slug: 'star-chasing',     coverIndex: 1, year: 2025, category: 'Toy & educational design', medium: 'Five-sense toy for autistic kids', shell: 'dichroic', palette: ['#cad4e2', '#5a6a8a', '#0e1830'], edge: '#5a6a8a', spine: '#0e1830', tone: 'graphite', hardware: 'silver', titleZh: '星 祺',                          subtitleZh: '基于五感的自闭症儿童玩具设计',   titleEn: 'Star Chasing',                subtitleEn: 'A five-sense toy for autistic children' },
  { folder: 'Your Puppy x 上海凡爱宠物用品合作',         slug: 'your-puppy',          coverIndex: 1, year: 2024, category: 'Pet product design',     medium: 'Award-winning puppy toy set',      shell: 'amber',   palette: ['#f6dcac', '#d28238', '#5a2c14'], edge: '#d28238', spine: '#5a2c14', tone: 'ivory', hardware: 'silver', titleZh: '你的小狗',                       subtitleZh: '上海凡爱宠物用品合作',          titleEn: 'Your Puppy',                  subtitleEn: 'NCDA & Oriental Design Award winner' },
  { folder: '一花一世界 x 大报恩寺文创',               slug: 'one-flower',          coverIndex: 1, year: 2025, category: 'Cultural creation',      medium: 'Dabao\'en Temple souvenir',         shell: 'smoked',  palette: ['#dcc4a8', '#7a4a28', '#1e1208'], edge: '#7a4a28', spine: '#1e1208', tone: 'graphite', hardware: 'gunmetal', titleZh: '一花一世界',                     subtitleZh: '大报恩寺文创',                  titleEn: 'One Flower, One World',        subtitleEn: 'A Dabao\'en Temple souvenir' },
  { folder: '仙人掌啃咬套装 x 上海凡爱宠物用品合作',     slug: 'cactus-bite',         coverIndex: 1, year: 2024, category: 'Pet product design',     medium: 'Cactus chew toy set',              shell: 'paleIce', palette: ['#d8e8c8', '#5a8a3c', '#143210'], edge: '#5a8a3c', spine: '#143210', tone: 'ivory', hardware: 'silver', titleZh: '仙人掌啃咬套装',                 subtitleZh: '上海凡爱宠物用品合作',          titleEn: 'Cactus Bite Set',             subtitleEn: 'A cactus-shaped pet chew toy' },
  { folder: '千年对望快客杯 x 大报恩寺文创',            slug: 'millennia-cup',       coverIndex: 1, year: 2025, category: 'Cultural creation',      medium: 'Dabao\'en Temple quick-cup',        shell: 'amber',   palette: ['#f0d2a2', '#a86a28', '#2e1408'], edge: '#a86a28', spine: '#2e1408', tone: 'ivory', hardware: 'silver', titleZh: '千年对望快客杯',                 subtitleZh: '大报恩寺文创',                  titleEn: 'Millennia Gaze Quick Cup',    subtitleEn: 'A Dabao\'en Temple quick-cup' },
  { folder: '桐心同源 x 东方设计奖国家级获奖作品',       slug: 'paulownia-roots',     coverIndex: 1, year: 2024, category: 'Cultural creation',      medium: 'National Oriental Design Award',   shell: 'amber',   palette: ['#f5e0bc', '#a87a32', '#2e1a08'], edge: '#a87a32', spine: '#2e1a08', tone: 'ivory', hardware: 'silver', titleZh: '桐心同源',                       subtitleZh: '东方设计奖国家级获奖作品',      titleEn: 'Paulownia Roots',             subtitleEn: 'National Oriental Design Award' },
  { folder: '水果系列 x 上海凡爱宠物用品合作',           slug: 'fruit-set',           coverIndex: 1, year: 2024, category: 'Pet product design',     medium: 'Fruit-shape pet toy set',          shell: 'amber',   palette: ['#f6e4b4', '#d68a3a', '#5a2010'], edge: '#d68a3a', spine: '#5a2010', tone: 'ivory', hardware: 'silver', titleZh: '水果系列',                       subtitleZh: '上海凡爱宠物用品合作',          titleEn: 'Fruit Pet Toy Set',           subtitleEn: 'A fruit-shape pet toy series' },
  { folder: '灯笼开口喵喵笑 x 上海凡爱宠物用品合作',     slug: 'lantern-cat-toy',     coverIndex: 1, year: 2024, category: 'Pet product design',     medium: 'Lantern cat toy set',              shell: 'amber',   palette: ['#f6d6a8', '#e8663c', '#5a1410'], edge: '#e8663c', spine: '#5a1410', tone: 'ivory', hardware: 'silver', titleZh: '灯笼猫玩具套装',                 subtitleZh: '上海凡爱宠物用品合作',          titleEn: 'Lantern Cat Toy Set',         subtitleEn: 'NCDA & Oriental Design Award winner' },
  { folder: '琉璃香 x 大报恩寺文创',                    slug: 'liuli-scent',         coverIndex: 1, year: 2025, category: 'Cultural creation',      medium: 'Dabao\'en Temple fragrance set',    shell: 'frosted', palette: ['#dde6e8', '#5a8aa8', '#0e2638'], edge: '#5a8aa8', spine: '#0e2638', tone: 'graphite', hardware: 'silver', titleZh: '琉璃香',                         subtitleZh: '大报恩寺文创',                  titleEn: 'Liuli Scent Set',             subtitleEn: 'A Dabao\'en Temple fragrance series' },
  { folder: '青葱校园 x 服务设计',                      slug: 'campus-recycle',      coverIndex: 1, year: 2025, category: 'Service design',         medium: 'Campus recycling service',         shell: 'paleIce', palette: ['#cfe8d4', '#3c8a5a', '#0e2e1e'], edge: '#3c8a5a', spine: '#0e2e1e', tone: 'ivory', hardware: 'silver', titleZh: '青葱校园',                       subtitleZh: '校园垃圾回收服务设计',           titleEn: 'Green Campus',                subtitleEn: 'A campus recycling service system' },
  { folder: '香薰蜡烛 x 大报恩寺文创',                  slug: 'leaf-bodhi',          coverIndex: 1, year: 2025, category: 'Cultural creation',      medium: 'Dabao\'en Temple scented candle',   shell: 'amber',   palette: ['#e8c890', '#9c6020', '#281408'], edge: '#9c6020', spine: '#281408', tone: 'graphite', hardware: 'gunmetal', titleZh: '一叶一菩提',                     subtitleZh: '香薰蜡烛·大报恩寺文创',          titleEn: 'One Leaf, One Bodhi',         subtitleEn: 'A Dabao\'en Temple scented candle' },
];

async function main() {
  const sharp = require('sharp');

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Clean only top-level non-backup files (keep _units/ folder).
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (file.startsWith('_')) continue;
    fs.unlinkSync(path.join(OUT_DIR, file));
  }

  const manifest = [];

  for (const work of WORKS) {
    const folder = path.join(SOURCE_ROOT, work.folder);
    if (!fs.existsSync(folder)) {
      console.error(`Missing folder: ${folder}`);
      process.exit(1);
    }
    const allFiles = fs.readdirSync(folder)
      .filter((f) => /\.(jpe?g|png)$/i.test(f));
    if (allFiles.length === 0) {
      console.error(`No images in ${folder}`);
      process.exit(1);
    }
    allFiles.sort(naturalCompare);

    console.log(`\n→ ${work.folder} (${allFiles.length} source files)`);

    const writtenNames = [];
    for (let i = 0; i < allFiles.length; i++) {
      const idx = i + 1;
      const srcPath = path.join(folder, allFiles[i]);
      const meta = await sharp(srcPath).metadata();
      const target = 1800;
      const ratio = target / meta.width;
      const newH = Math.round(meta.height * ratio);
      const outName = `${work.slug}-${String(idx).padStart(2, '0')}.jpg`;
      const outPath = path.join(OUT_DIR, outName);
      const data = await sharp(srcPath)
        .resize(target, newH, { kernel: sharp.kernel.lanczos3 })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
      fs.writeFileSync(outPath, data);
      const size = fs.statSync(outPath).size;
      writtenNames.push(outName);
      console.log(`  ${allFiles[i]} -> ${outName} (${Math.round(size / 1024)}KB, ${target}x${newH})`);
    }

    manifest.push({
      slug: work.slug,
      coverIndex: work.coverIndex,
      year: work.year,
      category: work.category,
      medium: work.medium,
      shell: work.shell,
      palette: work.palette,
      edge: work.edge,
      spine: work.spine,
      tone: work.tone,
      hardware: work.hardware,
      titleZh: work.titleZh,
      titleEn: work.titleEn,
      subtitleZh: work.subtitleZh,
      subtitleEn: work.subtitleEn,
      files: writtenNames,
    });
  }

  fs.writeFileSync(
    path.join(PROJECT_ROOT, 'scripts', '.portfolio-map.json'),
    JSON.stringify(manifest, null, 2),
  );
  console.log('\nwrote scripts/.portfolio-map.json');
}

main().catch((e) => { console.error(e); process.exit(1); });
