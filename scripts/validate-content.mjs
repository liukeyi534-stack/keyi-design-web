import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const projectRoot = process.cwd();
const dataPath = path.join(projectRoot, 'src', 'data', 'series.ts');
const publicRoot = path.join(projectRoot, 'public');

const source = fs.readFileSync(dataPath, 'utf8');
const requireFromSeries = createRequire(dataPath);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
  fileName: dataPath,
}).outputText;

const moduleRecord = { exports: {} };
const sandbox = {
  module: moduleRecord,
  exports: moduleRecord.exports,
  require: requireFromSeries,
  console,
};
vm.runInNewContext(compiled, sandbox, { filename: dataPath });

const { ALL_COLLECTIONS } = moduleRecord.exports;
const errors = [];
const warnings = [];
const seenCollectionIds = new Set();
const seenSlugs = new Set();
const seenWorkIds = new Set();
const ordersByStatus = new Map();
const localAssets = new Set();

const addError = (location, message) => errors.push(`${location}: ${message}`);
const addWarning = (location, message) => warnings.push(`${location}: ${message}`);
const isKebabCase = (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const isLocalAsset = (value) => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');
const resolvePublicAsset = (value) => path.join(publicRoot, ...value.slice(1).split('/'));

if (!Array.isArray(ALL_COLLECTIONS)) {
  addError('series.ts', 'ALL_COLLECTIONS must export an array.');
} else {
  for (const collection of ALL_COLLECTIONS) {
    const location = `collection:${collection?.id ?? '<missing-id>'}`;

    if (!collection?.id || !isKebabCase(collection.id)) {
      addError(location, 'id must be non-empty kebab-case.');
    } else if (seenCollectionIds.has(collection.id)) {
      addError(location, `duplicate collection id "${collection.id}".`);
    } else {
      seenCollectionIds.add(collection.id);
    }

    if (!collection?.slug || !isKebabCase(collection.slug)) {
      addError(location, 'slug must be non-empty kebab-case.');
    } else if (seenSlugs.has(collection.slug)) {
      addError(location, `duplicate slug "${collection.slug}".`);
    } else {
      seenSlugs.add(collection.slug);
    }

    if (!['published', 'draft', 'archived'].includes(collection?.status)) {
      addError(location, 'status must be published, draft, or archived.');
    }

    if (!Number.isInteger(collection?.order) || collection.order < 1) {
      addError(location, 'order must be a positive integer.');
    } else {
      const statusOrders = ordersByStatus.get(collection.status) ?? new Set();
      if (statusOrders.has(collection.order)) {
        addError(location, `duplicate order ${collection.order} inside status "${collection.status}".`);
      }
      statusOrders.add(collection.order);
      ordersByStatus.set(collection.status, statusOrders);
    }

    if (!Array.isArray(collection?.palette) || collection.palette.length !== 3) {
      addError(location, 'palette must contain exactly three colours.');
    } else {
      collection.palette.forEach((colour, index) => {
        if (!/^#[0-9a-f]{6}$/i.test(colour)) {
          addError(location, `palette[${index}] must be a six-digit hex colour.`);
        }
      });
    }

    const works = Array.isArray(collection?.works) ? collection.works : [];
    if (collection?.status === 'published' && (works.length < 1 || works.length > 12)) {
      addError(location, `published collections require 1–12 works; found ${works.length}.`);
    } else if (works.length > 12) {
      addError(location, `collections support at most 12 works; found ${works.length}.`);
    }

    if (collection?.coverWorkId && !works.some((work) => work.id === collection.coverWorkId)) {
      addError(location, `coverWorkId "${collection.coverWorkId}" does not exist in works.`);
    }

    const workOrders = new Set();
    for (const work of works) {
      const workLocation = `${location}/work:${work?.id ?? '<missing-id>'}`;
      if (!work?.id || !isKebabCase(work.id)) {
        addError(workLocation, 'work id must be non-empty kebab-case.');
      } else if (seenWorkIds.has(work.id)) {
        addError(workLocation, `duplicate global work id "${work.id}".`);
      } else {
        seenWorkIds.add(work.id);
      }

      if (!Number.isInteger(work?.order) || work.order < 1) {
        addError(workLocation, 'order must be a positive integer.');
      } else if (workOrders.has(work.order)) {
        addError(workLocation, `duplicate work order ${work.order}.`);
      } else {
        workOrders.add(work.order);
      }

      const isCoverWork = Boolean(collection?.coverWorkId) && work?.id === collection.coverWorkId;
      const requiredFields = isCoverWork
        ? ['image', 'oneLineZh', 'storyZh', 'medium']
        : ['image', 'titleZh', 'titleEn', 'oneLineZh', 'oneLineEn', 'storyZh', 'storyEn', 'medium'];
      for (const requiredField of requiredFields) {
        if (typeof work?.[requiredField] !== 'string' || work[requiredField].trim() === '') {
          addError(workLocation, `${requiredField} is required.`);
        }
      }

      if (isLocalAsset(work?.image)) {
        localAssets.add(work.image);
      } else if (collection?.status === 'published') {
        addWarning(workLocation, 'uses a remote or pending image; the public reader will show its pending state.');
      }
    }

    const sortedOrders = [...workOrders].sort((a, b) => a - b);
    sortedOrders.forEach((order, index) => {
      if (order !== index + 1) {
        addError(location, `work orders must be contiguous from 1; found ${sortedOrders.join(', ')}.`);
      }
    });

    if (isLocalAsset(collection?.cover)) {
      localAssets.add(collection.cover);
    } else if (collection?.status === 'published') {
      addWarning(location, 'cover is not a local public asset.');
    }

    if (collection?.audio?.src) {
      if (isLocalAsset(collection.audio.src)) localAssets.add(collection.audio.src);
      else addWarning(location, 'audio.src is not a local public asset.');
    }
  }
}

for (const asset of [...localAssets].sort()) {
  const absolutePath = resolvePublicAsset(asset);
  if (!fs.existsSync(absolutePath)) {
    addError(`asset:${asset}`, 'file does not exist under public/.');
    continue;
  }
  const stat = fs.statSync(absolutePath);
  if (!stat.isFile() || stat.size === 0) {
    addError(`asset:${asset}`, 'asset is not a non-empty file.');
  }
}

const publishedCollections = Array.isArray(ALL_COLLECTIONS)
  ? ALL_COLLECTIONS
      .filter((collection) => collection.status === 'published')
      .sort((a, b) => a.order - b.order)
  : [];
if (publishedCollections.length < 1) {
  addError('archive-rail', 'the home composition requires at least 1 published collection.');
} else if (publishedCollections.length > 32) {
  addError('archive-rail', `the home composition supports at most 32 published collections; found ${publishedCollections.length}.`);
}

for (const warning of warnings) console.warn(`WARN  ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);

const collectionCount = Array.isArray(ALL_COLLECTIONS) ? ALL_COLLECTIONS.length : 0;
console.log(`Checked ${collectionCount} collections, ${seenWorkIds.size} works, and ${localAssets.size} local assets.`);

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exitCode = 1;
} else {
  console.log(`Content validation passed with ${warnings.length} warning(s).`);
}
