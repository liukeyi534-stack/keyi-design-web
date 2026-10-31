import { Suspense } from 'react';

import { ExperienceFallback, LowkeyExperienceShell } from '@/components/narrative/LowkeyExperienceShell';

export default function ExperiencePrototypePage() {
  return (
    <Suspense fallback={<ExperienceFallback />}>
      <LowkeyExperienceShell />
    </Suspense>
  );
}
