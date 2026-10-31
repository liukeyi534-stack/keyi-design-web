'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

import type { Collection, Work } from '@/data/series';
import { getCollectionCoverWork } from '@/data/series';
import { VinylBgm } from '@/components/audio/VinylBgm';
import styles from './SeriesReader.module.css';

interface Props {
  series: Collection;
  storyOpen: boolean;
  initialIndex?: number;
  onClose: () => void;
  onOpenStory: () => void;
  onCloseStory: () => void;
}

const pad = (value: number) => String(value).padStart(2, '0');
const isLocalAsset = (path: string) => path.startsWith('/') && !path.startsWith('//');

/**
 * A quiet, full-screen museum reader for a collection of 1–9 works. Remote
 * placeholders are never requested: until a local work file is supplied the
 * collection's own local cover remains in the frame. Every artwork is fitted
 * with `contain`, preserving the artist's original ratio without stretching.
 */
export function SeriesReader({
  series,
  storyOpen,
  initialIndex = 0,
  onClose,
  onOpenStory,
  onCloseStory,
}: Props) {
  const works = series.works.slice().sort((a, b) => a.order - b.order);
  const safeInitialIndex = Math.min(Math.max(initialIndex, 0), Math.max(works.length - 1, 0));
  const [index, setIndex] = useState(safeInitialIndex);
  const [zoom, setZoom] = useState(1);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);
  const readerRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const active: Work | undefined = works[index] ?? works[0];

  const storyEn = useMemo(
    () => series.seriesStoryEn ?? (active ? [active.storyEn] : []),
    [active, series.seriesStoryEn],
  );
  const storyZh = useMemo(
    () => series.seriesStoryZh ?? (active ? [active.storyZh] : []),
    [active, series.seriesStoryZh],
  );

  const resolveImage = (work: Work) => isLocalAsset(work.image) ? work.image : null;

  const select = useCallback((next: number) => {
    const length = works.length;
    if (length === 0) return;
    setIndex((next + length) % length);
    setZoom(1);
  }, [works.length]);

  useEffect(() => {
    setIndex(safeInitialIndex);
    setZoom(1);
    setImageInfo(null);
  }, [safeInitialIndex, series.id]);

  useEffect(() => {
    setImageInfo(null);
  }, [active?.id]);

  useEffect(() => {
    const root = readerRef.current;
    if (!root) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        '[data-reader-layer]',
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.72, stagger: 0.055, ease: 'power3.out' },
      );
    }, root);
    return () => context.revert();
  }, [series.id]);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    gsap.killTweensOf(drawer);
    gsap.to(drawer, {
      yPercent: storyOpen ? 0 : 102,
      duration: storyOpen ? 0.72 : 0.46,
      ease: storyOpen ? 'power3.out' : 'power3.inOut',
    });
  }, [storyOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'Escape') {
        if (storyOpen) onCloseStory();
        else onClose();
        return;
      }
      if (storyOpen) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        select(index + 1);
        event.preventDefault();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        select(index - 1);
        event.preventDefault();
      } else if (event.key === '+' || event.key === '=') {
        setZoom((value) => Math.min(2, value + 0.5));
      } else if (event.key === '-') {
        setZoom((value) => Math.max(1, value - 0.5));
      } else if (event.key === '0') {
        setZoom(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, onClose, onCloseStory, select, storyOpen]);

  if (!active) return null;

  const activeImage = resolveImage(active);
  const matte = active.presentation?.matte ?? 'transparent';
  const objectPosition = `${(active.presentation?.focus?.[0] ?? 0.5) * 100}% ${(active.presentation?.focus?.[1] ?? 0.5) * 100}%`;
  const sourceFormat = imageInfo
    ? `${imageInfo.width} × ${imageInfo.height} / ${imageInfo.width === imageInfo.height ? 'SQUARE' : imageInfo.width > imageInfo.height ? 'LANDSCAPE' : 'PORTRAIT'}`
    : activeImage ? 'LOADING' : 'PENDING';

  return (
    <section
      ref={readerRef}
      className={styles.reader}
      aria-label={`${series.titleEn} collection viewer`}
    >
      <header className={styles.header} data-reader-layer>
        <button type="button" className={styles.back} onClick={onClose}>
          <span aria-hidden="true">←</span>
          <b>ARCHIVE</b>
        </button>
        <div className={styles.headerTitle}>
          <span>{series.titleEn.toUpperCase()}</span>
          <small>{pad(index + 1)} / {pad(works.length)}</small>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.artColumn} data-reader-layer>
          <div className={styles.artStage} data-matte={matte}>
            {activeImage ? (
              <div className={styles.artworkMat}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={active.id}
                  src={activeImage}
                  alt={active.titleEn}
                  className={styles.artwork}
                  style={{
                    // The full-screen reader is an archival view, never a crop.
                    // Cover fitting is reserved for the narrow 3D case insert.
                    objectFit: 'contain',
                    objectPosition,
                    transform: `scale(${zoom})`,
                  }}
                  draggable={false}
                  onLoad={(event) => setImageInfo({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  })}
                  onDoubleClick={() => setZoom((value) => value === 1 ? 1.5 : 1)}
                />
              </div>
            ) : (
              <div className={styles.pendingWork} role="img" aria-label={`${active.titleEn} artwork file pending`}>
                <span>ARCHIVE ASSET</span>
                <strong>{pad(index + 1)}</strong>
                <i />
                <small>ORIGINAL FILE PENDING</small>
              </div>
            )}
            <div className={styles.artGlass} aria-hidden="true" />
            {series.audio ? <VinylBgm audio={series.audio} /> : null}
          </div>

          <nav className={styles.workNav} aria-label="Artwork navigation">
            <button type="button" onClick={() => select(index - 1)} aria-label="Previous artwork">←</button>
            <div className={styles.progress} aria-hidden="true">
              <i style={{ width: `${((index + 1) / works.length) * 100}%` }} />
            </div>
            <button type="button" onClick={() => select(index + 1)} aria-label="Next artwork">→</button>
          </nav>
        </section>

        <aside className={styles.details} data-reader-layer>
          <p className={styles.eyebrow}>{series.year} / {series.category}</p>
          <h1>{series.titleZh || series.titleEn}</h1>
          {(series.subtitleZh || series.subtitleEn) ? (
            <div className={styles.subtitleBlock}>
              {series.subtitleZh ? <p className={styles.subtitleZh}>{series.subtitleZh}</p> : null}
              {series.subtitleEn ? <p className={styles.subtitleEn}>{series.subtitleEn}</p> : null}
            </div>
          ) : null}
          <i className={styles.rule} />
          {(() => {
            const coverWork = getCollectionCoverWork(series);
            const introEn = coverWork?.oneLineEn ?? '';
            const introZh = coverWork?.oneLineZh ?? '';
            return (
              <>
                {introEn ? <p className={styles.statement}>{introEn}</p> : null}
                {introZh ? <p className={styles.statementZh}>{introZh}</p> : null}
              </>
            );
          })()}

          <dl className={styles.metadata}>
            <div><dt>YEAR</dt><dd>{active.year}</dd></div>
            <div><dt>MEDIUM</dt><dd>{active.medium}</dd></div>
            {active.dimensions && <div><dt>FORMAT</dt><dd>{active.dimensions}</dd></div>}
            <div><dt>SOURCE</dt><dd>{sourceFormat}</dd></div>
            <div><dt>WORK</dt><dd>{pad(index + 1)} / {pad(works.length)}</dd></div>
          </dl>

          <div className={styles.actions}>
            <button type="button" onClick={onOpenStory}>READ STORY</button>
            <div className={styles.zoom} aria-label="Artwork zoom controls">
              <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.5))} disabled={zoom === 1}>−</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(2, value + 0.5))} disabled={zoom === 2}>+</button>
            </div>
          </div>
        </aside>
      </div>

      <ol className={styles.filmstrip} aria-label={`${series.titleEn} works`} data-reader-layer>
        {works.map((work, workIndex) => (
          <li key={work.id}>
            <button
              type="button"
              className={workIndex === index ? styles.activeThumb : undefined}
              onClick={() => select(workIndex)}
              aria-label={`View ${work.titleEn}`}
              aria-current={workIndex === index ? 'true' : undefined}
            >
              <span className={styles.thumbImage} data-pending={!resolveImage(work) || undefined}>
                {resolveImage(work) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={resolveImage(work) ?? ''} alt="" draggable={false} />
                ) : (
                  <b aria-hidden="true">{pad(workIndex + 1)}</b>
                )}
              </span>
              <small>{pad(workIndex + 1)}</small>
            </button>
          </li>
        ))}
      </ol>

      <aside ref={drawerRef} className={styles.story} aria-hidden={!storyOpen}>
        <header>
          <div>
            <span>ARCHIVE NOTE</span>
            <h2>{series.titleEn}</h2>
          </div>
          <button type="button" onClick={onCloseStory} aria-label="Close story">×</button>
        </header>
        <div className={styles.storyGrid}>
          <article lang="en">
            {storyEn.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
          </article>
          <article lang="zh-CN">
            {storyZh.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
          </article>
        </div>
      </aside>
    </section>
  );
}
