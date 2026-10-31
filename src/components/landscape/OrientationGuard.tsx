'use client';

import { useEffect, useState } from 'react';

import styles from './OrientationGuard.module.css';

const PORTRAIT_ASPECT_LIMIT = 1;
const MOBILE_QUERY = '(max-width: 900px), (pointer: coarse) and (max-width: 1180px)';

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isNarrowViewport = window.matchMedia('(max-width: 900px)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  return isMobileUA || (isNarrowViewport && isCoarsePointer) || isNarrowViewport;
}

function detectPortrait(): boolean {
  if (typeof window === 'undefined') return false;
  const { innerWidth: w, innerHeight: h } = window;
  if (!w || !h) return false;
  return h > w * PORTRAIT_ASPECT_LIMIT;
}

export function OrientationGuard() {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let raf = 0;
    const update = () => {
      const mobile = detectMobile();
      const portrait = detectPortrait();
      const shouldShow = mobile && portrait;
      setShowOverlay(shouldShow);

      // Try to lock landscape. Only meaningful in PWA / trusted contexts.
      const orientation = window.screen?.orientation;
      if (orientation && 'lock' in orientation && shouldShow) {
        type OrientationLock = (o: 'landscape' | 'any') => Promise<void>;
        const lock = (orientation as unknown as { lock: OrientationLock }).lock?.bind(orientation);
        if (lock) {
          lock('landscape').catch(() => {
            /* Browser refused (iOS Safari, not PWA, etc.) — overlay will guide instead. */
          });
        }
      }
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    update();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    const mobileMedia = window.matchMedia(MOBILE_QUERY);
    mobileMedia.addEventListener?.('change', schedule);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      mobileMedia.removeEventListener?.('change', schedule);
    };
  }, []);

  if (!showOverlay) return null;

  return (
    <div className={styles.overlay} role="alertdialog" aria-live="polite" aria-label="请将设备旋转至横屏">
      <div className={styles.card}>
        <svg className={styles.icon} viewBox="0 0 64 64" aria-hidden="true">
          <rect x="8" y="22" width="48" height="28" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="32" cy="36" r="3" fill="currentColor" />
          <path d="M44 14c4 0 6 2 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M20 50c-4 0-6-2-6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <h2 className={styles.title}>请旋转设备</h2>
        <p className={styles.subtitle}>将手机旋转至横屏以获得完整体验。</p>
        <p lang="en" className={styles.subtitleEn}>Rotate your phone to landscape for the full experience.</p>
        <p className={styles.hint}>添加至主屏幕后可自动锁定方向。</p>
      </div>
    </div>
  );
}
