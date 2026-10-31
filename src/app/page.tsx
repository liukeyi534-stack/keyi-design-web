import { Suspense } from 'react';

import {
  ExperienceFallback,
  LowkeyExperienceShell,
} from '@/components/narrative/LowkeyExperienceShell';

export default function Page() {
  return (
    <Suspense fallback={<ExperienceFallback />}>
      <LowkeyExperienceShell />
    </Suspense>
  );
}
