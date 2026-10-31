'use client';

// ============================================================
// /intro-prototype — isolated route for the LOWKEY planar-orbit entrance.
//
// This page mirrors the existing home page (ArchiveScene + SeriesReader) and
// hands a planar artwork orbit into the same seven WebGL case groups. It does
// not modify the production page.tsx. Once the handoff completes, the existing
// rail interaction owns the scene without duplicating the acrylic models.
//
// The page reads ?intro=1 to force the gate to show; otherwise the
// normal sessionStorage rule applies and the gate is skipped after
// the first dismissal in a session.
// ============================================================

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import { SeriesReader } from '@/components/SeriesReader';
import { PUBLISHED_COLLECTIONS as PUBLISHED, type Series } from '@/data/series';
import type { EntranceMode } from '@/components/archive/types';

const SESSION_KEY = 'lowkey:archive-orbit-seen:v1';

const ArchiveScene = dynamic(
  () => import('@/components/ArchiveScene').then((module) => module.ArchiveScene),
  { ssr: false, loading: () => <SceneFallback /> },
);

function SceneFallback() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        color: 'var(--ink-3)',
        fontFamily: 'var(--mono)',
        fontSize: 11,
        letterSpacing: '0.2em',
        background: '#fbfaf8',
      }}
    >
      <span>PREPARING THE ARCHIVE…</span>
    </div>
  );
}

type View =
  | { kind: 'archive' }
  | { kind: 'series'; seriesId: string; workIndex?: number }
  | { kind: 'series'; seriesId: string; story: true };

function IntroPrototypeShell() {
  const searchParams = useSearchParams();
  const forceIntro = searchParams?.get('intro') === '1';

  const [view, setView] = useState<View>({ kind: 'archive' });
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [entranceMode, setEntranceMode] = useState<EntranceMode>('standard');
  const [entranceReady, setEntranceReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      seen = false;
    }
    setEntranceMode(forceIntro || !seen ? 'orbit' : 'standard');
    setEntranceReady(true);
  }, [forceIntro]);

  const activeSeries = useMemo<Series | null>(() => {
    if (view.kind !== 'series') return null;
    return PUBLISHED.find((series) => series.id === view.seriesId) ?? null;
  }, [view]);

  const onEnterSeries = useCallback((id: string) => {
    setView({ kind: 'series', seriesId: id, workIndex: 0 });
  }, []);

  const onOpenStory = useCallback((id: string) => {
    setView({ kind: 'series', seriesId: id, story: true });
  }, []);

  const onCloseStory = useCallback((id: string) => {
    setView({ kind: 'series', seriesId: id });
  }, []);

  const onCloseReader = useCallback(() => {
    setView({ kind: 'archive' });
  }, []);

  const onEntranceComplete = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // The prototype remains usable when storage is unavailable.
    }
  }, []);

  if (!entranceReady) return <SceneFallback />;

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: entranceMode !== 'standard' ? '#fbfaf8' : 'var(--paper)',
      }}
    >
      <div
        aria-hidden={view.kind !== 'archive'}
        style={{
          position: 'absolute',
          inset: 0,
          visibility: view.kind === 'archive' ? 'visible' : 'hidden',
          pointerEvents: view.kind === 'archive' ? 'auto' : 'none',
        }}
      >
        <ArchiveScene
          series={PUBLISHED}
          reducedMotion={reducedMotion}
          onEnterSeries={onEnterSeries}
          entranceMode={entranceMode}
          onEntranceComplete={onEntranceComplete}
        />
      </div>

      {view.kind === 'series' && activeSeries && (
        <SeriesReader
          series={activeSeries}
          storyOpen={'story' in view && view.story === true}
          initialIndex={'workIndex' in view ? view.workIndex : 0}
          onClose={onCloseReader}
          onOpenStory={() => onOpenStory(activeSeries.id)}
          onCloseStory={() => onCloseStory(activeSeries.id)}
        />
      )}
    </main>
  );
}

export default function IntroPrototypePage() {
  return (
    <Suspense fallback={<SceneFallback />}>
      <IntroPrototypeShell />
    </Suspense>
  );
}
