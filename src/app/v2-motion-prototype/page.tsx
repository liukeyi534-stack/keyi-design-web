import { PUBLISHED_COLLECTIONS } from '@/data/series';
import {
  ArchiveFragmentsPrototype,
  type PrototypeWork,
} from '@/components/v2-motion/ArchiveFragmentsPrototype';

const MAX_WORKS = 12;

function getPrototypeWorks(): PrototypeWork[] {
  const seen = new Set<string>();
  const works: PrototypeWork[] = [];

  for (const collection of PUBLISHED_COLLECTIONS) {
    for (const work of collection.works.slice().sort((a, b) => a.order - b.order)) {
      if (!work.image || seen.has(work.image)) continue;
      seen.add(work.image);
      works.push({
        id: work.id,
        collectionId: collection.id,
        image: work.image,
        titleEn: work.titleEn,
        titleZh: work.titleZh,
        year: work.year,
      });
      if (works.length >= MAX_WORKS) return works;
    }
  }

  return works;
}

export default function V2MotionPrototypePage() {
  return <ArchiveFragmentsPrototype works={getPrototypeWorks()} />;
}
