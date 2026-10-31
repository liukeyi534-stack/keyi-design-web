'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { SeriesAudio } from '@/data/series';
import styles from './VinylBgm.module.css';

interface Props {
  audio: SeriesAudio;
}

/**
 * A small, self-contained black-vinyl BGM control. Renders a rotating disc with
 * a paper-tone label and a play/pause button. Owns its full visual + motion
 * contract through VinylBgm.module.css so the host reader does not need any
 * layout adjustments. The host only mounts `<VinylBgm audio={...} />` once.
 *
 * Audio playback always requires a user gesture. The component never starts
 * on its own; the first click begins playback. When `audio.src` changes the
 * track is paused and reset to 0 so the next click replays from the top.
 */
export function VinylBgm({ audio }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.loop = audio.loop ?? true;
    el.preload = 'auto';
    el.volume = Math.min(1, Math.max(0, audio.volume ?? 0.55));

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onReady = () => setReady(true);

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    el.addEventListener('canplay', onReady);

    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('canplay', onReady);
    };
  }, [audio.loop, audio.volume]);

  // Reset on track change so a different series starts from silence.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setPlaying(false);
    setReady(false);
  }, [audio.src]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      const result = el.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          setPlaying(false);
        });
      }
    } else {
      el.pause();
    }
  }, []);

  const theme = audio.vinylTheme;
  const discStyle = {
    '--vinyl-disc': theme?.discColor ?? '#0c0a09',
    '--vinyl-label': theme?.labelColor ?? '#d8ccbb',
    '--vinyl-ink': theme?.labelInk ?? '#382e26',
    '--vinyl-accent': theme?.accentColor ?? '#b8a994',
    '--vinyl-jewel': theme?.jewelColor ?? '#050403',
    '--vinyl-spin': `${theme?.rotationSeconds ?? 6.5}s`,
  } as CSSProperties;

  return (
    <div className={styles.wrap} data-ready={ready || undefined}>
      <button
        type="button"
        className={styles.disc}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? `Pause ${audio.title}` : `Play ${audio.title}`}
        data-playing={playing || undefined}
        data-variant={theme?.variant ?? 'archive'}
        style={discStyle}
      >
        <span className={styles.face} aria-hidden="true">
          <span className={styles.grooves} />
          <span className={styles.relicPattern} />
          <span className={styles.glint} data-glint="one" />
          <span className={styles.glint} data-glint="two" />
          <span className={styles.label}>
            <small>{audio.title.toUpperCase()}</small>
            {audio.label ? <i>{audio.label}</i> : null}
            {theme?.imprint ? <b>{theme.imprint}</b> : null}
          </span>
          <span className={styles.hole} />
        </span>
        <span className={styles.tip}>{playing ? 'PAUSE' : 'PLAY'} · BGM</span>
      </button>
      <audio ref={audioRef} src={audio.src} preload="auto" />
    </div>
  );
}
