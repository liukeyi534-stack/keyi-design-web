import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const scanRoots = ['src', 'public', 'out'];
const forbidden = [
  'lowkeytp.art',
  'lowkey-ochre.vercel.app',
  'LowkeyTppt',
  'Lowkeytppt@gmail.com',
  '26786765155',
  'draft-halcyon',
  'draft-vespers',
  'studio-published.json',
  'lowkey-portrait.png',
];

const textExtensions = new Set(['.css', '.js', '.mjs', '.json', '.md', '.tsx', '.ts', '.html', '.svg', '.txt', '.yml', '.yaml']);
const files = [];

function walk(relativeRoot) {
  const absoluteRoot = path.join(root, relativeRoot);
  if (!fs.existsSync(absoluteRoot)) return;
  const entries = fs.readdirSync(absoluteRoot, { withFileTypes: true });
  for (const entry of entries) {
    const relative = path.join(relativeRoot, entry.name);
    const absolute = path.join(root, relative);
    if (entry.isDirectory()) walk(relative);
    else if (textExtensions.has(path.extname(entry.name).toLowerCase())) files.push({ relative, absolute });
  }
}

for (const scanRoot of scanRoots) walk(scanRoot);

const findings = [];
for (const file of files) {
  const source = fs.readFileSync(file.absolute, 'utf8');
  for (const marker of forbidden) {
    if (source.toLowerCase().includes(marker.toLowerCase())) findings.push(`${file.relative}: contains forbidden marker ${marker}`);
  }
}

const demoRoot = path.join(root, 'public', 'archive', 'demo');
const demoFiles = fs.existsSync(demoRoot)
  ? fs.readdirSync(demoRoot).filter((name) => name.toLowerCase().endsWith('.svg'))
  : [];
if (demoFiles.length < 1) findings.push('public/archive/demo: requires at least one demo SVG.');

if (findings.length > 0) {
  for (const finding of findings) console.error(`ERROR ${finding}`);
  process.exitCode = 1;
} else {
  console.log(`Public scan passed: ${files.length} text files checked, ${demoFiles.length} demo SVGs found.`);
}
