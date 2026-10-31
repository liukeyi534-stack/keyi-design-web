// Resize source photos for the KEYI archive.
// Reads from <projectRoot>/../简历&作品集/Slide NN.jpg,
// writes 1800px-wide JPEGs to public/archive/works/<slug>-01.jpg.
// Also processes the personal portrait (1800px tall) and copies the PDF.

const path = require('node:path');
const fs = require('node:fs');

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const sourceDir = path.resolve(projectRoot, '..', '简历&作品集');
  const outDir = path.join(projectRoot, 'public', 'archive', 'works');
  const downloadsDir = path.join(projectRoot, 'public', 'downloads');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(downloadsDir, { recursive: true });

  // ---- 21 published unit-collections from Slide 38..58 ----
  const map = [
    { src: 'Slide 38.jpg', slug: 'companion',       titleZh: '伴侣',     titleEn: 'COMPANION',      category: 'Lifestyle direction', shell: 'amber',   palette: ['#f0d4a8', '#c08a5a', '#4a2a18'], edge: '#c08a5a', spine: '#4a2a18', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 39.jpg', slug: 'coast-notes',     titleZh: '岸记',     titleEn: 'COAST NOTES',    category: 'Beauty still life',   shell: 'paleIce', palette: ['#c2d8e8', '#6a8a9a', '#2a3848'], edge: '#6a8a9a', spine: '#2a3848', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 40.jpg', slug: 'drive-sunset',    titleZh: '驶暮',     titleEn: 'DRIVE SUNSET',   category: 'Lifestyle direction', shell: 'amber',   palette: ['#f0c89a', '#a85a28', '#2a1408'], edge: '#a85a28', spine: '#2a1408', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 41.jpg', slug: 'head-clouds',     titleZh: '云首',     titleEn: 'HEAD CLOUDS',    category: 'Fashion direction',   shell: 'milky',   palette: ['#f0e8d8', '#a08770', '#3a2e22'], edge: '#a08770', spine: '#3a2e22', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 42.jpg', slug: 'gourd-light',     titleZh: '葫光',     titleEn: 'GOURD LIGHT',    category: 'Still life',          shell: 'amber',   palette: ['#f1deba', '#a87a3a', '#2a1c10'], edge: '#a87a3a', spine: '#2a1c10', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 43.jpg', slug: 'lotus-quiet',     titleZh: '莲寂',     titleEn: 'LOTUS QUIET',    category: 'Still life',          shell: 'frosted', palette: ['#d8b8c4', '#7a3a4e', '#1e1418'], edge: '#7a3a4e', spine: '#1e1418', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 44.jpg', slug: 'bamboo-glass',    titleZh: '竹器',     titleEn: 'BAMBOO GLASS',   category: 'Tabletop still life', shell: 'smoked',  palette: ['#c8b88a', '#4a6248', '#1e2418'], edge: '#4a6248', spine: '#1e2418', tone: 'graphite', hardware: 'gunmetal' },
    { src: 'Slide 45.jpg', slug: 'color-pencil',    titleZh: '彩笔',     titleEn: 'COLOR PENCIL',   category: 'Beauty campaign',     shell: 'ice',     palette: ['#d8d5e0', '#3858c0', '#0a1850'], edge: '#3858c0', spine: '#0a1850', tone: 'clear',  hardware: 'silver'  },
    { src: 'Slide 46.jpg', slug: 'tea-ritual',      titleZh: '茶事',     titleEn: 'TEA RITUAL',     category: 'Tabletop still life', shell: 'smoked',  palette: ['#c8a888', '#7a4a2c', '#28160e'], edge: '#7a4a2c', spine: '#28160e', tone: 'graphite', hardware: 'gunmetal' },
    { src: 'Slide 47.jpg', slug: 'wet-street',      titleZh: '雨行',     titleEn: 'WET STREET',     category: 'Street composition',  shell: 'paleIce', palette: ['#c9d4dc', '#4a6878', '#1e2a32'], edge: '#4a6878', spine: '#1e2a32', tone: 'graphite', hardware: 'gunmetal' },
    { src: 'Slide 48.jpg', slug: 'orange-study',    titleZh: '橙研',     titleEn: 'ORANGE STUDY',   category: 'Product still life',  shell: 'amber',   palette: ['#f8e4c0', '#d08335', '#5e2812'], edge: '#d08335', spine: '#5e2812', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 49.jpg', slug: 'warm-gift',       titleZh: '暖礼',     titleEn: 'WARM GIFT',      category: 'Lifestyle direction', shell: 'amber',   palette: ['#f5d6b3', '#c4633a', '#4a2218'], edge: '#c4633a', spine: '#4a2218', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 50.jpg', slug: 'fruit-shape',     titleZh: '果形',     titleEn: 'FRUIT SHAPE',    category: 'Product design',      shell: 'amber',   palette: ['#f4e8c0', '#d8a050', '#a83a18'], edge: '#d8a050', spine: '#a83a18', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 51.jpg', slug: 'cat-festive',     titleZh: '猫节',     titleEn: 'CAT FESTIVE',    category: 'Product direction',   shell: 'amber',   palette: ['#e8c47a', '#c25a1c', '#2a1810'], edge: '#c25a1c', spine: '#2a1810', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 52.jpg', slug: 'peach-tea',       titleZh: '桃壶',     titleEn: 'PEACH TEA',      category: 'Tabletop still life', shell: 'smoked',  palette: ['#f0d8c8', '#d09a8a', '#5a3a28'], edge: '#d09a8a', spine: '#5a3a28', tone: 'graphite', hardware: 'gunmetal' },
    { src: 'Slide 53.jpg', slug: 'reading-pod',     titleZh: '阅读舱',   titleEn: 'READING POD',    category: 'Spatial design',      shell: 'paleIce', palette: ['#a8c8c8', '#2a6a78', '#14242c'], edge: '#2a6a78', spine: '#14242c', tone: 'graphite', hardware: 'gunmetal' },
    { src: 'Slide 54.jpg', slug: 'dog-toy',         titleZh: '棘宠',     titleEn: 'DOG TOY',        category: 'Product direction',   shell: 'amber',   palette: ['#f0e0a0', '#a8c020', '#6a4818'], edge: '#a8c020', spine: '#6a4818', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 55.jpg', slug: 'mobility-cart',   titleZh: '慢行',     titleEn: 'MOBILITY',       category: 'Industrial design',   shell: 'milky',   palette: ['#e8e4e0', '#6a6a6a', '#1e1e1e'], edge: '#6a6a6a', spine: '#1e1e1e', tone: 'clear',  hardware: 'silver'  },
    { src: 'Slide 56.jpg', slug: 'temple-autumn',   titleZh: '刹秋',     titleEn: 'TEMPLE AUTUMN',  category: 'Spatial direction',   shell: 'amber',   palette: ['#f3c87a', '#c25a1c', '#2a1810'], edge: '#c25a1c', spine: '#2a1810', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 57.jpg', slug: 'study-companion', titleZh: '学伴',     titleEn: 'STUDY COMPANION',category: 'Product direction',   shell: 'milky',   palette: ['#f0e0c8', '#5a6a78', '#142028'], edge: '#5a6a78', spine: '#142028', tone: 'ivory',  hardware: 'silver'  },
    { src: 'Slide 58.jpg', slug: 'shark-pump',      titleZh: '鲨泵',     titleEn: 'SHARK PUMP',     category: 'Product campaign',    shell: 'ice',     palette: ['#b0b8c8', '#1a3868', '#08102a'], edge: '#1a3868', spine: '#08102a', tone: 'clear',  hardware: 'silver'  },
  ];

  // ---- portrait: B&W life photo ----
  const portraitSrc = 'C:\\Users\\liukeyi\\.minimax\\v2\\assets\\2026\\10\\11\\16-22-04-062-asset_20261011-162204-062_73eaecf24f84_aca569c5-6290750676b2b510e9e5c43bf34502ec 2.jpg';
  const portraitDst = path.join(projectRoot, 'public', 'archive', 'portrait.jpg');

  // ---- PDF resume ----
  const pdfSrc = 'C:\\Users\\liukeyi\\.minimax\\v2\\assets\\2026\\10\\11\\16-22-04-031-asset_20261011-162204-031_9b836a5a6698_5fce07f5-产品研究.pdf';
  const pdfDst = path.join(downloadsDir, 'product-research.pdf');

  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('sharp is not installed. Run: npm install --save-dev sharp');
    process.exit(1);
  }

  // --- Clean stale work files ---
  for (const file of fs.readdirSync(outDir)) {
    fs.unlinkSync(path.join(outDir, file));
    console.log('cleaned', file);
  }

  for (const item of map) {
    const srcPath = path.join(sourceDir, item.src);
    if (!fs.existsSync(srcPath)) {
      console.error('Missing source:', srcPath);
      process.exit(1);
    }
    const meta = await sharp(srcPath).metadata();
    const ratio = 1800 / meta.width;
    const newH = Math.round(meta.height * ratio);
    const dstPath = path.join(outDir, `${item.slug}-01.jpg`);
    const data = await sharp(srcPath)
      .resize(1800, newH, { kernel: sharp.kernel.lanczos3 })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(dstPath, data);
    const size = fs.statSync(dstPath).size;
    console.log(`${item.src} -> ${item.slug}-01.jpg (${Math.round(size / 1024)}KB, 1800x${newH})`);
  }

  // --- Portrait: keep portrait orientation, target 1800px tall (1200 wide) ---
  if (fs.existsSync(portraitSrc)) {
    const meta = await sharp(portraitSrc).metadata();
    const ratio = 1200 / meta.width;
    const newH = Math.round(meta.height * ratio);
    const data = await sharp(portraitSrc)
      .resize(1200, newH, { kernel: sharp.kernel.lanczos3 })
      .grayscale()
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(portraitDst, data);
    const size = fs.statSync(portraitDst).size;
    console.log(`portrait -> ${portraitDst} (${Math.round(size / 1024)}KB, 1200x${newH})`);
  } else {
    console.error('Missing portrait source:', portraitSrc);
    process.exit(1);
  }

  // --- Copy PDF ---
  if (fs.existsSync(pdfSrc)) {
    fs.copyFileSync(pdfSrc, pdfDst);
    const size = fs.statSync(pdfDst).size;
    console.log(`pdf -> ${pdfDst} (${Math.round(size / 1024)}KB)`);
  } else {
    console.error('Missing pdf source:', pdfSrc);
    process.exit(1);
  }

  // --- Emit a tiny map for the data writer ---
  const mapOut = map.map((item) => ({
    slug: item.slug,
    titleZh: item.titleZh,
    titleEn: item.titleEn,
    category: item.category,
    shell: item.shell,
    palette: item.palette,
    edge: item.edge,
    spine: item.spine,
    tone: item.tone,
    hardware: item.hardware,
  }));
  fs.writeFileSync(
    path.join(projectRoot, 'scripts', '.slide-map.json'),
    JSON.stringify(mapOut, null, 2),
  );
  console.log('wrote scripts/.slide-map.json');
}

main().catch((e) => { console.error(e); process.exit(1); });
